import { ReactNode } from 'react'

type Variant = 'green' | 'amber' | 'blue' | 'default'

const styles: Record<Variant, string> = {
  green:   'bg-[var(--forest-pale)] text-[var(--forest-mid)]',
  amber:   'bg-[#fef9ec] text-[#92680a]',
  blue:    'bg-[#eff6ff] text-[#1d4ed8]',
  default: 'bg-[var(--surface)] text-[var(--text-2)]',
}

export default function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: Variant }) {
  return (
    <span className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${styles[variant]}`}>
      {children}
    </span>
  )
}
