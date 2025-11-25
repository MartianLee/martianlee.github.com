'use client'

import { useEffect, useRef, useState } from 'react'
import Image from '@/components/Image'
import Link from '@/components/Link'
import careerData from '@/data/careerData'

export default function CareerSection() {
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
    <section ref={sectionRef} className="py-12">
      <div
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Professional Experience
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerData.map((career, index) => (
            <div
              key={career.company}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative h-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-slate-600/0 group-hover:from-blue-500/5 group-hover:to-slate-600/5 transition-all duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Company Logo */}
                  {career.imgSrc && (
                    <div className="mb-4 h-16 flex items-center justify-center">
                      <Image
                        src={career.imgSrc}
                        alt={career.company}
                        width={120}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Company Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {career.company}
                  </h3>

                  {/* Role */}
                  <p className="text-pink-600 dark:text-pink-400 font-semibold mb-2">
                    {career.role}
                  </p>

                  {/* Period */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {career.period}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {career.description}
                  </p>

                  {/* Tech Stack */}
                  {career.techStack && career.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {career.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Link */}
                  {career.href && (
                    <Link
                      href={career.href}
                      className="inline-flex items-center text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                    >
                      Visit Website
                      <svg
                        className="ml-1 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

