'use client'
import { useEffect, useState } from 'react'

interface ToastProps { message: string; onDone: () => void }

export default function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300) }, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 px-5 py-2.5 rounded-full text-[12px] font-medium shadow-lg transition-all duration-300"
      style={{
        background: 'var(--forest)',
        color: '#e8f4e0',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
      }}
    >
      {message}
    </div>
  )
}
