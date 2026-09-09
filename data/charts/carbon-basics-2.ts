// data/charts/carbon-basics-2.ts
// 검증된 수치만 담는다. 각 항목에 출처와 기준 연도를 남긴다. 라벨에 em-dash 금지.
//
// 검증 방법(2026-09-09~10): OWID grapher CSV/메타데이터를 직접 받고, Apple 제품 환경
// 보고서 PDF를 내려받아 본문에서 직접 읽고, 국내 계수는 EG-TIPS(에너지온실가스 종합정보
// 플랫폼) 표에서 확인했다. 출처가 갈리거나 확인되지 않은 항목(택배 라스트마일, 자전거)은
// 넣지 않았다. 1편과 같은 규율이다.

import { CO2_M3_PER_KG } from './carbon-basics-1'

export type Lang = 'en' | 'ko'

export interface Source {
  name: string
  url: string
  year: number
}

export { CO2_M3_PER_KG }

/** 한국 1인당 연간 배출(1편에서 검증한 11,286 kg)을 365로 나눈 하루 평균. */
export const KOREA_PER_CAPITA_DAILY_KG = 30.9

/**
 * 국가 온실가스 배출계수(전력) 소비단, 2023년 기준 0.4173 tCO2eq/MWh.
 * EG-TIPS "에너지 발열량 및 온실가스 배출계수" 표에서 확인했다. 오래 인용되는 0.4594는
 * 2011년 기준값이라 쓰지 않는다. 국가 간 비교(gridMix)는 연도·출처를 통일하기 위해
 * Ember 값을 따로 쓰므로 한국 값이 두 개 나온다. 본문에서 그 이유를 각주로 밝힌다.
 */
export const KOREA_GRID_KG_PER_KWH = 0.4173
export const koreaGridSource: Source = {
  name: '국가 온실가스 배출계수(전력, 소비단) via EG-TIPS',
  url: 'https://tips.energy.or.kr/carbon/Ggas_tatistics03.do',
  year: 2023,
}

/**
 * 도시가스(LNG) 연소 배출계수: 15.236 tC/TJ x 44/12 = 55.865 gCO2/MJ.
 * 부피 기준으로는 순발열량 38.5 MJ/Nm3을 곱해 약 2.15 kg CO2/Nm3.
 * 출처는 koreaGridSource와 같은 EG-TIPS 표.
 */
export const CITY_GAS_G_PER_MJ = 55.865

/* ─────────────────────────── V1: CarbonDay ─────────────────────────── */

/**
 * 하루 시나리오. 통계가 아니라 **모델 계산**이며, 각 항목의 계산식을 주석과 본문에
 * 모두 공개한다. 순서는 하루의 시간 순.
 */
export interface DayItem {
  id: 'shower' | 'commute' | 'lunch' | 'office' | 'streaming'
  /** 24시 기준 발생 시각(장면의 트랙 위치) */
  hour: number
  kg: number
  source: Source
}

const owidFood: Source = {
  name: 'Poore & Nemecek (2018) via Our World in Data',
  url: 'https://ourworldindata.org/grapher/ghg-per-kg-poore',
  year: 2018,
}
const owidTravel: Source = {
  name: 'UK DESNZ (2022 factors) via Our World in Data',
  url: 'https://ourworldindata.org/grapher/carbon-footprint-travel-mode',
  year: 2022,
}
const ieaStreaming: Source = {
  name: 'IEA, The carbon footprint of streaming video (2020년 12월 수정치, 2019년 기준)',
  url: 'https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines',
  year: 2020,
}

