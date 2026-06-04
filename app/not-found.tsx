import Link from '@/components/Link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-start py-24">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="text-7xl font-bold tracking-[-0.04em] sm:text-8xl">
        Lost the thread<span className="text-accent">.</span>
      </h1>
      <p className="text-muted mt-5 font-serif text-xl">
        This page doesn&apos;t exist — or hasn&apos;t been written yet.
      </p>
      <Link href="/" className="ghost-btn mt-8 font-mono text-sm">
        ← Back home
      </Link>
    </div>
  )
}
