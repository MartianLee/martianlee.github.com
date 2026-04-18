import Image from './Image'
import Link from './Link'

interface CardProps {
  title: string
  description: string
  imgSrc?: string
  href?: string
  techStack?: string[]
  workflow?: string[]
  aiTools?: string[]
  demo?: string
  github?: string
}

const Card = ({
  title,
  description,
  imgSrc,
  href,
  techStack,
  workflow,
  aiTools,
  demo,
  github,
}: CardProps) => (
  <div className="md max-w-[544px] p-4 md:w-1/2">
    <div
      className={`${
        imgSrc && 'h-full'
      } border-opacity-60 hover:border-primary-500 overflow-hidden rounded-md border-2 border-gray-200 transition-colors duration-300 dark:border-gray-700`}
    >
      {imgSrc &&
        (href || demo ? (
          <Link href={href || demo || '#'} aria-label={`Link to ${title}`}>
            <Image
              alt={title}
              src={imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              width={544}
              height={306}
            />
          </Link>
        ) : (
          <Image
            alt={title}
            src={imgSrc}
            className="object-cover object-center md:h-36 lg:h-48"
            width={544}
            height={306}
          />
        ))}
      <div className="p-6">
        <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
          {href || demo ? (
            <Link href={href || demo || '#'} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>

        {/* Tech Stack */}
        {techStack && techStack.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5 md:gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 md:px-2 md:py-1 md:text-xs dark:bg-gray-700 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {workflow && workflow.length > 0 && (
          <div className="mb-4">
            <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Workflow
            </p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {workflow.map((item) => (
                <span
                  key={item}
                  className="border border-gray-300 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 md:px-2 md:py-1 md:text-xs dark:border-gray-600 dark:text-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {aiTools && aiTools.length > 0 && (
          <div className="mb-4">
            <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Built with AI
            </p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {aiTools.map((tool) => (
                <span
                  key={tool}
                  className="border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300 border px-1.5 py-0.5 text-[10px] font-medium md:px-2 md:py-1 md:text-xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-4">
          {demo && (
            <Link
              href={demo}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
              aria-label={`Demo of ${title}`}
            >
              Live Demo &rarr;
            </Link>
          )}
          {github && (
            <Link
              href={github}
              className="text-base leading-6 font-medium text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label={`GitHub repository of ${title}`}
            >
              GitHub &rarr;
            </Link>
          )}
          {!demo && !github && href && (
            <Link
              href={href}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
              aria-label={`Link to ${title}`}
            >
              Learn more &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default Card
