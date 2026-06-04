import type { HTMLAttributes } from 'react'

import { cn } from '../../shared/utils/cn.ts'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClass: Record<BadgeVariant, string> = {
  default: 'badge-default',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return <span className={cn('badge', variantClass[variant], className)} {...props} />
}

