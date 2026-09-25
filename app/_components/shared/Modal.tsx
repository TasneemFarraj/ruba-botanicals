'use client'
import { useEffect, ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}

export default function Modal({ open, onClose, title, children, footer, width = '480px' }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,26,15,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: width, background: '#fff', border: '0.5px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '0.5px solid var(--border)' }}
        >
          <h3 className="font-display text-[17px]" style={{ color: 'var(--text-1)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-[13px]"
            style={{ color: 'var(--text-3)', border: '0.5px solid var(--border)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)' }}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-6 py-4"
            style={{ borderTop: '0.5px solid var(--border)', background: 'var(--surface)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
