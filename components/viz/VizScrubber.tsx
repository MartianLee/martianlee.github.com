'use client'

import type { ReactNode } from 'react'

interface Props {
  playing: boolean
  onToggle: () => void
  /** 0에서 1 사이의 진행도 */
  value: number
  onScrub: (v: number) => void
  playLabel: string
  pauseLabel: string
  ariaLabel: string
  /** 슬라이더 위에 얹는 읽을거리(현재 값 등) */
  readout?: ReactNode
}

/**
 * 장면 하단의 재생/정지 + 진행 바.
 * 처음에는 자동 재생하고, 사용자가 만지는 순간 멈춰서 원하는 지점을 볼 수 있게 한다.
 * `VizFrame`의 오버레이는 pointer-events가 꺼져 있으므로 조작부에서 직접 켠다.
 */
export default function VizScrubber({
  playing,
  onToggle,
  value,
  onScrub,
  playLabel,
  pauseLabel,
  ariaLabel,
  readout,
}: Props) {
  return (
    <div className="absolute inset-x-4 bottom-3 flex flex-col gap-1.5 text-[#f4efe4]">
      {readout}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-[rgba(244,239,228,.4)] px-3 py-1 font-mono text-[11px] tracking-wide whitespace-nowrap uppercase hover:bg-[rgba(244,239,228,.12)]"
        >
          {playing ? pauseLabel : playLabel}
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(value * 1000)}
          onChange={(e) => onScrub(Number(e.target.value) / 1000)}
          aria-label={ariaLabel}
          className="w-full accent-[#e6a760]"
        />
      </div>
    </div>
  )
}
