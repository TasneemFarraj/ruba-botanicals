# Ruba Botanicals — Full Project Prompt for Claude Code

## Project Overview

Build a premium Arabic e-commerce website for "Ruba Botanicals" — a natural henna & botanical beauty brand from Jordan. The visual reference is **Ayurveda.fr** and **Purelis Beauty** — clean, editorial, warm-white with deep forest green accents.

No online payment. Orders go via **WhatsApp** and are saved to **Supabase**.

---

## Tech Stack — Do Not Change

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui
- GSAP + ScrollTrigger (animations only — no Framer Motion)
- Lenis (smooth scroll only)
- Zustand (cart state)
- Supabase (DB + Storage + Auth)

---

## Environment Variables (already set in .env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://aohctcbzteujxtjnaifv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_PcwU_My0UejKZACsziOhEQ_s3ljTxtU
```

---

## Color System — Reference: Ayurveda + Purelis

```css
:root {
  /* Backgrounds */
  --cream: #f7f3ee; /* Hero + Announcement bg — Ayurveda warm white */
  --white: #ffffff; /* Main page bg — Purelis clean white */
  --cream-card: #f5f1eb; /* Product image area bg */

  /* Forest Green */
  --forest: #1c3a1a; /* Navbar, Footer, Features Bar bg */
  --forest-mid: #2d5a0e; /* Primary buttons, active states */
  --forest-light: #4d7c1f; /* Hover states, accents */
  --forest-pale: #eef4e8; /* Light green tint for badges */

  /* Gold */
  --gold: #b07d2e; /* Prices, eyebrow labels */
  --gold-light: #f5e9d3; /* Gold tint backgrounds */

  /* Text */
  --text-dark: #1a2810; /* Primary text */
  --text-muted: #5c7050; /* Secondary text */
  --text-light: #8aaa80; /* Tertiary / footer text */

  /* Border */
  --border: rgba(77, 124, 31, 0.1);
}
```

---

## Global CSS Rules

- `html` background: `var(--white)`
- `body` background: `var(--white)`
- Hero section background: `var(--cream)`
- Announcement bar background: `var(--forest)`
- Features bar background: `var(--forest)`
- Footer background: `var(--forest)`
- All other sections: `var(--white)` broken by `var(--cream)` alternating
- Direction: `rtl` globally
- Font: IBM Plex Sans Arabic (via next/font/google)
- Serif font for large headings only

---

## Existing File Structure (already created — edit, don't recreate)

```
app/
  admin/
    AdminLogin.tsx
    AdminProductForm.tsx
    layout.tsx
    page.tsx
  products/
    [id]/page.tsx
    page.tsx
    ProductPageClient.tsx
  _components/
    BestSellers.tsx
    Button.tsx
    CartDrawer.tsx
    CartProvider.tsx
    Categories.tsx
    Footer.tsx
    Hero.tsx
    LanguageProvider.tsx
    Navbar.tsx
    ProductCard.tsx
    Providers.tsx
    ThemeProvider.tsx
  _lib/
    productContent.ts
    supabase.ts
    translations.ts
    utils.ts
  _types/
    index.ts
  globals.css
  layout.tsx
  page.tsx
```

---

## Supabase Schema (already created in DB)

```sql
-- Categories
create table categories (
  id uuid default gen_random_uuid() primary key,
  name_ar text not null,
  name_en text,
  slug text unique not null,
  image_url text,
  sort_order int default 0
);

-- Products
create table products (
  id uuid default gen_random_uuid() primary key,
  name_ar text not null,
  name_en text,
  description_ar text,
  price numeric not null,
  unit text,
  image_url text,
  image_no_bg_url text,
  category_id uuid references categories(id),
  is_best_seller boolean default false,
  in_stock boolean default true,
  sort_order int default 0,
  created_at timestamp default now()
);

-- Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text,
  customer_phone text,
  items jsonb,
  total numeric,
  notes text,
  status text default 'pending',
  created_at timestamp default now()
);
```

---

## \_types/index.ts

```typescript
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
  price: number;
  unit?: string;
  image_url?: string;
  image_no_bg_url?: string;
  category_id: string;
  is_best_seller: boolean;
  in_stock: boolean;
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

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: CartItem[];
  total: number;
  notes?: string;
  status: "pending" | "confirmed" | "done";
  created_at: string;
}
```

---

## \_lib/supabase.ts

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all categories ordered by sort_order
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

// Fetch all products
export async function getProducts(categorySlug?: string) {
  let query = supabase
    .from("products")
    .select("*, categories(slug)")
    .eq("in_stock", true)
    .order("sort_order");

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Fetch best sellers
export async function getBestSellers() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_best_seller", true)
    .eq("in_stock", true)
    .order("sort_order")
    .limit(4);
  if (error) throw error;
  return data;
}

// Save order to DB
export async function saveOrder(order: Omit<Order, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

---

## \_lib/utils.ts — WhatsApp

```typescript
import { CartItem } from "@/_types";

export const ADMIN_WHATSAPP = "962789795740";

export function buildWhatsAppMessage(
  items: CartItem[],
  customer: { name: string; phone: string; notes?: string },
): string {
  const lines = items
    .map((i) => `• ${i.name_ar} × ${i.quantity} = ${i.price * i.quantity} د.أ`)
    .join("\n");

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return `🌿 طلب جديد - ربى للحناء\n\nالمنتجات:\n${lines}\n\n💰 الإجمالي: ${total} د.أ\n\n👤 الاسم: ${customer.name}\n📱 واتساب: ${customer.phone}${customer.notes ? `\n📝 ملاحظات: ${customer.notes}` : ""}\n\n⏰ ${new Date().toLocaleDateString("ar-JO", { dateStyle: "full" })}`;
}

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}
```

---

## Zustand Cart Store — \_lib/store/cart.ts

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/_types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
          }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "ruba-cart" },
  ),
);
```

---

## Components to Build / Rewrite

### 1. Navbar.tsx

- Sticky top, background: `var(--cream)` with subtle border-bottom on scroll
- RTL layout: Logo right | Nav links center | Cart icon + CTA left
- Logo: "Ruba Botanicals" serif font + small leaf icon
- Cart icon shows item count badge (from Zustand)
- On scroll: adds `border-bottom: 0.5px solid var(--border)` + subtle backdrop-blur

### 2. Hero.tsx

- Full height section, background: `var(--cream)`
- Split layout: left = text content | right = auto-sliding image
- Image slider: crossfade transition every 4 seconds, NO dots, NO arrows
  - Images load from Supabase Storage (placeholder div with soft bg until images added)
- Left content:
  - Small eyebrow tag: "طبيعي 100% — مستوحى من الطبيعة"
  - Large serif H1 two lines: "الحناء الطبيعية / بلمسة فاخرة" (second line in forest-mid color)
  - Description paragraph
  - 3 small icon items: (leaf icon) طبيعي | (shield icon) آمن | (star icon) مضمون
  - Two buttons: primary forest green "اكتشفي المنتجات" + ghost outline "تعرفي علينا ←"
- GSAP entrance: each element fades up (y:60→0, opacity:0→1) staggered by 0.12s

### 3. FeaturesBar.tsx (NEW component)

- Background: `var(--forest)` deep green
- 4 columns, each: outline icon in bordered square + title + subtitle
- Style exactly like Ayurveda.fr features bar
- Items:
  1. truck icon | توصيل مجاني | للطلبات فوق 50 د.أ
  2. lock icon | دفع آمن | نضمن خصوصيتك
  3. leaf icon | مكونات طبيعية | لا كيماويات ضارة
  4. whatsapp icon | رد فوري | واتساب 7 أيام

### 4. BestSellers.tsx

- Background: `var(--white)`
- Section header: gold eyebrow "الأكثر مبيعاً" + large serif title "المنتجات المميزة" + gold divider line
- Fetches products with `is_best_seller = true` from Supabase
- 4 product cards in a row — style like **Purelis** exactly:
  - White card, no border (or extremely subtle)
  - Image area: `var(--cream-card)` bg, large padding, product image centered
  - Image floats up 8px on hover (GSAP)
  - Product name serif, description one line muted, price in gold
  - "أضيفي للسلة" button → adds to Zustand cart
  - Click card → opens ProductPanel
- GSAP ScrollTrigger: cards fade up from y:50 staggered on scroll

