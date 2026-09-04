# /climate 허브 1차 런칭 — 설계 (2026-08-31)

승인된 설계입니다. 배경 기획은 `.content-plan/carbon-series-plan.md`(untracked), 승인된 시각/카피
프리뷰는 아티팩트(claude.ai/code/artifact/b3df778d-a80a-4d8d-95ae-21c89cc9c24f)에 있습니다.
카피의 소스 오브 트루스는 `data/climateData.ts`입니다.

## 범위 (1차)

- `/climate` 허브 페이지 1장만. 케이스 스터디 상세 4편·교육 시리즈 글은 후속.
- **nav 탭에 추가하지 않음** (콘텐츠가 채워지면 추가). 진입은 직링크: 홈/About의
  Experience → TomorrowUse 행 (`careerData.href = '/climate'`).
- EDD(Earth Driven Developer) 정체성은 이 페이지 안에서만. 홈/About 격상 보류.

## 페이지 구조 (허브 시안 v7 + 승인 카피)

1. `ClimateHero` — 좌: EDD 선언(제목/선언문/역할), 우: 3D 패널, 아래 스탯 3개
2. `WhatIBuilt` — 케이스 카드 4개(계산기·Cafe24 SaaS·행사 상쇄·회고), 전부 링크 없이 `(upcoming)/(준비 중)` 라벨
3. `HowItWorked` — "어떻게 만들었나요?" 콜아웃 + 스택 필(직접 소유 = moss 색)
4. `LearningSeries` — "Carbon, from scratch" 3개 항목, UPCOMING/예정 (3D 약속 문구 없음)
5. `ClimateCTA` — Available + 이메일/GitHub/LinkedIn (작게, 히어로급 타이포 금지)

- 언어: 영어 우선 + 전역 언어 토글(KO). 카피는 `data/climateData.ts`에 EN/KO 쌍으로.
- 색/폰트: 사이트 토큰(`--paper/--ink/--accent/--line`, primary 램프)과 기존 유틸
  (`.eyebrow/.sec-head/.sec-num`) 재사용. 다크모드 자동 대응.
- SEO: `genPageMetadata({ title: 'Climate' })`, 색인 허용(kb와 달리 noindex 아님).

## 3D 히어로

- `three` npm 의존성, react-three-fiber 사용 안 함 (7월 바닐라 프로토타입 직접 이식).
- `'use client'` + `useEffect` 안 `await import('three')` → /climate 방문 시에만 로드되는 lazy 청크.
  SSR/빌드에는 관여하지 않음 (mermaid SSR hang 교훈).
- 장면: 피보나치 입자 지구(4,200) + 호박색 CO₂ 헤이즈 쉘(2,600, additive) + glow, 저속 자전.
- 폴백 사다리: 정적 radial-gradient 행성 + 링(CSS) → three 로드 성공 시 캔버스 페이드인
  → `prefers-reduced-motion`이면 1프레임만 렌더 → 로드 실패 시 정적 유지.
- 언마운트 시 RAF 취소 + renderer/geometry/material dispose.

## 카피 규칙

- `—`(em-dash)는 콘텐츠에 절대 사용하지 않는다 (사용자 지시).
- KO 본문은 경어체.
- 정직 원칙: 배출계수는 라이선스(직접 구축 아님), 지표는 ~50 가맹점 · 9.8kg/개 ·
  ~100t/월만 공개. 결제는 "payment SDK"로 표기(브랜드 비노출).

## 데이터 교정

- `careerData.ts`: `Stepping` 항목 → company `TomorrowUse`(설명에 제품 Stepping 명시),
  `href` `stepping.co.kr` → `/climate`.

## 검증

`yarn lint` + `yarn build`(static export) 통과, dev(:3456)에서 라이트/다크/모바일/KO 토글
스크린샷 확인, reduced-motion 폴백 확인. 배포는 main 머지 시 자동.
