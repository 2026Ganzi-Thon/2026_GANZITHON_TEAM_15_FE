import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dressApi } from '../../api/dress'
import { Page, Card, Button, Header } from '../../components/ui'

export default function DressPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['dress-items'],
    queryFn: ({ signal }) => dressApi.getItems(signal),
    retry: 1,
  })

  const [craft, setCraft] = useState<string[]>([])
  const [equipped, setEquipped] = useState<string[] | null>(null)

  const currentEquipped = equipped ??
    query.data?.items.filter(item => item.equipped).map(item => item.code) ?? []

  const selectedCost = useMemo(
    () => (query.data?.items ?? [])
      .filter(item => craft.includes(item.code))
      .reduce((sum, item) => sum + item.yarnCost, 0),
    [query.data, craft],
  )

  const mutation = useMutation({
    mutationFn: () => dressApi.updateItems({ craft, equipped: currentEquipped }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dress-items'] })
      await queryClient.invalidateQueries({ queryKey: ['my-sheep'] })
      setCraft([])
      setEquipped(null)
    },
  })

  const toggleCraft = (code: string) => {
    setCraft(current =>
      current.includes(code) ? current.filter(item => item !== code) : [...current, code],
    )
  }

  const toggleEquipped = (code: string) => {
    setEquipped(current => {
      const selected = current ??
        query.data?.items.filter(item => item.equipped).map(item => item.code) ?? []
      return selected.includes(code)
        ? selected.filter(item => item !== code)
        : [...selected, code]
    })
  }

  return (
    <Page>
      <Header title="양 꾸미기" onBack={() => navigate(-1)} />

      {query.isPending && <p>아이템을 불러오는 중이에요.</p>}
      {query.isError && (
        <Card>
          <p className="ui-error">{query.error.message}</p>
          <Button onClick={() => query.refetch()}>다시 불러오기</Button>
        </Card>
      )}

      {query.data && (
        <>
          <Card>
            <strong>내 털실</strong>
            <p>{query.data.yarnCount}올</p>
            <small>지금까지 사용한 털실 {query.data.spentYarn}올</small>
          </Card>

          <h2>꾸미기 아이템</h2>
          {!query.data.items.length && <Card>아직 꾸밀 수 있는 아이템이 없어요.</Card>}

          <div className="dress-items">
            {query.data.items.map(item => {
              const selected = craft.includes(item.code)
              const wearing = currentEquipped.includes(item.code)

              return (
                <Card key={item.code} className="dress-item">
                  <div className="grow">
                    <strong>{item.name}</strong>
                    <small>{item.owned ? '보유한 아이템' : `제작 비용 ${item.yarnCost}올`}</small>
                  </div>

                  {item.owned ? (
                    <Button
                      type="button"
                      className="compact"
                      aria-pressed={wearing}
                      onClick={() => toggleEquipped(item.code)}
                    >
                      {wearing ? '착용 중' : '착용하기'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="compact"
                      aria-pressed={selected}
                      disabled={!selected && selectedCost + item.yarnCost > query.data.yarnCount}
                      onClick={() => toggleCraft(item.code)}
                    >
                      {selected ? '제작 취소' : '제작 선택'}
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>

          <Card>
            <p>제작 예정: {selectedCost}올</p>
            <small>제작 후 착용할 아이템을 선택할 수 있어요.</small>
            {mutation.isError && <p className="ui-error">{mutation.error.message}</p>}
            {mutation.isSuccess && <p>꾸미기 내용이 저장됐어요.</p>}
          </Card>

          <Button
            className="report-submit"
            disabled={mutation.isPending || (craft.length === 0 && !query.data.items.some(item => item.equipped !== currentEquipped.includes(item.code)))}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? '저장 중…' : '꾸미기 저장'}
          </Button>
        </>
      )}
    </Page>
  )
}
