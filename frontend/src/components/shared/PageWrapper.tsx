import React from 'react'

type PageWrapperProps = {
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
}

const PageWrapper = ({ children, className = '', fullHeight = false }: PageWrapperProps) => {
  return (
    <main className={`${fullHeight ? 'min-h-screen flex items-center' : 'pt-28 pb-20'} ${className}`}>
      {children}
    </main>
  )
}

export default PageWrapper
