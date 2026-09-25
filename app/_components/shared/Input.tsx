import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/app/_lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{label}</label>
    )}
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg px-3 py-2.5 text-[13px]',
        'bg-white border border-[var(--border-mid)]',
        'text-[var(--text-1)] placeholder:text-[var(--text-3)]',
        'focus:outline-none focus:border-[var(--forest)]',
        'transition-colors duration-150',
        'disabled:opacity-40',
        error && 'border-red-400 focus:border-red-500',
        className
      )}
      {...props}
    />
    {error && <span className="text-[11px] text-red-500">{error}</span>}
  </div>
))

Input.displayName = 'Input'
export default Input
