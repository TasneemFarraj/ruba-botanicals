"use client";

import { useEffect, useState } from "react";
import { getCategories, getProducts } from "../_lib/supabase";
import type { Category, Product } from "../_types";
import ProductCard from "./ProductCard";
import ProductPanel from "./ProductPanel";
import { ui } from "../_lib/translations";

const t = ui.categories;
const ALL = "__all__";
const CARD_BG = ["#fafaf8", "#f8f9f7", "#f9f8f6", "#f7f9f8", "#f9f7f8"];

export default function Categories() {
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [activeSlug,   setActiveSlug]   = useState<string>(ALL);
  const [panelProduct, setPanelProduct] = useState<Product | null>(null);
  const [loadingCats,  setLoadingCats]  = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getProducts()]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setLoadingCats(false);
      setLoadingProds(false);
    });
  }, []);

  const handleTab = async (slug: string) => {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    setLoadingProds(true);
    const data = slug === ALL ? await getProducts() : await getProducts(slug);
    setProducts(data);
    setLoadingProds(false);
  };

  return (
    <section className="py-20" style={{ background: "var(--white)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="mb-10">
          <span className="block text-[11px] font-semibold tracking-[0.22em] uppercase mb-3" style={{ color: "var(--gold)" }}>
            Collection
          </span>
          <h2 className="font-display leading-tight" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "var(--text-dark)" }}>
            {t.heading}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed" style={{ fontFamily: "var(--font-naskh)", color: "var(--text-muted)" }}>
            {t.subheading}
          </p>
        </div>

        {/* Tabs */}
        <div
          className="mb-10 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--border)", scrollbarWidth: "none" } as React.CSSProperties}
        >
          <div className="flex w-max">
            <Tab active={activeSlug === ALL} onClick={() => handleTab(ALL)}>
              {t.all}
            </Tab>
            {loadingCats
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse mx-3 mb-3 rounded h-4" style={{ width: 48 + i * 14, background: "var(--cream-card)" }} />
                ))
              : categories.map((cat) => (
                  <Tab key={cat.id} active={activeSlug === cat.slug} onClick={() => handleTab(cat.slug)}>
                    {cat.name_ar}
                  </Tab>
                ))
            }
          </div>
        </div>

        {/* Product count */}
        {!loadingProds && products.length > 0 && (
          <p className="text-[11px] mb-6" style={{ color: "var(--text-light)" }}>
            {products.length} منتج
          </p>
        )}

        {/* Products grid */}
        {loadingProds ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-lg mb-3" style={{ aspectRatio: "1/1", background: "var(--cream-card)" }} />
                <div className="h-3 rounded-sm mb-2 w-3/4" style={{ background: "var(--cream-card)" }} />
                <div className="h-3 rounded-sm w-1/2"       style={{ background: "var(--cream-card)" }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" style={{ color: "var(--text-light)" }}>
            <p className="text-sm">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} onOpenPanel={setPanelProduct} bgColor={CARD_BG[i % CARD_BG.length]} />
            ))}
          </div>
        )}

      </div>
      <ProductPanel product={panelProduct} onClose={() => setPanelProduct(null)} />
    </section>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
