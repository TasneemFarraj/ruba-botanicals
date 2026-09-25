"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { getProductById, getCategoryById, getRelatedProducts } from "@/app/_lib/supabase";
import { useCart } from "@/app/_components/CartProvider";
import { fmtPrice } from "@/app/_lib/utils";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import ProductCard from "@/app/_components/ProductCard";
import EmptyState from "@/app/_components/shared/EmptyState";
import type { Product, Category } from "@/app/_types";

const USAGE_STEPS = [
  { title: "بلّلي الشعر", desc: "بلّلي الشعر وفروة الرأس بالكامل بماء فاتر، لا ساخن." },
  { title: "خذي الكمية المناسبة", desc: "ضعي كمية بحجم حبة البندق في راحة يدك، وضاعفيها للشعر الطويل أو الكثيف." },
  { title: "وزّعي على الفروة", desc: "وزّعي على فروة الرأس مباشرةً وليس على أطراف الشعر." },
  { title: "دلّكي بلطف", desc: "دلّكي بأطراف الأصابع بحركات دائرية لمدة 2–3 دقائق دون استخدام الأظافر." },
  { title: "اتركيه يعمل", desc: "اتركيه على الشعر دقيقتين ليمتص الفروة المكوّنات." },
  { title: "اشطفي جيداً", desc: "اشطفي بالماء حتى يزول تماماً، وكرّري الخطوات عند الحاجة." },
];