export const dayItems: DayItem[] = [
  {
    // 10분 샤워 100L를 15도에서 40도로(25K). 100kg x 4.18kJ/kg/K = 10.45MJ,
    // 보일러 효율 85%로 12.3MJ의 도시가스. 12.3MJ x 55.865gCO2/MJ = 687g.
    id: 'shower',
    hour: 7,
    kg: 0.69,
    source: koreaGridSource,
  },
  {
    // 휘발유 승용차 1인 탑승 170.48 g/pkm x 20km.
    id: 'commute',
    hour: 8,
    kg: 3.41,
    source: owidTravel,
  },
  {
    // 소고기(육우) 99.48 kg CO2e/kg x 0.15kg.
    id: 'lunch',
    hour: 12,
    kg: 14.92,
    source: owidFood,
  },
  {
    // 사무실에서 1인이 쓰는 몫 2.5kWh x 0.4173 kg/kWh.
    id: 'office',
    hour: 18,
    kg: 1.04,
    source: koreaGridSource,
  },
  {
    // 영상 스트리밍 36 g/시간 x 2시간. 대부분은 데이터센터가 아니라 보는 화면에서 나온다.
    id: 'streaming',
    hour: 22,
    kg: 0.07,
    source: ieaStreaming,
  },
]

export const dayTotalKg = 20.13

/* ─────────────────────────── V2: FoodMasses ─────────────────────────── */

/**
 * 식품 1kg 생산 배출(kg CO2e/kg). OWID grapher CSV에서 직접 확인했다.
 * 경계: 토지이용변화 + 농장 + 가공 + 운송 + 포장 + 소매까지. 소비자 단계(조리, 폐기,
 * 장보기 이동)는 제외. 소고기 99.48은 **육우(beef herd)** 한정값이며, 낙농 부산물까지
 * 포함한 가중평균(약 60)과 다르므로 라벨에서 육우임을 밝힌다.
 */
export interface FoodItem {
  id: 'beef' | 'lamb' | 'cheese' | 'pork' | 'poultry' | 'eggs' | 'rice' | 'tofu' | 'vegetables'
  kgPerKg: number
}

export const foods: { items: FoodItem[]; source: Source } = {
  items: [
    { id: 'beef', kgPerKg: 99.48 },
    { id: 'lamb', kgPerKg: 39.72 },
    { id: 'cheese', kgPerKg: 23.88 },
    { id: 'pork', kgPerKg: 12.31 },
    { id: 'poultry', kgPerKg: 9.87 },
    { id: 'eggs', kgPerKg: 4.67 },
    { id: 'rice', kgPerKg: 4.45 },
    { id: 'tofu', kgPerKg: 3.16 },
    { id: 'vegetables', kgPerKg: 0.53 },
  ],
  source: owidFood,
}

/* ─────────────────────────── V3: TravelLanes ─────────────────────────── */

/**
 * 1인 1km당 배출(g CO2e/pkm). OWID grapher CSV에서 직접 확인했다.
 * - flight(국내선)에는 고고도 비행의 비-CO2 온난화 효과가 포함되어 있다.
 * - ev는 영국 전력망 기준이라 한국에서는 더 커진다.
 * - car4는 OWID 발행값이 아니라 carPetrol을 4로 나눈 자체 계산이므로 own: true로 표시하고
 *   라벨에도 밝힌다.
 * - 자전거/도보는 넣지 않는다. 배기 배출은 0이지만 OWID는 식이 기반으로 16~50 g/km라고
 *   따로 적고 있고 DEFRA 공식 차트에는 포함되지 않는다.
 */
export interface TravelItem {
  id: 'flight' | 'carPetrol' | 'motorcycle' | 'bus' | 'ev' | 'car4' | 'rail'
  gPerPkm: number
  own?: boolean
}

export const travel: { items: TravelItem[]; source: Source } = {
  items: [
    { id: 'flight', gPerPkm: 245.87 },
    { id: 'carPetrol', gPerPkm: 170.48 },
    { id: 'motorcycle', gPerPkm: 113.55 },
    { id: 'bus', gPerPkm: 96.5 },
    { id: 'ev', gPerPkm: 47.09 },
    { id: 'car4', gPerPkm: 42.62, own: true },
    { id: 'rail', gPerPkm: 35.49 },
  ],
  source: owidTravel,
}

