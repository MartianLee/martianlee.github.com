'use client'

import Link from '@/components/Link'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface Feature {
  icon: string
  title: string
  description: string
  link: string
}

const features: Feature[] = [
  {
    icon: '📝',
    title: 'Tech Blog',
    description: 'Sharing development experiences and learnings',
    link: '/posts',
  },
  {
    icon: '🚀',
    title: 'Projects',
    description: 'Personal projects and side projects',
    link: '/projects',
  },
  {
    icon: '👨‍💻',
    title: 'About',
    description: 'Learn more about me and my career',
    link: '/about',
  },
]

export default function FeaturedSection() {
  const { isVisible, ref } = useIntersectionObserver()

  return (
    <section ref={ref} className="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div
            className={`mb-16 text-center transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              What are you looking for?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Sharing diverse development experiences and knowledge
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.link}
                className={`group transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative h-full transform overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-slate-600/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-slate-600/5" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-4 transform text-5xl transition-transform duration-300 group-hover:scale-110">
                      {feature.icon}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>

                  {/* Arrow icon */}
                  <div className="absolute right-6 bottom-6 translate-x-2 transform text-blue-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-blue-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
