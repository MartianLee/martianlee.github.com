import Link from 'next/link'
import { slug } from 'github-slugger'

interface Props {
  text: string
}

const Tag = ({ text }: Props) => (
  <Link
    href={`/tags/${slug(text)}`}
    className="chip hover:border-accent hover:text-accent mr-2 transition-colors"
  >
    {text.split(' ').join('-')}
  </Link>
)

export default Tag
