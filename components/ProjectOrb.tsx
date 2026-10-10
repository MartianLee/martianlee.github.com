import type { OrbKey } from '@/data/projectsData'

/**
 * Procedural planet for a project. CheerCat has a ring (one half behind the planet, one in front);
 * Side Project Tracker has a moonlet (one element, the second moonlet is its box-shadow; see REF/inner/inner.css).
 */
export default function ProjectOrb({ orb, size = 'row' }: { orb: OrbKey; size?: 'row' | 'hero' }) {
  return (
    <span className={`rh-tile rh-tile--${size}`} aria-hidden="true">
      {orb === 'cheer' && <span className="rh-orb-ring" />}
      <span className={`rh-orb rh-o-${orb}`}>
        <i />
      </span>
      {orb === 'cheer' && <span className="rh-orb-ring rh-front" />}
      {orb === 'tracker' && <span className="rh-moonlet" />}
    </span>
  )
}