/* ─────────────────────────── V4: EmbodiedGoods ─────────────────────────── */

/**
 * 물건 1개의 생애 배출(kg CO2e)과 단계 비중.
 * makePct = 제조 + 수송, usePct = 사용(충전, 세탁). 폐기는 어느 출처에서도 1% 미만이라
 * 막대에 넣지 않는다.
 * 경계를 맞추기 위해 모두 생애(cradle-to-grave) 기준으로 골랐다. 티셔츠는 같은 Cotton
 * Incorporated 표에서 제조까지 3.4kg, 미국 소비자 세탁 56회까지 더한 8.4kg이 나오므로
 * 8.4를 쓰고 3.4는 본문에서 경계 이야기를 할 때 인용한다.
 * 운동화는 쓰는 동안 에너지가 들지 않는 제품이라 usePct가 0이다.
 */
export interface GoodsItem {
  id: 'laptop' | 'phone' | 'jeans' | 'shoes' | 'tshirt'
  totalKg: number
  makePct: number
  usePct: number
  source: Source
}

export const goods: GoodsItem[] = [
  {
    // Apple 제품 환경 보고서 2쪽 도넛: 145kg, 제조(재료 38 + 전력 24 + 재생에너지 1) 63,
    // 사용 27, 수송 10, 폐기 1% 미만. MacBook Air 15인치(M5) 512GB 구성.
    id: 'laptop',
    totalKg: 145,
    makePct: 73,
    usePct: 27,
    source: {
      name: 'Apple Product Environmental Report, MacBook Air 15" (M5) 512GB',
      url: 'https://www.apple.com/environment/pdf/products/notebooks/MacBook_Air_M5_PER_Mar2026.pdf',
      year: 2026,
    },
  },
  {
    // 55kg, 제조 77 + 수송 4 = 81, 사용(충전) 18, 폐기 1% 미만. iPhone 17 256GB.
    id: 'phone',
    totalKg: 55,
    makePct: 81,
    usePct: 18,
    source: {
      name: 'Apple Product Environmental Report, iPhone 17 256GB',
      url: 'https://www.apple.com/environment/pdf/products/iphone/iPhone_17_PER_Sept2025.pdf',
      year: 2025,
    },
  },
  {
    // 501 청바지 33.4kg. 소비자 세탁·건조가 37%로 최대 비중, 원단이 27%.
    id: 'jeans',
    totalKg: 33.4,
    makePct: 63,
    usePct: 37,
    source: {
      name: 'Levi Strauss & Co., LCA Fact Sheet (501 jeans)',
      url: 'https://m.levistrauss.com/wp-content/uploads/2015/03/Fact-Sheet-for-LCA-FINAL.pdf',
      year: 2015,
    },
  },
  {
    // 러닝화 1켤레 13.6kg(30 lb). 제조 공정이 3분의 2 이상이고 사용 단계 에너지는 없다.
    id: 'shoes',
    totalKg: 13.6,
    makePct: 100,
    usePct: 0,
    source: {
      name: 'MIT Materials Systems Lab (ASICS 의뢰), J. Cleaner Production',
      url: 'https://news.mit.edu/2013/footwear-carbon-footprint-0522',
      year: 2013,
    },
  },
  {
    // 면 티셔츠: 제조까지 3.4kg, 미국 소비자 세탁 56회 포함 8.4kg(같은 표에서 계산).
    id: 'tshirt',
    totalKg: 8.4,
    makePct: 40,
    usePct: 60,
    source: {
      name: 'Cotton Incorporated, LCA of Cotton Fiber & Fabric',
      url: 'https://cottontoday.cottoninc.com/wp-content/uploads/2016/08/LCA_Executive_Summary_split-1.pdf',
      year: 2012,
    },
  },
]

