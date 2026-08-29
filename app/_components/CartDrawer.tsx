"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { saveOrder } from "../_lib/supabase";

const inputBase: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(28,58,26,0.12)",
  borderRadius: 8,
  color: "#1a2810",
  fontSize: 13,
  outline: "none",
  width: "100%",
  padding: "9px 12px",
  direction: "rtl",
  transition: "border-color 0.2s",
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "#1c3a1a";
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "rgba(28,58,26,0.12)";
};

export default function CartDrawer() {
  const { items, removeItem, updateQty, count, isOpen, closeCart, clearCart } = useCart();
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (!items.length) return;
    if (!name.trim() || !phone.trim()) {
      setError("يرجى تعبئة الاسم ورقم الهاتف");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await saveOrder({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        items,
        total,
        notes: notes.trim() || undefined,
        status: "pending",
      });
      setSuccess(true);
      setTimeout(() => clearCart(), 2000);
      setTimeout(() => {
        closeCart();
        setSuccess(false);
        setName(""); setPhone(""); setNotes("");
      }, 3000);
    } catch {
      setError("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 z-[55] transition-opacity duration-400"
        style={{
          background: "rgba(10,18,8,0.48)",
          backdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        dir="rtl"
        className="fixed top-0 right-0 h-full w-full flex flex-col z-[60] transition-transform duration-[420ms] ease-[cubic-bezier(0.32,0,0.12,1)]"
        style={{
          maxWidth: 380,
          background: "var(--white)",
          boxShadow: "-20px 0 56px rgba(10,18,8,0.14)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px]" style={{ color: "var(--text-dark)" }}>السلة</span>
            {count > 0 && (
              <span className="text-[10px] font-semibold w-5 h-5 flex items-center justify-center rounded-full"
                style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:opacity-60"
            style={{ color: "var(--text-light)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 pb-10"
              style={{ color: "var(--text-light)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                className="w-10 h-10 opacity-25 mb-1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-sm">السلة فارغة</p>
              <button onClick={closeCart}
                className="text-xs transition-opacity hover:opacity-60 mt-0.5"
                style={{ color: "var(--text-muted)" }}>
                متابعة التسوق
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-3 py-4"
                  style={{ borderBottom: idx < items.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
                    style={{ background: "var(--cream-card)" }}>
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name_ar} fill className="object-contain p-1.5" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{ fontSize: 18, opacity: 0.12 }}>🌿</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[13px] font-medium leading-snug line-clamp-2"
                        style={{ color: "var(--text-dark)" }}>
                        {item.name_ar}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-opacity hover:opacity-50 mt-0.5"
                        style={{ color: "var(--text-light)" }}
                        aria-label="حذف"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Qty */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
                          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="text-xs font-semibold w-4 text-center tabular-nums"
                          style={{ color: "var(--text-dark)" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
                          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      </div>

                      <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>
                        {(item.price * item.quantity).toFixed(2)} د.أ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 pt-4 pb-5 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-light)" }}>الإجمالي</span>
              <span className="font-display text-base" style={{ color: "var(--text-dark)" }}>
                {total.toFixed(2)}{" "}
                <span className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>د.أ</span>
              </span>
            </div>

            {success ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "#d1fae5" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2.5" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-center" style={{ color: "#065f46" }}>
                  تم استلام طلبك بنجاح! سنتواصل معك قريباً
                </p>
              </div>
            ) : (
              <>
                {/* Shipping info box */}
                <div style={{
                  background: "#f8f7f5",
                  border: "1px solid rgba(28,58,26,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 12,
                }}>
                  {[
                    { icon: "🕐", text: "يرجى تأكيد الطلبات قبل الساعة 6 مساء" },
                    { icon: "📦", text: "التوصيل من 1 إلى 4 أيام عمل" },
                    { icon: "❌", text: "لا يوجد توصيل يوم الجمعة" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2" style={{ fontSize: 11, color: "#5c7050", lineHeight: 1.9 }}>
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="الاسم الكريم"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={inputBase}
                  />
                  <input
                    type="tel"
                    placeholder="رقم الواتساب"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={inputBase}
                  />
                  <textarea
                    placeholder="ملاحظات إضافية (اختياري)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
                    onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
                    rows={2}
                    style={{ ...inputBase, resize: "none" }}
                  />
                  {error && (
                    <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</p>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full text-[13px] font-semibold flex items-center justify-center transition-opacity hover:opacity-88 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "#1c3a1a",
                    color: "#e8f4e0",
                    borderRadius: 999,
                    padding: "12px",
                    fontSize: 13,
                  }}
                >
                  {loading ? "جاري الإرسال…" : "إتمام الطلب"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
