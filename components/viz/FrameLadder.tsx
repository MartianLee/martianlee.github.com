import {
  ladderText as T,
  measured,
  scenarioLabel,
  sideLabel,
  sourceName,
  type Lang,
  type ScenarioKey,
} from '@/data/charts/pungsu-stutter'

const AXIS_MAX = 200
const TICKS = [0, 16.7, 50, 100, 150, 200]
const SEGMENTS = [
  { key: 'p50', fill: 'bg-ink/70' },
  { key: 'p95', fill: 'bg-ink/40' },
  { key: 'p99', fill: 'bg-accent/45' },
  { key: 'max', fill: 'bg-accent' },
] as const

/**
 * 측정별 프레임 시간 분포를 막대 하나로 그린다: 0~p50, p50~p95, p95~p99, p99~최대.
 * 서버 컴포넌트라 JS를 보내지 않는다.
 */
export default function FrameLadder({ lang = 'ko' }: { lang?: Lang }) {
  const pct = (ms: number) => `${(Math.min(ms, AXIS_MAX) / AXIS_MAX) * 100}%`
  const keys = Object.keys(measured.scenarios) as ScenarioKey[]
  return (
    <figure className="my-8">
      <div className="border-line bg-surface rounded-2xl border p-5">
        <div className="text-muted mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          {SEGMENTS.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-2">
              <i className={`${s.fill} inline-block h-3 w-3 rounded-sm`} />
              {T.legend[s.key][lang]}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {keys.map((k) => (
            <div key={k}>
              <div className="mb-1.5 text-sm font-bold">{scenarioLabel[k][lang]}</div>
              {(['before', 'after'] as const).map((side) => {
                const st = measured.scenarios[k][side].stats
                const stops = [0, st.p50, st.p95, st.p99, st.max]
                return (
                  <div
                    key={side}
                    className="mb-1.5 grid grid-cols-[4rem_1fr_4.5rem] items-center gap-3 sm:grid-cols-[5rem_1fr_6rem]"
                  >
                    <span className="text-muted text-xs">{sideLabel[side][lang]}</span>
                    <div className="bg-line relative h-5 overflow-hidden rounded">
                      {SEGMENTS.map((s, i) => (
                        <div
                          key={s.key}
                          className={`${s.fill} absolute inset-y-0`}
                          style={{
                            left: pct(stops[i]),
                            width: `calc(${pct(stops[i + 1])} - ${pct(stops[i])})`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-right font-mono text-xs tabular-nums">
                      p99 {st.p99}
                      <br />
                      <span className="text-muted">max {st.max}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[4rem_1fr_4.5rem] gap-3 sm:grid-cols-[5rem_1fr_6rem]">
          <div />
          <div className="border-line relative mt-1 h-5 border-t">
            {TICKS.map((tick, i) => (
              <span
                key={tick}
                className={`text-muted absolute top-0 font-mono text-[11px] whitespace-nowrap tabular-nums ${
                  i === 0 ? '' : i === TICKS.length - 1 ? '-translate-x-full' : '-translate-x-1/2'
                }`}
                style={{ left: pct(tick) }}
              >
                {tick}
                {i === TICKS.length - 1 ? ' ms' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{T.title[lang]}.</span> {T.caption[lang]}{' '}
        <span className="text-muted">{sourceName[lang]}</span>
      </figcaption>
      <div className="sr-only">
        <table>
          <thead>
            <tr>
              <th />
              <th>avg</th>
              <th>p50</th>
              <th>p95</th>
              <th>p99</th>
              <th>max</th>
            </tr>
          </thead>
          <tbody>
            {keys.flatMap((k) =>
              (['before', 'after'] as const).map((side) => {
                const st = measured.scenarios[k][side].stats
                return (
                  <tr key={`${k}-${side}`}>
                    <td>
                      {scenarioLabel[k][lang]} · {sideLabel[side][lang]}
                    </td>
                    <td>{st.avg}</td>
                    <td>{st.p50}</td>
                    <td>{st.p95}</td>
                    <td>{st.p99}</td>
                    <td>{st.max}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
