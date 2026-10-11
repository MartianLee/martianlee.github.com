export interface TenureRole {
  company: string
  role: string
  startYear: number
  endYear: number | null
}

export interface TenureAxis {
  from: number
  to: number
}

/** 2026-10-10 → 2026.7726 (share of the UTC year elapsed). */
export function yearFraction(date: Date): number {
  const y = date.getUTCFullYear()
  const start = Date.UTC(y, 0, 1)
  return y + (date.getTime() - start) / (Date.UTC(y + 1, 0, 1) - start)
}

/** From the earliest start year to the year after `nowYear`, so the current year has room. */
export function tenureAxis(roles: readonly TenureRole[], nowYear: number): TenureAxis {
  return { from: Math.min(...roles.map((r) => r.startYear)), to: nowYear + 1 }
}

/** Percent geometry: start-year tick to end-year tick; ongoing roles end at `now` (a year fraction). */
export function barSpan(
  role: TenureRole,
  axis: TenureAxis,
  now: number
): { left: number; width: number } {
  const span = axis.to - axis.from
  const end = role.endYear ?? now
  return {
    left: ((role.startYear - axis.from) / span) * 100,
    width: ((end - role.startYear) / span) * 100,
  }
}

/** Roles held at any point of whole year `year`, start and end years inclusive. */
export function activeRoles<T extends TenureRole>(
  roles: readonly T[],
  year: number,
  nowYear: number
): T[] {
  return roles.filter((r) => r.startYear <= year && year <= (r.endYear ?? nowYear))
}

/** Scrubber stops: every whole year on the axis up to `nowYear`. */
export function scrubYears(axis: TenureAxis, nowYear: number): number[] {
  const out: number[] = []
  for (let y = axis.from; y <= nowYear; y++) out.push(y)
  return out
}
