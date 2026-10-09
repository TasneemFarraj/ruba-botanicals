"use client";

import type { Order } from "../../_types";

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** The store opened in October 2026 — no earlier months are shown */
const LAUNCH = { year: 2026, month: 9 };
const MAX_MONTHS = 12;

const net = (o: Order) => Number(o.subtotal ?? (o.total - (o.delivery_fee ?? 0)));

/** Completed ("تم") orders grouped by the month they were placed, from launch (max 12 months), newest first */
export function monthlySales(orders: Order[], now = new Date()) {
  const span = (now.getFullYear() - LAUNCH.year) * 12 + (now.getMonth() - LAUNCH.month) + 1;
  const rows = Array.from({ length: Math.min(Math.max(span, 1), MAX_MONTHS) }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth(), count: 0, total: 0, net: 0 };
  });
  const index = new Map(rows.map((r, i) => [`${r.year}-${r.month}`, i]));
  for (const o of orders) {
    if (o.status !== "done") continue;
    const d = new Date(o.created_at);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i === undefined) continue;
    rows[i].count += 1;
    rows[i].total += Number(o.total) || 0;
    rows[i].net   += net(o) || 0;
  }
  return rows;
}

/** Number + "د.أ" laid out right-to-left like the rest of the site ("155.00 د.أ") */
function Money({ value, size = 15, unitSize = 12, className = "", color }: { value: number; size?: number; unitSize?: number; className?: string; color?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1 whitespace-nowrap ${className}`} style={{ color }}>
      <span className="tabular-nums" style={{ fontSize: size }}>{value.toFixed(2)}</span>
      <span className="font-normal" style={{ fontSize: unitSize, opacity: 0.75 }}>د.أ</span>
    </span>
  );
}

export default function SalesReport({ orders }: { orders: Order[] }) {
  const rows     = monthlySales(orders);
  const total    = rows.reduce((s, r) => s + r.total, 0);
  const netSum   = rows.reduce((s, r) => s + r.net, 0);
  const count    = rows.reduce((s, r) => s + r.count, 0);
  const delivery = total - netSum;
  const average  = count ? netSum / count : 0;
  const best     = Math.max(...rows.map(r => r.net), 0);

  return (
    <div className="max-w-5xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "var(--forest)" }}>المبيعات الشهرية</h2>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
          الطلبات المكتملة (تم) فقط
        </p>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Net sales — the headline number */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-6 sm:p-7"
          style={{ background: "linear-gradient(135deg, #254a22 0%, #1c3a1a 55%, #162f14 100%)", color: "#fff" }}>
          <svg viewBox="0 0 64 80" fill="none" aria-hidden="true" className="absolute -left-4 -bottom-6 w-40 h-48" style={{ opacity: 0.08 }}>
            <path d="M32 72 C32 72 30 50 32 28" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="#fff" />
            <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="#fff" />
            <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="#fff" />
            <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="#fff" />
          </svg>
          <p className="text-[13.5px] font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>إجمالي المبيعات (بدون التوصيل)</p>
          <Money value={netSum} size={42} unitSize={16} className="mt-1" />

          <div className="relative grid grid-cols-1 min-[420px]:grid-cols-3 gap-2.5 mt-6">
            {[
              { label: "شامل التوصيل", value: total },
              { label: "رسوم التوصيل", value: delivery },
              { label: "متوسط الطلب",  value: average },
            ].map(s => (
              <div key={s.label} className="rounded-2xl px-3.5 py-3" style={{ background: "rgba(255,255,255,0.09)" }}>
                <p className="text-[11.5px] mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</p>
                <Money value={s.value} size={16} unitSize={11} className="font-semibold" />
              </div>
            ))}
          </div>
        </div>

        {/* Order count */}
        <div className="rounded-3xl p-6 sm:p-7 border flex flex-col justify-between gap-6" style={{ background: "#fff", borderColor: "#e6eae3" }}>
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-medium" style={{ color: "var(--text-muted)" }}>الطلبات المكتملة</p>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gold-pale)", color: "var(--gold)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-[44px] leading-none tabular-nums" style={{ color: "var(--text-dark)" }}>{count}</p>
            <p className="text-[12.5px] mt-2" style={{ color: "var(--text-muted)" }}>طلب منذ الافتتاح</p>
          </div>
        </div>
      </div>

      {/* ── Monthly breakdown ── */}
      <div className="rounded-3xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e6eae3" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #eef0ec" }}>
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text-dark)" }}>التفصيل الشهري</h3>
          <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>الأحدث أولاً</span>
        </div>

        <ul>
          {rows.map((r, i) => {
            const pct = best ? (r.net / best) * 100 : 0;
            return (
              <li key={`${r.year}-${r.month}`} className="px-6 py-5 grid grid-cols-[1fr_auto] sm:grid-cols-[180px_1fr_auto] items-center gap-x-6 gap-y-3"
                style={{ borderTop: i > 0 ? "1px solid #eef0ec" : "none" }}>
                {/* Month */}
                <div>
                  <p className="text-[15px] font-bold" style={{ color: "var(--text-dark)" }}>
                    {MONTHS_AR[r.month]} <span className="font-medium" style={{ color: "var(--text-muted)" }}>{r.year}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{r.count} {r.count === 1 ? "طلب" : "طلبات"}</span>
                    {i === 0 && (
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>
                        الشهر الحالي
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar (relative to the best month) */}
                <div className="hidden sm:block h-2.5 rounded-full overflow-hidden" style={{ background: "#f0f2ee" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--forest-light), var(--forest-mid))", marginInlineStart: 0 }} />
                </div>

                {/* Amounts */}
                <div className="text-left">
                  <Money value={r.net} size={18} className="font-bold" color={r.count ? "var(--forest)" : "var(--text-light)"} />
                  <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    شامل التوصيل <Money value={r.total} size={11.5} unitSize={10} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
