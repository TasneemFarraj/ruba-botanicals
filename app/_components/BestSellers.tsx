"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getBestSellers } from "../_lib/supabase";
import type { Product } from "../_types";
import { useCart } from "./CartProvider";
import { ui } from "../_lib/translations";
import ProductPanel from "./ProductPanel";

gsap.registerPlugin(ScrollTrigger);

const t = ui.bestSellers;
const SKELETON = Array.from({ length: 4 });
const PER_PAGE = 4;

export default function BestSellers() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [panelProduct, setPanelProduct] = useState<Product | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [active,       setActive]       = useState(0);
  const pausedRef  = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const arrowRef   = useRef<HTMLSpanElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    getBestSellers().then((data) => { setProducts(data); setLoading(false); });
  }, []);

  const totalPages = Math.ceil(products.length / PER_PAGE);

  const goTo = useCallback((idx: number) => setActive(idx), []);

  /* auto-play */
  useEffect(() => {
    if (totalPages <= 1) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setActive((p) => (p + 1) % totalPages);
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [totalPages]);

  /* scroll entrance */
  useEffect(() => {
    if (loading || products.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(".bs-header", {
        y: 16, opacity: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 82%", toggleActions: "play none none none" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, products]);

  /* card entrance on page change */
  useEffect(() => {
    gsap.fromTo(".bs-card",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: "power2.out" }
    );
  }, [active]);

  const onViewAllEnter = () => gsap.to(arrowRef.current, { x: -5, duration: 0.28, ease: "power2.out" });
  const onViewAllLeave = () => gsap.to(arrowRef.current, { x: 0,  duration: 0.28, ease: "power2.out" });

  const currentPage = products.slice(active * PER_PAGE, active * PER_PAGE + PER_PAGE);

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      style={{ background: "var(--white)", borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

          {/* ── Text column ── */}
          <div className="bs-header md:w-52 shrink-0 md:pt-2">
            {/* Badge */}
            <span
              className="inline-block mb-4 text-[11px] font-semibold tracking-widest uppercase"
              style={{ color: "var(--gold)" }}
            >
              {t.badge}
            </span>
            {/* Main heading */}
            <h2 className="font-display leading-tight mb-2" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--text-dark)" }}>
              {t.heading1}<br />{t.heading2}
            </h2>
            {/* Sub label */}
            <p className="text-[12px] mb-6" style={{ color: "var(--text-light)", letterSpacing: "0.04em" }}>
              {(t as any).subBadge}
            </p>
            {/* Description */}
            <p className="text-[14px] leading-loose mb-8" style={{ color: "var(--text-muted)", fontFamily: "var(--font-naskh)" }}>
              {t.desc}
            </p>
            {/* Link */}
            <a
              href="/products"
              className="group/link inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--forest-mid)" }}
              onMouseEnter={onViewAllEnter}
              onMouseLeave={onViewAllLeave}
            >
              {t.viewAll}
              <span ref={arrowRef} aria-hidden style={{ display: "inline-block" }}>←</span>
            </a>
          </div>

          {/* ── Carousel ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {SKELETON.map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-3">
                    <div className="rounded-2xl" style={{ aspectRatio: "3/4", background: "var(--cream-card)" }} />
                    <div className="h-3 rounded-sm w-3/4 mx-auto" style={{ background: "var(--cream-card)" }} />
                    <div className="h-2.5 rounded-sm w-1/2 mx-auto" style={{ background: "var(--cream-card)" }} />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-16" style={{ color: "var(--text-light)" }}>
                <p className="text-sm">{t.empty}</p>
              </div>
            ) : (
              <div className="relative">
                {/* Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-6">
                  {currentPage.map((p) => (
                    <div
                      key={p.id}
                      className="bs-card group flex flex-col cursor-pointer"
                      onClick={() => setPanelProduct(p)}
                    >
                      {/* Image */}
                      <div
                        className="relative w-full rounded-2xl overflow-hidden mb-3"
                        style={{ aspectRatio: "3/4", background: "var(--cream-card)" }}
                      >
                        {/* Badge — glass */}
                        <span
                          className="absolute top-2.5 start-2.5 z-10 text-[9px] font-medium px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(255,255,255,0.55)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.7)",
                            color: "#1c3a1a",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {t.badge}
                        </span>

                        {p.image_url && (
                          <Image src={p.image_url} alt={p.name_ar} fill
                            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        )}
                        {p.image_no_bg_url && (
                          <Image src={p.image_no_bg_url} alt={p.name_ar} fill
                            className="object-contain opacity-0 group-hover:opacity-100 group-hover:scale-105"
                            style={{ padding: "clamp(0.75rem,3%,1.25rem)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        )}
                        {!p.image_url && !p.image_no_bg_url && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.25 }}>
                            <svg viewBox="0 0 64 80" fill="none" className="w-14 h-18">
                              <path d="M32 72 C32 72 30 50 32 28" stroke="#2d5a0e" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="#2d5a0e"/>
                              <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="#2d5a0e"/>
                              <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="#2d5a0e"/>
                              <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="#2d5a0e"/>
                              <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="#2d5a0e"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-display text-[15px] leading-snug mb-0.5 truncate text-center px-1" style={{ color: "var(--text-dark)" }}>
                        {p.name_ar}
                      </h3>
                      {p.unit && (
                        <p className="text-[12px] text-center mb-2" style={{ color: "var(--text-light)" }}>{p.unit}</p>
                      )}

                      {/* Price + button — same row, swapped */}
                      <div className="flex items-center justify-between px-1 mt-auto">
                        <span className="text-[14px] font-semibold" style={{ color: "#1c3a1a" }}>
                          {p.price} <span className="text-[11px] font-normal" style={{ color: "#8aaa80" }}>د.أ</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({ id: p.id, name_ar: p.name_ar, price: p.price, image_url: p.image_no_bg_url ?? p.image_url });
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                          style={{ border: "1px solid rgba(28,58,26,0.15)", background: "transparent", color: "#1c3a1a" }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#1c3a1a"; el.style.color = "#fff"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#1c3a1a"; }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M5 1v8M1 5h8"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 pt-4" dir="ltr">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`صفحة ${i + 1}`}
                      style={{
                        width: i === active ? 20 : 6,
                        height: 6,
                        borderRadius: 99,
                        background: i === active ? "var(--gold)" : "var(--border)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        transition: "width 0.4s ease, background 0.4s ease",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      <ProductPanel product={panelProduct} onClose={() => setPanelProduct(null)} />
    </section>
  );
}
