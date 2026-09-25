"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getBestSellers } from "../_lib/supabase";
import type { Product } from "../_types";
import { useCart } from "./CartProvider";
import { ui } from "../_lib/translations";
import EmptyState from "./shared/EmptyState";
import DotPaginator from "./shared/DotPaginator";

gsap.registerPlugin(ScrollTrigger);

const t = ui.bestSellers;
const SKELETON = Array.from({ length: 4 });
const PER_PAGE = 4;

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const pausedRef  = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const arrowRef   = useRef<HTMLSpanElement>(null);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    getBestSellers().then((data) => { setProducts(data); setLoading(false); });
  }, []);

  const totalPages = Math.ceil(products.length / PER_PAGE);

  const goTo = useCallback((idx: number) => setActive(idx), []);

  useEffect(() => {
    if (totalPages <= 1) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setActive((p) => (p + 1) % totalPages);
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [totalPages]);

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

  useEffect(() => {
    gsap.fromTo(".bs-card",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: "power2.out" }
    );
  }, [active]);

  const onViewAllEnter = () => gsap.to(arrowRef.current, { x: -5, duration: 0.28, ease: "power2.out" });
  const onViewAllLeave = () => gsap.to(arrowRef.current, { x: 0, duration: 0.28, ease: "power2.out" });

  const currentPage = products.slice(active * PER_PAGE, active * PER_PAGE + PER_PAGE);

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      style={{ background: "var(--white)", borderTop: "1px solid var(--border)" }}
    >
      <div
        className="max-w-7xl mx-auto px-6 md:px-10"
        style={{ paddingTop: "var(--section-py)", paddingBottom: "var(--section-py)" }}
      >
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

          {/* ── Text column ── */}
          <div className="bs-header md:w-52 shrink-0 md:pt-2">
            <span
              className="eyebrow"
              style={{ display: "block", marginBottom: "0.75rem" }}
            >
              {t.badge}
            </span>
            <h2 className="font-display section-title mb-2">
              {t.heading1}<br />{t.heading2}
            </h2>
            <p
              className="mb-6"
              style={{ fontSize: "var(--fs-xs)", color: "var(--text-light)", letterSpacing: "0.04em" }}
            >
              {(t as any).subBadge}
            </p>
            <p
              className="mb-8"
              style={{ fontSize: "var(--fs-base)", lineHeight: 1.85, color: "var(--text-muted)" }}
            >
              {t.desc}
            </p>
            <a
              href="/products"
              className="font-display inline-flex items-center gap-1.5"
              style={{ fontSize: "var(--fs-card)", color: "var(--forest-mid)" }}
              onMouseEnter={onViewAllEnter}
              onMouseLeave={onViewAllLeave}
            >
              {t.viewAll}
              <span ref={arrowRef} aria-hidden style={{ display: "inline-block" }}>›</span>
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
              <EmptyState title={t.empty} />
            ) : (
              <div className="relative">
                {/* Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-6">
                  {currentPage.map((p) => (
                    <div
                      key={p.id}
                      className="bs-card group flex flex-col cursor-pointer"
                      onClick={() => router.push(`/products/${p.id}`)}
                    >
                      {/* Image */}
                      <div
                        className="relative w-full rounded-2xl overflow-hidden mb-3"
                        style={{ aspectRatio: "3/4", background: "var(--cream-card)" }}
                      >
                        <span
                          className="absolute top-2.5 start-2.5 z-10"
                          style={{
                            background: "rgba(255,255,255,0.55)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.7)",
                            color: "var(--forest)",
                            fontSize: "var(--fs-eyebrow)",
                            letterSpacing: "0.02em",
                            padding: "3px 10px",
                            borderRadius: 999,
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
                      <h3
                        className="font-display leading-snug mb-0.5 truncate text-center px-1"
                        style={{ fontSize: "var(--fs-card)", color: "var(--text-dark)" }}
                      >
                        {p.name_ar}
                      </h3>
                      {p.unit && (
                        <p className="text-center mb-2" style={{ fontSize: "var(--fs-xs)", color: "var(--text-light)" }}>
                          {p.unit}
                        </p>
                      )}

                      {/* Price + quick-add */}
                      <div className="flex items-center justify-between px-1 mt-auto">
                        <span style={{ fontSize: "var(--fs-base)", fontWeight: 600, color: "var(--forest)" }}>
                          {p.price}{" "}
                          <span style={{ fontSize: "var(--fs-xs)", fontWeight: 400, color: "var(--text-light)" }}>د.أ</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({ id: p.id, name_ar: p.name_ar, price: p.price, image_url: p.image_no_bg_url ?? p.image_url });
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                          style={{ border: "1px solid var(--border-mid)", background: "transparent", color: "var(--text-muted)" }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--forest)"; el.style.color = "#fff"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-muted)"; }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M5 1v8M1 5h8"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination dots */}
                <DotPaginator total={totalPages} active={active} onSelect={goTo} />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