### 5. Categories.tsx

- Background: `var(--white)`
- Section header left-aligned: large serif "تسوقي حسب الفئة" + subtitle
- Layout exactly like **Purelis "Shop by Category"**:
  - 4 square image cards in a row, no border, no rounded corners (or very subtle)
  - Below each image: category name bold + "تسوقي الآن →" small muted text
  - Hover: slight scale(1.02) on image
- Fetches categories from Supabase
- Click category → filters products in the section below (no page navigation)
- Filtered products grid: 3-4 columns, same ProductCard style

### 6. ProductCard.tsx

- White bg, no border (Purelis style)
- Image area: `var(--cream-card)` background, generous padding
- Product image: `image_no_bg_url` if available, else `image_url`
- Name (serif), unit/weight (muted small), price (gold bold)
- "+ أضيفي" circle button bottom right → adds to cart
- "Bestseller" badge top left if `is_best_seller`
- Click → opens ProductPanel (side panel)

### 7. ProductPanel.tsx (Side Panel)

- Slides in from right: `translateX(100%) → translateX(0)` spring animation
- Overlay behind with backdrop-blur
- Close with X button, overlay click, or Escape key
- Content:
  - Large product image (no-bg version) with drop-shadow
  - Name (serif large), description (full text), unit, price (gold)
  - Divider
  - Quantity selector: [−] [1] [+] with live subtotal
  - "أضيفي للسلة" green button
  - "اطلبي عبر واتساب مباشرة" whatsapp green button (single item order)

### 8. CartDrawer.tsx

- Slides in from right (same animation as panel)
- Header: "سلة المشتريات" + close button
- Empty state: bag icon + "السلة فارغة"
- Each cart item: small image + name + qty controls [−][n][+] + price + delete
- Footer:
  - Total display
  - Name input (required)
  - Phone input (required)
  - Notes textarea (optional)
  - "إتمام الطلب عبر واتساب" button → calls saveOrder() then openWhatsApp()
  - Small note: "يفتح واتساب بتفاصيل طلبك"

### 9. Footer.tsx

- Style exactly like **Ayurveda footer**: dark forest green background
- Left: Logo + brand description + social icons (Instagram, TikTok, WhatsApp)
- Center-left: "انضمي لمجتمعنا" + short text + email input + subscribe button
- Center-right: روابط المتجر (categories links)
- Right: من نحن | تواصلي | سياسة الخصوصية
- Bottom bar: copyright + legal links
- Divider line between sections

### 10. Admin Panel — app/admin/page.tsx

- Protected by Supabase Auth (email + password)
- Dashboard tabs: المنتجات | الأقسام | الطلبات

**Products tab:**

- Table: image thumbnail | name | category | price | best seller toggle | in stock toggle | edit | delete
- "إضافة منتج" button → opens AdminProductForm modal
- AdminProductForm fields:
  - name_ar, name_en
  - description_ar
  - price, unit
  - category (select from categories)
  - is_best_seller toggle
  - in_stock toggle
  - image upload → uploads to Supabase Storage `products` bucket → saves URL
  - image_no_bg upload (PNG transparent) → saves to same bucket

**Categories tab:**

- Table: image | name_ar | slug | sort_order | edit | delete
- Add/edit category form

**Orders tab:**

- Table: date | customer name | phone | items summary | total | status dropdown
- Status: pending → confirmed → done

---

## Products Data (seed this into Supabase)

### Category: حناء النقش (slug: henna-naqsh)

