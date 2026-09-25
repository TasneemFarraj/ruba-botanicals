"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/app/_lib/supabase";
import ProductCard from "@/app/_components/ProductCard";
import EmptyState from "@/app/_components/shared/EmptyState";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import type { Category, Product } from "@/app/_types";

const SKELETON = Array.from({ length: 8 });

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([getCategoryBySlug(slug), getProducts(slug)]).then(
      ([cat, prods]) => {
        setCategory(cat);
        setProducts(prods);
        setLoading(false);
      }
    );
  }, [slug]);

  return (
    <>
      <Navbar />
      <main dir="rtl" style={{ background: "var(--white)", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6 pb-20">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-[13px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-display), Georgia, serif" }}>
            <Link href="/" className="hover:underline" style={{ color: "var(--text-3)" }}>
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:underline" style={{ color: "var(--text-3)" }}>
              المنتجات
            </Link>
            {!loading && category && (
              <>
                <span>/</span>
                <span style={{ color: "var(--text-2)" }}>{category.name_ar}</span>
              </>
            )}
          </nav>

          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center shrink-0 rounded-full transition-all duration-200 hover:opacity-60"
              style={{
                width: 40,
                height: 40,
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                background: "transparent",
              }}
              aria-label="العودة"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Branch icon */}
            <div style={{ width: 22, height: 28, color: "var(--forest)", opacity: 0.4, flexShrink: 0 }}>
              <svg viewBox="0 0 64 80" fill="none" className="w-full h-full" aria-hidden="true">
                <path d="M32 72 C32 72 30 50 32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="currentColor"/>
                <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="currentColor"/>
                <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="currentColor"/>
                <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="currentColor"/>
                <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="currentColor"/>
              </svg>
            </div>

            {/* Title + count */}
            {loading ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-7 rounded w-44" style={{ background: "var(--cream-card)" }} />
                <div className="h-3 rounded w-16" style={{ background: "var(--cream-card)" }} />
              </div>
            ) : (
              <div>
                <h1
                  className="font-display leading-tight"
                  style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.7rem)", color: "var(--forest-mid)" }}
                >
                  {category?.name_ar ?? "الفئة"}
                </h1>
                {products.length > 0 && (
                  <p className="text-[12px] mt-0.5 tabular-nums" style={{ color: "var(--text-3)" }}>
                    {products.length} منتج
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {SKELETON.map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl mb-4" style={{ background: "var(--cream-card)" }} />
                  <div className="h-3 rounded-sm mb-2 w-3/4" style={{ background: "var(--cream-card)" }} />
                  <div className="h-3 rounded-sm w-1/2" style={{ background: "var(--cream-card)" }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState title="لا توجد منتجات في هذه الفئة حتى الآن" actionLabel="تصفحي جميع المنتجات" actionHref="/products" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
