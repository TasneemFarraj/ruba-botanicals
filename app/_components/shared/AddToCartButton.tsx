"use client";

import { useEffect, useState } from "react";

/**
 * "أضيفي للسلة" pill for product listing cards — same look as the product page button
 * (forest pill, 12px label, bag icon). Briefly confirms after each add.
 */
export default function AddToCartButton({ onClick, disabled = false }: { onClick: (e: React.MouseEvent) => void; disabled?: boolean }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(t);
  }, [added]);

  // Colours live in classes only (no inline color) so hover/active states can never hide the label
  const tone = disabled
    ? "bg-[var(--surface-alt)] text-[var(--text-2)] cursor-default"
    : added
      ? "bg-[var(--forest-bg-mid)] text-white"
      : "bg-[var(--forest-bg)] text-white hover:opacity-85 active:scale-[0.97]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => { onClick(e); if (!disabled) setAdded(true); }}
      className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-[11.5px] font-medium tracking-[0.03em] whitespace-nowrap transition-[opacity,transform,background-color] duration-200 ${tone}`}
    >
      {added ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 11, height: 11 }}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          تمت الإضافة
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
          </svg>
          {disabled ? "غير متوفر" : "أضيفي للسلة"}
        </>
      )}
    </button>
  );
}
