'use client'

import { useEffect, useRef, useState } from 'react'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'

interface RecentPostsSectionProps {
  posts: CoreContent<Blog>[]
}

export default function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const recentPosts = posts.slice(0, 3)

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div
            className={`flex justify-between items-center mb-12 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Recent Posts
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Sharing latest development insights and experiences
              </p>
            </div>
            <Link
              href="/posts"
              className="hidden md:flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-semibold transition-colors duration-300 group"
            >
              View All Posts
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post, index) => (
              <article
                key={post.slug}
                className={`group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="h-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  {/* Date */}
                  <time
                    dateTime={post.date}
                    className="text-sm text-pink-600 dark:text-pink-400 font-medium"
                  >
                    {formatDate(post.date, siteMetadata.locale)}
                  </time>

                  {/* Title */}
                  <h3 className="mt-3 text-xl font-bold line-clamp-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {/* Summary */}
                  <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-3 text-sm leading-relaxed">
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
                      className="inline-flex items-center text-pink-600 dark:text-pink-400 font-medium text-sm hover:gap-2 transition-all duration-300"
                    >
                      <span>Read more</span>
                      <svg
                        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
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
            className={`mt-12 text-center md:hidden transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              View All Posts
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

