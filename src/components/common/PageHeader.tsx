import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon: ReactNode
  title: string
  subtitle: string
}

export function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <header className="knowledge-base-header">
      <div className="knowledge-base-header-icon">{icon}</div>
      <div>
        <h1>{title}</h1>
        <p className="knowledge-base-subtitle">{subtitle}</p>
      </div>
    </header>
  )
}
