import type { OrbKey } from '@/data/projectsData'

/**
 * Procedural planet for a project. CheerCat has a ring (one half behind the planet, one in front);
 * Side Project Tracker has a moonlet (one element, the second moonlet is its box-shadow; see REF/inner/inner.css).
 * `glow` adds the wash of sunlight the home rows paint on the tile when the pointer is near (usePointerSun drives it).
 */
export default function ProjectOrb({
  orb,
  size = 'row',
  glow = false,
}: {
  orb: OrbKey
  size?: 'row' | 'hero'
  glow?: boolean
}) {
  return (
    <span className={`rh-tile rh-tile--${size}`} aria-hidden="true">
      {glow && <span className="rh-glow" />}
      {orb === 'cheer' && <span className="rh-orb-ring" />}
      <span className={`rh-orb rh-o-${orb}`}>
        <i />
      </span>
      {orb === 'cheer' && <span className="rh-orb-ring rh-front" />}
      {orb === 'tracker' && <span className="rh-moonlet" />}
    </span>
  )
}
