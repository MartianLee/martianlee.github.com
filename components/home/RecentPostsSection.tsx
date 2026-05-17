'use client'

import Link from '@/components/Link'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Tag from '@/components/Tag'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'

interface RecentPostsSectionProps {
  posts: CoreContent<Blog>[]
}

export default function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  const { isVisible, ref } = useIntersectionObserver()
  const recentPosts = posts.slice(0, 3)

  return (
    <section ref={ref} className="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div
            className={`mb-12 flex items-center justify-between transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                Recent Posts
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Sharing latest development insights and experiences
              </p>
            </div>
            <Link
              href="/posts"
              className="group hidden items-center gap-2 font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-700 md:flex dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All Posts
              <svg
                className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post, index) => (
              <article
                key={post.slug}
                className={`group transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="h-full transform rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                  {/* Date */}
                  <time
                    dateTime={post.date}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    {formatDate(post.date, siteMetadata.locale)}
                  </time>

                  {/* Title */}
                  <h3 className="mt-3 line-clamp-2 text-xl font-bold">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-gray-900 transition-colors duration-300 group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-400"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {/* Summary */}
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {post.summary}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <Tag key={tag} text={tag} />
                    ))}
                  </div>

                  {/* Read more link */}
                  <div className="mt-4">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="inline-flex items-center text-sm font-medium text-pink-600 transition-all duration-300 hover:gap-2 dark:text-pink-400"
                    >
                      <span>Read more</span>
                      <svg
                        className="ml-1 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile "View All" Button */}
          <div
            className={`mt-12 text-center transition-all delay-700 duration-1000 md:hidden ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <Link
              href="/posts"
              className="inline-flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-slate-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              View All Posts
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
