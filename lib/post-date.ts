// Post dates are written with a +0900 offset and kept as UTC instants, so formatting one in the machine's own zone can land
// on another day than the one the post carries: the static export is built in UTC, most readers are in Seoul, and the two
// printed different days (React #418 on the list pages). Every post date is shown in Seoul time instead, on the server and
// in every browser alike. Pure: no hooks, no DOM, importable from server and client components.

const SEOUL = 'Asia/Seoul'

/** `2026-10-07T16:00:00.000Z` (01:00 on the 8th in Seoul) becomes "Oct 8, 2026" in English and "2026년 10월 8일" in Korean. */
export function formatPostDate(date: string, lang: 'en' | 'ko'): string {
  return new Date(date).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: lang === 'ko' ? 'long' : 'short',
    day: 'numeric',
    timeZone: SEOUL,
  })
}
