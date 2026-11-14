// Fetch 기반 SSE 공통 유틸. API 명세의 text/event-stream 이벤트 규칙을 처리합니다.
// 설계 결정: JSON 파싱에 실패한 이벤트는 원문을 알 수 없는 이벤트 콜백으로 전달합니다.

import { ApiError, authHeaders, buildUrl, handleUnauthorized } from './client'
import type { ApiFailure } from './types'
import { ERROR_CODES } from './types'

export type SseEventMap = {
  progress: {
    userMessageCount: number
    ready: boolean
    maxUserMessages: number
    limitReached: boolean
  }
  delta: { text: string }
  crisis: { message: string; actions: string[] }
  notice: { message: string }
  reset: Record<string, never>
  replace: { text: string }
  error: { code: string; message: string }
  done: Record<string, never>
}

export type SseEventName = keyof SseEventMap

export interface StreamSseOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  // 설계 결정: 기본적으로 done/error 없이 끝난 스트림을 네트워크 오류로 알립니다.
  requireTerminalEvent?: boolean
  onEvent?: <K extends SseEventName>(name: K, data: SseEventMap[K]) => void
  onUnknownEvent?: (name: string, data: unknown) => void
  onHttpError?: (error: ApiError) => void
  onNetworkError?: (error: Error) => void
}

const EVENT_NAMES = new Set<string>([
  'progress',
  'delta',
  'crisis',
  'notice',
  'reset',
  'replace',
  'error',
  'done',
])

interface ParsedEvent {
  name: string
  data: string
}

function isApiFailure(value: unknown): value is ApiFailure {
  if (typeof value !== 'object' || value === null || !('success' in value)) return false
  if (value.success !== false || !('error' in value)) return false
  const error = value.error
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

function dispatchEvent(
  event: ParsedEvent,
  options: StreamSseOptions,
): SseEventName | null {
  let data: unknown
  try {
    data = JSON.parse(event.data) as unknown
  } catch {
    options.onUnknownEvent?.(event.name || 'message', event.data)
    return null
  }

  const name = event.name || 'message'
  if (!EVENT_NAMES.has(name)) {
    options.onUnknownEvent?.(name, data)
    return null
  }

  options.onEvent?.(name as SseEventName, data as SseEventMap[SseEventName])
  return name as SseEventName
}

export async function streamSse(
  path: string,
  options: StreamSseOptions = {},
): Promise<void> {
  const method = options.method ?? 'POST'
  const headers: Record<string, string> = {
    ...authHeaders(),
    Accept: 'text/event-stream',
  }
  if (method === 'POST' && options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: method === 'POST' && options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    options.onNetworkError?.(
      error instanceof Error
        ? error
        : new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.'),
    )
    return
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (!response.ok || !contentType.toLowerCase().includes('text/event-stream')) {
    let payload: unknown
    try {
      payload = await response.json() as unknown
    } catch {
      payload = null
    }

    const error = isApiFailure(payload)
      ? new ApiError(response.status, payload.error.code, payload.error.message)
      : new ApiError(response.status, 'UNKNOWN', '잠시 후 다시 시도해 주세요.')
    // 설계 결정: SSE 시작 전 오류 코드도 COMMON_401일 수 있다고 추정합니다.
    if (isApiFailure(payload) && payload.error.code === ERROR_CODES.COMMON_401) {
      handleUnauthorized()
    }
    options.onHttpError?.(error)
    return
  }

  if (!response.body) {
    options.onNetworkError?.(
      new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.'),
    )
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let eventName = ''
  const dataLines: string[] = []
  let finished = false
  let terminalEventReceived = false
  let streamFailed = false

  const processLine = (line: string): boolean => {
    if (line === '') {
      if (dataLines.length === 0) {
        eventName = ''
        return false
      }
      const dispatched = dispatchEvent(
        { name: eventName, data: dataLines.join('\n') },
        options,
      )
      if (dispatched === 'done' || dispatched === 'error') terminalEventReceived = true
      eventName = ''
      dataLines.length = 0
      return dispatched === 'done'
    }
    if (line.startsWith(':')) return false

    const colon = line.indexOf(':')
    const field = colon === -1 ? line : line.slice(0, colon)
    let value = colon === -1 ? '' : line.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)
    if (field === 'event') eventName = value
    if (field === 'data') dataLines.push(value)
    return false
  }

  const processLines = (endOfStream: boolean): boolean => {
    let start = 0
    for (let index = 0; index < buffer.length; index += 1) {
      const char = buffer[index]
      if (char !== '\n' && char !== '\r') continue
      if (char === '\r' && index === buffer.length - 1 && !endOfStream) break
      const line = buffer.slice(start, index)
      if (char === '\r' && buffer[index + 1] === '\n') index += 1
      start = index + 1
      if (processLine(line)) {
        buffer = buffer.slice(start)
        return true
      }
    }
    buffer = buffer.slice(start)
    if (endOfStream) {
      if (buffer.length > 0) {
        const shouldStop = processLine(buffer)
        buffer = ''
        if (shouldStop) return true
      }
      // 설계 결정: EOF에서 빈 줄 없이 끝난 마지막 이벤트도 처리합니다.
      if (dataLines.length > 0) {
        const dispatched = dispatchEvent(
          { name: eventName, data: dataLines.join('\n') },
          options,
        )
        if (dispatched === 'done' || dispatched === 'error') terminalEventReceived = true
        eventName = ''
        dataLines.length = 0
        return dispatched === 'done'
      }
    }
    return false
  }

  try {
    while (!finished) {
      if (options.signal?.aborted) break
      const { value, done } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        finished = processLines(true)
        break
      }
      buffer += decoder.decode(value, { stream: true })
      finished = processLines(false)
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError') && !options.signal?.aborted) {
      streamFailed = true
      options.onNetworkError?.(
        error instanceof Error
          ? error
          : new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.'),
      )
    }
  } finally {
    if (
      !streamFailed &&
      !finished &&
      !options.signal?.aborted &&
      options.requireTerminalEvent !== false &&
      !terminalEventReceived
    ) {
      options.onNetworkError?.(
        new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.'),
      )
    }
    if (finished || options.signal?.aborted) {
      try {
        await reader.cancel()
      } catch {
        // 취소 시 이미 닫힌 reader일 수 있습니다.
      }
    }
    reader.releaseLock()
  }
}
