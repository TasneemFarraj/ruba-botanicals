"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "../_types";
import { useCart } from "./CartProvider";
import { fmtPrice } from "../_lib/utils";

interface Props {
  product: Product;
  onOpenPanel?: (product: Product) => void;
  bgColor?: string;
}

export default function ProductCard({ product, bgColor }: Props) {
  const { addItem } = useCart();
  const router = useRouter();

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
      onClick={() => router.push(`/products/${product.id}`)}
    >
      {/* ── Image box ── */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl mb-3"
        style={{ background: bgColor ?? "var(--surface-card)" }}
      >
        {/* Best-seller badge */}
        {product.is_best_seller && (
          <span
            className="absolute top-2.5 start-2.5 z-10"
            style={{
              background: "var(--forest-pale)",
              color: "var(--forest-mid)",
              fontSize: 10,
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
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.12 }}>
            <svg viewBox="0 0 64 80" fill="none" className="w-16 h-20" aria-hidden="true">
              <path d="M32 72 C32 72 30 50 32 28" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="var(--text-3)"/>
              <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="var(--text-3)"/>
              <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="var(--text-3)"/>
              <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="var(--text-3)"/>
              <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="var(--text-3)"/>
            </svg>
          </div>
        )}

        {/* ── Hover gradient overlay ── */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(15,30,13,0.72) 0%, rgba(15,30,13,0.3) 45%, transparent 80%)",
            borderRadius: "inherit",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(220,240,215,0.95)", letterSpacing: "0.06em", fontFamily: "var(--font-ibm), sans-serif" }}>
            عرض التفاصيل
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="px-0.5 flex-1 flex flex-col gap-0.5">
        <h3 className="font-display text-[15px] leading-snug line-clamp-2" style={{ color: "var(--text-dark)" }}>
          {product.name_ar}
        </h3>
        {product.unit && (
          <p className="text-[12px]" style={{ color: "var(--text-light)" }}>
            {product.unit}
          </p>
        )}
      </div>

      {/* ── Price + add ── */}
      <div className="px-0.5 mt-2.5 flex items-center justify-between">
        <span className="font-display text-[15px] font-semibold" style={{ color: "var(--gold)" }}>
          {fmtPrice(product.price)}
          <span className="text-[11px] font-normal ms-0.5" style={{ color: "var(--text-light)" }}>د.أ</span>
        </span>

        <button
          onClick={handleAdd}
          aria-label="أضيفي للسلة"
          className="rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            width: 36,
            height: 36,
            border: "1.5px solid var(--border-mid)",
            color: "var(--text-muted)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "var(--forest)";
            el.style.color = "#fff";
            el.style.borderColor = "var(--forest)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.color = "var(--text-muted)";
            el.style.borderColor = "var(--border-mid)";
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
