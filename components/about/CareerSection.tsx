'use client'

import Image from '@/components/Image'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Link from '@/components/Link'
import careerData from '@/data/careerData'

export default function CareerSection() {
  const { isVisible, ref } = useIntersectionObserver()

  return (
    <section ref={ref} className="py-12">
      <div
        className={`transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Professional Experience
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {careerData.map((career, index) => (
            <div
              key={career.company}
              className={`group transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative h-full transform overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-slate-600/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-slate-600/5" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Company Logo */}
                  {career.imgSrc && (
                    <div className="mb-4 flex h-16 items-center justify-center">
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
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {career.company}
                  </h3>

                  {/* Role */}
                  <p className="mb-2 font-semibold text-pink-600 dark:text-pink-400">
                    {career.role}
                  </p>

                  {/* Period */}
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{career.period}</p>

                  {/* Description */}
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                    {career.description}
                  </p>

                  {/* Tech Stack */}
                  {career.techStack && career.techStack.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {career.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 md:px-2 md:py-1 md:text-xs dark:bg-gray-700 dark:text-gray-300"
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
                      className="inline-flex items-center text-sm font-medium text-pink-600 transition-colors hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                    >
                      Visit Website
                      <svg
                        className="ml-1 h-4 w-4"
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
