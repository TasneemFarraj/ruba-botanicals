"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, getCategories, getProductById } from "@/app/_lib/supabase";
import type { Product, Category } from "@/app/_types";
import ProductCard from "@/app/_components/ProductCard";
import ProductPanel from "@/app/_components/ProductPanel";

const SKELETON = Array.from({ length: 8 });

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products,     setProducts]     = useState<Product[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [activeSlug,   setActiveSlug]   = useState<string | null>(null);
  const [panelProduct, setPanelProduct] = useState<Product | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const cat  = searchParams.get("cat");
    const open = searchParams.get("open");
    if (cat) setActiveSlug(cat);
    if (open) getProductById(open).then((p) => { if (p) setPanelProduct(p); });
  }, [searchParams]);

  useEffect(() => { getCategories().then(setCategories); }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(activeSlug ?? undefined).then((data) => { setProducts(data); setLoading(false); });
  }, [activeSlug]);

  return (
    <main dir="rtl" style={{ background: "var(--white)", minHeight: "100vh" }}>

      {/* ── Page header ── */}
      <div className="pt-10 pb-2 px-6 md:px-10 max-w-7xl mx-auto">
        <h1 className="font-display text-2xl" style={{ color: "var(--text-dark)" }}>
          المنتجات
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">

        {/* ── Category tabs ── */}
        {categories.length > 0 && (
          <div
            className="mb-12 overflow-x-auto"
            style={{ borderBottom: "1px solid var(--border)", scrollbarWidth: "none" } as React.CSSProperties}
          >
            <div className="flex w-max">
              <PageTab active={activeSlug === null} onClick={() => setActiveSlug(null)}>
                الكل
              </PageTab>
              {categories.map((cat) => (
                <PageTab
                  key={cat.id}
                  active={activeSlug === cat.slug}
                  onClick={() => setActiveSlug(activeSlug === cat.slug ? null : cat.slug)}
                >
                  {cat.name_ar}
                </PageTab>
              ))}
            </div>
          </div>
        )}

        {/* Product count */}
        {!loading && products.length > 0 && (
          <p className="text-[11px] mb-8 tracking-wide" style={{ color: "var(--text-light)" }}>
            {products.length} منتج
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {SKELETON.map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl mb-4" style={{ background: "var(--cream-card)" }} />
                <div className="h-3 rounded-sm mb-2 w-3/4" style={{ background: "var(--cream-card)" }} />
                <div className="h-3 rounded-sm w-1/2"       style={{ background: "var(--cream-card)" }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-28" style={{ color: "var(--text-light)" }}>
            <p className="text-sm">لا توجد منتجات في هذه الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onOpenPanel={setPanelProduct} />
            ))}
          </div>
        )}

      </div>

      <ProductPanel product={panelProduct} onClose={() => setPanelProduct(null)} />
    </main>
  );
}

function PageTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors duration-200"
      style={{
        color:        active ? "var(--forest)"   : "var(--text-muted)",
        borderBottom: active ? "2px solid var(--forest-mid)" : "2px solid transparent",
        marginBottom: -1,
        background:   "transparent",
      }}
    >
      {children}
    </button>
  );
}
