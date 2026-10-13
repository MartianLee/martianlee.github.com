/**
 * The tag as it is written in tag-data.json. generateStaticParams hands out encodeURI(tag), and Next 16.2 gives
 * generateMetadata that string but the page itself an encoded copy of it (a Hangul tag arrives as %25EB%25B9...), so a
 * single decodeURI left the page with a title of %EB%B9%85... and no posts. Decode until no escape is left (three times at
 * most): slugs never contain a literal %.
 */
export function decodeTag(param: string): string {
  let tag = param
  for (let i = 0; i < 3 && /%[0-9A-Fa-f]{2}/.test(tag); i++) {
    try {
      tag = decodeURIComponent(tag)
    } catch {
      break // a malformed escape such as a lone %E0: keep what we have
    }
  }
  return tag
}
