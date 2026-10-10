// Mars clock: Mars24 algorithm (Allison & McEwen 2000; NASA GISS). Pure, no DOM.
// Verified against the Mars24 worked example: 2000-01-06T00:00Z gives Ls 277.18759°, MSD 44795.99976, EOT −5.18774°.

export const TT_MINUS_UTC_S = 69.184 // 37 leap seconds + 32.184 s, unchanged since 2017
export const JEZERO = { latDeg: 18.44, lonEastDeg: 77.45 } as const // Perseverance landing site
export const MY39_START_MSD = 54299.0962 // 2026-09-30T08:21Z, Ls = 0
export const SOLS_PER_MARS_YEAR = 668.5991
export const LIGHT_SECONDS_PER_AU = 499.004784

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface MarsClock {
  msd: number
  mtc: number
  ls: number
  my: number
  season: Season
  lmstJezero: number
  nuMinusM: number
  eot: number
  subsolarLatDeg: number
  subsolarLonEastDeg: number
  au: number
  lightSec: number
}

const D = Math.PI / 180
const mod = (a: number, n: number): number => ((a % n) + n) % n
const SEASONS: readonly Season[] = ['spring', 'summer', 'autumn', 'winter']

// JPL "Approximate Positions of the Planets" (1800–2050): a, e, I, L, ϖ, Ω and their rates per century.
type Elements = readonly number[]
const EARTH: Elements = [
  1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0, 0.00000562, -0.00004392,
  -0.01294668, 35999.37244981, 0.32327364, 0,
]
const MARS: Elements = [
  1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882,
  -0.00813131, 19140.30268499, 0.44441088, -0.29257343,
]

function heliocentric(e: Elements, T: number): [number, number, number] {
  const a = e[0] + e[6] * T
  const ec = e[1] + e[7] * T
  const I = (e[2] + e[8] * T) * D
  const L = e[3] + e[9] * T
  const wb = e[4] + e[10] * T
  const O = e[5] + e[11] * T
  const w = (wb - O) * D
  const Or = O * D
  const M = (mod(L - wb + 180, 360) - 180) * D
  let E = M + ec * Math.sin(M)
  for (let k = 0; k < 12; k++) E -= (E - ec * Math.sin(E) - M) / (1 - ec * Math.cos(E))
  const x = a * (Math.cos(E) - ec)
  const y = a * Math.sqrt(1 - ec * ec) * Math.sin(E)
  const cw = Math.cos(w),
    sw = Math.sin(w),
    cO = Math.cos(Or),
    sO = Math.sin(Or),
    cI = Math.cos(I),
    sI = Math.sin(I)
  return [
    (cw * cO - sw * sO * cI) * x + (-sw * cO - cw * sO * cI) * y,
    (cw * sO + sw * cO * cI) * x + (-sw * sO + cw * cO * cI) * y,
    sw * sI * x + cw * sI * y,
  ]
}

export function marsClock(ms: number, ttMinusUtc: number = TT_MINUS_UTC_S): MarsClock {
  const jdTT = 2440587.5 + ms / 8.64e7 + ttMinusUtc / 86400
  const dt = jdTT - 2451545.0
  const M = (19.3871 + 0.52402073 * dt) * D
  const aFMS = 270.3871 + 0.524038496 * dt
  const A = [0.0071, 0.0057, 0.0039, 0.0037, 0.0021, 0.002, 0.0018]
  const TAU = [2.2353, 2.7543, 1.1177, 15.7866, 2.1354, 2.4694, 32.8493]
  const PHI = [49.409, 168.173, 191.837, 21.736, 15.704, 95.528, 49.095]
  let pbs = 0
  for (let i = 0; i < 7; i++) pbs += A[i] * Math.cos(((0.985626 * dt) / TAU[i] + PHI[i]) * D)
  const nuMinusM =
    (10.691 + 3e-7 * dt) * Math.sin(M) +
    0.623 * Math.sin(2 * M) +
    0.05 * Math.sin(3 * M) +
    0.005 * Math.sin(4 * M) +
    0.0005 * Math.sin(5 * M) +
    pbs
  const ls = mod(aFMS + nuMinusM, 360)
  const lsR = ls * D
  const eot =
    2.861 * Math.sin(2 * lsR) - 0.071 * Math.sin(4 * lsR) + 0.002 * Math.sin(6 * lsR) - nuMinusM
  const msd = (dt - 4.5) / 1.0274912517 + 44796.0 - 0.0009626
  const mtc = mod(24 * msd, 24)
  const my = 39 + Math.floor((msd - MY39_START_MSD) / SOLS_PER_MARS_YEAR)
  const season = SEASONS[Math.floor(ls / 90)]
  const lmstJezero = mod(mtc + JEZERO.lonEastDeg / 15, 24)
  const subsolarLatDeg = Math.asin(0.42565 * Math.sin(lsR)) / D + 0.25 * Math.sin(lsR)
  const subsolarLonEastDeg = mod(360 - mod(15 * mtc + eot + 180, 360), 360)
  const T = dt / 36525
  const e = heliocentric(EARTH, T)
  const m = heliocentric(MARS, T)
  const au = Math.hypot(m[0] - e[0], m[1] - e[1], m[2] - e[2])
  return {
    msd,
    mtc,
    ls,
    my,
    season,
    lmstJezero,
    nuMinusM,
    eot,
    subsolarLatDeg,
    subsolarLonEastDeg,
    au,
    lightSec: au * LIGHT_SECONDS_PER_AU,
  }
}
