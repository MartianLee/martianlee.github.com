import siteMetadata from '@/data/siteMetadata'

export default function ContactSection() {
  return (
    <section className="border-ink mt-6 border-t py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 font-mono text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
          <span>Open to senior / staff engineering roles — globally.</span>
        </div>
        <div className="text-accent flex gap-5 font-mono text-sm">
          <a href={`mailto:${siteMetadata.email}`}>Email ↗</a>
          <a href={siteMetadata.github}>GitHub ↗</a>
          <a href={siteMetadata.linkedin}>LinkedIn ↗</a>
        </div>
      </div>
    </section>
  )
}
