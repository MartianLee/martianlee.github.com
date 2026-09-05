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

| ID  | 내용                             | 형태                                                                          | 데이터(작성 시 최신치로 검증)                                                                                                                                                    |
| --- | -------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | 전 세계 온실가스 구성(CO₂e 기준) | 100% 누적 가로막대                                                            | CO₂ ~75%, CH₄ ~17%, N₂O ~6%, F-gas ~2% (Our World in Data / Climate Watch)                                                                                                       |
| V2  | 대기 중 CO₂ 농도 1959→2025       | 선그래프 + 280 ppm 기준선                                                     | NOAA Mauna Loa 연평균                                                                                                                                                            |
| V3  | 1.5°C 탄소 예산 사용률           | 쿼터 바(사용/잔여) + "현재 속도로 N년치"                                      | Global Carbon Budget 2025                                                                                                                                                        |
| V4  | 활동별 kg CO₂e                   | 가로막대 + 1 t 기준선, 두 단 눈금(1 t 이하 / 연간 규모), 음수(나무 흡수) 포함 | 나무 1그루 연간 흡수 ≈ −7, 휘발유차 100 km ≈ 17, 소고기 1 kg ≈ 60, 서울↔제주 편도 ≈ 60, 스마트폰 1대 ≈ 70, 가정 한 달 전기 ≈ 130, 세계 1인 연간 ≈ 4,700, 한국 1인 연간 ≈ 11,000 |

## 구현: 차트 컴포넌트 (이미지 아님)

- `components/charts/`: `ChartFrame`(제목·캡션·출처 공통 틀), `HBarChart`(가로막대·기준선·음수·두 단), `StackedBar`(100% 누적), `LineChart`(SVG 선그래프·축·기준선·주석), `QuotaBar`(사용/잔여).
- CSS/SVG 기반, 사이트 토큰(`--ink/--muted/--line/--accent`)으로 라이트·다크 자동 대응, 모바일 반응형, 숫자는 `tabular-nums`.
- 숫자·출처는 `data/charts/carbon-basics-1.ts` 한 곳에. 라벨·캡션은 KO/EN MDX에서 각각 props로 전달.
- `components/MDXComponents.tsx`에 등록해 MDX에서 `<HBarChart .../>` 등으로 삽입.
- 차트 코드 작성 전 **dataviz 스킬 로드** (색·눈금·접근성 규칙).
- 2·3편에서 재사용을 전제로 데이터 형태를 일반화(항목 배열 + 단위 + 기준선).

## 허브 연동

- `data/climateData.ts` series.items에 `href?` 추가, 1편 항목에 `/kb/2026-09-05-carbon-basics-what-is-carbon`(KB 경로 관례) 연결.
- `components/climate/LearningSeries.tsx`: href 있는 항목은 `Link`로 감싸고 배지를 "읽기 →"/"Read →"로, 없는 항목은 "준비 중" 유지.

## 수치 검증 프로토콜

작성 시 웹에서 확인하고 각 차트 하단에 출처·연도를 적는다: NOAA GML Mauna Loa(연평균 ppm), Global Carbon Budget 2025(연간 화석 CO₂, 잔여 예산), Our World in Data / Climate Watch(가스별 비중), IPCC AR6 WG1(GWP100 값, 캡션용), 국립산림과학원(나무 흡수량), 국내 전력 배출계수, 한국 1인당 배출(GCB/OWID). 확인 불가 항목은 차트에서 뺀다(추정치로 채우지 않는다).

## 검증

- contentlayer 빌드로 KB 자동 등록(`app/kb-data.json` 손대지 않음), `yarn lint`, `yarn build`.
- 로컬 렌더 확인: KO/EN 글, 라이트/다크, 모바일, 허브 시리즈 카드 링크.
- 한국어 자연스러움 정독(번역체·경어체 점검).
