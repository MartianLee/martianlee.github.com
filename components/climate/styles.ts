// Shared class strings for the /climate page (moss = "owned" accent, per hub design).

export const mossText = 'text-[#4a5a3a] dark:text-[#94ab78]'

const tagBase =
  'rounded-full border px-2.5 py-0.5 text-[11px] whitespace-nowrap border-line bg-paper text-ink/70'

export function tagClass(kind: 'plain' | 'metric' | 'own'): string {
  if (kind === 'metric') {
    return 'rounded-full border px-2.5 py-0.5 text-[11px] whitespace-nowrap font-semibold tabular-nums border-primary-200 bg-primary-100 text-primary-800 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-300'
  }
  if (kind === 'own') {
    return 'rounded-full border px-2.5 py-0.5 text-[11px] whitespace-nowrap font-semibold border-[#bcd0a8] bg-[#e7efe0] text-[#4a5a3a] dark:border-[#3a4a2e] dark:bg-[#1c2416] dark:text-[#94ab78]'
  }
  return tagBase
}

export function pillClass(own?: boolean): string {
  if (own) {
    return 'rounded-full border px-3 py-1 text-xs font-semibold border-[#bcd0a8] bg-[#e7efe0] text-[#4a5a3a] dark:border-[#3a4a2e] dark:bg-[#1c2416] dark:text-[#94ab78]'
  }
  return 'rounded-full border px-3 py-1 text-xs border-line bg-paper text-ink/70'
}