/** 본문에서 경계 이야기를 할 때 쓰는 티셔츠 3종 값. */
export const tshirtBoundary = {
  gateKg: 3.4,
  graveKg: 8.4,
  hotWashKg: 15,
  hotWashSource: {
    name: 'Carbon Trust, International Carbon Flows: Clothing',
    url: 'https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/international-carbon-flows-clothing',
    year: 2011,
  } as Source,
}

/* ─────────────────────────── V5: GridTiles ─────────────────────────── */

/**
 * 전력 배출집약도(g CO2e/kWh). 네 나라 모두 같은 출처, 같은 연도(2024)로 맞췄다.
 * 한국 값(442.94)이 위의 국내 공식 소비단 계수(417.3)와 다른 이유는 산정 경계와 기준
 * 연도가 다르기 때문이며, 본문 각주에서 밝힌다.
 * 가구 사용량은 통계가 아니라 시나리오 가정이다. 주택용 누진 2단계 구간인 월 300kWh를
 * 쓴다고 두었다.
 */
export const HOUSEHOLD_KWH_PER_YEAR = 3600

export interface GridItem {
  id: 'korea' | 'usa' | 'uk' | 'france'
  gPerKwh: number
}

export const grid: { items: GridItem[]; source: Source } = {
  items: [
    { id: 'korea', gPerKwh: 442.94 },
    { id: 'usa', gPerKwh: 385.49 },
    { id: 'uk', gPerKwh: 151.45 },
    { id: 'france', gPerKwh: 40.48 },
  ],
  source: {
    name: 'Ember (2024) via Our World in Data',
    url: 'https://ourworldindata.org/grapher/carbon-intensity-electricity',
    year: 2024,
  },
}

/* ─────────────────────────── 라벨 ─────────────────────────── */

export interface Labels {
  source: string
  fallbackNote: string
  kg: string
  gPerKm: string
  kgPerKg: string

  dayTitle: string
  dayCaption: string
  day: Record<DayItem['id'], string>
  dayTotal: string
  dayCompare: string

  foodTitle: string
  foodCaption: string
  food: Record<FoodItem['id'], string>

  travelTitle: string
  travelCaption: string
  travel: Record<TravelItem['id'], string>

  goodsTitle: string
  goodsCaption: string
  goods: Record<GoodsItem['id'], string>
  make: string
  use: string

  gridTitle: string
  gridCaption: string
  gridCountry: Record<GridItem['id'], string>
  gridUsage: string
}

