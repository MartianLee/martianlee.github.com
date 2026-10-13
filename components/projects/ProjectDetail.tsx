'use client'

import { useRef, type CSSProperties } from 'react'
import HorizonBand from '@/components/HorizonBand'
import Image from '@/components/Image'
import Link from '@/components/Link'
import ProjectOrb from '@/components/ProjectOrb'
import projectsData, { type Project } from '@/data/projectsData'
import { usePointerSun } from '@/components/hooks/usePointerSun'
import { useUI, useLocalized } from '@/components/useUI'
import { fill } from '@/lib/ui-strings'

/** Box used for a screenshot whose real size could not be read at build time. */
const FALLBACK_SHOT = { width: 1100, height: 620 }

interface ProjectDetailProps {
  project: Project
  /** Intrinsic size of `project.imgSrc` (read at build time), so the frame keeps its height while the lazy image loads. */
  shot?: { width: number; height: number }
}

type Side = 'prev' | 'next'

/** Previous / next project card: its planet, the name and the one-liner. */
function Neighbor({ p, side }: { p: Project; side: Side }) {
  const ui = useUI()
  const summary = useLocalized(p.summary, p.summaryKo)
  return (
    <Link
      href={`/projects/${p.slug}`}
      className={side === 'next' ? 'rh-pnav-card rh-pnav-card--next' : 'rh-pnav-card'}
    >
      <ProjectOrb orb={p.orb} glow />
      <span className="rh-pnav-text">
        <span className="rh-pnav-label">
          {side === 'prev' ? `← ${ui.projectsPage.previous}` : `${ui.projectsPage.next} →`}
        </span>
        <span className="rh-pnav-title">{p.title}</span>
        <span className="rh-pnav-sum">{summary}</span>
      </span>
    </Link>
  )
}

/**
 * Fills the slot of a missing neighbor (first / last project) with the way back to the list, as REF does on its left.
 * The left slot says "← Projects"; the right one has no arrow to point at, so it says "More projects".
 */
function AllProjects({ side }: { side: Side }) {
  const ui = useUI()
  return (
    <Link
      href="/projects"
      className={side === 'next' ? 'rh-pnav-card rh-pnav-card--next' : 'rh-pnav-card'}
    >
      <span className="rh-pnav-text">
        <span className="rh-pnav-label">
          {side === 'prev' ? ui.projectsPage.back : ui.projectsPage.more}
        </span>
        <span className="rh-pnav-title">
          {fill(ui.band.projectCount, { n: projectsData.length })}
        </span>
      </span>
    </Link>
  )
}

export default function ProjectDetail({ project, shot }: ProjectDetailProps) {
  const ui = useUI()
  const pageRef = useRef<HTMLDivElement>(null)
  // The pointer is the Sun for the planet in the band (and the neighbor planets below).
  usePointerSun(pageRef)
  const {
    title,
    kind,
    kindKo,
    category,
    description,
    descriptionKo,
    imgSrc,
    techStack,
    workflow,
    aiTools,
    demo,
    github,
  } = project
  const desc = useLocalized(description, descriptionKo)
  const kindLabel = useLocalized(kind, kindKo)
  const categoryLabel = category === 'game' ? ui.projectsPage.game : ui.projectsPage.appTool
  const index = projectsData.findIndex((p) => p.slug === project.slug)
  const prev = index > 0 ? projectsData[index - 1] : undefined
  const next = index >= 0 && index < projectsData.length - 1 ? projectsData[index + 1] : undefined
  const size = shot ?? FALLBACK_SHOT

  // --rh-name-n (title length) and --rh-name-w (longest word): the band sizes a long name to the room beside the planet
  const longestWord = Math.max(...title.split(/\s+/).map((word) => word.length))
  const pageStyle = { '--rh-name-n': title.length, '--rh-name-w': longestWord } as CSSProperties

  return (
    <div className="rh-page" ref={pageRef} style={pageStyle}>
      <HorizonBand
        variant="name"
        dot={false}
        title={title}
        tele={
          <>
            <Link href="/projects">{ui.projectsPage.back}</Link>
            <span className="rh-sep" aria-hidden="true">
              ·
            </span>
            <span>{kindLabel}</span>
            <span className="rh-sep" aria-hidden="true">
              ·
            </span>
            <span>{categoryLabel}</span>
          </>
        }
        aside={<ProjectOrb orb={project.orb} size="hero" />}
      />
      <div className="rh-wrap">
        <div className="rh-p-intro">
          <p className="rh-p-lede">{desc}</p>
          {(demo || github) && (
            <div className="rh-actions">
              {demo && (
                <a
                  className="rh-btn rh-btn--accent"
                  href={demo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ui.projectsPage.liveDemo}
                </a>
              )}
              {github && (
                <a
                  className={demo ? 'rh-btn' : 'rh-btn rh-btn--accent'}
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          )}
        </div>

        {imgSrc && (
          <figure className="rh-shot">
            <div className="rh-shot-frame">
              <Image
                src={imgSrc}
                // the figure is captioned with the project's name: a second description would only repeat it
                alt=""
                width={size.width}
                height={size.height}
                loading="lazy"
              />
              <i className="rh-cm rh-cm--tl" aria-hidden="true" />
              <i className="rh-cm rh-cm--tr" aria-hidden="true" />
              <i className="rh-cm rh-cm--bl" aria-hidden="true" />
              <i className="rh-cm rh-cm--br" aria-hidden="true" />
            </div>
            <figcaption>
              <span className="rh-cap-no">{ui.projectsPage.figure}</span>
              <span className="rh-cap-sep" aria-hidden="true">
                ·
              </span>
              {title}
            </figcaption>
          </figure>
        )}

        <section className="rh-sec" aria-labelledby="spec-h">
          <div className="rh-sec-head">
            <span className="rh-sec-no">01</span>
            <h2 id="spec-h">{ui.projectsPage.spec}</h2>
          </div>
          <dl className="rh-spec">
            <div>
              <dt>{ui.projectsPage.kind}</dt>
              <dd>
                {kindLabel} · {categoryLabel}
              </dd>
            </div>
            {techStack && techStack.length > 0 && (
              <div>
                <dt>{ui.projectsPage.techStack}</dt>
                <dd>
                  <ul className="rh-stack-list">
                    {techStack.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {workflow && workflow.length > 0 && (
              <div>
                <dt>{ui.projectsPage.workflow}</dt>
                <dd>
                  <ol>
                    {workflow.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ol>
                </dd>
              </div>
            )}
            {aiTools && aiTools.length > 0 && (
              <div>
                <dt>{ui.projectsPage.builtWithAI}</dt>
                <dd>
                  <ul className="rh-spec-lines">
                    {aiTools.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {github && (
              <div>
                <dt>{ui.projectsPage.source}</dt>
                <dd>
                  <a href={github} target="_blank" rel="noopener noreferrer">
                    {github.replace(/^https?:\/\//, '')} ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <nav className="rh-pnav" aria-label={ui.projectsPage.more}>
          {prev ? <Neighbor p={prev} side="prev" /> : <AllProjects side="prev" />}
          {next ? <Neighbor p={next} side="next" /> : <AllProjects side="next" />}
        </nav>
      </div>
    </div>
  )
}
