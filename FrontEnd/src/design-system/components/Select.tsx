import type { SelectHTMLAttributes } from 'react'

import { cn } from '../../shared/utils/cn.ts'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('text-select', className)} {...props}>
      {children}
    </select>
  )
}

