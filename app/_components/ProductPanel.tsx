"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { X, ShoppingBag } from "lucide-react";
import type { Product } from "../_types";
import { useCart } from "./CartProvider";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function ProductPanel({ product, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const isOpen = product !== null;

  useEffect(() => {
    if (!cardRef.current || !backdropRef.current) return;
    if (isOpen) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" });
      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.95, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.36, ease: "power3.out" }
      );
      setQty(1);
    } else {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(cardRef.current, { opacity: 0, scale: 0.97, y: 8, duration: 0.2, ease: "power2.in" });
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
    onClose();
  };

  const imgSrc = product?.image_no_bg_url ?? product?.image_url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(12,20,10,0.5)", backdropFilter: "blur(8px)", opacity: 0 }}
      />

      {/* Card */}
      <div
        ref={cardRef}
        dir="rtl"
        className="relative w-full flex flex-col sm:flex-row rounded-2xl overflow-hidden"
        style={{
          maxWidth: 660,
          maxHeight: "90vh",
          background: "var(--white)",
          boxShadow: "0 24px 72px rgba(10,18,8,0.2), 0 0 0 1px rgba(77,124,31,0.07)",
          opacity: 0,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-20 w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-50"
          style={{ color: "var(--text-2)" }}
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* ── Image panel ── */}
        <div
          className="relative sm:w-[42%] h-60 sm:h-auto shrink-0 flex items-center justify-center"
          style={{ background: "var(--surface-card)" }}
        >
          {imgSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={imgSrc}
                alt={product?.name_ar ?? ""}
                fill
                className="object-contain p-10 sm:p-12"
                style={{ filter: "drop-shadow(0 6px 22px rgba(28,58,26,0.13))" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full" style={{ opacity: 0.12 }}>
              <svg viewBox="0 0 64 80" fill="none" className="w-20 h-24" aria-hidden="true">
                <path d="M32 72 C32 72 30 50 32 28" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="var(--text-3)"/>
                <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="var(--text-3)"/>
                <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="var(--text-3)"/>
                <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="var(--text-3)"/>
                <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="var(--text-3)"/>
              </svg>
            </div>
          )}
        </div>

        {/* ── Content panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 pt-7 pb-4">

            {/* Bestseller badge */}
            {product?.is_best_seller && (
              <span className="inline-flex items-center mb-3" style={{
                background: "var(--forest-pale)",
                color: "var(--forest-mid)",
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: "0.07em",
                padding: "3px 10px",
                borderRadius: 999,
              }}>
                الأكثر مبيعاً
              </span>
            )}

            {/* Name */}
            <h2 className="font-display leading-snug mb-1" style={{ fontSize: 22, color: "var(--text-1)" }}>
              {product?.name_ar}
            </h2>

            {product?.unit && (
              <p className="text-[11px] mb-4 tracking-wide" style={{ color: "var(--text-3)" }}>
                {product.unit}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-5">
              <span className="font-display text-[22px]" style={{ color: "var(--gold)" }}>
                {product?.price}
              </span>
              <span className="text-[12px]" style={{ color: "var(--text-2)" }}>د.أ</span>
            </div>

            {/* Divider */}
            <div className="mb-5" style={{
              height: 1,
              background: "linear-gradient(to left, transparent, var(--border) 20%, var(--border) 80%, transparent)",
            }} />

            {/* Description */}
            {product?.description_ar && (
              <p className="text-[14.5px] leading-[1.9] mb-5" style={{ color: "var(--text-2)" }}>
                {product.description_ar}
              </p>
            )}

            {/* Qty */}
            <div className="flex items-center gap-3">
              <span className="text-[11px]" style={{ color: "var(--text-3)" }}>الكمية</span>
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full"
                style={{ border: "1px solid var(--border)" }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-4 h-4 flex items-center justify-center rounded-full transition-all duration-150"
                  style={{ color: qty === 1 ? "var(--text-3)" : "var(--text-2)" }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--forest)"; el.style.color = "#fff"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = qty === 1 ? "var(--text-3)" : "var(--text-2)"; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="w-4 text-center text-[13px] font-semibold tabular-nums"
                  style={{ color: "var(--text-1)" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-4 h-4 flex items-center justify-center rounded-full transition-all duration-150"
                  style={{ color: "var(--text-2)" }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--forest)"; el.style.color = "#fff"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-2)"; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
              {qty > 1 && (
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--gold)" }}>
                  = {((product?.price ?? 0) * qty).toFixed(2)} د.أ
                </span>
              )}
            </div>
          </div>

          {/* ── Action ── */}
          <div className="px-6 py-5" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-88 active:scale-[0.98]"
              style={{
                background: "var(--forest)",
                color: "#fff",
                padding: "11px 0",
              }}
            >
              <ShoppingBag size={14} />
              أضيفي للسلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
