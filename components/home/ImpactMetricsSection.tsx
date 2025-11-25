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
    <section ref={sectionRef} className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div
            className={`text-center mb-12 md:mb-16 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Impact & Achievements
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Delivering measurable results through technical excellence and leadership
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                {/* Icon */}
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {metric.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {metric.title}
                </h3>

                {/* Description */}
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {metric.description}{' '}
                  {metric.highlight && (
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mt-2">
                      {metric.highlight}
                    </span>
                  )}
                </p>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-slate-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Additional Stats */}
          <div
            className={`mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                6+
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                3
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Companies
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                10M+
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Users Served
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                5+
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Engineers Mentored
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

