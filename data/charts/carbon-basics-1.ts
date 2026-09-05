// data/charts/carbon-basics-1.ts
// 검증된 수치만 담는다. 각 항목에 출처와 기준 연도를 남긴다. 라벨에 em-dash 금지.
//
// 검증 방법: WebFetch로 1차 자료(NOAA CSV, 국립산림과학원 PDF, GCB 공식 페이지)를 직접
// 내려받거나, WebSearch로 교차 확인했다. 항목별 출처는 각 값 옆 주석과 각 Source 필드 참고.

export type Lang = 'en' | 'ko'

export interface Source {
  name: string
  url: string
  year: number
}

/**
 * V1: 전 세계 온실가스 구성(CO₂e 기준, %)
 * 출처: Our World in Data "Greenhouse gas emissions"(ourworldindata.org/greenhouse-gas-emissions
 * 의 "By gas" 섹션, Climate Watch/CAIT 데이터), 2016년 기준 수치.
 * 검증: OWID의 현재 "by gas" 인터랙티브 차트(grapher/ghg-emissions-by-gas)는 국가별
 * 시계열(CO2/CH4/N2O만, F-가스 미포함)이라 4종 비중이 텍스트로 노출되지 않는다. 대신
 * 동일한 Climate Watch/CAIT 데이터를 쓰는 WRI의 "World Greenhouse Gas Emissions: 2016"
 * Sankey 차트(wri.org/data/world-greenhouse-gas-emissions-2016)가 CO2 74.4%, 메탄
 * 17.3%, 아산화질소 6.2%로 명시하고 있어(WebFetch로 확인), 브리프 수치(74.4/17.3/6.2/2.1,
 * 합 100.0)가 2016년 데이터와 일치함을 교차 확인했다. OWID 쪽에 더 최신 연도의 4종 비중
 * 재집계본은 없어 값은 그대로 두고 연도만 2016으로 확정한다.
 */
export interface GasShare {
  id: 'co2' | 'ch4' | 'n2o' | 'fgas'
  share: number
  color: string
}
export const gasMix: { shares: GasShare[]; source: Source } = {
  shares: [
    { id: 'co2', share: 74.4, color: '#e6a760' },
    { id: 'ch4', share: 17.3, color: '#a8bd74' },
    { id: 'n2o', share: 6.2, color: '#cf7a3d' },
    { id: 'fgas', share: 2.1, color: '#f4efe4' },
  ],
  source: {
    name: 'Our World in Data (Climate Watch)',
    url: 'https://ourworldindata.org/greenhouse-gas-emissions',
    year: 2016,
  },
}

/**
 * V2: Mauna Loa 연평균 CO₂ 농도(ppm).
 * 검증: WebFetch로 NOAA GML의 원본 CSV를 직접 내려받아 1959~2025년 67개 행 전부를
 * 옮겼다(결측 연도 없음, 최신 완결 연도 2025). preindustrial 280 ppm은 NOAA/IPCC가
 * 공통으로 쓰는 산업화 이전 기준값으로 별도 수치 변경 없음.
 */
export const co2Annual: { preindustrial: number; series: [number, number][]; source: Source } = {
  preindustrial: 280,
  series: [
    [1959, 315.98],
    [1960, 316.91],
    [1961, 317.64],
    [1962, 318.45],
    [1963, 318.99],
    [1964, 319.62],
    [1965, 320.04],
    [1966, 321.37],
    [1967, 322.18],
    [1968, 323.05],
    [1969, 324.62],
    [1970, 325.68],
    [1971, 326.32],
    [1972, 327.46],
    [1973, 329.68],
    [1974, 330.19],
    [1975, 331.13],
    [1976, 332.03],
    [1977, 333.84],
    [1978, 335.41],
    [1979, 336.84],
    [1980, 338.76],
    [1981, 340.12],
    [1982, 341.48],
    [1983, 343.15],
    [1984, 344.87],
    [1985, 346.35],
    [1986, 347.61],
    [1987, 349.31],
    [1988, 351.69],
    [1989, 353.2],
    [1990, 354.45],
    [1991, 355.7],
    [1992, 356.54],
    [1993, 357.21],
    [1994, 358.96],
    [1995, 360.97],
    [1996, 362.74],
    [1997, 363.88],
    [1998, 366.84],
    [1999, 368.54],
    [2000, 369.71],
    [2001, 371.32],
    [2002, 373.45],
    [2003, 375.98],
    [2004, 377.7],
    [2005, 379.98],
    [2006, 382.09],
    [2007, 384.02],
    [2008, 385.83],
    [2009, 387.64],
    [2010, 390.1],
    [2011, 391.85],
    [2012, 394.06],
    [2013, 396.74],
    [2014, 398.81],
    [2015, 401.01],
    [2016, 404.41],
    [2017, 406.76],
    [2018, 408.72],
    [2019, 411.65],
    [2020, 414.21],
    [2021, 416.41],
    [2022, 418.53],
    [2023, 421.08],
    [2024, 424.61],
    [2025, 427.35],
  ],
  source: {
    name: 'NOAA GML, Mauna Loa annual mean',
    url: 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv',
    year: 2025,
  },
}

