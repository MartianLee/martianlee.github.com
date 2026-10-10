import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeRoles, barSpan, scrubYears, tenureAxis, yearFraction } from './tenure.ts'

const ROLES = [
  { company: 'UJET', role: 'Software Engineer 2', startYear: 2024, endYear: null },
  { company: 'TomorrowUse', role: 'Co-founder / CTO', startYear: 2021, endYear: 2023 },
  { company: 'Miso', role: 'Frontend Developer', startYear: 2020, endYear: 2021 },
]
const near = (a: number, b: number, msg: string) =>
  assert.ok(Math.abs(a - b) < 1e-3, `${msg}: ${a} vs ${b}`)

test('axis runs from the first start year to the year after now', () => {
  assert.deepEqual(tenureAxis(ROLES, 2026), { from: 2020, to: 2027 })
})

test('bars run from the start-year tick to the end-year tick, ongoing roles to now', () => {
  const axis = { from: 2020, to: 2027 }
  const miso = barSpan(ROLES[2], axis, 2026.7726)
  near(miso.left, 0, 'Miso left')
  near(miso.width, 100 / 7, 'Miso width')
  const tu = barSpan(ROLES[1], axis, 2026.7726)
  near(tu.left, 100 / 7, 'TomorrowUse left')
  near(tu.width, 200 / 7, 'TomorrowUse width')
  const ujet = barSpan(ROLES[0], axis, 2026.7726)
  near(ujet.left, 400 / 7, 'UJET left')
  near(ujet.width, ((2026.7726 - 2024) / 7) * 100, 'UJET width')
})

test('active roles count whole years inclusively', () => {
  const names = (y: number) => activeRoles(ROLES, y, 2026).map((r) => r.company)
  assert.deepEqual(names(2020), ['Miso'])
  assert.deepEqual(names(2021), ['TomorrowUse', 'Miso'])
  assert.deepEqual(names(2023), ['TomorrowUse'])
  assert.deepEqual(names(2024), ['UJET'])
  assert.deepEqual(names(2026), ['UJET'])
})

test('scrub years and year fraction', () => {
  assert.deepEqual(
    scrubYears({ from: 2020, to: 2027 }, 2026),
    [2020, 2021, 2022, 2023, 2024, 2025, 2026]
  )
  near(yearFraction(new Date(Date.UTC(2026, 9, 10))), 2026 + 282 / 365, 'yearFraction 2026-10-10')
})
