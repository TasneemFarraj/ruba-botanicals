"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Spinner ─── */
export function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--forest)", borderTopColor: "transparent" }} />
    </div>
  );
}

/* ─── Toggle switch ─── */
export function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0"
      style={{ background: value ? "var(--forest-bg)" : "#e2e8f0" }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
        style={{ right: value ? "2px" : "auto", left: value ? "auto" : "2px" }}
      />
    </button>
  );
}

/* ─── Toast ─── */
export type ToastState = { message: string; type: "success" | "error" };

export function Toast({ message, type, onDone }: ToastState & { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-20 lg:bottom-6 left-4 lg:left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[13px] font-medium"
      style={{ background: type === "success" ? "var(--forest-bg)" : "#dc2626", color: "#fff", minWidth: 200, maxWidth: "calc(100vw - 48px)" }}
    >
      {type === "success" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
    </div>
  );
}

/* ─── Icon button ─── */
export function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title?: string; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
      style={{ color: danger ? "#ef4444" : "var(--text-light)", background: "transparent" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? "#fef2f2" : "var(--forest-pale)"; (e.currentTarget as HTMLElement).style.color = danger ? "#dc2626" : "var(--forest-mid)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = danger ? "#ef4444" : "var(--text-light)"; }}
    >
      {children}
    </button>
  );
}

/* ─── Confirm delete dialog ─── */
export function ConfirmDialog({
  name, onConfirm, onCancel, loading,
}: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div onClick={onCancel} className="absolute inset-0" style={{ background: "rgba(28,58,26,0.45)", backdropFilter: "blur(4px)" }} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" style={{ background: "#fff" }}>
        <div className="p-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#fef2f2" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
            </svg>
          </div>
          <h3 className="text-[18px] mb-1" style={{ color: "#1a2810" }}>تأكيد الحذف</h3>
          <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
            سيتم حذف <span className="font-semibold" style={{ color: "#1a2810" }}>{name}</span> نهائياً ولا يمكن التراجع.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border transition-opacity hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "#dc2626", color: "#fff" }}
            >
              {loading ? "جاري الحذف..." : "حذف"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Form styling shared by the full-page editors ─── */
export const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none border border-[#dfe4dc] transition-[border-color,box-shadow] placeholder:text-[#9aa894] focus:border-[var(--forest-light)] focus:shadow-[0_0_0_3px_rgba(77,124,31,0.10)]";
export const inputStyle = { background: "#fff", color: "var(--text-dark)" };
export const numberClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
export const labelClass = "block text-[13px] font-semibold mb-1.5";
export const labelStyle = { color: "var(--text-dark)" };

export function FormCard({ title, hint, icon, action, children }: { title: string; hint?: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-5 sm:p-6" style={{ background: "#fff", borderColor: "#e6eae3", boxShadow: "0 1px 2px rgba(28,58,26,0.04)" }}>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--text-dark)" }}>{title}</h2>
            {hint && <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{hint}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ─── Dropdown (replaces native <select>) ─── */
export type SelectOption = { value: string; label: string; image?: string | null; hint?: string };

export function Select({
  value, onChange, options, placeholder = "اختاري...", searchable = false, compact = false, className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected  = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey  = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, searchable]);

  const q = query.trim();
  const visible = q ? options.filter(o => o.label.includes(q)) : options;
  const toggle = () => { setOpen(o => !o); setQuery(""); };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center gap-2.5 rounded-xl text-right transition-colors ${compact ? "px-3 py-2 text-[13px]" : "px-3.5 py-2.5 text-[14px]"}`}
        style={{
          background: "#fff",
          border: open ? "1.5px solid var(--forest-light)" : "1px solid #dfe4dc",
          boxShadow: open ? "0 0 0 3px rgba(77,124,31,0.10)" : "none",
          color: selected ? "var(--text-dark)" : "var(--text-light)",
        }}
      >
        {selected?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.image} alt="" className="w-6 h-6 rounded-md object-contain shrink-0" style={{ background: "#f4f5f2" }} />
        )}
        <span className="flex-1 truncate">{selected?.label ?? placeholder}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"
          style={{ color: "var(--text-light)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 inset-x-0 rounded-xl overflow-hidden shadow-xl"
          style={{ background: "#fff", border: "1px solid #dfe4dc", minWidth: 220 }}>
          {searchable && (
            <div className="p-2" style={{ borderBottom: "1px solid #eef0ec" }}>
              <div className="flex items-center gap-2 px-2.5 rounded-lg" style={{ background: "#f6f7f4" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" style={{ color: "var(--text-light)" }}>
                  <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M20 20l-3.5-3.5" />
                </svg>
                <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث..."
                  className="flex-1 bg-transparent outline-none py-2 text-[13.5px]" style={{ color: "var(--text-dark)" }} />
              </div>
            </div>
          )}
          <ul role="listbox" className="max-h-72 overflow-y-auto py-1" data-lenis-prevent>
            {visible.length === 0 && (
              <li className="px-3.5 py-3 text-[13px] text-center" style={{ color: "var(--text-light)" }}>لا توجد نتائج</li>
            )}
            {visible.map(o => {
              const active = o.value === value;
              return (
                <li key={o.value || "__empty"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-right text-[13.5px] transition-colors hover:bg-[#f2f6ee]"
                    style={{ background: active ? "var(--forest-pale)" : undefined, color: o.value ? "var(--text-dark)" : "var(--text-muted)", fontWeight: active ? 600 : 400 }}
                  >
                    {o.image !== undefined && (
                      o.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={o.image} alt="" className="w-8 h-8 rounded-lg object-contain shrink-0" style={{ background: "#f4f5f2" }} />
                        : <span className="w-8 h-8 rounded-lg shrink-0" style={{ background: "#f4f5f2" }} />
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{o.label}</span>
                      {o.hint && <span className="block text-[11.5px] truncate" style={{ color: "var(--text-light)" }}>{o.hint}</span>}
                    </span>
                    {active && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0" style={{ color: "var(--forest)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Page header used by every admin page ─── */
export function PageHeader({ title, subtitle, actions, backHref }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode; backHref?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link href={backHref} aria-label="رجوع"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-opacity hover:opacity-60"
            style={{ borderColor: "var(--border-mid)", color: "var(--text-2)", background: "transparent" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M9 18l6-6-6-6" /></svg>
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-tight" style={{ color: "#16231a" }}>{title}</h1>
          {subtitle && <p className="text-[13.5px] mt-1 truncate" style={{ color: "#66735f" }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export const primaryBtn = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[#1c3a1a] hover:bg-[#2d5a0e] transition-colors disabled:opacity-60";
export const secondaryBtn = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium border border-[#dfe4dc] bg-white text-[#16231a] hover:bg-[#f2f5f0] transition-colors";

/* ─── Textarea that grows with its content (no inner scrollbar) ─── */
export function AutoTextarea({ value, onChange, className = "", style, minRows = 2, ...rest }:
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    minRows?: number;
  }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea ref={ref} rows={minRows} value={value} onChange={onChange}
      className={`${className} resize-none overflow-hidden leading-7`} style={style} {...rest} />
  );
}
