// Next's static export names the routes of non-ASCII params after their percent-encoded form
// (out/tags/%EB%B9%85%EC%B9%B4%EC%9D%B8%EC%A6%88.html). GitHub Pages decodes the request path before it looks a file up,
// so /tags/빅카인즈 finds none of them, only the real-Hangul folder the RSS step writes (out/tags/빅카인즈/feed.xml): it
// 301s to that folder and 404s. Renaming every escaped entry to its decoded name puts the pages where the server looks.
// Browsers still request the encoded URL; the server decodes it and now finds the file.
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  rmdirSync,
} from 'node:fs'
import path from 'node:path'

const ESCAPE = /%[0-9A-Fa-f]{2}/

/** `name` decoded once, or null when it cannot be decoded or would no longer be a single plain name. */
function decode(name) {
  try {
    const decoded = decodeURIComponent(name)
    if (decoded === '' || decoded === '.' || decoded === '..' || /[\\/\0]/.test(decoded))
      return null
    return decoded
  } catch {
    return null // malformed escape, such as a lone %E0
  }
}

function kind(p) {
  try {
    const stat = lstatSync(p)
    return stat.isDirectory() ? 'dir' : stat.isFile() ? 'file' : 'other'
  } catch {
    return null
  }
}

/** Move `src` to `dest`. A folder that already exists there takes the contents; a different file already there wins. */
function moveInto(src, dest, log, tally) {
  const from = kind(src)
  const to = kind(dest)
  if (to === null) {
    renameSync(src, dest)
    return
  }
  if (from === 'dir' && to === 'dir') {
    for (const child of readdirSync(src)) {
      moveInto(path.join(src, child), path.join(dest, child), log, tally)
    }
    rmdirSync(src)
    tally.merged += 1
    return
  }
  if (from === 'file' && to === 'file' && readFileSync(src).equals(readFileSync(dest))) {
    rmSync(src) // the same bytes are already there
    return
  }
  log(`decode-out-names: ${dest} already exists with different content, kept it and dropped ${src}`)
  rmSync(src, { recursive: true, force: true })
  tally.conflicts.push(dest)
}

function walk(dir, log, tally) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    // children first: a folder moves with its final names inside, and its own path is still the one we listed
    if (entry.isDirectory()) walk(full, log, tally)
    if (!ESCAPE.test(entry.name)) continue
    const decoded = decode(entry.name)
    if (decoded === null || decoded === entry.name) {
      log(`decode-out-names: left ${full} as it is (it does not decode to a plain name)`)
      tally.left.push(full)
      continue
    }
    moveInto(full, path.join(dir, decoded), log, tally)
    tally.renamed += 1
  }
}

/**
 * Rename every file and folder under `root` whose name has a percent-escape to its decoded name, once, deepest first.
 * A decoded folder that exists already gets the contents merged in; a decoded file that exists with different content is
 * kept and the encoded one is dropped (both logged).
 */
export function decodeOutNames(root, log = console.log) {
  const tally = { renamed: 0, merged: 0, conflicts: [], left: [] }
  if (existsSync(root)) walk(root, log, tally)
  return tally
}
