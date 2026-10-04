"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X, ArrowRight, ChevronLeft, ChevronDown,
  Trash2, Truck, Banknote, CreditCard, Pencil,
  BadgeCheck, Check,
} from "lucide-react";
import { useCart } from "./CartProvider";
import { saveOrder } from "../_lib/supabase";
import type { CartItem } from "../_types";

/* ── Types & constants ─────────────────────────────────────────────────── */
type Step = 0 | 1 | 2;

const GOVERNORATES = [
  "عمّان",  "إربد",   "الزرقاء", "البلقاء",
  "الكرك",  "المفرق", "جرش",     "معان",
  "مادبا",  "الطفيلة","العقبة",  "عجلون",
];

const DELIVERY_INFO = [
  { Icon: Truck,      text: "التوصيل لجميع محافظات المملكة والعالم" },
  { Icon: Banknote,   text: "عمّان 2 دينار · باقي المحافظات 3 دنانير" },
  { Icon: CreditCard, text: "كاش عند الاستلام أو كليك" },
];

const POLICY_NOTES = [
  "يرجى تأكيد الطلبات قبل الساعة 6 مساءً",
  "التوصيل من 1 إلى 4 أيام عمل · لا يوجد توصيل الجمعة",
  "للطلب المستعجل أو للطلب من خارج الأردن — تواصلي على الواتساب",
];

const STEP_LABELS: Record<Step, string> = {
  0: "سلّتك",
  1: "تفاصيل التوصيل",
  2: "مراجعة الطلب",
};

/* ── Field style tokens ────────────────────────────────────────────────── */
const iSt  = { background: "var(--white)", border: "1px solid var(--border-mid)", boxShadow: "none",                     color: "var(--text-1)" };
const iStF = { background: "var(--white)", border: "1.5px solid var(--forest-light)", boxShadow: "none",                    color: "var(--text-1)" };
const iCl  = "w-full px-3 py-[8px] rounded-lg text-[13px] outline-none transition-all duration-150 placeholder:text-[var(--text-3)]";

/* ── Form state ────────────────────────────────────────────────────────── */
interface OrderForm {
  name: string; phone: string; phone2: string;
  governorate: string; area: string; street: string; notes: string;
}
const EMPTY: OrderForm = { name:"", phone:"", phone2:"", governorate:"", area:"", street:"", notes:"" };

/* ── Branch / leaf icon (matches app botanical icon language) ──────────── */
function BranchIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 64 80" fill="none" width={size} height={Math.round(size * 1.25)} aria-hidden="true">
      <path d="M32 72 C32 72 30 50 32 28" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill={color}/>
      <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill={color}/>
      <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill={color}/>
      <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill={color}/>
      <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill={color}/>
    </svg>
  );
}

/* ── BranchLoader — outline branch with sequential leaf-fill pulse ─────── */
const LOADER_LEAVES = [
  { d: "M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z", delay: "0s"    },
  { d: "M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z", delay: "0.16s" },
  { d: "M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z", delay: "0.32s" },
  { d: "M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z", delay: "0.48s" },
  { d: "M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z", delay: "0.64s" },
];

