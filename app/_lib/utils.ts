import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CartItem } from '../_types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ADMIN_WHATSAPP = '962789838741'

export function buildWhatsAppMessage(
  items: CartItem[],
  customer: { name: string; phone: string; notes?: string }
): string {
  const lines = items
    .map(i => `• ${i.name_ar} × ${i.quantity} = ${(i.price * i.quantity).toFixed(2)} د.أ`)
    .join('\n')

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return `🌿 طلب جديد - ربى للحناء\n\nالمنتجات:\n${lines}\n\n💰 الإجمالي: ${total.toFixed(2)} د.أ\n\n👤 الاسم: ${customer.name}\n📱 واتساب: ${customer.phone}${customer.notes ? `\n📝 ملاحظات: ${customer.notes}` : ''}\n\n⏰ ${new Date().toLocaleDateString('ar-JO', { dateStyle: 'full' })}`
}

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
