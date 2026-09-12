import { AXIS_MAX, AXIS_TICKS, pairs, t, type Lang } from '@/data/charts/framework-magic-tax'

/**
 * 요청당 CPU를 막대 하나로 그리고, 그 안에서 본체와 마법세를 가른다.
 *
 * 상호작용이 없으므로 클라이언트 컴포넌트가 아니다 — JS를 한 바이트도 보내지 않는다.
 * 3D viz들과 달리 캔버스가 없어 VizFrame을 쓰지 않지만, figure + figcaption + 출처 +
 * sr-only 대체 표라는 같은 구조를 따른다.
 */
export default function MagicTaxStack({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang]
  const pct = (v: number) => `${(v / AXIS_MAX) * 100}%`

  return (
    <figure className="my-8">
      <div className="border-line bg-surface rounded-2xl border p-5">
        <div className="text-muted mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-2">
            <i className="bg-ink/70 inline-block h-3 w-3 rounded-sm" />
            {l.legendBase}
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="bg-accent inline-block h-3 w-3 rounded-sm" />
            {l.legendTax}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {pairs.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3 sm:grid-cols-[4.5rem_1fr_4rem]"
            >
              <span className="text-sm font-bold">{p.runtime}</span>
              <div className="bg-line relative h-7 overflow-hidden rounded">
                <div
                  className="bg-ink/70 absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: pct(p.bareCpu) }}
                />
                <div
                  className="bg-accent absolute inset-y-0 rounded-sm"
                  style={{ left: pct(p.bareCpu), width: pct(p.fullCpu - p.bareCpu) }}
                />
              </div>
              <span className="text-accent text-right text-sm font-bold tabular-nums">
                &times;{p.cpuRatio.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3.5rem_1fr_3.5rem] gap-3 sm:grid-cols-[4.5rem_1fr_4rem]">
          <div />
          <div className="border-line relative mt-1 h-5 border-t">
            {AXIS_TICKS.map((tick, i) => {
              // 단위는 마지막 눈금에 붙인다. 따로 오른쪽에 띄우면 100% 지점 눈금과 겹친다.
              const last = i === AXIS_TICKS.length - 1
              return (
                <span
                  key={tick}
                  className={`text-muted absolute top-0 font-mono text-[11px] tabular-nums ${
                    last ? '-translate-x-full' : '-translate-x-1/2'
                  }`}
                  style={{ left: pct(tick) }}
                >
                  {tick.toFixed(1)}
                  {last ? ` ${l.unit}` : ''}
                </span>
              )
            })}
          </div>
          <div />
        </div>
      </div>

      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}{' '}
        <span className="text-muted">
          {l.source}:{' '}
          <a
            href="https://github.com/MartianLee/study-rails-compare"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {l.sourceName}
          </a>
        </span>
      </figcaption>

      {/* sr-only는 table 박스를 clip하지 못해(행이 문서 폭을 늘림) div로 감싼다 */}
      <div className="sr-only">
        <table>
          <thead>
            <tr>
              {l.tableCols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => (
              <tr key={p.id}>
                <td>{p.runtime}</td>
                <td>{p.bareCpu.toFixed(3)}</td>
                <td>{p.fullCpu.toFixed(3)}</td>
                <td>&times;{p.cpuRatio.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