const WARNINGS = [
  "للاستخدام الخارجي فقط. تجنّبي ملامسة العينين والأغشية المخاطية.",
  "في حال حدوث تهيّج أو احمرار، توقّفي عن الاستخدام فوراً واستشيري الطبيب.",
  "يُحفظ بعيداً عن متناول الأطفال.",
  "للحوامل والمرضعات: يُنصح باستشارة الطبيب قبل الاستخدام.",
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    getProductById(id).then(async (p) => {
      setProduct(p);
      if (p) {
        const [cat, rel] = await Promise.all([
          getCategoryById(p.category_id),
          getRelatedProducts(p.category_id, p.id),
        ]);
        setCategory(cat);
        setRelated(rel);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name_ar: product.name_ar,
        price: product.price,
        image_url: product.image_no_bg_url ?? product.image_url,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const imgSrc = product?.image_no_bg_url ?? product?.image_url;

  return (
    <>
      <Navbar />
      <main dir="rtl" style={{ background: "var(--white)", minHeight: "100vh", paddingBottom: 60 }}>
        {loading ? (
          <LoadingSkeleton />
        ) : !product ? (
          <NotFound onBack={() => router.push("/products")} />
        ) : (
          <>
            {/* ══════════════════════════════════════════
                Hero
            ══════════════════════════════════════════ */}
            <section className="max-w-[1240px] mx-auto px-6 md:px-10 pt-8 pb-4">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 mb-10 text-[13px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-display), Georgia, serif" }}>
                <Link href="/" className="hover:opacity-60 transition-opacity">الرئيسية</Link>
                <ChevronSep />
                <Link href="/products" className="hover:opacity-60 transition-opacity">المتجر</Link>
                {category && (<><ChevronSep /><Link href={`/products?cat=${category.slug}`} className="hover:opacity-60 transition-opacity">{category.name_ar}</Link></>)}
                <ChevronSep />
                <span style={{ color: "var(--text-2)" }}>{product.name_ar}</span>
              </nav>

              {/* ── Product name — full width, takes centre stage ── */}
              <div className="mb-2">
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  {product.is_best_seller && <span className="badge badge-bestseller">الأكثر مبيعاً</span>}
                  {product.name_en && (
                    <span className="text-[11px] tracking-widest uppercase" style={{ color: "var(--text-3)", fontFamily: "var(--font-display), Georgia, serif" }}>
                      {product.name_en}
                    </span>
                  )}
                </div>
                <h1
                  className="font-display leading-[1.25]"
                  style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)", color: "var(--text-1)" }}
                >
                  {product.name_ar}
                </h1>
              </div>

              <div style={{ margin: "20px 0 32px" }} />

              {/* ── 2 columns: image | description + purchase ── */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

                {/* Image — RIGHT in RTL */}
                <div className="shrink-0 order-1 mx-auto md:mx-0 md:w-[30%]" style={{ width: "min(100%, 280px)" }}>
                  <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={product.name_ar}
                        fill
                        priority
                        className="object-contain"
                        style={{ filter: "drop-shadow(0 12px 40px rgba(28,58,26,0.14))" }}
                        sizes="(max-width: 768px) 100vw, 34vw"
                      />
                    ) : (
                      <PlaceholderBranch />
                    )}
                  </div>
                </div>

                {/* Description + purchase — LEFT in RTL, dominant */}
                <div className="flex-1 min-w-0 order-2 flex flex-col">

                  {/* Description */}
                  {product.description_ar && (
                    <div className="mb-10">
                      <p className="text-[10px] tracking-[0.14em] uppercase mb-4" style={{ color: "var(--text-3)" }}>
                        شرح المنتج
                      </p>
                      <p className="leading-[2.2]" style={{ fontSize: "clamp(14px, 1.4vw, 16px)", color: "var(--text-2)" }}>
                        {product.description_ar}
                      </p>
                    </div>
                  )}

                  {/* Price + CTA — one row, price RIGHT · buttons LEFT */}
                  <div ref={ctaRef} className="flex items-center justify-between gap-4 flex-wrap">

                    {/* RIGHT: price + unit + total when qty>1 */}
                    <div className="flex items-baseline gap-2 shrink-0 flex-wrap min-w-0">
                      <span className="font-display" style={{ fontSize: "clamp(1.4rem, 2vw, 1.8rem)", color: "var(--gold)" }}>
                        {fmtPrice(product.price)}
                      </span>
                      {product.unit && (
                        <span className="text-[11px] tracking-widest" style={{ color: "var(--text-3)" }}>· {product.unit}</span>
                      )}
                      {qty > 1 && (
                        <span className="text-[11px]" style={{ color: "var(--text-3)" }}>
                          = <span className="font-semibold tabular-nums" style={{ color: "var(--gold)" }}>{fmtPrice(product.price * qty)}</span>
                        </span>
                      )}
                    </div>

                    {/* LEFT: qty + button only */}
                    {product.in_stock ? (
                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Qty pill */}
                        <div className="flex items-center" style={{ border: "1px solid var(--border-mid)", borderRadius: 999, overflow: "hidden", height: 36 }}>
                          <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))} dim={qty === 1} size={36}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 10, height: 10 }}><path d="M5 12h14" /></svg>
                          </QtyBtn>
                          <span className="text-[13px] tabular-nums flex items-center justify-center" style={{ width: 30, height: 36, borderInline: "1px solid var(--border)", color: "var(--text-1)" }}>
                            {qty}
                          </span>
                          <QtyBtn onClick={() => setQty((q) => q + 1)} size={36}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 10, height: 10 }}><path d="M12 5v14M5 12h14" /></svg>
                          </QtyBtn>
                        </div>

                        {/* Button */}
                        <button
                          onClick={handleAddToCart}
                          className="flex items-center justify-center gap-1.5 text-[12px] font-medium tracking-[0.05em] transition-all duration-200 active:scale-[0.98]"
                          style={{ background: added ? "var(--forest-mid)" : "var(--forest)", color: "#fff", height: 36, borderRadius: 999, paddingInline: 18 }}
                          onMouseEnter={(e) => { if (!added) (e.currentTarget as HTMLElement).style.opacity = "0.84"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                        >
                          {added ? (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 10, height: 10 }}><path d="M20 6 9 17l-5-5" /></svg>تمت الإضافة</>
                          ) : (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>أضيفي للسلة</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="py-2 px-4 text-[11px] tracking-wide" style={{ borderRadius: 999, background: "var(--surface-card)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                        غير متوفر حالياً
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ── Scroll hint ── */}
              <button
                onClick={() => document.getElementById("details")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full flex flex-col items-center gap-1.5 pt-8 pb-2 transition-opacity hover:opacity-50"
                style={{ color: "var(--text-3)" }}
              >
                <span className="text-[11px] tracking-wide">
                  نزّلي لتشوفي طريقة الاستخدام وتفاصيل المنتج
                </span>
                <svg
                  className="animate-bounce"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18 }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

            </section>

            {/* ══════════════════════════════════════════
                Details — usage steps + info
            ══════════════════════════════════════════ */}
            <section id="details" style={{ background: "var(--white)" }}>
              <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 md:py-16">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-start">

                  {/* Right (RTL): usage steps */}
                  <div className="flex-1 min-w-0">

                    {/* Section label */}
                    <p className="text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
                      طريقة الاستخدام
                    </p>
                    <div className="flex items-center gap-3 mb-10">
                      <h2 className="font-display" style={{ fontSize: "clamp(1.3rem, 2vw, 1.6rem)", color: "var(--text-1)" }}>
                        كيف تستخدمينه
                      </h2>
                      <span
                        className="text-[10px] px-2.5 py-0.5 rounded-full"
                        style={{ background: "var(--gold-pale)", color: "var(--gold)", fontFamily: "var(--font-display), Georgia, serif" }}
                      >
                        2–3 مرات أسبوعياً
                      </span>
                    </div>

                    {/* Timeline steps */}
                    <div className="relative">
                      {/* Vertical connecting line */}
                      <div
                        className="absolute"
                        style={{
                          right: 11,
                          top: 24,
                          bottom: 24,
                          width: 1,
                          background: "var(--border)",
                        }}
                      />

                      <div className="space-y-5">
                        {USAGE_STEPS.map((step, i) => (
                          <div key={i} className="flex gap-4 items-start relative">
                            <div
                              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium relative z-10"
                              style={{
                                border: "1.5px solid var(--border-str)",
                                background: "var(--white)",
                                color: "var(--text-3)",
                                fontFamily: "var(--font-display), Georgia, serif",
                              }}
                            >
                              {i + 1}
                            </div>
                            <div className="pb-1">
                              <p className="font-semibold text-[15px] mb-1 leading-snug" style={{ color: "var(--text-1)" }}>
                                {step.title}
                              </p>
                              <p className="text-[14px] leading-[1.8]" style={{ color: "var(--text-2)" }}>
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="mt-10 flex gap-3 items-start">
                      <div
                        className="shrink-0 mt-0.5 text-[11px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded"
                        style={{ background: "var(--gold-pale)", color: "var(--gold)" }}
                      >
                        نصيحة
                      </div>
                      <p className="text-[13px] leading-[1.9]" style={{ color: "var(--text-2)" }}>
                        الرغوة التي تنزل أثناء الشطف تكفي لتنظيف أطراف الشعر، فلا داعي لفركها.
                      </p>
                    </div>
                  </div>

                  {/* Left (RTL): storage + warnings — flat, minimal */}
                  <div className="w-full lg:w-[300px] shrink-0">

                    {/* Storage + Shelf life */}
                    <p className="text-[11px] tracking-[0.12em] uppercase mb-5" style={{ color: "var(--text-3)" }}>
                      معلومات المنتج
                    </p>

                    <div className="space-y-0" style={{ borderTop: "1px solid var(--border)" }}>
                      {[
                        { label: "التخزين", value: "مكان بارد وجاف، بعيداً عن أشعة الشمس، أقل من 25°م." },
                        { label: "الصلاحية", value: "12 شهراً من الفتح مع إغلاق العبوة جيداً." },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="py-4 flex gap-4"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <span className="text-[14px] font-semibold shrink-0 w-16" style={{ color: "var(--text-1)" }}>
                            {item.label}
                          </span>
                          <span className="text-[14px] leading-[1.8]" style={{ color: "var(--text-2)" }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Warnings */}
                    <p className="text-[11px] tracking-[0.12em] uppercase mt-8 mb-4" style={{ color: "var(--text-3)" }}>
                      تحذيرات
                    </p>
                    <ul className="space-y-3.5">
                      {WARNINGS.map((w, i) => (
                        <li key={i} className="flex gap-3 items-start text-[14px] leading-[1.85]" style={{ color: "var(--text-2)" }}>
                          <span
                            className="shrink-0 mt-[7px] w-1 h-1 rounded-full"
                            style={{ background: "var(--text-3)" }}
                          />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════
                Related products
            ══════════════════════════════════════════ */}
            {related.length > 0 && (
              <section style={{ background: "var(--white)" }}>
                <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-16 md:py-24">
                  <div className="flex items-end justify-between mb-10">
                    <div>
                      <span className="eyebrow">من نفس الفئة</span>
                      <h2
                        className="font-display"
                        style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", color: "var(--forest-mid)" }}
                      >
                        منتجات مشابهة
                      </h2>
                    </div>
                    {category && (
                      <Link
                        href={`/products?cat=${category.slug}`}
                        className="font-display hidden md:inline-flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-60"
                        style={{ color: "var(--forest-mid)" }}
                      >
                        عرض الكل
                        <span aria-hidden="true" style={{ fontSize: 14 }}>›</span>
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
                    {related.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Sticky bottom bar — appears when CTA scrolls out of view ── */}
        {product && (
          <div
            dir="rtl"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              background: "var(--white)",
              borderTop: "1px solid var(--border)",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.07)",
              transform: stickyVisible ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div className="max-w-[1240px] mx-auto px-5 md:px-10 py-2.5 flex items-center gap-3">
              <p className="flex-1 min-w-0 text-[12px] truncate" style={{ color: "var(--text-2)" }}>
                {product.name_ar}
              </p>
              <span className="font-display shrink-0 text-[14px]" style={{ color: "var(--gold)" }}>
                {fmtPrice(product.price)}
              </span>
              {qty > 1 && (
                <span className="text-[11px] shrink-0" style={{ color: "var(--text-3)" }}>
                  = <span className="font-semibold tabular-nums" style={{ color: "var(--gold)" }}>{fmtPrice(product.price * qty)}</span>
                </span>
              )}

              {/* Qty pill — sticky */}
              <div className="shrink-0 flex items-center" style={{ border: "1px solid var(--border-mid)", borderRadius: 999, overflow: "hidden", height: 32 }}>
                <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))} dim={qty === 1} size={32}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 9, height: 9 }}><path d="M5 12h14" /></svg>
                </QtyBtn>
                <span className="text-[12px] tabular-nums flex items-center justify-center" style={{ width: 26, height: 32, borderInline: "1px solid var(--border)", color: "var(--text-1)" }}>
                  {qty}
                </span>
                <QtyBtn onClick={() => setQty((q) => q + 1)} size={32}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 9, height: 9 }}><path d="M12 5v14M5 12h14" /></svg>
                </QtyBtn>
              </div>

              {/* Add to cart — sticky */}
              <button
                onClick={handleAddToCart}
                className="shrink-0 flex items-center gap-1.5 text-[11.5px] font-medium tracking-wide transition-opacity active:scale-[0.97]"
                style={{
                  background: added ? "var(--forest-mid)" : "var(--forest)",
                  color: "#fff",
                  height: 32,
                  borderRadius: 999,
                  paddingInline: 14,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.84"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                {added ? "تمت الإضافة ✓" : "أضيفي للسلة"}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

/* ─── Small helpers ──────────────────────────────────────────────────────── */

function QtyBtn({
  onClick,
  dim = false,
  size = 44,
  children,
}: {
  onClick: () => void;
  dim?: boolean;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: size, color: dim ? "var(--text-3)" : "var(--text-1)", flexShrink: 0 }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--forest)"; el.style.color = "#fff"; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = dim ? "var(--text-3)" : "var(--text-1)"; }}
    >
      {children}
    </button>
  );
}


function ChevronSep() {
  return <span style={{ opacity: 0.4, fontSize: 10 }}>/</span>;
}

function PlaceholderBranch() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.1 }}>
      <svg viewBox="0 0 64 80" fill="none" className="w-28 h-36" aria-hidden="true">
        <path d="M32 72 C32 72 30 50 32 28" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="var(--forest)" />
        <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="var(--forest)" />
        <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="var(--forest)" />
        <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="var(--forest)" />
        <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="var(--forest)" />
      </svg>
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-8 pb-20">
      <div className="flex gap-2 mb-8 animate-pulse">
        {[80, 60, 80, 140].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className="w-1 h-1 rounded-full" style={{ background: "var(--border-mid)" }} />}
            <div className="h-2.5 rounded" style={{ width: w, background: "var(--surface-card)" }} />
          </div>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-10 animate-pulse">
        <div
          className="w-full lg:w-[44%] shrink-0 rounded-2xl"
          style={{ aspectRatio: "1/1", background: "var(--surface-card)" }}
        />
        <div className="flex-1 pt-2 flex flex-col gap-5">
          <div className="h-3 rounded w-2/5" style={{ background: "var(--surface-card)" }} />
          <div className="h-10 rounded w-3/4" style={{ background: "var(--surface-card)" }} />
          <div className="space-y-2">
            <div className="h-3 rounded" style={{ background: "var(--surface-card)" }} />
            <div className="h-3 rounded w-5/6" style={{ background: "var(--surface-card)" }} />
          </div>
        </div>
        <div
          className="hidden lg:block w-[260px] shrink-0 rounded-2xl"
          style={{ height: 220, background: "var(--surface-card)" }}
        />
      </div>
    </div>
  );
}

/* ─── Not found ──────────────────────────────────────────────────────────── */

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <EmptyState title="المنتج غير موجود" actionLabel="العودة للمنتجات" onAction={onBack} />
  );
}
