import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CartItem } from '../_types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ADMIN_PHONE = '962789795740'

/** @deprecated use ADMIN_PHONE */
export const ADMIN_WHATSAPP = ADMIN_PHONE

export function fmtPrice(price: number): string {
  if (price === 0) return 'بالاتفاق'
  return `${price} د.أ`
}

export function fmtDate(iso: string) {
  const d = new Date(iso)
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0')
  return {
    date: `${d.getDate()} ${mo} ${d.getFullYear()}`,
    time: `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`,
  }
}

export function buildWAMessage(
  items: CartItem[],
  customer: { name: string; phone: string; notes?: string }
): string {
  const lines = items.map(i => `• ${i.name_ar} × ${i.quantity} = ${(i.price * i.quantity).toFixed(2)} د.أ`).join('\n')
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  return `🌿 طلب جديد - ربى للحناء\n\nالمنتجات:\n${lines}\n\n💰 الإجمالي: ${total.toFixed(2)} د.أ\n\n👤 ${customer.name}\n📱 ${customer.phone}${customer.notes ? `\n📝 ${customer.notes}` : ''}`
}

/** @deprecated use buildWAMessage */
export function buildWhatsAppMessage(
  items: CartItem[],
  customer: { name: string; phone: string; notes?: string }
): string {
  return buildWAMessage(items, customer)
}

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
