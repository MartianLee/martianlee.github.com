import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer className="site-chrome-footer border-line mt-16 border-t">
      <div className="text-muted flex flex-col gap-4 py-7 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {siteMetadata.author}
        </span>
        <div className="flex items-center gap-4">
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={5} />
          <SocialIcon kind="github" href={siteMetadata.github} size={5} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={5} />
          <span>Seoul · UTC+9</span>
        </div>
      </div>
    </footer>
  )
}
