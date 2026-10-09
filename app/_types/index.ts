export interface Category {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  image_url?: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  price?: number;
  unit?: string;
  image_url?: string;
  image_no_bg_url?: string;
  category_id: string;
  is_best_seller: boolean;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
  how_to_use_ar?: Array<{ title: string; text: string }> | null;
  storage_ar?: string | null;
  expiry_ar?: string | null;
  warnings_ar?: string[] | null;
  /** Price before discount; `price` holds the discounted (selling) price */
  original_price?: number | null;
  discount_percent?: number | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface FeedbackImage {
  id: string;
  product_id: string | null;
  image_url: string;
  customer_name?: string | null;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  name_ar: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export type ProductWithCategory = Product & {
  categories: {
    id: string;
    slug: string;
    name_ar: string;
    name_en?: string;
  } | null;
};

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_phone2?: string;
  governorate?: string;
  area?: string;
  street_address?: string;
  items: CartItem[];
  subtotal?: number;
  delivery_fee?: number;
  total: number;
  notes?: string;
  status: "pending" | "postponed" | "done";
  created_at: string;
  completed_at?: string | null;
}
