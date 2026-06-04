import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  contextLabel?: string
}

export function PageHeader({ title, description, actions, contextLabel }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {contextLabel ? <span className="screen-context">{contextLabel}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="inline-actions">{actions}</div> : null}
    </header>
  )
}
