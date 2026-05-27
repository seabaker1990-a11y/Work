import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'icon'
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        variant === 'default' &&
          'bg-violet-600/80 hover:bg-violet-600 text-white border border-violet-500/30',
        variant === 'ghost' &&
          'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/8',
        variant === 'danger' &&
          'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3 py-1.5 text-sm',
        size === 'icon' && 'p-2',
        className,
      )}
      {...props}
    />
  )
}
