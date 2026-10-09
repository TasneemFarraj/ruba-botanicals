"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

/** "Added to cart" confirmation — replaces auto-opening the drawer */
export default function CartToast() {
  const { addedTick, openCart, isOpen } = useCart();
  const pathname = usePathname();
  const [dismissedTick, setDismissedTick] = useState(0);
  const visible = addedTick !== dismissedTick;
  const setVisible = (v: boolean) => { if (!v) setDismissedTick(addedTick); };

  useEffect(() => {
    if (addedTick === 0) return;
    const t = setTimeout(() => setDismissedTick(addedTick), 2500);
    return () => clearTimeout(t);
  }, [addedTick]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      dir="rtl"
      className="fixed z-[70] left-1/2 bottom-6 flex items-center gap-3 rounded-full ps-4 pe-1.5 py-1.5 shadow-xl"
      style={{
        background: "var(--forest-bg)",
        color: "#fff",
        transform: `translate(-50%, ${visible ? "0" : "calc(100% + 32px)"})`,
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(0.32,0,0.15,1), opacity 0.3s",
        pointerEvents: visible ? "auto" : "none",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span className="text-[14px] font-medium whitespace-nowrap">تمت الإضافة للسلة ✓</span>
      {!isOpen && (
        <button
          onClick={() => { openCart(); setVisible(false); }}
          className="text-[13px] font-semibold rounded-full px-3.5 py-1.5 whitespace-nowrap"
          style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
        >
          عرض السلة
        </button>
      )}
    </div>
  );
}
