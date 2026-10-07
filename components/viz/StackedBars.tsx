import { charts, sourceName, type Lang } from '@/data/charts/stacked-bars'

/**
 * 가로 누적 막대. 막대 하나가 한 요청(또는 한 경로)의 전체이고, 칸이 층이다.
 * 데이터는 data/charts/stacked-bars.ts의 charts[chart]에만 둔다.
 * MagicTaxStack과 같은 구조(figure + figcaption + 출처 + sr-only 대체 표)이고 JS를 보내지 않는다.
 */
export default function StackedBars({ chart, lang = 'ko' }: { chart: string; lang?: Lang }) {
  const c = charts[chart]
  const pct = (v: number) => `${(v / c.axisMax) * 100}%`
  const digits = c.digits ?? 3
  const unit = c.unit ? c.unit[lang] : 'ms'
  const tickDigits = Number.isInteger(c.ticks[1]) ? 0 : 1
  const nameOf = (b: (typeof c.bars)[number]) => b.label?.[lang] ?? b.name

  return (
    <figure className="my-8">
      <div className="border-line bg-surface rounded-2xl border p-5">
        <div className="text-muted mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          {c.segments.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-2">
              <i className={`${s.fill} inline-block h-3 w-3 rounded-sm`} />
              {s.label[lang]}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {c.bars.map((b) => {
            let left = 0
            return (
              <div
                key={b.name}
                className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3 sm:grid-cols-[7rem_1fr_4rem]"
              >
                <span className="flex flex-col text-sm leading-tight font-bold">
                  {nameOf(b)}
                  {b.note && (
                    <span className="text-muted font-mono text-[11px] font-normal tabular-nums">
                      {b.note}
                    </span>
                  )}
                </span>
                <div className="bg-line relative h-7 overflow-hidden rounded">
                  {c.segments.map((s) => {
                    const seg = (
                      <div
                        key={s.key}
                        className={`${s.fill} absolute inset-y-0`}
                        style={{ left: pct(left), width: pct(b.values[s.key]) }}
                      />
                    )
                    left += b.values[s.key]
                    return seg
                  })}
                </div>
                <span className="text-right text-sm font-bold tabular-nums">
                  {b.total.toFixed(digits)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[5.5rem_1fr_3.5rem] gap-3 sm:grid-cols-[7rem_1fr_4rem]">
          <div />
          <div className="border-line relative mt-1 h-5 border-t">
            {c.ticks.map((tick, i) => {
              // 단위는 마지막 눈금에 붙인다. 따로 오른쪽에 띄우면 100% 지점 눈금과 겹친다.
              const last = i === c.ticks.length - 1
              return (
                <span
                  key={tick}
                  className={`text-muted absolute top-0 font-mono text-[11px] whitespace-nowrap tabular-nums ${
                    last ? '-translate-x-full' : '-translate-x-1/2'
                  }`}
                  style={{ left: pct(tick) }}
                >
                  {tick.toFixed(tickDigits)}
                  {last && unit ? ` ${unit}` : ''}
                </span>
              )
            })}
          </div>
          <div />
        </div>
      </div>

      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{c.title[lang]}</span> {c.caption[lang]}{' '}
        <span className="text-muted">
          {lang === 'ko' ? '측정' : 'Measurement'}:{' '}
          {c.sourceUrl ? (
            <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {(c.source ?? sourceName)[lang]}
            </a>
          ) : (
            (c.source ?? sourceName)[lang]
          )}
        </span>
      </figcaption>

      <div className="sr-only">
        <table>
          <thead>
            <tr>
              <th>{c.firstCol[lang]}</th>
              {c.segments.map((s) => (
                <th key={s.key}>{s.label[lang]}</th>
              ))}
              <th>{lang === 'ko' ? '합계' : 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            {c.bars.map((b) => (
              <tr key={b.name}>
                <td>
                  {nameOf(b)}
                  {b.note ? ` (${b.note})` : ''}
                </td>
                {c.segments.map((s) => (
                  <td key={s.key}>{b.values[s.key].toFixed(digits)}</td>
                ))}
                <td>{b.total.toFixed(digits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
