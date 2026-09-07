# 탄소 기초 1: 탄소란 무엇이고, 왜 중요한가 — 설계 (2026-09-05)

"Carbon, from scratch" 학습 시리즈의 1편. `/climate` 허브의 시리즈 항목 1을 이 글로 연결합니다.

## 목표·독자

- 독자: 개발자(단위·정의·출처의 정확성을 기대). 채용 담당자에게는 "도메인을 정확히 설명하는 사람" 신호.
- 관통 프레임: **단위계** — CO₂e는 서로 다른 가스를 한 단위로 합치는 환율, 탄소 예산은 쿼터.
- 원칙: **글로 설명하기보다 시각화로 설명.** 본문은 각 시각화의 도입·캡션 수준(한국어 1,000자 안팎).

## 파일·메타

- `data/posts/2026-09-05-carbon-basics-what-is-carbon.mdx` + `.en.mdx` (필수 쌍).
- frontmatter: `title: '탄소 기초 1: 탄소란 무엇이고, 왜 중요한가'` (EN: `Carbon Basics 1: What carbon is, and why it matters`),
  `date: 2026-09-05 18:00:00 +0900`, `tags: ['climate', 'carbon', 'co2e', 'carbon-basics']`,
  `topic: climate`, `stage: budding`, `summary`, `author: MartianLee`.
- `scripts/generate-kb-data.mjs`의 `TOPIC_LABELS`에 `climate: 'Climate'` 추가.
- 본문 상단 attribution 한 줄: `_This article is mostly written by Claude Code_` (관례).
- 경어체. em-dash(—) 금지. 표·코드 없음(시각화로 대체).

## 구성

1. **왜 필요한가요** — 2~3문장. 탄소 데이터를 만지면 만나는 단위(t CO₂e, ppm, Gt)를 못 읽으면 숫자를 못 읽는다.
2. **탄소, CO₂, 온실가스, 그리고 CO₂e** — 정의 3줄 + **V1**. 캡션에서 CO₂e를 한 줄로: "메탄 1 kg은 CO₂ 약 28 kg으로 환산해 합친 단위". GWP 표·코드 섹션은 두지 않는다.
3. **규모: 농도와 쿼터** — **V2** + **V3**, 각 1~2문장.
4. **1 t CO₂e를 손에 잡히게** — **V4** + 읽는 법 한 줄.
5. **왜 중요한가요** — 3문장: 쿼터가 유한하니 측정이 중요하다, 다음 편(일상 속 탄소) 예고, `/climate` 허브 링크.
6. **출처와 수치 검증** — 출처 목록 + 기준 연도.

## 시각화 4개

| ID  | 내용                             | 형태                                                                           | 데이터(작성 시 최신치로 검증)                                                                                                                                                    |
| --- | -------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | 전 세계 온실가스 구성(CO₂e 기준) | 3D 입자 구름(가스별 경도 구간, 범례 오버레이)                                  | CO₂ ~75%, CH₄ ~17%, N₂O ~6%, F-gas ~2% (Our World in Data / Climate Watch)                                                                                                       |
| V2  | 대기 중 CO₂ 농도 1959→2025       | 3D 입자 지구 + 연도 타임라인(헤이즈 밀도 ∝ ppm), 280 ppm 기준 표기             | NOAA Mauna Loa 연평균                                                                                                                                                            |
| V3  | 1.5°C 탄소 예산 사용률           | 3D 입자 탱크(사용/잔여) + "현재 속도로 N년치"                                  | Global Carbon Budget 2025                                                                                                                                                        |
| V4  | 활동별 kg CO₂e                   | 3D 부피 큐브(CO₂ 1 kg = 0.535 m³), 사람·자동차 기준 물체, 음수(나무 흡수) 포함 | 나무 1그루 연간 흡수 ≈ −7, 휘발유차 100 km ≈ 17, 소고기 1 kg ≈ 60, 서울↔제주 편도 ≈ 60, 스마트폰 1대 ≈ 70, 가정 한 달 전기 ≈ 130, 세계 1인 연간 ≈ 4,700, 한국 1인 연간 ≈ 11,000 |

## 구현: three.js 3D 장면 (사용자 결정 2026-09-05: "/climate 페이지처럼 3D로 아름답게")

- 시각화 4개는 모두 `components/viz/`의 three.js 장면 컴포넌트: `GasMixCloud`(V1, 가스별 비중만큼 경도 구간에 배치한 입자 구름), `AtmosphereTimeline`(V2, 허브의 입자 지구를 재사용해 연도별 ppm에 비례해 헤이즈가 짙어지는 타임라인 + 스크러버), `BudgetTank`(V3, 입자로 차오르는 원통 탱크), `TonneCubes`(V4, CO₂ 1 kg = 0.535 m³ 기준 실제 비율의 부피 큐브를 사람·자동차 옆에 배치).
- 공통 기반: `useThreeScene`(three 지연 import, 화면에 보일 때만 RAF, reduced-motion 1프레임, dispose), `VizFrame`(캔버스 + 오버레이 + 캡션/출처 + 접근성 폴백 표), `earthScene`(허브 `Globe3D`와 공유).
- 장면 배경은 허브와 같은 어두운 대기 그라데이션(테마 무관), 캡션·표는 사이트 토큰으로 라이트/다크 대응.
- 숫자·출처·KO/EN 라벨은 `data/charts/carbon-basics-1.ts` 한 곳에. MDX에서는 `<GasMixCloud lang="ko" />`처럼 `lang`만 전달.
- `components/MDXComponents.tsx`에 4개 장면 등록.
- 차트 코드 작성 전 **dataviz 스킬 로드** (색·범례·접근성 규칙).
- 상세 태스크는 `docs/superpowers/plans/2026-09-05-carbon-basics-1.md`.

## 허브 연동

- `data/climateData.ts` series.items에 `slug?` 추가, 1편 항목에 `2026-09-05-carbon-basics-what-is-carbon` 연결. 링크는 언어별 포스트 경로(EN `/posts/<slug>`, KO `/ko/posts/<slug>`)로 컴포넌트가 만든다(KB 뷰는 noindex라 포스트 경로가 정식).
- `components/climate/LearningSeries.tsx`: slug 있는 항목은 `Link`로 감싸고 배지를 "읽기 →"/"Read →"로, 없는 항목은 "준비 중" 유지.

## 수치 검증 프로토콜

작성 시 웹에서 확인하고 각 차트 하단에 출처·연도를 적는다: NOAA GML Mauna Loa(연평균 ppm), Global Carbon Budget 2025(연간 화석 CO₂, 잔여 예산), Our World in Data / Climate Watch(가스별 비중), IPCC AR6 WG1(GWP100 값, 캡션용), 국립산림과학원(나무 흡수량), 국내 전력 배출계수, 한국 1인당 배출(GCB/OWID). 확인 불가 항목은 차트에서 뺀다(추정치로 채우지 않는다).

## 검증

- contentlayer 빌드로 KB 자동 등록(`app/kb-data.json` 손대지 않음), `yarn lint`, `yarn build`.
- 로컬 렌더 확인: KO/EN 글, 라이트/다크, 모바일, 허브 시리즈 카드 링크.
- 한국어 자연스러움 정독(번역체·경어체 점검).
