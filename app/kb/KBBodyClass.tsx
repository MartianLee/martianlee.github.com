'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function KBBodyClass({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add('kb-active')
    return () => {
      document.body.classList.remove('kb-active')
    }
  }, [])

  return (
    <>
      <Script
        id="kb-body-class"
        strategy="beforeInteractive"
      >{`document.body.classList.add('kb-active')`}</Script>
      {children}
    </>
  )
}
