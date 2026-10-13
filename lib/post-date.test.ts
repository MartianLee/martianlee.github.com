import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatPostDate } from './post-date.ts'

// 2026-10-08 01:00 +0900 is 2026-10-07 16:00 UTC: the two zones disagree about the day.
const KST_ONE_AM = '2026-10-07T16:00:00.000Z'

test('a +0900 date at 01:00 formats as that KST day, not the UTC day before', () => {
  assert.equal(formatPostDate(KST_ONE_AM, 'en'), 'Oct 8, 2026')
  assert.equal(formatPostDate('2026-10-08T01:00:00+09:00', 'en'), 'Oct 8, 2026')
  assert.equal(formatPostDate(KST_ONE_AM, 'ko'), '2026년 10월 8일')
})

test('the Seoul day turns over at 15:00 UTC', () => {
  assert.equal(formatPostDate('2026-10-08T14:59:59.000Z', 'en'), 'Oct 8, 2026')
  assert.equal(formatPostDate('2026-10-08T15:00:00.000Z', 'en'), 'Oct 9, 2026')
  assert.equal(formatPostDate('2026-12-31T15:00:00.000Z', 'ko'), '2027년 1월 1일')
})

test('English uses the short month, Korean the numbered one', () => {
  assert.equal(formatPostDate('2026-09-29T09:00:00.000Z', 'en'), 'Sep 29, 2026')
  assert.equal(formatPostDate('2026-05-05T09:00:00.000Z', 'en'), 'May 5, 2026')
  assert.equal(formatPostDate('2026-09-29T09:00:00.000Z', 'ko'), '2026년 9월 29일')
})

test('the result does not depend on the machine time zone', () => {
  const was = process.env.TZ
  try {
    for (const tz of ['UTC', 'Asia/Seoul', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      process.env.TZ = tz
      assert.equal(formatPostDate(KST_ONE_AM, 'en'), 'Oct 8, 2026', `en in ${tz}`)
      assert.equal(formatPostDate(KST_ONE_AM, 'ko'), '2026년 10월 8일', `ko in ${tz}`)
    }
  } finally {
    if (was === undefined) delete process.env.TZ
    else process.env.TZ = was
  }
})
