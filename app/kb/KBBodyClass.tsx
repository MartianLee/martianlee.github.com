'use client'

import { useEffect } from 'react'

export default function KBBodyClass({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add('kb-active')
    return () => {
      document.body.classList.remove('kb-active')
    }
  }, [])

  return <>{children}</>
}