function BranchLoader({ size = 32, color = "#4a8a38" }: { size?: number; color?: string }) {
  return (
    <svg
      viewBox="0 0 64 80"
      width={size}
      height={Math.round(size * 1.25)}
      aria-label="جاري التحميل"
      style={{ animation: "rbl-float 1.6s ease-in-out infinite" }}
    >
      <path
        d="M32 72 C32 72 30 50 32 28"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"
        style={{ animation: "rbl-stem 1.6s ease-in-out infinite" }}
      />
      {LOADER_LEAVES.map(({ d, delay }, i) => (
        <path
          key={i} d={d}
          fill={color} stroke={color} strokeWidth="0.6" strokeLinejoin="round"
          style={{ fillOpacity: 0.1, animation: `rbl-leaf 1.6s ${delay} ease-in-out infinite` }}
        />
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════════════ */
export default function CartDrawer() {
  const router = useRouter();
  const { items, removeItem, updateQty, isOpen, closeCart, clearCart } = useCart();
  const [step,    setStep]    = useState<Step>(0);
  const [form,    setForm]    = useState<OrderForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = form.governorate === "عمّان" ? 2 : form.governorate ? 3 : 0;
  const total       = subtotal + deliveryFee;

  const formValid = !!(
    form.name.trim() && form.phone.trim() && form.phone2.trim() &&
    form.governorate  && form.area.trim() && form.street.trim()
  );

  const set = (k: keyof OrderForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const setPhone = (k: "phone" | "phone2") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value.replace(/[^\d+]/g, "") }));

  const handleClose = () => {
    closeCart();
    setTimeout(() => { setStep(0); setError(""); setDone(false); }, 420);
  };

  const handleContinueShopping = () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
    clearCart();
    handleClose();
    router.push("/products");
  };

  const handleSend = async () => {
    setError(""); setLoading(true);
try {
      await saveOrder({
        customer_name:   form.name.trim(),
        customer_phone:  form.phone.trim(),
        customer_phone2: form.phone2.trim(),
        governorate:     form.governorate,
        area:            form.area.trim(),
        street_address:  form.street.trim(),
        items, subtotal, delivery_fee: deliveryFee, total,
        notes:  form.notes.trim() || undefined,
        status: "pending",
      });
      setDone(true);
      doneTimer.current = setTimeout(handleContinueShopping, 8000);
    } catch {
      setError("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes rbl-float {
          0%,100% { transform: scale(1)    translateY(0);    opacity: .85; }
          50%      { transform: scale(1.07) translateY(-2px); opacity: 1;   }
        }
        @keyframes rbl-stem {
          0%,100% { stroke-opacity: .35; }
          50%      { stroke-opacity: 1;   }
        }
        @keyframes rbl-leaf {
          0%,100% { fill-opacity: .1;  }
          45%,55% { fill-opacity: 1;   }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[55] transition-opacity duration-300"
        style={{
          background:    "rgba(0,0,0,0.38)",
          backdropFilter:"blur(5px)",
          opacity:       isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/*
        DRAWER — flex column: header + footer shrink-0 (never scroll),
        only the middle content area scrolls.
        GovPicker renders its list absolutely inside the scroll area
      */}
      <div
        dir="rtl"
        className="fixed top-0 right-0 h-full z-[60] flex flex-col"
        style={{
          width:      "min(400px, 100vw)",
          background: "var(--white)",
          boxShadow:  "-2px 0 0 rgba(28,58,26,0.05), -20px 0 60px rgba(0,0,0,0.12)",
          transition: "transform 400ms cubic-bezier(0.32,0,0.15,1)",
          transform:  isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* ── Header (shrink-0, never scrolls) ────────────────────── */}
        <div className="shrink-0 bg-[var(--white)]" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 px-5" style={{ height: 56 }}>

            {/* Back button / placeholder */}
            <div style={{ width: 34 }}>
              {step > 0 && !done && (
                <button
                  onClick={() => { setStep(s => (s - 1) as Step); setError(""); }}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors"
                  style={{ color: "var(--text-2)", background: "var(--surface-alt)" }}
                >
                  <ArrowRight size={15} />
                </button>
              )}
            </div>

            <h2
              className="flex-1 text-center text-[15.5px] font-bold"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-display, serif)" }}
            >
              {done ? "تم استلام طلبك" : STEP_LABELS[step]}
            </h2>

            <button
              onClick={handleClose}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--text-3)", background: "var(--surface-alt)" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Step dots — hidden when done */}
          {!done && (
            <div className="flex justify-center items-center gap-1.5 pb-2.5">
              {([0, 1, 2] as Step[]).map(i => (
                <div key={i} style={{
                  width:        step === i ? 18 : 5,
                  height:       4,
                  borderRadius: 99,
                  background:   i <= step ? "var(--forest)" : "var(--border-mid)",
                  opacity:      i < step ? 0.3 : 1,
                  transition:   "all 0.3s ease",
                }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Content — only this scrolls ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── SUCCESS STATE ── */}
          {done && (
            <>
              <style>{`
                @keyframes rb-seal-in {
                  0%   { transform: scale(0.35) rotate(-18deg); opacity: 0; }
                  65%  { transform: scale(1.05) rotate(1.5deg); opacity: 1; }
                  82%  { transform: scale(0.97) rotate(-0.3deg); }
                  100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes rb-icon-in {
                  0%   { transform: scale(0) rotate(-22deg); opacity: 0; }
                  58%  { transform: scale(1.2) rotate(4deg); opacity: 1; }
                  76%  { transform: scale(0.94) rotate(-1deg); }
                  100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes rb-ring-spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
                @keyframes rb-ripple-out {
                  0%   { transform: scale(1); opacity: 0.45; }
                  100% { transform: scale(2.3); opacity: 0; }
                }
                @keyframes rb-ripple-out2 {
                  0%   { transform: scale(1); opacity: 0.22; }
                  100% { transform: scale(3); opacity: 0; }
                }
                @keyframes rb-fade-up {
                  0%   { transform: translateY(16px); opacity: 0; }
                  100% { transform: translateY(0);    opacity: 1; }
                }
              `}</style>

              <div className="flex flex-col items-center justify-center px-7 py-14 gap-8">

                {/* Seal */}
                <div style={{ position: "relative", width: 156, height: 156 }}>

                  {/* Ripple pulses (fire once on mount) */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(50,130,25,0.10)",
                    animation: "rb-ripple-out 1.1s 0.38s ease-out forwards", opacity: 0,
                  }} />
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(50,130,25,0.06)",
                    animation: "rb-ripple-out2 1.4s 0.55s ease-out forwards", opacity: 0,
                  }} />

                  {/* All rings + fill in one SVG — snaps in together, outer ring slowly spins */}
                  <svg
                    viewBox="0 0 156 156"
                    width="156" height="156"
                    style={{
                      position: "absolute", inset: 0,
                      animation: "rb-seal-in 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
                      opacity: 0,
                    }}
                  >
                    <defs>
                      <radialGradient id="seal-fill" cx="40%" cy="35%">
                        <stop offset="0%"   stopColor="#d8f4c4" />
                        <stop offset="100%" stopColor="#c0eaa8" />
                      </radialGradient>
                    </defs>

                    {/* Outer dot ring — 24 evenly spaced dots, rotates slowly */}
                    <g style={{ transformOrigin: "78px 78px", animation: "rb-ring-spin 28s linear infinite" }}>
                      <circle cx="78" cy="78" r="72"
                        fill="none" stroke="#3d8a28" strokeWidth="2"
                        strokeDasharray="2 18.8" strokeLinecap="round"
                        opacity="0.45"
                      />
                    </g>

                    {/* Middle thin ring */}
                    <circle cx="78" cy="78" r="61"
                      fill="none" stroke="#3d8a28" strokeWidth="1"
                      opacity="0.18"
                    />

                    {/* Inner filled circle */}
                    <circle cx="78" cy="78" r="51" fill="url(#seal-fill)" />

                    {/* Subtle inner border */}
                    <circle cx="78" cy="78" r="51"
                      fill="none" stroke="#2e7020" strokeWidth="1"
                      opacity="0.14"
                    />
                  </svg>

                  {/* BadgeCheck icon centered */}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      animation: "rb-icon-in 0.52s 0.32s cubic-bezier(0.175,0.885,0.32,1.275) both",
                      display: "inline-flex", color: "#1a6810",
                    }}>
                      <BadgeCheck size={50} strokeWidth={1.4} />
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="text-center" style={{ animation: "rb-fade-up 0.5s 0.6s ease both", opacity: 0 }}>
                  <p className="text-[21px] font-bold mb-2" style={{ color: "var(--text-1)", fontFamily: "var(--font-display, serif)" }}>
                    تم استلام طلبك
                  </p>
                  <p className="text-[13px] leading-[1.95]" style={{ color: "var(--text-2)" }}>
                    سيصل طلبك خلال{" "}
                    <span className="font-semibold" style={{ color: "var(--forest)" }}>3 إلى 5 أيام عمل</span>
                    <br />
                    سيتواصل معك مندوب التوصيل قبل الوصول
                  </p>
                </div>

                {/* Button */}
                <div style={{ animation: "rb-fade-up 0.5s 0.78s ease both", opacity: 0, width: "100%" }}>
                  <button
                    onClick={handleContinueShopping}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl font-bold text-[14px] active:scale-[0.97] transition-opacity"
                    style={{
                      height: 50,
                      background: "linear-gradient(135deg,#254a22,#1c3a1a,#162f14)",
                      color: "#fff", border: "none",
                      boxShadow: "0 2px 16px rgba(28,58,26,0.26)",
                      letterSpacing: "0.02em",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    <BranchIcon size={13} color="rgba(255,255,255,0.75)" />
                    متابعة التسوق
                    <ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                  </button>
                </div>

              </div>
            </>
          )}

          {/* ── STEP 0: Cart ── */}
          {!done && step === 0 && (
            <div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "var(--surface-card)" }}
                  >
                    <BranchIcon size={28} color="var(--text-3)" />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--text-3)" }}>سلّتك فارغة</p>
                    <p className="text-[12px]" style={{ color: "var(--text-3)" }}>أضيفي منتجاتك المفضلة</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-2.5 rounded-xl font-bold text-[14px] transition-opacity active:scale-[0.97]"
                    style={{
                      padding: "12px 26px",
                      background: "linear-gradient(135deg,#254a22,#1c3a1a,#162f14)",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 2px 12px rgba(28,58,26,0.22)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    <BranchIcon size={13} color="rgba(255,255,255,0.75)" />
                    متابعة التسوق
                    <ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.55)" }} />
                  </button>
                </div>
              ) : (
                items.map((item, i) => (
                  <CartRow
                    key={item.id}
                    item={item}
                    showDivider={i > 0}
                    onRemove={() => removeItem(item.id)}
                    onQtyChange={q => updateQty(item.id, q)}
                  />
                ))
              )}
            </div>
          )}

          {/* ── STEP 1: Form ── */}
          {!done && step === 1 && (
            <div className="px-5 pt-3 pb-4 space-y-3.5">

              <SectionLabel>التواصل</SectionLabel>

              <AField label="الاسم الكامل" required>
                <AInput value={form.name} onChange={set("name")} placeholder="ريم محمد" />
              </AField>

              <AField label="رقم الواتساب" required>
                <AInput value={form.phone} onChange={setPhone("phone")} placeholder="078*******" type="tel" ltr />
              </AField>

              <AField label="رقم احتياطي" required>
                <AInput value={form.phone2} onChange={setPhone("phone2")} placeholder="078*******" type="tel" ltr />
              </AField>

              <SectionLabel topGap>عنوان التوصيل</SectionLabel>

              <GovPicker value={form.governorate} onChange={v => setForm(f => ({ ...f, governorate: v }))} />

              <AField label="المنطقة / الحي" required>
                <AInput value={form.area} onChange={set("area")} placeholder="مثال: الدوار السابع" />
              </AField>

              <AField label="الشارع والعنوان التفصيلي" required>
                <ATextarea value={form.street} onChange={set("street")} placeholder="مثال: شارع الأمير حمزة، بناية 12، الطابق 2" rows={2} />
              </AField>

              <AField label="ملاحظات">
                <ATextarea value={form.notes} onChange={set("notes")} placeholder="أي تعليمات خاصة للتوصيل…" rows={2} />
              </AField>

              <PolicyBox />

            </div>
          )}

          {/* ── STEP 2: Review ── */}
          {!done && step === 2 && (
            <div className="px-5 pt-3 pb-4 space-y-4">

              <SectionLabel>المنتجات</SectionLabel>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {items.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "var(--white)" : "var(--surface-card)" }}>
                    {item.image_url && (
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--surface-card)" }}>
                        <Image src={item.image_url} alt={item.name_ar} fill className="object-contain p-1" />
                      </div>
                    )}
                    <p className="flex-1 text-[13px] font-medium line-clamp-1" style={{ color: "var(--text-1)" }}>{item.name_ar}</p>
                    <span className="text-[11px] shrink-0" style={{ color: "var(--text-3)" }}>× {item.quantity}</span>
                    <span className="text-[13px] font-semibold tabular-nums shrink-0 ms-2" style={{ color: "var(--gold)" }}>
                      {(item.price * item.quantity).toFixed(2)} <span className="text-[10px] font-normal">د.أ</span>
                    </span>
                  </div>
                ))}
              </div>

              <SectionLabel>الإجمالي</SectionLabel>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <PriceRow label="المنتجات" value={`${subtotal.toFixed(2)} د.أ`} />
                <PriceRow label={`التوصيل — ${form.governorate}`} value={`${deliveryFee.toFixed(2)} د.أ`} divider />
                <div className="flex justify-between items-center px-4 py-3.5" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="text-[13.5px] font-bold" style={{ color: "var(--text-1)" }}>الإجمالي الكلي</span>
                  <span className="text-[20px] font-bold tabular-nums" style={{ color: "var(--forest)", fontFamily: "var(--font-display, serif)" }}>
                    {total.toFixed(2)} <span className="text-[11px] font-normal" style={{ color: "var(--text-3)" }}>د.أ</span>
                  </span>
                </div>
              </div>

              <SectionLabel>التوصيل إلى</SectionLabel>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {(
                  [
                    ["الاسم",     form.name],
                    ["واتساب",    form.phone],
                    ["رقم احتياطي", form.phone2],
                    ["المنطقة",   `${form.governorate} — ${form.area}`],
                    ["العنوان",   form.street],
                    ...(form.notes ? [["ملاحظات", form.notes]] : []),
                  ] as [string, string][]
                ).map(([lbl, val], i) => (
                  <div key={lbl} className="flex items-start justify-between gap-4 px-4 py-2.5"
                    style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <span className="text-[11px] shrink-0 mt-0.5" style={{ color: "var(--text-3)" }}>{lbl}</span>
                    <span className="text-[12.5px] text-end leading-snug" style={{ color: "var(--text-1)" }}>{val}</span>
                  </div>
                ))}
              </div>

              <PolicyBox />

              {error && <p className="text-center text-[12px]" style={{ color: "#e05050" }}>{error}</p>}

            </div>
          )}

        </div>{/* /flex-1 overflow-y-auto */}

        {/* ── Footer — shrink-0, never scrolls ─────────────────────── */}
        {!done && items.length > 0 && (
          <div className="shrink-0 bg-[var(--white)] px-5 pt-3 pb-5" style={{ borderTop: "1px solid var(--border)" }}>

            {step === 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-display, serif)" }}>
                  الإجمالي
                </span>
                <span className="text-[22px] font-bold tabular-nums" style={{ color: "var(--text-1)", fontFamily: "var(--font-display, serif)" }}>
                  {subtotal.toFixed(2)}{" "}
                  <span className="text-[12px] font-normal" style={{ color: "var(--text-3)" }}>د.أ</span>
                </span>
              </div>
            )}

            {step === 0 && (
              <CtaBtn label="إتمام الطلب" onClick={() => setStep(1)} />
            )}

            {step === 1 && (
              <CtaBtn label="مراجعة الطلب" onClick={() => { if (formValid) setStep(2); }} disabled={!formValid} />
            )}

            {step === 2 && (
              <div className="flex gap-2.5">
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex items-center gap-1.5 rounded-xl font-medium text-[13px] shrink-0 transition-colors"
                  style={{ padding: "0 16px", height: 46, background: "var(--surface-alt)", color: "var(--text-2)", border: "1px solid var(--border-mid)", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--forest-pale)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-alt)"; }}
                >
                  <Pencil size={13} />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-[14px] active:scale-[0.98]"
                  style={{
                    height:     46,
                    background: "linear-gradient(135deg,#254a22,#1c3a1a,#162f14)",
                    color:      "#fff",
                    border:     "none",
                    cursor:     loading ? "not-allowed" : "pointer",
                    boxShadow:  "0 2px 12px rgba(28,58,26,0.25)",
                    opacity:    loading ? 0.75 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {loading
                    ? <BranchLoader size={24} color="#7aaa6a" />
                    : <><BranchIcon size={13} color="rgba(255,255,255,0.75)" /><span>تأكيد وإرسال الطلب</span><ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.55)" }} /></>
                  }
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PolicyBox — merged delivery info + policy notes
══════════════════════════════════════════════════════════════════════════ */
function PolicyBox() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--forest-pale)", border: "1px solid var(--border-mid)" }}>

      {/* Delivery highlights */}
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {DELIVERY_INFO.map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5">
            <Icon size={13} style={{ color: "var(--forest-light)", flexShrink: 0 }} />
            <span className="text-[12px]" style={{ color: "var(--forest-mid)" }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border-mid)", margin: "0 16px" }} />

      {/* Notes */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {POLICY_NOTES.map((note, i) => (
          <div key={note} className="flex items-start gap-2">
            <span style={{ color: "var(--forest-light)", fontSize: 10, marginTop: 3, flexShrink: 0 }}>●</span>
            {i === 2 ? (
              <p className="text-[12px] leading-[1.6]" style={{ color: "var(--forest-mid)" }}>
                للطلب المستعجل أو من خارج الأردن —{" "}
                <a
                  href="https://wa.me/962789795740"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold"
                  style={{ color: "var(--forest-mid)" }}
                >
                  تواصلي على الواتساب
                </a>
              </p>
            ) : (
              <p className="text-[12px] leading-[1.6]" style={{ color: "var(--forest-mid)" }}>{note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   GovPicker — dropdown anchored under the trigger (scrolls with the form)
══════════════════════════════════════════════════════════════════════════ */
function GovPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Bring the list into view (on phones it often opens below the fold)
    requestAnimationFrame(() =>
      dropdownRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    );
    const handleOuter = (e: PointerEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handleOuter);
    return () => document.removeEventListener("pointerdown", handleOuter);
  }, [open]);

  const dropdown = open && (
    <div
      ref={dropdownRef}
      dir="rtl"
      style={{
        position:   "absolute",
        top:        "calc(100% + 2px)",
        insetInline: 0,
        zIndex:     20,
        background: "var(--surface-card)",
        border:     "1px solid var(--border-mid)",
        borderRadius: 8,
        boxShadow:  "0 8px 28px rgba(0,0,0,0.12)",
        maxHeight:  240,
        overflowY:  "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        scrollMarginBottom: 16,
      }}
    >
      {GOVERNORATES.map((g, i) => (
        <button
          key={g}
          type="button"
          onClick={() => { onChange(g); setOpen(false); }}
          className="w-full flex items-center justify-between px-3 py-2.5 text-right text-[13px]"
          style={{
            borderTop:  i > 0 ? "1px solid var(--border)" : "none",
            color:      g === value ? "var(--forest)" : "var(--text-1)",
            fontWeight: g === value ? 600 : 400,
            cursor:     "pointer",
            background: "transparent",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-pale)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span>{g}</span>
          {g === value && <Check size={12} style={{ color: "var(--forest)", flexShrink: 0 }} />}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <label className="flex items-center gap-1 text-[12.5px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
        المحافظة <span style={{ color: "#c0392b", fontSize: 10 }}>*</span>
      </label>
      <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 text-[13.5px] transition-all duration-150"
        style={{
          height:       42,
          background:   "var(--white)",
          border:       open ? "1.5px solid var(--forest-light)" : "1px solid var(--border-mid)",
          boxShadow:    "none",
          borderRadius: 8,
          color:        value ? "var(--text-1)" : "var(--text-3)",
          cursor:       "pointer",
        }}
      >
        <span>{value || "اختاري المحافظة..."}</span>
        <ChevronDown size={14} style={{
          color:      "var(--text-3)",
          transform:  open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.22s ease",
          flexShrink: 0,
        }} />
      </button>
      {dropdown}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CartRow
══════════════════════════════════════════════════════════════════════════ */
function CartRow({ item, showDivider, onRemove, onQtyChange }: {
  item: CartItem; showDivider: boolean;
  onRemove: () => void; onQtyChange: (q: number) => void;
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-4"
      style={{ borderTop: showDivider ? "1px solid var(--surface-alt)" : "none" }}>
      <div className="relative shrink-0 rounded-xl overflow-hidden" style={{ width: 56, height: 56, background: "var(--surface-card)" }}>
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name_ar} fill className="object-contain p-1.5" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.15 }}>
            <BranchIcon size={22} color="var(--text-3)" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-snug line-clamp-2 mb-2.5" style={{ color: "var(--text-1)" }}>
          {item.name_ar}
        </p>
        <div className="flex items-center gap-2">
          <QtyBtn sign="−" onClick={() => onQtyChange(item.quantity - 1)} />
          <span className="text-[14px] font-bold w-5 text-center tabular-nums" style={{ color: "var(--text-1)" }}>
            {item.quantity}
          </span>
          <QtyBtn sign="+" onClick={() => onQtyChange(item.quantity + 1)} />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2.5 shrink-0">
        <span className="text-[14px] font-bold tabular-nums" style={{ color: "var(--gold)" }}>
          {(item.price * item.quantity).toFixed(2)}
          <span className="text-[10px] font-normal ms-0.5">د.أ</span>
        </span>
        <button
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-full"
          style={{ color: "var(--text-3)", background: "var(--surface-card)", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.background = "var(--surface-card)"; }}
          aria-label="حذف"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Form atoms
══════════════════════════════════════════════════════════════════════════ */
function SectionLabel({ children, topGap = false }: { children: React.ReactNode; topGap?: boolean }) {
  return (
    <p className={`text-[10.5px] font-semibold tracking-widest uppercase${topGap ? " pt-1" : ""}`}
      style={{ color: "var(--text-3)" }}>
      {children}
    </p>
  );
}

function AField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[12.5px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
        {label}
        {required && <span style={{ color: "#c0392b", fontSize: 11 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function AInput({ value, onChange, placeholder, type = "text", ltr = false }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; ltr?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      inputMode={type === "tel" ? "tel" : undefined}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      dir={ltr ? "ltr" : "rtl"}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${iCl}${ltr ? " text-right" : ""}`}
      style={focused ? iStF : iSt}
    />
  );
}

function ATextarea({ value, onChange, placeholder, rows = 2 }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      dir="rtl"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${iCl} resize-none`}
      style={focused ? iStF : iSt}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Misc
══════════════════════════════════════════════════════════════════════════ */
function QtyBtn({ sign, onClick }: { sign: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-full text-[14px] font-semibold active:scale-95"
      style={{ width: 26, height: 26, background: "var(--surface-alt)", color: "var(--text-2)", border: "none", cursor: "pointer", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-pale)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--surface-alt)")}
    >
      {sign}
    </button>
  );
}

function CtaBtn({ label, onClick, disabled = false }: {
  label: string; onClick: () => void; disabled?: boolean;
}) {
  const iconColor = disabled ? "rgba(168,184,164,0.6)" : "rgba(255,255,255,0.75)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2.5 rounded-xl font-bold text-[14px] active:scale-[0.98]"
      style={{
        height:        48,
        background:    disabled ? "var(--surface-alt)" : "linear-gradient(135deg,#254a22,#1c3a1a,#162f14)",
        color:         disabled ? "var(--text-3)" : "#fff",
        border:        "none",
        cursor:        disabled ? "not-allowed" : "pointer",
        letterSpacing: "0.02em",
        boxShadow:     disabled ? "none" : "0 2px 12px rgba(28,58,26,0.25)",
        transition:    "opacity 0.2s",
      }}
    >
      <BranchIcon size={13} color={iconColor} />
      {label}
      <ChevronLeft size={16} style={{ color: iconColor }} />
    </button>
  );
}

function PriceRow({ label, value, divider = false }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5"
      style={{ borderTop: divider ? "1px solid var(--border)" : "none" }}>
      <span className="text-[12.5px]" style={{ color: "var(--text-2)" }}>{label}</span>
      <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--text-1)" }}>{value}</span>
    </div>
  );
}
