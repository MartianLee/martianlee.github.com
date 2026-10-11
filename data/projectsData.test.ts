import { test } from 'node:test'
import assert from 'node:assert/strict'
import projectsData, { ORB_KEYS } from './projectsData.ts'

test('every project has short EN/KO one-liners and a known orb', () => {
  assert.equal(projectsData.length, 10)
  const orbs = new Set<string>()
  for (const p of projectsData) {
    assert.ok(
      p.summary.length > 0 && p.summary.length <= 100,
      `${p.slug}: summary length ${p.summary.length}`
    )
    assert.ok(
      p.summaryKo.length > 0 && p.summaryKo.length <= 80,
      `${p.slug}: summaryKo length ${p.summaryKo.length}`
    )
    assert.ok(p.summaryKo.endsWith('니다.'), `${p.slug}: summaryKo must be formal speech`)
    assert.ok((ORB_KEYS as readonly string[]).includes(p.orb), `${p.slug}: unknown orb ${p.orb}`)
    orbs.add(p.orb)
  }
  assert.equal(orbs.size, 10, 'each project has its own orb')
})
