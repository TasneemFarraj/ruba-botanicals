import { createClient } from '@supabase/supabase-js'
import type { Category, Product, ProductWithCategory, Order, CartItem, ProductImage, FeedbackImage } from '../_types'

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
    .order('sort_order')

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return (data ?? []) as Product[]
}

export async function getNavProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
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

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name_ar', `%${query}%`)
    .order('sort_order')
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

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function getRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('sort_order')
    .limit(4)
  if (error) { console.error(error); return [] }
  return data ?? []
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

/* ── Product gallery & customer feedback ── */

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getFeedbackImages(productId?: string): Promise<FeedbackImage[]> {
  let query = supabase
    .from('feedback_images')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })
  if (productId) query = query.eq('product_id', productId)
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data ?? []
}

/** Uploads under a unique name and returns the public URL */
export async function uploadToBucket(
  bucket: 'product-images' | 'feedback-images',
  file: File,
  folder: string
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/** Best-effort removal of a file previously returned by uploadToBucket */
export async function removeFromBucket(bucket: 'product-images' | 'feedback-images', publicUrl: string) {
  const marker = `/object/public/${bucket}/`
  const i = publicUrl.indexOf(marker)
  if (i === -1) return
  const path = decodeURIComponent(publicUrl.slice(i + marker.length))
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) console.warn('[removeFromBucket]', error)
}
