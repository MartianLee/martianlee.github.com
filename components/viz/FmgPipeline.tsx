'use client'

import { useId, useState } from 'react'
import { GROUP_COLORS, GROUP_ORDER, PHASES, t, type Lang } from '@/data/charts/fmg-pipeline'

/**
 * FMG GenerationPipeline 40단계를 실행 시간 막대로 늘어놓고, 단계를 고르면 설명과 결과 화면을 보여 준다.
 * 막대 폭은 실제 측정값이고 0ms 단계도 보이도록 최소 폭을 준다.
 */

const MIN_SHARE = 0.35 // ms. 0ms 단계도 한 줄은 보이게

export default function FmgPipeline({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang]
  const [sel, setSel] = useState('economy')
  const uid = useId().replace(/:/g, '')
  const panelId = `${uid}-panel`

  const steps = PHASES.flatMap((p) => p.steps.map((s) => ({ ...s, phase: p.id, group: p.group })))
  const totalMs = steps.reduce((a, s) => a + s.ms, 0)
  const maxMs = Math.max(...steps.map((s) => s.ms))
  const width = steps.reduce((a, s) => a + Math.max(s.ms, MIN_SHARE), 0)
  const phase = PHASES.find((p) => p.id === sel) ?? PHASES[0]
  const text = l.phases[phase.id]
  const phaseMs = phase.steps.reduce((a, s) => a + s.ms, 0)

  return (
    <figure className="my-8 grid grid-cols-[minmax(0,1fr)] gap-4">
      <div className="text-muted flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[12px]">
        <span>{l.total(steps.length, totalMs.toFixed(1))}</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          {GROUP_ORDER.map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: GROUP_COLORS[g] }}
              />
              {l.groups[g]}
            </span>
          ))}
        </span>
      </div>

      {/* 단계 막대: 폭 = 실행 시간 */}
      <div
        className="border-line flex h-12 w-full overflow-hidden rounded-lg border"
        aria-hidden="true"
      >
        {steps.map((s) => {
          const on = s.phase === sel
          return (
            <button
              key={s.id}
              type="button"
              tabIndex={-1}
              title={`${s.id} · ${s.ms} ms`}
              onClick={() => setSel(s.phase)}
              className="relative h-full cursor-pointer border-r border-white/40 transition-opacity last:border-r-0"
              style={{
                width: `${(Math.max(s.ms, MIN_SHARE) / width) * 100}%`,
                background: GROUP_COLORS[s.group],
                opacity: on ? 1 : 0.38,
              }}
            >
              {s.ms > 20 && (
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold text-white">
                  {s.id} {s.ms}ms
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div role="group" aria-label={l.group} className="flex flex-wrap gap-2">
        {PHASES.map((p) => {
          const on = p.id === sel
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              aria-controls={panelId}
              onClick={() => setSel(p.id)}
              className="text-ink border-line bg-surface focus-visible:outline-accent inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-[12.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={
                on
                  ? {
                      borderColor: GROUP_COLORS[p.group],
                      boxShadow: `inset 0 0 0 1px ${GROUP_COLORS[p.group]}`,
                    }
                  : undefined
              }
            >
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: GROUP_COLORS[p.group] }}
              />
              {l.phases[p.id].name}
            </button>
          )
        })}
      </div>

      <div
        id={panelId}
        aria-live="polite"
        className="border-line bg-surface grid gap-4 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]"
      >
        <div className="grid content-start gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="text-ink m-0 text-[16px] font-bold">{text.name}</h4>
            <span className="text-muted font-mono text-[12px] whitespace-nowrap">
              {phaseMs.toFixed(1)} ms
            </span>
          </div>
          <p className="text-ink/85 m-0 text-[14px] leading-relaxed">{text.desc}</p>
          <div className="grid gap-1">
            <span className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              {l.steps}
            </span>
            <ul className="m-0 grid list-none gap-1 p-0">
              {phase.steps.map((s) => (
                <li key={s.id} className="flex items-center gap-2 font-mono text-[12px]">
                  <span className="text-ink min-w-0 flex-1 truncate">{s.id}</span>
                  <span className="bg-line/60 relative h-1.5 w-20 overflow-hidden rounded-full">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${(s.ms / maxMs) * 100}%`,
                        background: GROUP_COLORS[phase.group],
                      }}
                    />
                  </span>
                  <span className="text-muted w-14 text-right tabular-nums">{s.ms}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-1">
            <span className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              {l.writes}
            </span>
            <code className="text-ink text-[12px] break-words">{phase.writes}</code>
          </div>
        </div>
        {phase.image ? (
          <a
            href={phase.image}
            target="_blank"
            rel="noopener noreferrer"
            className="block self-start"
          >
            <img
              src={phase.image}
              alt={l.imageAlt(text.name)}
              loading="lazy"
              width={1600}
              height={900}
              className="border-line h-auto w-full rounded-lg border"
            />
          </a>
        ) : (
          <div className="border-line text-muted flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed p-6 text-center text-[13px]">
            {l.noImage}
          </div>
        )}
      </div>

      <figcaption className="text-ink/75 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}.</span> {l.caption}
      </figcaption>
    </figure>
  )
}
