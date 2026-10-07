'use client'

import { useState } from 'react'

interface YouTubeProps {
  id: string
  title: string
  channel?: string
  date?: string
  lang?: 'ko' | 'en'
}

const strings = {
  ko: { play: '재생', watch: 'YouTube에서 보기' },
  en: { play: 'Play', watch: 'Watch on YouTube' },
}

/**
 * 클릭하기 전에는 썸네일만 불러오는 유튜브 임베드(facade).
 * 재생을 누르기 전에는 youtube.com 쪽으로 쿠키나 스크립트가 나가지 않는다.
 */
export default function YouTube({ id, title, channel, date, lang = 'ko' }: YouTubeProps) {
  const [active, setActive] = useState(false)
  const l = strings[lang]
  const byline = [channel, date].filter(Boolean).join(', ')

  return (
    <figure className="my-8">
      <div className="border-line relative aspect-video w-full overflow-hidden rounded-2xl border bg-black">
        {active ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={lang === 'ko' ? `${title} ${l.play}` : `${l.play} ${title}`}
            className="group absolute inset-0 block h-full w-full cursor-pointer"
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-3 text-left text-sm font-semibold text-white sm:text-base">
              {title}
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 64 64"
                className="h-16 w-16 drop-shadow-lg transition-transform group-hover:scale-110"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="30" className="fill-accent" />
                <path d="M26 20l20 12-20 12z" fill="#fff" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{title}</span>
        {byline && <> &mdash; {byline}</>}{' '}
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted underline"
        >
          {l.watch}
        </a>
      </figcaption>
    </figure>
  )
}