| name_ar            | price | unit      | description_ar                                                         |
| ------------------ | ----- | --------- | ---------------------------------------------------------------------- |
| حناء بيضاء مؤقتة   | 3     | 20g       | حناء مؤقتة بتروح مع التغسيل، آمنة للرسم على الجسم والوجه، لا تسبب تحسس |
| حناء فضي مؤقتة     | 3     | 20g       | حناء مؤقتة بتروح مع التغسيل، آمنة للرسم على الجسم والوجه، لا تسبب تحسس |
| حناء ذهبي مؤقتة    | 3     | 20g       | حناء مؤقتة بتروح مع التغسيل، آمنة للرسم على الجسم والوجه، لا تسبب تحسس |
| حناء بيضاء ثابتة   | 10    | 15g       | ثباتها 1-4 أيام، مقاومة للماء، تعمل طبقة على الجلد، لا تسبب تحسس       |
| حنّا حمرا طبيعية   | 5     | 50g       | لون برتقالي يتحول تدريجياً لبني محمر، طبيعية 100%                      |
| خمري-بني فوري      | 3     | 20g       | صناعية، لونها بين البني والخمري، ثباتها 2-10 أيام                      |
| حناء سوداء         | 7     | 4 أمبولات | بودرة تُخلط بالماء، ثباتها 9-14 يوم                                    |
| قلم الجل الأبيض    | 3     | —         | للتخطيط قبل رسم الحناء، لا يعيق امتصاص اللون                           |
| قراطيس فارغة Cones | 1     | 5 cones   | لتعبئة الحناء، يتسع من 20-50 جرام                                      |
| جاغوا              | 10    | 15g       | حناء طبيعية باللون الكحلي، آمنة للحوامل والأطفال                       |

### Category: حناء وأعشاب الشعر (slug: henna-hair)

| name_ar            | price | unit |
| ------------------ | ----- | ---- |
| حناء شعر بني-نحاسي | 15    | كيلو |
| حناء شعر بني-نحاسي | 8     | 500g |
| حناء شعر برغندي    | 15    | كيلو |
| حناء شعر برغندي    | 8     | 500g |
| خلطة أعشاب الشيب   | 5     | 30g  |
| سدر عضوي           | 5     | 100g |
| مشاط أحمر          | 5     | 100g |
| وسمة               | 6     | 100g |

### Category: العناية الطبيعية بالشعر (slug: hair-care)

| name_ar                    | price | unit  |
| -------------------------- | ----- | ----- |
| شامبو أعشاب المشاط الطبيعي | 6     | 250ml |
| كريم مرطب للشعر Leave-in   | 10    | 250ml |
| سيروم الشعر المغذّي        | 10    | 50ml  |
| مقشر فروة الرأس            | 8     | 350g  |

### Category: العناية الطبيعية بالجسم (slug: body-care)

| name_ar                           | price | unit  |
| --------------------------------- | ----- | ----- |
| غسول السدر الطبيعي للوجه          | 6     | 200ml |
| سكراب الجسم بالسدر والورد المحمدي | 8     | 350g  |

### Category: خدمات (slug: services)

- الحفلات والمناسبات — بالاتفاق
- دورات الحناء المعتمدة — من 50 د.أ
- خدمة منزلية — بالاتفاق

---

## Animation Rules (GSAP only)

```typescript
// Lenis setup in layout
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

// Hero entrance — staggered fade up
gsap.from(".hero-element", {
  y: 60,
  opacity: 0,
  duration: 1.2,
  stagger: 0.12,
  ease: "power3.out",
});

// Hero image crossfade
gsap.to(currentSlide, { opacity: 0, duration: 0.8, ease: "power2.inOut" });
gsap.to(nextSlide, { opacity: 1, duration: 0.8, ease: "power2.inOut" });

// Product cards on scroll
gsap.from(".product-card", {
  y: 40,
  opacity: 0,
  stagger: 0.1,
  scrollTrigger: {
    trigger: ".products-section",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

// Product image hover
const floatAnim = gsap.to(".product-img", {
  y: -8,
  duration: 0.3,
  ease: "power2.out",
  paused: true,
});
card.addEventListener("mouseenter", () => floatAnim.play());
card.addEventListener("mouseleave", () => floatAnim.reverse());

// Side panel slide in
gsap.fromTo(
  ".side-panel",
  { x: "100%" },
  { x: 0, duration: 0.45, ease: "power3.out" },
);
```

---

## Important Notes

- All text RTL, Arabic primary language
- No dark mode needed — light mode only
- No Framer Motion — GSAP only for animations
- Images: `image_no_bg_url` (PNG transparent) for cards and panel, `image_url` for hero slider
- Until real images are uploaded to Supabase, show placeholder divs with `var(--cream-card)` bg
- Supabase Storage bucket name: `products` (public)
- Admin route protected: redirect to /admin/login if no session
- Mobile responsive: 1 column mobile, 2 tablet, 3-4 desktop
