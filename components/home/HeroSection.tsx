'use client'

import { useEffect, useState } from 'react'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const roles = ['Senior Software Engineer', 'Full Stack Developer', 'Former CTO']
  const [currentRole, setCurrentRole] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative flex min-h-[calc(100vh-200px)] items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-950 dark:to-slate-950" />
        <div className="absolute inset-0 opacity-20">
          <div className="animate-blob absolute top-0 -left-4 h-72 w-72 rounded-full bg-blue-300 opacity-60 mix-blend-multiply blur-xl filter dark:bg-blue-900 dark:mix-blend-soft-light" />
          <div className="animate-blob animation-delay-2000 absolute top-0 -right-4 h-72 w-72 rounded-full bg-slate-300 opacity-60 mix-blend-multiply blur-xl filter dark:bg-slate-800 dark:mix-blend-soft-light" />
          <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-blue-200 opacity-60 mix-blend-multiply blur-xl filter dark:bg-blue-800 dark:mix-blend-soft-light" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Greeting with fade-in animation */}
          <div
            className={`transition-all duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="mb-4 text-lg font-medium text-blue-600 md:text-2xl dark:text-blue-400">
              Hello 👋
            </p>
          </div>

          {/* Main heading with stagger animation */}
          <div
            className={`transition-all delay-200 duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl lg:text-7xl dark:text-white">
              I'm{' '}
              <span className="bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                {siteMetadata.author}
              </span>
            </h1>
          </div>

          {/* Rotating role text */}
          <div
            className={`transition-all delay-400 duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="mb-8 h-12 md:h-16">
              <p className="text-2xl font-light text-gray-700 md:text-3xl dark:text-gray-300">
                <span className="inline-block transition-all duration-500 ease-in-out">
                  {roles[currentRole]}
                </span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div
            className={`transition-all delay-600 duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="mx-auto mb-4 max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                6+ years of experience
              </span>{' '}
              building scalable systems and leading engineering teams.
            </p>
            <p className="mx-auto mb-12 max-w-2xl text-base text-gray-500 md:text-lg dark:text-gray-500">
              Specialized in full-stack development, cloud architecture, and delivering high-impact
              products to millions of users.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`transition-all delay-800 duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/posts"
                className="group relative transform overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-slate-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span className="relative z-10">View Posts</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-slate-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <Link
                href="/projects"
                className="transform rounded-lg border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/30"
              >
                View Projects
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div
            className={`transition-all delay-1000 duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="mt-12 flex items-center justify-center gap-6">
              {siteMetadata.github && (
                <a
                  href={siteMetadata.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform text-gray-600 transition-all duration-300 hover:scale-110 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  aria-label="GitHub"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              )}
              {siteMetadata.linkedin && (
                <a
                  href={siteMetadata.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform text-gray-600 transition-all duration-300 hover:scale-110 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  aria-label="LinkedIn"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
