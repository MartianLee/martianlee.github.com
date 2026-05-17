'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname.split('/')[1]
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="py-8">
      <nav className="flex items-center justify-between">
        {/* Previous Button */}
        {prevPage ? (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
            className="inline-flex transform items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>
        )}

        {/* Page Counter */}
        <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Button */}
        {nextPage ? (
          <Link
            href={`/${basePath}/page/${currentPage + 1}`}
            rel="next"
            className="inline-flex transform items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
          >
            Next
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-600"
          >
            Next
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const [isTagsOpen, setIsTagsOpen] = useState(false)

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="pt-6 pb-8">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>

        {/* Tags Section - Collapsible */}
        <div className="mb-8">
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <span>Browse by Tags</span>
            </span>
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${
                isTagsOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Collapsible Tags Content */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isTagsOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mt-4 flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <Link
                href="/posts"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith('/posts') && !pathname.includes('/tags/')
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All Posts
              </Link>
              {sortedTags.map((t) => (
                <Link
                  key={t}
                  href={`/tags/${slug(t)}`}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname.split('/tags/')[1] === slug(t)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {`${t} (${tagCounts[t]})`}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Posts List - Card Style */}
        <div className="space-y-6">
          {displayPosts.map((post) => {
            const { path, date, title, summary, tags } = post
            return (
              <article
                key={path}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-slate-600/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-slate-600/5" />

                <div className="relative z-10">
                  {/* Date */}
                  <time
                    dateTime={date}
                    className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(date, siteMetadata.locale)}
                  </time>

                  {/* Title */}
                  <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
                    <Link
                      href={`/${path}`}
                      className="text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                    >
                      {title}
                    </Link>
                  </h2>

                  {/* Tags */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tags?.map((tag) => (
                      <Tag key={tag} text={tag} />
                    ))}
                  </div>

                  {/* Summary */}
                  <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-400">{summary}</p>

                  {/* Read More Link */}
                  <Link
                    href={`/${path}`}
                    className="group/link inline-flex items-center gap-2 font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Read More
                    <svg
                      className="h-4 w-4 transform transition-transform duration-300 group-hover/link:translate-x-1"
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
              </article>
            )
          })}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
        )}
      </div>
    </>
  )
}
