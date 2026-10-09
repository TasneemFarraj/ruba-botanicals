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

/** Discount details for a product; null when it isn't discounted */
export function getDiscount(p: { price?: number | null; original_price?: number | null; discount_percent?: number | null }) {
  const pct = Number(p.discount_percent ?? 0)
  const original = Number(p.original_price ?? 0)
  if (pct <= 0 || original <= 0 || !p.price || p.price >= original) return null
  return { percent: Math.round(pct), original }
}

/** price = original × (1 − percent/100), rounded to fils-friendly 2 decimals */
export function applyDiscount(original: number, percent: number) {
  return Math.round(original * (1 - percent / 100) * 100) / 100
}

/**
 * Normalizes a Jordanian number to +962 format:
 * 07x → +9627x, 7x → +9627x, 00962 → +962, +962 stays.
 */
export function normalizeJoPhone(raw: string): string {
  const s = raw.trim().replace(/[^\d+]/g, '')
  if (s.startsWith('+962')) return s
  if (s.startsWith('00962')) return `+${s.slice(2)}`
  if (s.startsWith('962')) return `+${s}`
  if (s.startsWith('07')) return `+962${s.slice(1)}`
  if (s.startsWith('7')) return `+962${s}`
  return s
}

/** wa.me expects the international number as digits only (no "+") */
export function waLink(phone: string) {
  return `https://wa.me/${normalizeJoPhone(phone).replace(/\D/g, '')}`
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
  return `🌿 طلب جديد - ربى فرّاج\n\nالمنتجات:\n${lines}\n\n💰 الإجمالي: ${total.toFixed(2)} د.أ\n\n👤 ${customer.name}\n📱 ${customer.phone}${customer.notes ? `\n📝 ${customer.notes}` : ''}`
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
