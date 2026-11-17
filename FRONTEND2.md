# 프론트 2 실행·연동 안내

## 실행

- `npm ci` 후 `npm run dev:mock`: 로그인 없이 목장·나 탭·신고 등 시연. 시작 주소 `/farm`.
- `npm run dev`: `.env.local`의 `VITE_USE_MOCK=false`로 실제 API 사용. 로그인 JWT는 기존 `src/api/token.ts`를 통해 저장.
- 로컬 `VITE_API_BASE_URL=/api`는 Vite 프록시로 HTTPS 백엔드에 전달한다. 확인 시 백엔드가 localhost CORS 사전 요청에 403을 반환하여 개발 프록시를 추가했다.
- 배포에서는 `VITE_API_BASE_URL=https://teolhanol-api.duckdns.org`와 `VITE_USE_MOCK=false`를 빌드 환경에 지정하고, 백엔드에 배포 Origin을 허용해야 한다. Vite 개발 프록시는 배포되지 않는다.
- `npm run build`, `npm run lint`, `npx playwright test`. 테스트 브라우저는 로컬 Chrome 사용. 테스트 결과/스크린샷은 `test-results/`에 생성된다.

## 라우트

| 경로 | 화면 |
| --- | --- |
| `/farm` | 주제별 목장, 양 선택, 다음 페이지 |
| `/worries/new` | 고민 작성·주제 선택·등록 결과 |
| `/worries/new?diaryId=123` | 케어 마무리에서 진입, 추천 목장 조회; 사적인 대화 내용은 자동 복사하지 않음 |
| `/worries/me?status=active` | 진행 중인 내 고민 |
| `/worries/me?status=graduated` | 보관함 |
| `/worries/:id` | 소유자는 받은 털·하트·졸업, 타인은 조언 입력·어조 확인·전송 |
| `/reports/WORRY_SHEEP/:id`, `/reports/WOOL/:id` | 고민/받은 조언 신고, 신고 완료 후 차단 |
| `/worries/:worryId/report` | 기존 신고 경로 호환 |
| `/me` | 나 탭, 메뉴, 푸시 설정 |
| `/me/nickname` | 2~10자 닉네임 변경, 글자 수, 서버 중복 오류 |
| `/me/blocks` | 차단 목록·해제 |
| `/help/crisis` | 서버 상담 정보·전화 링크 |

## 프론트 1 연결점

- 기능별 `routes.tsx` 배열을 루트 라우터에 모았다. `/`, `/dress`, `/me/records/delete`, `/me/account`의 `IntegrationPage`는 실제 홈·꾸미기·계정 기능이 준비되면 프론트 1 화면으로 교체한다. 해당 기능을 구현한 것으로 간주하지 않는다.
- `FarmInvitation`에 `diaryId`를 전달하여 #14 마무리 화면에 삽입한다. 프론트 1의 마무리 화면이 아직 없어 호출 지점은 연결 대기 상태다.
- 상담 진입은 `navigate('/help/crisis', { state: { returnTo: 현재대화경로 } })`. `/care`로 시작하는 경로이면 “대화로 돌아가기”가 표시된다. 외부 URL은 허용하지 않는다.
- `CrisisBanner`를 홈/대화에도 삽입할 수 있다. 서버 active/만료 시간을 확인하고 60초마다 갱신한다. 현재는 목장에 배치했다.
- `NotificationListener`는 루트에 한 번 설치. 로그아웃 시 `/push/subscriptions` 해지 후 토큰 삭제 처리가 필요하다. 로그인 상태가 변경될 때 루트 Listener를 다시 마운트하도록 프론트 1 인증 흐름과 연결한다.

## 공통 UI

- `components/ui.tsx`: Button(네이티브 버튼 props), Card, Header(title/onBack), Page(children/className), Chip(selected).
- `components/feedback.tsx`: BottomSheet(title/onClose), Toast(message/onClose), QueryState, EmptyState(title/action/to). BottomSheet는 native dialog로 포커스·Escape를 처리한다.
- `components/navigation.tsx`: BackHeader, BottomNav, FarmInvitation.
- `components/Sheep.tsx`: stage(1~5), size, added(+털 연출), accessories(꾸미기 overlay slot), stageAssets(단계별 이미지 5개). 단계 변경 애니메이션과 reduced-motion 대응.
- 토큰: `styles/tokens.css`. 실제 공통 스타일: `components/ui.css`, `styles/app.css`. 기존 Vite 데모 CSS는 앱 엔트리에서 제외했다.
- Figma에 현재 확인한 양 실루엣은 3종이어서 기본 5단계 중 일부는 같은 원본을 공유한다. 서로 다른 최종 5단계 원화는 `stageAssets`로 교체 가능하다. 최종 원화 5종을 완성했다고 간주하지 않는다.

## API와 목업

- Swagger `https://teolhanol-api.duckdns.org/v3/api-docs` 기준. 도메인 API는 `api/farm.ts`, `me.ts`, `safety.ts`, `report.ts`.
- 등록: CREATED/CRISIS/PII_REJECTED. 조언: SENT/SUGGEST/BLOCKED. 저장하지 않은 결과를 성공 처리하지 않는다.
- 목업은 페이지 세션의 메모리 상태이며 전체 새로고침하면 초기화된다. 실제 사용자 데이터는 목업에 저장하지 않는다.
- 기본 다른 목동 양 1~8, 내 고민 9~12. 9번에는 하트를 누를 수 있는 받은 조언이 있다.
- 목업 시연: 조언에 “노력” → 어조 제안, `010-...` → 개인정보 거절, 고민 내용 `[시연:위기]` → 상담 전환/24시간 배너. `/me?demoNotification=1` → 앱 안 알림.
- 상담 목업은 제공된 백엔드의 공개 GET 응답 스냅샷(2026-11-17). 실제 모드는 서버 응답을 사용한다.
- Swagger 목록의 공통 `Item` 스키마가 꾸미기 아이템으로 중복 노출되어 목장 목록 필드는 추가로 런타임 확인한다. 실계정 데이터로 최종 계약 검증이 필요하다.

## 검증 한계와 남은 외부 연결

- 실제 계정/토큰으로 등록·조언·신고하는 운영 데이터 변경 테스트는 수행하지 않았다.
- 푸시 구독/서비스워커/알림 클릭 코드 구현. 실제 VAPID 활성화와 브라우저 권한·실기기 수신은 서버 및 사용자의 브라우저에서 검증 필요. 서버 enabled=false면 권한 요청 없이 앱 안 알림으로 안내한다.
- 프론트 1 화면 및 인증 연결, 최종 양 원화, 배포 CORS, 팀 통합 시연·실기기 QA는 별도 확인이 필요하다.
- 작업 브랜치: `feat/21-frontend2-features`. main 병합과 배포는 팀 리뷰 후 별도로 진행한다.
