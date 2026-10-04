"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts, getCategories, searchProducts } from "@/app/_lib/supabase";
import type { Product, Category } from "@/app/_types";
import ProductCard from "@/app/_components/ProductCard";
import EmptyState from "@/app/_components/shared/EmptyState";

const SKELETON = Array.from({ length: 8 });

function LeafIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" fill="none" className={className} aria-hidden="true">
      <path d="M32 72 C32 72 30 50 32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="currentColor"/>
      <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="currentColor"/>
      <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="currentColor"/>
      <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="currentColor"/>
      <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="currentColor"/>
    </svg>
  );
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ProductPageClient({ searchParams }: Props) {
  const params     = use(searchParams);
  const initialCat = typeof params.cat === "string" ? params.cat : null;
  const initialQ   = typeof params.q   === "string" ? params.q   : "";

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(initialCat);
  const [inputVal,   setInputVal]   = useState(initialQ);
  const [query,      setQuery]      = useState(initialQ);
  const [loading,    setLoading]    = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router      = useRouter();

  const isSearch = query.trim().length > 0;

  useEffect(() => { getCategories().then(setCategories); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(inputVal), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputVal]);

  useEffect(() => {
    setLoading(true);
    const fetch = isSearch
      ? searchProducts(query.trim())
      : getProducts(activeSlug ?? undefined);
    fetch.then((data) => { setProducts(data); setLoading(false); });
  }, [query, activeSlug, isSearch]);

  const clearSearch = () => {
    setInputVal("");
    setQuery("");
    router.replace("/products", { scroll: false });
  };

  const selectCategory = (slug: string | null) => {
    setActiveSlug(slug);
    if (isSearch) { setInputVal(""); setQuery(""); }
  };

  return (
    <main dir="rtl" style={{ background: "var(--white)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Page hero ── */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(var(--surface-rgb),0.82), rgba(var(--surface-rgb),0.92)), var(--hero-bg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Bottom fade to white */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
          style={{ background: "linear-gradient(transparent, var(--white))" }}
        />

        <div className="relative max-w-2xl mx-auto px-6 pt-8 pb-6 flex flex-col items-center text-center gap-3">
          {/* Icon */}
          <div style={{ width: 20, height: 26, color: "var(--forest)", opacity: 0.3 }}>
            <LeafIcon className="w-full h-full" />
          </div>

          {/* Title */}
          <div>
            {isSearch ? (
              <>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-3)", letterSpacing: "0.14em" }}>
                  نتائج البحث
                </p>
                <h1 className="font-display text-[24px] md:text-[30px] leading-tight" style={{ color: "var(--text-1)" }}>
                  &ldquo;{query.trim()}&rdquo;
                </h1>
              </>
            ) : (
              <>
                <h1 className="font-display text-[26px] md:text-[32px] leading-tight" style={{ color: "var(--forest-mid)" }}>
                  المنتجات
                </h1>
              </>
            )}
            {!loading && (
              <p className="mt-1 text-[12px]" style={{ color: "var(--text-3)" }}>
                {products.length} {isSearch ? "نتيجة" : "منتج"}
              </p>
            )}
          </div>

          {/* ── Search bar ── */}
          <div
            className="w-full max-w-sm flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-shadow duration-200 focus-within:shadow-md"
            style={{
              background: "var(--white)",
              border: "1.5px solid var(--border-mid)",
              boxShadow: "0 2px 10px rgba(28,58,26,0.05)",
            }}
          >
            {loading && isSearch ? (
              <svg className="animate-spin shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--forest)" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0" style={{ color: "var(--text-3)" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (e.target.value.trim()) setActiveSlug(null);
              }}
              placeholder="ابحثي عن منتج..."
              className="flex-1 min-w-0 bg-transparent outline-none text-[13px]"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-display), Georgia, serif" }}
            />
            {inputVal && (
              <button
                onClick={clearSearch}
                className="shrink-0 rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-150"
                style={{ background: "var(--surface-alt)", color: "var(--text-3)" }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Category pills ── */}
      {!isSearch && categories.length > 0 && (
        <div
          className="sticky top-16 z-20"
          style={{
            background: "var(--white)",
            borderBottom: "1px solid rgba(77,124,31,0.06)",
            boxShadow: "0 2px 10px rgba(28,58,26,0.05)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-wrap items-center gap-1.5 py-2">
              <Pill active={activeSlug === null} onClick={() => selectCategory(null)}>الكل</Pill>
              {categories.map((cat) => (
                <Pill key={cat.id} active={activeSlug === cat.slug} onClick={() => selectCategory(cat.slug)}>
                  {cat.name_ar}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Products grid ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {SKELETON.map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl mb-4" style={{ background: "var(--surface-card)" }} />
                <div className="h-3 rounded-sm mb-2 w-3/4" style={{ background: "var(--surface-card)" }} />
                <div className="h-3 rounded-sm w-1/2" style={{ background: "var(--surface-card)" }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title={isSearch ? `لا توجد نتائج لـ "${query.trim()}"` : "لا توجد منتجات في هذه الفئة"}
            actionLabel={isSearch ? "عرض جميع المنتجات" : undefined}
            onAction={isSearch ? clearSearch : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200 whitespace-nowrap"
      style={{
        background: active ? "var(--forest-bg)" : "transparent",
        color:      active ? "#fff" : "var(--text-2)",
        border:     `1px solid ${active ? "var(--forest-bg)" : "var(--border-mid)"}`,
        fontFamily: "var(--font-display), Georgia, serif",
        lineHeight: "1.5",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--forest-mid)";
          el.style.color = "var(--forest-mid)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-mid)";
          el.style.color = "var(--text-2)";
        }
      }}
    >
      {children}
    </button>
  );
}