/**
 * V3: 1.5°C 탄소 예산(GtCO₂). used + remaining = total
 *
 * 검증(모두 Global Carbon Budget 2025, 2025-11 공표 / ESSD 논문 essd-18-3211-2026 기준):
 * - remainingGt = 170: "The remaining carbon budget from the beginning of 2026 for a 50%
 *   likelihood to limit warming to 1.5°C is nearly exhausted (50 GtC, 170 GtCO2 left)."
 *   (globalcarbonbudget.org/key-targets-2025/, WebFetch로 원문 확인)
 * - annualGt = 42.2: 2025년 화석 CO2 38.1 GtCO2 + 토지이용변화 CO2 4.1 GtCO2.
 *   ESSD 논문 요약문이 "Combined (2025): approximately 11.5 GtC yr-1 or 42.2 GtCO2 yr-1"로
 *   명시(essd.copernicus.org/articles/18/3211/2026/, WebFetch로 확인).
 * - usedGt = 2793.7: GCB 2025 보도자료/논문에는 "1850년 이후 누적 배출" 총량이 직접
 *   명시돼 있지 않아, Global Carbon Project 데이터를 쓰는 Our World in Data의
 *   "Cumulative CO2 emissions including land-use change" 시계열(1850년부터 시작 -
 *   sinceYear=1850과 정확히 일치)에서 2024년 누적치 2,751,504,300,000 t = 2751.5 GtCO2를
 *   가져오고, 여기에 위 annualGt(2025년 추정 42.2 GtCO2)를 더해 2025년 말 기준
 *   누적치를 근사했다: 2751.5 + 42.2 = 2793.7 GtCO2.
 *   (curl로 https://ourworldindata.org/grapher/cumulative-co2-including-land.csv 직접 확인)
 * - 정합성 체크: usedGt + remainingGt = 2793.7 + 170 = 2963.7 GtCO2. IPCC AR6가 제시한
 *   "1850~2019 누적 약 2390 GtCO2 + 2020년 시점 잔여 약 500 GtCO2(50%) = 약 2890 GtCO2"
 *   범위와 자릿수가 맞아 근사치로 타당하다고 판단.
 * - sinceYear=1850, asOfYear=2025: remaining budget은 "2026년 시작 시점" 기준이므로,
 *   이는 "2025년 말까지 누적 배출을 다 쓴 뒤 남은 양"과 동치. asOfYear는 그 누적 시점인
 *   2025로 둔다.
 */
export const carbonBudget: {
  usedGt: number
  remainingGt: number
  annualGt: number
  sinceYear: number
  asOfYear: number
  source: Source
} = {
  usedGt: 2793.7,
  remainingGt: 170,
  annualGt: 42.2,
  sinceYear: 1850,
  asOfYear: 2025,
  source: {
    name: 'Global Carbon Budget 2025',
    url: 'https://globalcarbonbudget.org/key-targets-2025/',
    year: 2025,
  },
}

/**
 * CO₂ 1 kg이 차지하는 부피(m³), 15°C 1 atm 기준 밀도 1.87 kg/m³
 * 검증: Wikipedia(carbon dioxide) 물성표의 0°C 1atm 밀도 1.977 kg/m³를 이상기체 법칙으로
 * 15°C(288.15K)로 환산하면 1.977 x (273.15/288.15) = 1.874 kg/m³로 1.87과 일치.
 * 1 / 1.87 = 0.5348 -> 0.535 m³/kg. 브리프 값 그대로 유지.
 */
export const CO2_M3_PER_KG = 0.535

/**
 * V4: 활동별 kg CO₂e. 음수는 흡수.
 * 스마트폰 1대 생산 항목은 Step 3 shape/Labels.tonne에 슬롯이 없어(브리프 최소 구성에도
 * 없음) 최종 목록에서 제외했다. 그 외 항목은 모두 아래와 같이 실제 출처로 검증했다.
 * flight(김포-제주 항공편) 항목은 기존 Curb6 수치(140.7kg)가 방법론 미공개였고, 대체
 * 출처로 (a) 국내 항공사 노선별 계산기, (b) Google 항공편 배출량 추정치를 인용한
 * 자료, (c) ICAO Carbon Emissions Calculator의 GMP-CJU 결과를 명시한 자료를 모두
 * 찾아봤으나 non-CO2 승수 없이 1인 기준 kg 수치를 명확한 출처와 함께 제시하는 자료를
 * 찾지 못해(WebSearch/WebFetch로 확인, 2026-09-05) 항목 자체를 제거했다. t.en.tonne /
 * t.ko.tonne의 flight 라벨도 함께 제거해 1:1 대응을 유지한다.
 */
