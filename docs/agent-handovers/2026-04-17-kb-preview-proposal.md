# KB Preview/Stack 개선 핸드오버 (2026-04-17)

## 배경

현재 KB는 링크 클릭 시 전체 페이지 전환만 지원합니다.  
사용자는 `Attention Is All You Need` 노트를 읽다가 기초 노트 링크를 눌렀을 때, 문맥이 끊기지 않는 `hover preview` 또는 `stack view` 형태를 원합니다.

대상 페이지 예시:

- `/kb/2026-04-17-attention-is-all-you-need-paper-note`

## 현재 상태 요약

- KB 라우트/레이아웃은 안정화됨 (`KBShell`, `KBContextPanel`, `KBNotePage`).
- `llm-research` 토픽과 기초 노트 세트는 생성됨.
- MDX 파싱은 `rehype-mermaid` 영향으로 불안정할 수 있어, 인덱싱 안정화를 위해 `DISABLE_REHYPE_MERMAID=true` 플래그를 도입함.
  - 위치: `contentlayer.config.ts`

## 사용자 요구

링크를 클릭하기 전에 관련 노트의 핵심을 가볍게 확인하고, 필요 시 현재 문맥을 유지한 채 추가 문서를 나란히/겹쳐 보길 원함.

## 제안 기능 (우선순위)

### 1) Hover Preview (1차 구현)

- 링크에 250~350ms hover 시 미리보기 카드 표시
- 카드 내용:
  - 제목
  - 요약(summary)
  - 메타(토픽, stage, date)
- UX:
  - 마우스 벗어나면 닫힘
  - `Esc`로 닫기
  - 카드 내 `Open in stack` 버튼 제공

### 2) Stack View (2차 구현)

- `Shift+Click` 또는 Preview 카드 버튼으로 우측 임시 패널에 노트 오픈
- 현재 본문은 유지되고, 스택 패널에서 관련 노트 빠르게 탐색
- 패널 내:
  - 제목/요약/핵심 링크
  - 전체 이동 버튼

### 3) 모바일 대응 (3차 구현)

- hover 대신 tap으로 bottom sheet preview
- 재탭 시 full navigation

## 구현 힌트

- 데이터 소스:
  - 우선 `app/kb-data.json`의 `postIndex`(title, summary, topic, stage, date) 활용
  - 본문 스니펫이 필요하면 후속으로 `excerpt` 필드 추가

- 권장 수정 파일:
  - `components/Link.tsx` (kb 링크 감지/이벤트 처리)
  - `components/kb/KBShell.tsx` (preview portal, stack panel host)
  - `components/kb/KBContextPanel.tsx` (backlinks/links 항목과 preview 연동)
  - `components/kb/KBNoteList.tsx` (목록 링크 hover preview 연동)
  - 필요 시 신규:
    - `components/kb/KBLinkPreview.tsx`
    - `components/kb/KBStackPanel.tsx`

## 수용 기준

- `/kb/*` 페이지에서 내부 KB 링크 hover 시 미리보기 카드가 뜬다.
- 클릭하지 않아도 관련 노트 제목/요약을 확인할 수 있다.
- `Open in stack`으로 현재 읽던 문맥을 유지한 채 관련 노트를 열 수 있다.
- 모바일에서 hover 기능이 깨지지 않고 fallback 동작한다.

## 리스크/주의

- 전역 `Link` 컴포넌트 변경 시 블로그 전체 라우팅 UX 영향 가능
  - KB 경로(`/kb/`)에서만 기능 활성화 권장
- 미리보기 렌더 시 포커스/접근성(`aria`, keyboard navigation) 고려 필요
- 렌더 비용 증가 방지를 위해 preview는 지연 표시 + 캐시 필요

## 실행 메모

- 인덱싱만 빠르게 검증할 때:
  - `DISABLE_REHYPE_MERMAID=true yarn contentlayer2 build`
