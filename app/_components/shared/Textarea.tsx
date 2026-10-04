import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/app/_lib/utils'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{label}</label>
    )}
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg px-3 py-2.5 text-[13px] resize-none',
        'bg-[var(--white)] border border-[var(--border-mid)]',
        'text-[var(--text-1)] placeholder:text-[var(--text-3)]',
        'focus:outline-none focus:border-[var(--forest)]',
        'transition-colors duration-150',
        className
      )}
      {...props}
    />
    {error && <span className="text-[11px] text-red-500">{error}</span>}
  </div>
))

Textarea.displayName = 'Textarea'
export default Textarea
