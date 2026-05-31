# KB 전용 검색 (Cmd+K 팔레트) 설계

- 날짜: 2026-06-01
- 대상 페이지: `/kb`, `/kb/[slug]`, `/kb/preview/[slug]`
- 상태: 승인됨, 구현 계획 대기

## 배경

KB 페이지는 VS Code/Obsidian 스타일의 전체화면 UI(`KBShell`)로, 전역 헤더가 보이지 않는 몰입형 뷰입니다. root layout(`app/layout.tsx`)의 pliny `SearchProvider`(kbar)가 전역으로 Cmd+K를 듣고 있어 KB 페이지에서도 Cmd+K를 누르면 **블로그 포스트 전체**(`public/search.json`, 약 82개)를 대상으로 하는 모달이 뜨고, 결과 클릭 시 `/blog/...` 같은 일반 포스트로 이동합니다.

상태바에는 이미 `Cmd+K to search` 안내 문구가 있으나, **KB 노트만 검색하고 `/kb/[slug]` 뷰에 머무르는 전용 검색은 미구현** 상태입니다. 본 설계는 이 KB 전용 검색을 추가합니다.

## 결정 사항

- **UI 형태**: Cmd+K 커맨드 팔레트(모달). 인라인 박스 아님.
- **검색 범위**: 메타데이터(title / summary / tags / topic label). 본문 전체 검색 아님 → 추가 인덱스 로딩 불필요.

## 동작 개요

KB 라우트 안에 있는 동안만 Cmd+K(맥) / Ctrl+K(윈도우)를 가로채 전역 블로그 검색 대신 KB 전용 팔레트를 띄웁니다.

- **열기**: Cmd+K, 또는 상태바의 "Cmd+K to search" 클릭
- **닫기**: Esc, 바깥(backdrop) 클릭
- **탐색**: ↑/↓ 선택 이동, Enter로 `/kb/[slug]` 이동(이동 시 자동 닫힘), 결과 클릭도 이동

### 전역 kbar와의 충돌 처리

전역 kbar도 Cmd+K를 듣고 있으므로, KB 영역에서 **capture 단계** keydown 리스너를 `window`에 등록한다. Cmd+K를 잡으면 `preventDefault()` + `stopImmediatePropagation()`으로 kbar의 핸들러까지 도달하지 못하게 막은 뒤 KB 팔레트를 연다. 컴포넌트 언마운트(= KB 페이지 이탈) 시 리스너를 해제하여 전역 검색이 정상 복귀하도록 한다.

## 컴포넌트 구조

기존 KB 컴포넌트는 모두 `components/kb/` 아래에 있고, `app/kb/KBBodyClass.tsx`가 모든 KB 라우트를 감싸는 단일 클라이언트 래퍼다.

### 새 파일 (1개)

- **`components/kb/KBSearchPalette.tsx`** (client) — 자기완결형
  - 내부에서 `open` 상태를 직접 관리, capture-단계 Cmd+K 리스너 등록/해제
  - `window`의 커스텀 이벤트 `kb:open-search`를 청취 → 상태바 클릭으로 열기 지원
  - 모달 오버레이 UI(입력창 + 결과 리스트) 렌더링
  - `next/navigation`의 `useRouter`로 `/kb/[slug]` 이동
  - 데이터: `app/kb-data.json`의 `postIndex` / `topics`를 직접 import (`KBData` 타입)

### 기존 파일 수정 (2곳, 최소)

- **`app/kb/KBBodyClass.tsx`** — `<KBSearchPalette />`를 한 번 마운트(모든 KB 라우트 공통 적용).
- **`app/kb/page.tsx`** — 상태바의 `Cmd+K to search` 텍스트를 클릭 시 `kb:open-search` 이벤트를 dispatch하는 버튼으로 변경(선택적 편의 기능). 다른 KB 컴포넌트(Sidebar/NoteList/Shell)는 수정하지 않는다.

## 검색 로직 & 랭킹

**대상 필드**: 각 노트의 `title`, `summary`, `tags[]`, 그리고 `topics`에서 id→label을 찾은 topic label 텍스트.

**매칭**: 질의를 소문자화 후 공백으로 토큰 분리. 각 노트에 대해 **모든 토큰**이 위 필드 어딘가에 부분 문자열로 존재하면 매칭(AND). 영어/한글 모두 단순 substring으로 처리(형태소 분석 없음).

**랭킹**(점수 높은 순):

- 필드 가중치: 제목 매칭 > 태그 매칭 > 요약/토픽 매칭
- 동점 시 최신 날짜 우선
- 결과 상한 약 50개

**상태별 표시**:

- **빈 질의**: 최근 노트 8개(날짜순), "Recent" 라벨
- **결과 있음**: 매칭 리스트, 첫 항목 자동 선택. 각 행 = stage 아이콘 + 제목 + 메타(토픽 · backlink 수 등)
- **결과 없음**: "No notes found" 안내

**스타일**: 기존 `kb-theme` CSS 변수(`--kb-bg`, `--kb-surface`, `--kb-border`, `--kb-accent` 등) + `font-mono`로 일관성 유지. 매칭 글자 하이라이트는 범위 제외(YAGNI).

## 검증

dev 서버(`yarn dev`, 포트 3456) 기동 후 KB 페이지에서 수동 확인:

- Cmd+K로 KB 팔레트가 열리는가 / 전역 블로그 검색이 안 뜨는가
- 입력에 따른 실시간 필터링(제목·태그·요약·토픽)
- ↑/↓ 선택 이동, Enter 이동, Esc 닫기, backdrop 클릭 닫기
- 상태바 "Cmd+K to search" 클릭으로 열기
- KB 페이지를 벗어나면 전역 Cmd+K 검색이 정상 복귀하는가

필요 시 playwright로 자동 확인.

## 범위 밖 (YAGNI)

- 본문 전체 검색 / search.json 조인
- 매칭 글자 하이라이트
- 검색 히스토리, 퍼지 매칭, 가중 스코어링 고도화
