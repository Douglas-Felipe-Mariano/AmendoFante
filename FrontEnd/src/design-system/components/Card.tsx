import type { HTMLAttributes } from 'react'

import { cn } from '../../shared/utils/cn.ts'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
}

export function Card({ padded = true, className, ...props }: CardProps) {
  return <div className={cn('card', padded && 'card-padded', className)} {...props} />
}

