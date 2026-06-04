import type { InputHTMLAttributes } from 'react'

import { cn } from '../../shared/utils/cn.ts'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('text-input', className)} {...props} />
}

