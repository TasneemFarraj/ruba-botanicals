"use client";

import { useState } from "react";
import { X, ShoppingBag, Clock, Package, Ban, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { saveOrder } from "../_lib/supabase";
import EmptyState from "./shared/EmptyState";

export default function CartDrawer() {
  const { items, removeItem, updateQty, count, isOpen, closeCart, clearCart } = useCart();
  const [name,         setName]         = useState("");
  const [phone,        setPhone]        = useState("");
  const [notes,        setNotes]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);
  const [footerOpen,   setFooterOpen]   = useState(true);

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && items.length > 0;

  const handleCheckout = async () => {
    if (!canSubmit) return;
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

  const NOTES = [
    { Icon: Clock,   text: "يرجى تأكيد الطلبات قبل الساعة 6 مساء" },
    { Icon: Package, text: "التوصيل من 1 إلى 4 أيام عمل" },
    { Icon: Ban,     text: "لا يوجد توصيل يوم الجمعة" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 z-[55] transition-opacity duration-300"
        style={{
          background: "rgba(10,18,8,0.5)",
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
          borderLeft: "1px solid var(--border)",
          boxShadow: "-20px 0 60px rgba(10,18,8,0.18)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-4 shrink-0"
          style={{ height: 52, borderBottom: "1px solid var(--border)" }}
        >
          {/* Close — leftmost (end in RTL), touches the open edge */}
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-50 shrink-0"
            style={{ color: "var(--text-2)", background: "var(--surface-card)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <ShoppingBag size={14} style={{ color: "var(--forest)" }} />
            <span className="text-[13.5px] font-medium" style={{ color: "var(--text-1)" }}>سلتك</span>
            {count > 0 && (
              <span
                className="flex items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background: "var(--forest-pale)",
                  color: "var(--forest-mid)",
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                }}
              >
                {count}
              </span>
            )}
          </div>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-12">
              <EmptyState title="السلة فارغة" actionLabel="متابعة التسوق" onAction={closeCart} />
            </div>
          ) : (
            <div>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-3.5"
                  style={{ borderBottom: idx < items.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0"
                    style={{ background: "var(--surface-card)" }}
                  >
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name_ar} fill className="object-contain p-1" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{ fontSize: 16, opacity: 0.12 }}>🌿</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium leading-snug line-clamp-1 mb-2.5"
                      style={{ color: "var(--text-1)" }}>
                      {item.name_ar}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-full transition-all duration-150"
                          style={{ border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--forest)"; el.style.color = "#fff"; el.style.borderColor = "var(--forest)"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-2)"; el.style.borderColor = "var(--border-mid)"; }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2 h-2"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="text-xs font-semibold w-4 text-center tabular-nums" style={{ color: "var(--text-1)" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-full transition-all duration-150"
                          style={{ border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--forest)"; el.style.color = "#fff"; el.style.borderColor = "var(--forest)"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-2)"; el.style.borderColor = "var(--border-mid)"; }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2 h-2"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>

                      <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--gold)" }}>
                        {(item.price * item.quantity).toFixed(2)}{" "}
                        <span style={{ fontSize: 10, fontWeight: 400 }}>د.أ</span>
                      </span>
                    </div>
                  </div>

                  {/* X — same size as header close button so they line up */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-40"
                    style={{ color: "var(--text-3)" }}
                    aria-label="حذف"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="shrink-0" style={{ borderTop: "1px solid var(--border)" }}>

            {success ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 px-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "#d1fae5" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-center" style={{ color: "#065f46" }}>
                  تم استلام طلبك بنجاح!<br />
                  <span className="text-[12px] font-normal" style={{ color: "#34795a" }}>سنتواصل معك قريباً</span>
                </p>
              </div>
            ) : (
              <>
                {/* ── Collapsible total toggle ── */}
                <button
                  onClick={() => setFooterOpen(o => !o)}
                  className="w-full flex items-center justify-between px-5 transition-colors"
                  style={{ height: 52 }}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[18px]" style={{ color: "var(--text-1)" }}>
                      {total.toFixed(2)}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-2)" }}>د.أ</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: "var(--text-3)" }}>الإجمالي</span>
                    <ChevronUp
                      size={14}
                      style={{
                        color: "var(--text-3)",
                        transition: "transform 0.22s ease",
                        transform: footerOpen ? "rotate(0deg)" : "rotate(180deg)",
                      }}
                    />
                  </div>
                </button>

                {/* ── Expandable panel ── */}
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: footerOpen ? 600 : 0,
                    transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div className="px-5 pb-5">
                    {/* Form */}
                    <div className="flex flex-col gap-2">
                      <Field
                        type="text"
                        placeholder="الاسم"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                      <Field
                        type="tel"
                        placeholder="رقم الواتساب"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                      <FieldArea
                        placeholder="ملاحظات (اختياري)"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />

                      {error && (
                        <p style={{ color: "#ef4444", fontSize: 11.5 }}>{error}</p>
                      )}

                      <button
                        onClick={handleCheckout}
                        disabled={loading || !canSubmit}
                        style={{
                          marginTop: 2,
                          background: "#1c3a1a",
                          color: "#e8f4e0",
                          borderRadius: 12,
                          padding: "10px 0",
                          fontSize: 13,
                          fontWeight: 600,
                          width: "100%",
                          opacity: canSubmit && !loading ? 1 : 0.32,
                          cursor: canSubmit && !loading ? "pointer" : "not-allowed",
                          transition: "opacity 0.2s",
                        }}
                      >
                        {loading ? "جاري الإرسال…" : "إتمام الطلب"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Shipping notes — always visible at bottom ── */}
        <div className="shrink-0 px-5 py-3 flex flex-col gap-1.5"
          style={{ borderTop: "1px solid var(--border)" }}>
          {NOTES.map(({ Icon, text }) => (
            <p key={text} className="flex items-center gap-2"
              style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.65 }}>
              <Icon size={11} style={{ flexShrink: 0 }} />
              {text}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}

function Field({
  type, placeholder, value, onChange,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      dir="rtl"
      style={{
        display: "block",
        width: "100%",
        background: "var(--surface-card)",
        border: `1px solid ${focused ? "rgba(28,58,26,0.5)" : "var(--border)"}`,
        borderRadius: 8,
        padding: "7px 13px",
        fontSize: 12.5,
        color: "var(--text-1)",
        outline: "none",
        direction: "rtl",
        transition: "border-color 0.18s",
      }}
    />
  );
}

function FieldArea({
  placeholder, value, onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      rows={2}
      dir="rtl"
      style={{
        display: "block",
        width: "100%",
        background: "var(--surface-card)",
        border: `1px solid ${focused ? "rgba(28,58,26,0.5)" : "var(--border)"}`,
        borderRadius: 8,
        padding: "7px 13px",
        fontSize: 12.5,
        color: "var(--text-1)",
        outline: "none",
        resize: "none",
        direction: "rtl",
        transition: "border-color 0.18s",
      }}
    />
  );
}
