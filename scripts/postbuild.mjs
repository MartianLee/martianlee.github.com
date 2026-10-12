import rss from './rss.mjs'
import { decodeOutNames } from './decode-out-names.mjs'

async function postbuild() {
  await rss()
  // last, so it also sees the real-Hangul tag folders the RSS step just wrote beside the percent-encoded ones
  const { renamed, merged } = decodeOutNames('out')
  console.log(
    `Decoded ${renamed} percent-encoded names in out/ (${merged} merged into existing folders)`
  )
}

postbuild()
