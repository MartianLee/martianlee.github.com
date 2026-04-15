import { allBlogs } from '.contentlayer/generated'
import { redirect } from 'next/navigation'

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({
    slug: p.slug,
  }))
}

export default async function NotesRedirect(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  redirect(`/kb/${decodeURI(params.slug)}`)
}
