"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { X } from "lucide-react";
import type { Product } from "../_types";
import { useCart } from "./CartProvider";
import { buildWhatsAppMessage, openWhatsApp } from "../_lib/utils";

interface Props {
  product: Product | null;
  onClose: () => void;
}

const WA_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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
        { opacity: 0, scale: 0.94, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "power3.out" }
      );
      setQty(1);
    } else {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.22 });
      gsap.to(cardRef.current, { opacity: 0, scale: 0.96, y: 10, duration: 0.22, ease: "power2.in" });
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

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = buildWhatsAppMessage(
      [{ id: product.id, name_ar: product.name_ar, price: product.price, quantity: qty, image_url: product.image_url }],
      { name: "عميل", phone: "" }
    );
    openWhatsApp(msg);
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
        style={{
          background: "rgba(12,20,10,0.55)",
          backdropFilter: "blur(8px)",
          opacity: 0,
        }}
      />

      {/* Card */}
      <div
        ref={cardRef}
        dir="rtl"
        className="relative w-full flex flex-col sm:flex-row rounded-3xl overflow-hidden"
        style={{
          maxWidth: 700,
          maxHeight: "90vh",
          background: "var(--white)",
          boxShadow: "0 32px 80px rgba(10,18,8,0.22), 0 0 0 1px rgba(77,124,31,0.06)",
          opacity: 0,
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-70"
          style={{
            color: "var(--text-muted)",
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Image panel */}
        <div
          className="relative sm:w-[45%] h-64 sm:h-auto shrink-0 flex items-center justify-center"
          style={{ background: "var(--cream-card)" }}
        >
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, var(--forest) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {imgSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={imgSrc}
                alt={product?.name_ar ?? ""}
                fill
                className="object-contain p-10 sm:p-12"
                style={{ filter: "drop-shadow(0 8px 28px rgba(28,58,26,0.14))" }}
              />
            </div>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"
              className="w-20 h-20 opacity-10" style={{ color: "var(--forest)" }}>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c0 0 8-2 8-10 0-5.5-4.5-10-8-10z" />
            </svg>
          )}

          {product?.is_best_seller && (
            <div className="absolute bottom-4 start-4">
              <span style={{
                background: "#eef4e8",
                color: "#2d5a0e",
                fontSize: 9,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 999,
                letterSpacing: "0.05em",
              }}>
                الأكثر مبيعاً
              </span>
            </div>
          )}
        </div>

        {/* Content panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-7 pt-8 pb-4">

            <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-snug mb-1.5"
              style={{ color: "var(--text-dark)" }}>
              {product?.name_ar}
            </h2>

            {product?.unit && (
              <p className="text-xs mb-4 tracking-wide" style={{ color: "var(--text-light)" }}>
                {product.unit}
              </p>
            )}

            <div className="mb-5 flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-semibold" style={{ color: "var(--gold)" }}>
                {product?.price}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>د.أ</span>
            </div>

            <div className="mb-5" style={{
              height: 1,
              background: "linear-gradient(to left, transparent, var(--border) 30%, var(--border) 70%, transparent)",
            }} />

            {product?.description_ar && (
              <p className="text-sm leading-[1.85] mb-6" style={{ color: "var(--text-muted)" }}>
                {product.description_ar}
              </p>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-2">
              <span className="text-xs" style={{ color: "var(--text-light)" }}>الكمية</span>

              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full"
                style={{ border: "1px solid var(--border)" }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-5 h-5 flex items-center justify-center transition-opacity hover:opacity-60"
                  style={{ color: qty === 1 ? "var(--text-light)" : "var(--text-muted)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="w-5 text-center text-sm font-semibold tabular-nums"
                  style={{ color: "var(--text-dark)" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-5 h-5 flex items-center justify-center transition-opacity hover:opacity-60"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>

              {qty > 1 && (
                <span className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
                  = {((product?.price ?? 0) * qty).toFixed(2)} د.أ
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-7 py-5 space-y-2.5">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-full text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: "var(--forest)", color: "#fff" }}
            >
              أضيفي للسلة
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full py-2.5 flex items-center justify-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)", fontSize: 13 }}
            >
              {WA_ICON}
              <span>أو اطلبي مباشرة عبر واتساب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