export interface TonneItem {
  id: string
  kg: number
  source: Source
}
export const tonneItems: TonneItem[] = [
  {
    // 국립산림과학원 "산림에서의 탄소순흡수량 국가표준"(2012) 표-2: 소나무(평균)의
    // 60년간 누적 흡수량 141.04kg을 60으로 나눈 연평균값(=2.35). 141.04/60=2.3507로
    // 표의 2.35와 일치해 "그루당 연간 CO2 흡수량"임을 확인했다.
    id: 'tree',
    kg: -2.35,
    source: {
      name: '국립산림과학원, 산림에서의 탄소순흡수량 국가표준(소나무 평균)',
      url: 'https://www.forest.go.kr/newkfsweb/cmm/fms/BoardFileDown.do?atchFileId=FILE_000000000547606&fileSn=0&bbsId=BBSMSTR_1493',
      year: 2012,
    },
  },
  {
    // 같은 국립산림과학원 자료(첨부 3)의 승용차-소나무 비교 산출 근거에 있는
    // "에너지효율 2등급 승용차, 연비 14.4km/L 기준 km당 CO2 배출량 162g"을 그대로 사용.
    // 162g/km x 100km = 16.2kg. (환경부/교통안전공단에 100km당 수치를 직접 공표한
    // 자료를 찾지 못해 브리프가 허용한 대체 계산식 방식을 따르되, EPA 대신 이 국내
    // 공식 자료의 배출계수를 썼다.)
    id: 'car100km',
    kg: 16.2,
    source: {
      name: '국립산림과학원(지식경제부 자동차 에너지소비효율 2등급 기준 인용)',
      url: 'https://www.forest.go.kr/newkfsweb/cmm/fms/BoardFileDown.do?atchFileId=FILE_000000000547606&fileSn=0&bbsId=BBSMSTR_1493',
      year: 2012,
    },
  },
  {
    // OWID "food-choice-vs-eating-local" 기사에 "Producing a kilogram of beef emits
    // 60 kilograms of greenhouse gases"로 Poore & Nemecek(2018)을 인용해 명시.
    id: 'beef',
    kg: 60,
    source: {
      name: 'Poore & Nemecek 2018',
      url: 'https://ourworldindata.org/food-choice-vs-eating-local',
      year: 2018,
    },
  },
  {
    // 가구 월평균 사용량(295kWh, 출처 불명확) 주장 대신 정해진 양인 "전기 300 kWh"를
    // 기준으로 삼는다. 300 x 0.4173(국가 전력배출계수, 2023년도, 기후에너지환경부가
    // 2025-12-17 국가온실가스 통계관리위원회에서 확정 공표) = 125.19 -> 125.2kg.
    id: 'electricity',
    kg: 125.2,
    source: {
      name: '전기 300 kWh x 국가 전력 배출계수 0.4173 kgCO₂/kWh (온실가스종합정보센터, 2023)',
      url: 'https://www.kharn.kr/mobile/article.html?no=29600',
      year: 2023,
    },
  },
  { id: 'tonne', kg: 1000, source: { name: 'reference', url: '', year: 2025 } },
  {
    // Our World in Data per-capita CO2 그래퍼(co-emissions-per-capita) 2024년 값
    // 4.729075 t -> 4729kg. curl로 그래퍼 CSV를 직접 받아 확인.
    id: 'worldPerCapita',
    kg: 4729,
    source: {
      name: 'Our World in Data',
      url: 'https://ourworldindata.org/co2-emissions',
      year: 2024,
    },
  },
  {
    // 같은 그래퍼의 South Korea 2024년 값 11.285893 t -> 11286kg. OWID의
    // South Korea CO2 프로필 페이지도 "11.29 tonnes in 2024"로 동일하게 확인.
    id: 'koreaPerCapita',
    kg: 11286,
    source: {
      name: 'Our World in Data',
      url: 'https://ourworldindata.org/co2-emissions',
      year: 2024,
    },
  },
]

/** 장면·폴백 표에 쓰는 KO/EN 라벨 */
export interface Labels {
  gas: Record<GasShare['id'], string>
  gasTitle: string
  gasCaption: string
  timelineTitle: string
  timelineCaption: string
  ppm: string
  year: string
  preindustrial: string
  play: string
  pause: string
  budgetTitle: string
  budgetCaption: string
  used: string
  remaining: string
  yearsLeft: (n: number) => string
  tonneTitle: string
  tonneCaption: string
  tonne: Record<string, string>
  human: string
  car: string
  kg: string
  fallbackNote: string
  source: string
}