export const t: Record<Lang, Labels> = {
  en: {
    source: 'Source',
    fallbackNote: '3D is unavailable here, so the figures are listed as a table.',
    kg: 'kg CO₂e',
    gPerKm: 'g CO₂e / passenger-km',
    kgPerKg: 'kg CO₂e / kg',

    dayTitle: 'A day in carbon',
    dayCaption:
      'A modelled day for an office worker in Seoul, not a measurement. Every formula is listed at the end of the post.',
    day: {
      shower: 'Morning shower',
      commute: 'Commute, 20 km by car',
      lunch: 'Lunch, 150 g of beef',
      office: 'Office electricity, 2.5 kWh',
      streaming: 'Streaming, 2 hours',
    },
    dayTotal: 'Day total',
    dayCompare: "Korea's per-capita average, per day",

    foodTitle: 'What a kilogram of food costs',
    foodCaption:
      'Emissions from production through retail. Cooking and household waste are excluded.',
    food: {
      beef: 'Beef (beef herd)',
      lamb: 'Lamb',
      cheese: 'Cheese',
      pork: 'Pork',
      poultry: 'Chicken',
      eggs: 'Eggs',
      rice: 'Rice',
      tofu: 'Tofu',
      vegetables: 'Vegetables',
    },

    travelTitle: 'The same kilometre, seven ways',
    travelCaption:
      'Per passenger-km, at average occupancy. The domestic flight figure includes the non-CO₂ warming effects of flying at altitude, and the EV figure assumes the UK grid.',
    travel: {
      flight: 'Domestic flight',
      carPetrol: 'Petrol car, alone',
      motorcycle: 'Motorcycle',
      bus: 'Bus',
      ev: 'Electric car (UK grid)',
      car4: 'Petrol car, 4 sharing (own calculation)',
      rail: 'Rail',
    },

    goodsTitle: 'Small objects, large emissions',
    goodsCaption:
      'Lifetime emissions, production through disposal. Running shoes use no energy while you wear them, so production is all of it.',
    goods: {
      laptop: 'Laptop',
      phone: 'Smartphone',
      jeans: 'Jeans',
      shoes: 'Running shoes',
      tshirt: 'Cotton T-shirt',
    },
    make: 'Making and shipping',
    use: 'Using (charging, washing)',

    gridTitle: 'Same life, different grid',
    gridCaption:
      'One household using 3,600 kWh a year, with only the country changed. All four factors come from the same source and year.',
    gridCountry: {
      korea: 'South Korea',
      usa: 'United States',
      uk: 'United Kingdom',
      france: 'France',
    },
    gridUsage: '3,600 kWh per year',
  },
  ko: {
    source: '출처',
    fallbackNote: '3D를 쓸 수 없는 환경이라 수치를 표로 대신합니다.',
    kg: 'kg CO₂e',
    gPerKm: 'g CO₂e / 1인 1km',
    kgPerKg: 'kg CO₂e / kg',

    dayTitle: '하루의 탄소',
    dayCaption:
      '서울 직장인의 하루를 가정한 모델 계산이며 측정값이 아닙니다. 계산식은 글 끝에 모두 적었습니다.',
    day: {
      shower: '아침 온수 샤워',
      commute: '출근, 자가용 20km',
      lunch: '점심, 소고기 150g',
      office: '사무실 전기 2.5kWh',
      streaming: '스트리밍 2시간',
    },
    dayTotal: '하루 합계',
    dayCompare: '한국 1인당 하루 평균',

    foodTitle: '식품 1kg의 값',
    foodCaption: '생산에서 소매까지의 배출입니다. 조리와 가정 폐기는 빠져 있습니다.',
    food: {
      beef: '소고기(육우)',
      lamb: '양고기',
      cheese: '치즈',
      pork: '돼지고기',
      poultry: '닭고기',
      eggs: '달걀',
      rice: '쌀',
      tofu: '두부',
      vegetables: '채소',
    },

    travelTitle: '같은 1km, 일곱 가지 방법',
    travelCaption:
      '평균 탑승 인원을 반영한 1인 1km당 배출입니다. 국내선 항공에는 고고도 비행의 비-CO₂ 온난화 효과가 포함되어 있고, 전기차는 영국 전력망 기준입니다.',
    travel: {
      flight: '국내선 항공',
      carPetrol: '휘발유차, 혼자',
      motorcycle: '오토바이',
      bus: '시내버스',
      ev: '전기차(영국 전력)',
      car4: '휘발유차, 4인 분담(자체 계산)',
      rail: '철도',
    },

    goodsTitle: '작은 물건, 큰 배출',
    goodsCaption:
      '제조부터 폐기까지 더한 생애 배출량입니다. 운동화는 신는 동안 에너지가 들지 않아 제조가 전부입니다.',
    goods: {
      laptop: '노트북',
      phone: '스마트폰',
      jeans: '청바지',
      shoes: '운동화',
      tshirt: '면 티셔츠',
    },
    make: '제조 · 수송',
    use: '사용(충전 · 세탁)',

    gridTitle: '같은 생활, 다른 전력망',
    gridCaption:
      '연 3,600kWh를 쓰는 가구를 그대로 두고 나라만 바꿨습니다. 네 나라 모두 같은 출처, 같은 연도의 계수입니다.',
    gridCountry: { korea: '한국', usa: '미국', uk: '영국', france: '프랑스' },
    gridUsage: '연 3,600kWh',
  },
}
