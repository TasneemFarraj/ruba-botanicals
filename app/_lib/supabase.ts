import { createClient } from '@supabase/supabase-js'
import type { Category, Product, ProductWithCategory, Order, CartItem } from '../_types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, categories!inner(slug)')
    .eq('in_stock', true)
    .order('sort_order')

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getNavProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('sort_order')
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getBestSellers(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_best_seller', true)
    .eq('in_stock', true)
    .order('sort_order')
    .limit(4)
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function saveOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

/* ── Admin functions ── */

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at'>
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function uploadProductImage(
  file: File,
  path: string
): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const fullPath = `${path}.${ext}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fullPath, file, { upsert: true })

  if (error) { console.error(error); return null }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fullPath)

  return publicUrl
}
