# Browser Automation Comparison Post Design

## Overview

Playwright, agent-browser, Lightpanda 세 도구의 개념적 차이를 시각화하고, 실용적인 선택 가이드를 제공하는 블로그 포스트.

## Target Audience

AI 에이전트/자동화 도구를 만들려는 개발자. "어떤 브라우저 자동화 도구를 써야 하지?"라는 실용적 선택을 돕는 글. 아키텍처 비교는 최소한으로.

## Post Metadata

- **slug**: `2026-04-16-browser-automation-comparison`
- **title**: "Playwright vs agent-browser vs Lightpanda — 브라우저 자동화 도구, 어떤 걸 써야 할까?"
- **topic**: `ai-infrastructure`
- **tags**: `['playwright', 'agent-browser', 'lightpanda', 'browser-automation', 'ai-agent', 'comparison']`
- **stage**: `budding`
- **예상 읽기 시간**: 10분 내외

## Post Structure

### 1. 의사결정 트리 (Mermaid flowchart)

독자의 상황에 따라 도구를 추천하는 의사결정 트리. 글 최상단 배치.

분기 기준:

- AI 에이전트가 브라우저를 조작하는가? → agent-browser
- 대량 크롤링/스크래핑이 목적인가? → Lightpanda
- E2E 테스트 또는 범용 자동화인가? → Playwright

추가 분기: AI 기반 E2E 테스트 자동화 → agent-browser (필자 실제 경험 기반)

### 2. 핵심 차이 비교 테이블

Markdown 테이블로 다음 항목 비교:

| 비교 항목   | Playwright                   | agent-browser              | Lightpanda             |
| ----------- | ---------------------------- | -------------------------- | ---------------------- |
| 레이어      | 테스트 프레임워크 (High)     | AI 에이전트 미들웨어 (Mid) | 브라우저 엔진 (Low)    |
| 주요 목적   | E2E 테스트 / 범용 자동화     | AI 에이전트 웹 탐색        | 대량 크롤링 / 스크래핑 |
| 언어        | TypeScript/Python/Java/C#    | Rust                       | Zig                    |
| 브라우저    | Chromium/Firefox/WebKit 번들 | Chrome/Lightpanda/Cloud    | 자체 엔진 (독립 구현)  |
| 프로토콜    | CDP + 자체 프로토콜          | CDP                        | CDP / MCP              |
| AI 친화성   | 낮음 (수동 셀렉터)           | 높음 (접근성 트리 Ref)     | 중간 (MCP 지원)        |
| 리소스 사용 | 높음 (실제 브라우저)         | 중간 (데몬 + 브라우저)     | 낮음 (Chrome 대비 9x)  |
| JS 실행     | 완전 지원                    | 브라우저 위임              | V8 내장 (부분 지원)    |

### 3. 도구별 한 줄 포지셔닝

각 도구를 한 문장으로 정리. 기존 블로그 글로의 `[[wiki-link]]` 포함:

- Playwright: 크로스 브라우저 E2E 테스트의 사실상 표준 (추후 아키텍처 분석 글 작성 예정)
- agent-browser: AI 에이전트가 웹을 "눈으로 보고 손으로 조작"할 수 있게 해주는 미들웨어 → `[[2026-04-09-agent-browser-architecture]]`
- Lightpanda: 브라우저 자체를 AI/스크래핑 용도로 재설계한 초경량 엔진 → `[[2026-03-13-lightpanda-architecture]]`

### 4. 동일 태스크 코드 비교

**태스크**: "Hacker News 첫 페이지에서 상위 5개 글의 제목과 URL을 추출"

세 도구로 각각 구현:

- **Playwright**: `page.locator()` + CSS 셀렉터 방식 (TypeScript)
- **agent-browser**: CLI 명령 또는 접근성 트리 Ref 기반 (CLI/JSON)
- **Lightpanda**: CDP 직접 호출 또는 Playwright 호환 모드

코드 블록 3개 + 접근 방식 차이 1-2문장 코멘트.

### 5. 결론 + 기존 글 링크

- 세 도구는 경쟁이 아니라 스택의 서로 다른 레이어
- "테스트면 Playwright, AI 에이전트면 agent-browser, 대량 크롤링이면 Lightpanda"
- 조합 사용 가능 (예: agent-browser + Lightpanda)
- 필자의 경험: agent-browser로 E2E 자동화 시 Playwright보다 토큰 효율적이고 빨랐음

관련 글 섹션:

- `[[2026-03-13-lightpanda-architecture]]` — Lightpanda 아키텍처 분석
- `[[2026-04-09-agent-browser-architecture]]` — agent-browser 아키텍처 분석
- Playwright 아키텍처 분석 — 추후 작성 예정

## KB Integration

이 포스트는 KB의 첫 번째 cross-link 글이 됨:

- `forwardLinks`에 Lightpanda, agent-browser 글이 등록됨
- 두 기존 글의 `backlinks`에 이 포스트가 자동 등록됨
- `generate-kb-data.mjs`의 기존 `[[wiki-link]]` 파싱 로직으로 자동 처리

## Writing Style

- 경어체 사용 (~입니다, ~합니다)
- Mermaid 다이어그램 활용 (블로그에 rehype-mermaid 지원 있음)
- `*This article is mostly written by Claude Code*` 표기 포함

## Future Related Posts

- Playwright 아키텍처 분석 (별도 글)
- 브라우저 자동화 스택 레이어별 아키텍처 심층 비교 (별도 글)
