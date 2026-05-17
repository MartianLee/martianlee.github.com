'use client'

import { useEffect, useState, useRef } from 'react'

interface Metric {
  icon: string
  title: string
  description: string
  highlight?: string
}

const metrics: Metric[] = [
  {
    icon: '🚀',
    title: 'System Performance',
    description: 'Led migration to microservices architecture',
    highlight: 'reducing latency by 40%',
  },
  {
    icon: '👥',
    title: 'Team Leadership',
    description: 'Mentored and guided',
    highlight: '5+ junior engineers',
  },
  {
    icon: '📈',
    title: 'Scale & Reliability',
    description: 'Built systems handling',
    highlight: '10M+ requests/day',
  },
  {
    icon: '⚡',
    title: 'DevOps Excellence',
    description: 'Reduced deployment time from 2 hours to',
    highlight: '15 minutes',
  },
]

export default function ImpactMetricsSection() {
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

  return (
    <section ref={sectionRef} className="bg-gray-50 py-16 md:py-24 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div
            className={`mb-12 text-center transition-all duration-1000 md:mb-16 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Impact & Achievements
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Delivering measurable results through technical excellence and leadership
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className={`group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:border-blue-500 hover:shadow-xl md:p-8 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                {/* Icon */}
                <div className="mb-4 transform text-5xl transition-transform duration-300 group-hover:scale-110">
                  {metric.icon}
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                  {metric.title}
                </h3>

                {/* Description */}
                <p className="text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-400">
                  {metric.description}{' '}
                  {metric.highlight && (
                    <span className="mt-2 block font-bold text-blue-600 dark:text-blue-400">
                      {metric.highlight}
                    </span>
                  )}
                </p>

                {/* Hover Effect Border */}
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-slate-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
              </div>
            ))}
          </div>

          {/* Additional Stats */}
          <div
            className={`mt-12 grid grid-cols-2 gap-6 transition-all delay-500 duration-1000 md:mt-16 md:grid-cols-4 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600 md:text-4xl dark:text-blue-400">
                6+
              </div>
              <div className="text-sm text-gray-600 md:text-base dark:text-gray-400">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600 md:text-4xl dark:text-blue-400">
                3
              </div>
              <div className="text-sm text-gray-600 md:text-base dark:text-gray-400">Companies</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600 md:text-4xl dark:text-blue-400">
                10M+
              </div>
              <div className="text-sm text-gray-600 md:text-base dark:text-gray-400">
                Users Served
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600 md:text-4xl dark:text-blue-400">
                5+
              </div>
              <div className="text-sm text-gray-600 md:text-base dark:text-gray-400">
                Engineers Mentored
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
