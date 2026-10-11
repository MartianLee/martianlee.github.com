// components/viz/DayRoutine.tsx
'use client'

import { dayItems, dayTotalKg, t, type Lang } from '@/data/charts/carbon-basics-2'

// 하루를 6시에서 24시까지로 두고 그 위에 일과를 찍는다. 3D 장면이 "얼마나 큰가"를
// 보여 준다면 이 타임라인은 "무슨 하루였나"를 보여 주는 쪽이다.
const FIRST_HOUR = 6
const LAST_HOUR = 24
const TICKS = [6, 12, 18, 24]

const maxKg = Math.max(...dayItems.map((d) => d.kg))
const posOf = (hour: number) => ((hour - FIRST_HOUR) / (LAST_HOUR - FIRST_HOUR)) * 100
const dotPx = (kg: number) => 8 + 26 * Math.sqrt(kg / maxKg)
const hhmm = (hour: number) => `${String(hour).padStart(2, '0')}:00`

/**
 * 라벨을 선 위아래로 번갈아 놓되 위쪽은 두 단으로 나눈다. 항목이 일곱 개라
 * 2단 교차만으로는 아침 시간대 세 개가 서로 겹친다.
 */
const LEVELS = [
  { above: true, extra: 0 },
  { above: false, extra: 0 },
  { above: true, extra: 40 },
]

/** 라벨이 양끝에서 잘리지 않도록 위치에 따라 정렬 기준을 옮긴다 */
function anchorOf(pos: number): string {
  if (pos < 15) return 'translateX(-8%)'
  if (pos > 80) return 'translateX(-92%)'
  return 'translateX(-50%)'
}

export default function DayRoutine({ lang }: { lang: Lang }) {
  const L = t[lang]
  const items = dayItems.map((d, i) => ({
    ...d,
    pos: posOf(d.hour),
    px: dotPx(d.kg),
    level: LEVELS[i % LEVELS.length],
    biggest: d.kg === maxKg,
  }))

  return (
    <figure className="my-8">
      <div className="border-line bg-surface relative rounded-2xl border px-6 py-5 sm:px-9">
        <div className="text-muted mb-1 font-mono text-[11px] tracking-[0.12em] uppercase">
          {L.routineTitle}
        </div>

        {/* 가로 타임라인: 화면이 넓을 때만. 라벨 다섯 개가 좁은 폭에서는 반드시 겹친다. */}
        <div className="relative hidden h-[300px] sm:block">
          <div className="absolute inset-x-0 top-0 bottom-8">
            <div className="bg-line absolute top-1/2 right-0 left-0 h-px" />

            {TICKS.map((h) => (
              <div key={h}>
                <div
                  className="bg-line absolute top-1/2 h-2 w-px"
                  style={{ left: `${posOf(h)}%`, transform: 'translateX(-50%)' }}
                />
                <div
                  className="text-muted absolute bottom-0 font-mono text-[10.5px] whitespace-nowrap"
                  style={{ left: `${posOf(h)}%`, transform: anchorOf(posOf(h)) }}
                >
                  {hhmm(h)}
                </div>
              </div>
            ))}

            {items.map((d) => (
              <div key={d.id} className="absolute top-1/2" style={{ left: `${d.pos}%` }}>
                <span
                  className={`absolute rounded-full ${d.biggest ? 'bg-accent' : 'bg-ink/45'}`}
                  style={{
                    width: d.px,
                    height: d.px,
                    transform: `translate(-50%, -50%)`,
                  }}
                />
                <div
                  className="absolute whitespace-nowrap"
                  style={{
                    transform: anchorOf(d.pos),
                    [d.level.above ? 'bottom' : 'top']: `${d.px / 2 + 10 + d.level.extra}px`,
                  }}
                >
                  <div className="text-muted font-mono text-[10.5px]">{hhmm(d.hour)}</div>
                  <div
                    className={`text-[13.5px] leading-tight ${d.biggest ? 'text-ink font-semibold' : 'text-ink/80'}`}
                  >
                    {L.routine[d.id]}
                  </div>
                  <div className="text-muted font-mono text-[11px] tabular-nums">
                    {d.kg.toFixed(2)} {L.kg}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 좁은 화면: 같은 내용을 세로로 세운다 */}
        <ol className="sm:hidden">
          {items.map((d) => (
            <li
              key={d.id}
              className="border-line flex items-baseline gap-3 border-b py-2.5 last:border-b-0"
            >
              <span className="text-muted w-11 shrink-0 font-mono text-[11px]">{hhmm(d.hour)}</span>
              <span
                className={`flex-1 text-[14px] ${d.biggest ? 'text-ink font-semibold' : 'text-ink/80'}`}
              >
                {L.routine[d.id]}
              </span>
              <span className="text-muted shrink-0 font-mono text-[11.5px] tabular-nums">
                {d.kg.toFixed(2)}
              </span>
            </li>
          ))}
        </ol>

        <div className="border-line mt-3 flex items-baseline justify-between border-t pt-3">
          <span className="text-muted font-mono text-[11px]">{L.dayTotal}</span>
          <span className="text-ink font-mono text-[15px] font-bold tabular-nums">
            {dayTotalKg.toFixed(2)} {L.kg}
          </span>
        </div>
      </div>
      <figcaption className="text-muted mt-3 text-[13px] leading-relaxed">
        {L.routineNote}
      </figcaption>
    </figure>
  )
}