export const t: Record<Lang, Labels> = {
  en: {
    gas: { co2: 'CO₂', ch4: 'Methane (CH₄)', n2o: 'Nitrous oxide (N₂O)', fgas: 'F-gases' },
    gasTitle: 'What the world emits, by gas',
    gasCaption:
      'Every gas is converted to CO₂-equivalent (CO₂e): 1 kg of methane counts as about 28 kg of CO₂. That is how one number can hold four gases.',
    timelineTitle: 'CO₂ in the air, 1959 to today',
    timelineCaption:
      'Annual mean at Mauna Loa. The haze around the Earth thickens in proportion to the concentration; the dashed ring is the pre-industrial 280 ppm.',
    ppm: 'ppm',
    year: 'Year',
    preindustrial: 'pre-industrial 280 ppm',
    play: 'Play',
    pause: 'Pause',
    budgetTitle: 'The 1.5 °C carbon budget as a tank',
    budgetCaption:
      'Cumulative CO₂ since 1850 has used most of the budget that keeps warming to 1.5 °C. At the current rate the remainder lasts only a few years.',
    used: 'used',
    remaining: 'remaining',
    yearsLeft: (n) => `about ${n} years at the current rate`,
    tonneTitle: 'How big is a tonne of CO₂?',
    tonneCaption:
      'CO₂ is a gas, so a tonne fills about 535 m³: a cube 8.1 m on a side. Each cube is drawn to scale next to a person (1.7 m) and a car.',
    tonne: {
      tree: 'One tree absorbs in a year',
      car100km: 'Petrol car, 100 km',
      beef: '1 kg of beef',
      electricity: '300 kWh of electricity (roughly a home for a month)',
      tonne: 'One tonne',
      worldPerCapita: 'World average, one person, one year',
      koreaPerCapita: 'Korea average, one person, one year',
    },
    human: 'person, 1.7 m',
    car: 'car',
    kg: 'kg CO₂e',
    fallbackNote: 'The 3D scene is unavailable here; the same data is shown as a table.',
    source: 'Source',
  },
  ko: {
    gas: { co2: 'CO₂', ch4: '메탄(CH₄)', n2o: '아산화질소(N₂O)', fgas: 'F-가스' },
    gasTitle: '세계는 어떤 가스를 얼마나 내보내나',
    gasCaption:
      '모든 가스는 CO₂ 환산량(CO₂e)으로 바꿔 더합니다. 메탄 1 kg은 CO₂ 약 28 kg으로 칩니다. 그래서 숫자 하나에 네 가지 가스를 담을 수 있습니다.',
    timelineTitle: '대기 중 CO₂, 1959년부터 지금까지',
    timelineCaption:
      '마우나로아 관측소 연평균입니다. 지구를 감싼 헤이즈는 농도에 비례해 짙어지고, 점선 고리는 산업화 이전 280 ppm입니다.',
    ppm: 'ppm',
    year: '연도',
    preindustrial: '산업화 이전 280 ppm',
    play: '재생',
    pause: '일시정지',
    budgetTitle: '1.5°C 탄소 예산을 탱크로 보면',
    budgetCaption:
      '1850년 이후 누적 배출이 1.5°C를 지키는 예산의 대부분을 이미 썼습니다. 지금 속도라면 남은 양은 몇 년 안에 바닥납니다.',
    used: '사용',
    remaining: '잔여',
    yearsLeft: (n) => `지금 속도로 약 ${n}년치`,
    tonneTitle: 'CO₂ 1톤은 얼마나 클까',
    tonneCaption:
      'CO₂는 기체라서 1톤이 약 535 m³, 한 변 8.1 m 큐브를 채웁니다. 각 큐브는 사람(1.7 m)과 자동차 옆에 실제 비율로 그렸습니다.',
    tonne: {
      tree: '나무 한 그루가 1년간 흡수',
      car100km: '휘발유차 100 km',
      beef: '소고기 1 kg',
      electricity: '전기 300 kWh (한 가정의 한 달 정도)',
      tonne: '1톤',
      worldPerCapita: '세계 평균 1인 1년',
      koreaPerCapita: '한국 평균 1인 1년',
    },
    human: '사람 1.7 m',
    car: '자동차',
    kg: 'kg CO₂e',
    fallbackNote: '이 환경에서는 3D 장면을 보여줄 수 없어 같은 데이터를 표로 보여줍니다.',
    source: '출처',
  },
}
