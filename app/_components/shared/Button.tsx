import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/app/_lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'whatsapp'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:  'bg-[var(--forest)] text-[#e8f4e0] hover:bg-[var(--forest-mid)]',
  outline:  'border border-[var(--border-mid)] text-[var(--forest)] hover:border-[var(--forest)] hover:bg-[var(--forest-pale)]',
  ghost:    'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--forest-pale)]',
  danger:   'text-red-500 hover:bg-red-50 hover:text-red-600',
  whatsapp: 'bg-[#128c7e] text-white hover:bg-[#0a7265]',
}

const sizes: Record<Size, string> = {
  sm: 'text-[11px] px-3.5 py-1.5',
  md: 'text-[12px] px-5 py-2.5',
  lg: 'text-[13px] px-7 py-3',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium',
        'transition-all duration-200 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
