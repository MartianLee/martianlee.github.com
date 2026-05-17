'use client'

import { useEffect, useRef, useState } from 'react'

interface TechItem {
  name: string
  category: string
}

const techStack: TechItem[] = [
  { name: 'Rails', category: 'Backend' },
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'React Native', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Language' },
  { name: 'Django', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'GCP', category: 'Cloud' },
  { name: 'AWS', category: 'Cloud' },
]

export default function TechStackSection() {
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
    <section ref={sectionRef} className="bg-white py-20 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div
            className={`mb-16 text-center transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Tech Stack
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Solving problems with diverse technologies
            </p>
          </div>

          {/* Tech Stack Grid */}
          <div
            className={`transition-all delay-300 duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="flex flex-wrap justify-center gap-4">
              {techStack.map((tech, index) => (
                <div
                  key={tech.name}
                  className="group relative"
                  style={{
                    animation: isVisible
                      ? `fadeInScale 0.5s ease-out ${index * 0.05}s both`
                      : 'none',
                  }}
                >
                  <div className="transform cursor-default rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-2 transition-all duration-300 hover:scale-110 hover:border-blue-400 hover:shadow-lg md:px-6 md:py-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800 dark:hover:border-blue-500">
                    <span className="text-sm font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600 md:text-sm dark:text-gray-200 dark:group-hover:text-blue-400">
                      {tech.name}
                    </span>
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 transform rounded bg-gray-900 px-3 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-gray-700">
                    {tech.category}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div
            className={`mt-20 grid grid-cols-2 gap-8 transition-all delay-500 duration-1000 md:grid-cols-4 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            {[
              { number: '50+', label: 'Blog Posts' },
              { number: '10+', label: 'Tech Stacks' },
              { number: '3+', label: 'Projects' },
              { number: '∞', label: 'Passion for Learning' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="transform rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-6 text-center transition-all duration-300 hover:scale-105 hover:border-blue-300 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800 dark:hover:border-blue-500"
              >
                <div className="mb-2 bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-600 md:text-base dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
