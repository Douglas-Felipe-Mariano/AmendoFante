import type { TextareaHTMLAttributes } from 'react'

import { cn } from '../../shared/utils/cn.ts'

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('text-area', className)} {...props} />
}

