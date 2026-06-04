import siteMetadata from '@/data/siteMetadata'

export default function Masthead() {
  return (
    <section className="pt-12 pb-16 sm:pt-16">
      <p className="eyebrow mb-5">
        Software Engineer @ UJET · ex-Founder/CTO · Seoul, open to global roles
      </p>
      <h1 className="text-[clamp(3.5rem,11vw,6.5rem)] leading-[0.82] font-bold tracking-[-0.045em]">
        MARTIAN
        <br />
        LEE<span className="text-accent">.</span>
      </h1>
      <p className="text-ink/90 mt-7 max-w-[24ch] font-serif text-2xl leading-[1.4]">
        I move fast with AI — and keep the decisions that matter human.
      </p>
      <div className="mt-8 flex flex-wrap gap-6 font-mono text-sm">
        <a href="#projects" className="text-accent border-accent border-b-2 pb-0.5">
          ↓ View projects
        </a>
        <a href="/posts" className="text-muted hover:text-accent">
          Writing
        </a>
        <a href="/static/cv.pdf" className="text-muted hover:text-accent">
          CV ↗
        </a>
        <a href={siteMetadata.github} className="text-muted hover:text-accent">
          GitHub ↗
        </a>
      </div>
    </section>
  )
}
