import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";
import { getCategories, getProducts } from "./_lib/supabase";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((c) => ({
      url: `${SITE_URL}/products/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: p.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
