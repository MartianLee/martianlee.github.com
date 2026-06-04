'use client'

import Image from './Image'
import Link from './Link'
import { useLocalized } from './useUI'

interface CardProps {
  title: string
  description: string
  descriptionKo?: string
  slug: string
  kind?: string
  kindKo?: string
  imgSrc?: string
  techStack?: string[]
}

const Card = ({
  title,
  description,
  descriptionKo,
  slug,
  kind,
  kindKo,
  imgSrc,
  techStack,
}: CardProps) => {
  const desc = useLocalized(description, descriptionKo)
  const kindLabel = useLocalized(kind, kindKo)
  return (
    <Link
      href={`/projects/${slug}`}
      className="border-line group flex items-center gap-4 border-b py-4 no-underline sm:gap-6"
    >
      <div className="border-line bg-surface h-14 w-20 shrink-0 overflow-hidden rounded-md border">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            width={80}
            height={56}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted flex h-full w-full items-center justify-center font-mono text-base font-bold">
            {title.slice(0, 2)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="group-hover:text-accent text-lg font-bold tracking-tight transition-colors">
            {title}
          </h3>
          {kindLabel && <span className="chip">{kindLabel}</span>}
        </div>
        <p className="text-muted mt-1 line-clamp-1 max-w-[60ch] font-serif text-sm sm:line-clamp-none">
          {desc}
        </p>
      </div>
      {techStack && (
        <span className="text-muted hidden shrink-0 self-center font-mono text-xs whitespace-nowrap md:block">
          {techStack.slice(0, 3).join(' · ')} →
        </span>
      )}
    </Link>
  )
}

export default Card
