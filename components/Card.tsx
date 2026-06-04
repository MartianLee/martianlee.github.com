import Link from './Link'

interface CardProps {
  title: string
  description: string
  href?: string
  techStack?: string[]
  aiTools?: string[]
  demo?: string
  github?: string
}

const Card = ({ title, description, techStack, aiTools, demo, github, href }: CardProps) => {
  const link = demo || github || href
  return (
    <div className="list-row flex-col items-start sm:flex-row sm:items-baseline">
      <div className="sm:pr-8">
        <h2 className="text-xl font-bold tracking-tight">
          {link ? (
            <Link href={link} className="hover:text-accent transition-colors">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="text-muted mt-1.5 max-w-[64ch] font-serif">{description}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
          {demo && (
            <Link href={demo} className="text-accent">
              Live Demo ↗
            </Link>
          )}
          {github && (
            <Link href={github} className="text-muted hover:text-accent">
              GitHub ↗
            </Link>
          )}
          {aiTools?.length ? (
            <span className="text-muted">built with {aiTools.join(', ')}</span>
          ) : null}
        </div>
      </div>
      {techStack && (
        <span className="text-muted mt-2 shrink-0 font-mono text-xs whitespace-nowrap sm:mt-0">
          {techStack.slice(0, 4).join(' · ')}
        </span>
      )}
    </div>
  )
}

export default Card
