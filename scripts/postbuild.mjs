import rss from './rss.mjs'
import { decodeOutNames } from './decode-out-names.mjs'

async function postbuild() {
  await rss()
  // last, so it also sees the real-Hangul tag folders the RSS step just wrote beside the percent-encoded ones
  const { renamed, merged, conflicts, left } = decodeOutNames('out')
  console.log(
    `Decoded ${renamed} percent-encoded names in out/ (${merged} merged into existing folders)`
  )
  if (left.length) {
    console.log(`Left ${left.length} escaped names that do not decode to a plain name:`)
    for (const f of left) console.log(`  ${f}`)
  }
  if (conflicts.length) {
    // the host would serve the wrong file (or none) for these routes: a build that ships them is a broken build
    console.error(
      `decode-out-names: ${conflicts.length} rename conflict(s), fix the export before it ships:`
    )
    for (const f of conflicts) console.error(`  ${f}`)
    process.exitCode = 1
  }
}

postbuild()
