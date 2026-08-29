"use client";

import Image from "next/image";
import type { Product } from "../_types";
import { useCart } from "./CartProvider";

interface Props {
  product: Product;
  onOpenPanel?: (product: Product) => void;
  bgColor?: string;
}

export default function ProductCard({ product, onOpenPanel, bgColor }: Props) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name_ar: product.name_ar,
      price: product.price,
      image_url: product.image_no_bg_url ?? product.image_url,
    });
  };

  const imgSrc = product.image_no_bg_url ?? product.image_url;

  return (
    <div
      className="group flex flex-col cursor-pointer"
      onClick={() => onOpenPanel?.(product)}
    >
      {/* Image */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl mb-3"
        style={{ background: bgColor ?? "var(--cream)" }}
      >
        {product.is_best_seller && (
          <span
            className="absolute top-2.5 start-2.5 z-10"
            style={{
              background: "#eef4e8",
              color: "#2d5a0e",
              fontSize: 9,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              letterSpacing: "0.05em",
            }}
          >
            الأكثر مبيعاً
          </span>
        )}

        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={product.name_ar}
            fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.18 }}>
            <svg viewBox="0 0 64 80" fill="none" className="w-16 h-20">
              <path d="M32 72 C32 72 30 50 32 28" stroke="#2d5a0e" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="#2d5a0e"/>
              <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="#2d5a0e"/>
              <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="#2d5a0e"/>
              <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="#2d5a0e"/>
              <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="#2d5a0e"/>
            </svg>
          </div>
        )}

        {/* Quick-view hint */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <span
            className="text-[11px] font-medium px-4 py-1.5 rounded-full translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(6px)",
              color: "var(--text-dark)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}
          >
            اعرض التفاصيل
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5 flex-1 flex flex-col gap-1">
        <h3 className="font-display text-[15px] leading-snug line-clamp-2"
          style={{ color: "var(--text-dark)" }}>
          {product.name_ar}
        </h3>
        {product.unit && (
          <p className="text-[12px]" style={{ color: "var(--text-light)" }}>
            {product.unit}
          </p>
        )}
      </div>

      {/* Price + add */}
      <div className="px-0.5 mt-2.5 flex items-center justify-between">
        <span className="text-[14px] font-semibold" style={{ color: "var(--text-dark)" }}>
          {product.price}{" "}
          <span className="text-[11px] font-normal" style={{ color: "var(--text-light)" }}>د.أ</span>
        </span>

        <button
          onClick={handleAdd}
          aria-label="أضيفي للسلة"
          className="rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            width: 26,
            height: 26,
            border: "1px solid rgba(28,58,26,0.15)",
            color: "#5c7050",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#1c3a1a";
            el.style.color = "#fff";
            el.style.borderColor = "#1c3a1a";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.color = "#5c7050";
            el.style.borderColor = "rgba(28,58,26,0.15)";
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M5 1v8M1 5h8"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
