import { test } from 'node:test'
import assert from 'node:assert/strict'
import { marsClock } from './clock.ts'
import { formatClock, formatLightTime, formatMsd } from './format.ts'

const near = (a: number, b: number, eps: number, msg: string) =>
  assert.ok(Math.abs(a - b) <= eps, `${msg}: got ${a}, want ${b} ± ${eps}`)

test('reproduces the Mars24 worked example (2000-01-06T00:00Z, TT-UTC 64.184 s)', () => {
  const c = marsClock(Date.UTC(2000, 0, 6), 64.184)
  near(c.ls, 277.18759, 2e-4, 'Ls')
  near(c.msd, 44795.99976, 3e-5, 'MSD')
  near(c.nuMinusM, 4.44193, 2e-4, 'nu - M')
  near(c.eot, -5.18774, 3e-4, 'EOT')
  assert.equal(c.my, 24)
  assert.equal(c.season, 'winter')
})

test('Mars Year 39 begins on 2026-09-30 at about 08:21Z', () => {
  assert.equal(marsClock(Date.UTC(2026, 8, 30, 8, 0)).my, 38)
  assert.equal(marsClock(Date.UTC(2026, 8, 30, 9, 0)).my, 39)
  assert.equal(marsClock(Date.UTC(2026, 9, 10, 7)).season, 'spring')
})

test('Earth–Mars distance matches known geometry', () => {
  near(marsClock(Date.UTC(2027, 1, 19)).au, 0.678, 0.003, 'opposition 2027-02-19')
  near(marsClock(Date.UTC(2026, 0, 9)).au, 2.404, 0.003, 'conjunction 2026-01-09')
  near(marsClock(Date.UTC(2026, 9, 10, 7)).lightSec, 798.3, 1, 'light time 2026-10-10T07Z')
})

test('the subsolar meridian sits at local true solar time 12:00', () => {
  for (const t of [Date.UTC(2000, 0, 6), Date.UTC(2026, 9, 10, 7), Date.UTC(2027, 4, 1, 15, 30)]) {
    const c = marsClock(t)
    const ltst = (((c.mtc + c.subsolarLonEastDeg / 15 + c.eot / 15) % 24) + 24) % 24
    near(ltst, 12, 1e-6, 'LTST at the subsolar longitude')
    assert.ok(Math.abs(c.subsolarLatDeg) <= 25.5, 'subsolar latitude within ±25.5°')
  }
})

test('formatters', () => {
  assert.equal(formatClock(18.5625), '18:33:45')
  assert.equal(formatClock(23.725644, false), '23:43')
  assert.equal(formatLightTime(798.3, 'en'), '13 min 18 s')
  assert.equal(formatLightTime(798.3, 'ko'), '13분 18초')
  assert.equal(formatMsd(54308.7734), '54,308.77')
})
