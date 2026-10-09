"use client";

import { useState } from "react";
import type { Order } from "../_types";
import { waLink } from "../_lib/utils";
import { supabase } from "../_lib/supabase";
import EmptyState from "../_components/shared/EmptyState";
import { useAdmin } from "./_components/AdminApp";
import { Spinner, PageHeader } from "./_components/ui";

type OrdersView = "active" | "postponed" | "archive";

/* ─── Status config ─── */
const STATUS_CONFIG: Record<Order["status"], { label: string; bg: string; color: string }> = {
  pending:   { label: "جديد",  bg: "#fef3c7", color: "#92400e" },
  postponed: { label: "مؤجلة", bg: "#ede9fe", color: "#5b21b6" },
  done:      { label: "تم",    bg: "#d1fae5", color: "#065f46" },
};

const STATUS_OPTIONS: { value: Order["status"]; label: string; icon: React.ReactNode }[] = [
  {
    value: "pending", label: "جديد",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l3.5 2" /></svg>),
  },
  {
    value: "postponed", label: "مؤجلة",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>),
  },
  {
    value: "done", label: "تم",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>),
  },
];

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: Order["status"] }) {
  // Fallback covers legacy values (e.g. "ready") until the DB migration runs
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

/* ─── Order totals: products (without delivery) / delivery / total ─── */
const orderSubtotal = (o: Order) => Number(o.subtotal ?? (o.total - (o.delivery_fee ?? 0)));

function OrderTotals({ order }: { order: Order }) {
  const cells = [
    { label: "المنتجات", value: orderSubtotal(order) },
    { label: "التوصيل",  value: Number(order.delivery_fee ?? 0) },
    { label: "الإجمالي", value: Number(order.total), strong: true },
  ];
  return (
    <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {cells.map((c, i) => (
        <div key={c.label} className="px-2.5 py-1.5 text-center"
          style={{ background: c.strong ? "var(--forest-pale)" : "#fff", borderRight: i > 0 ? "1px solid var(--border)" : "none" }}>
          <p className="text-[10.5px]" style={{ color: "var(--text-muted)" }}>{c.label}</p>
          <p className="text-[12.5px] tabular-nums whitespace-nowrap" dir="ltr"
            style={{ color: c.strong ? "var(--forest)" : "var(--text-dark)", fontWeight: c.strong ? 700 : 500 }}>
            {c.value.toFixed(2)} <span className="text-[10px] font-normal">د.أ</span>
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Copy full order (to send to the customer / delivery) ─── */
const ORDER_COPY_TITLE = "🌿 Ruba Botanicals | ربى فرّاج 🌿";

/* Lines starting with BOLD: <b> in the HTML copy (Word / Docs), bold Unicode digits in plain text (WhatsApp) */
const BOLD = "\u0000b";
const boldDigits = (s: string) => s.replace(/\d/g, d => String.fromCodePoint(0x1D7EC + Number(d)));

function buildOrderLines(order: Order) {
  const money = (n: number) => `${n.toFixed(2)} د.أ`;
  const line = "━━━━━━━━━━━━";
  const address = [order.governorate, order.area, order.street_address].filter(Boolean).join("، ");
  const subtotal = order.subtotal ?? (order.total - (order.delivery_fee ?? 0));

  return [
    ORDER_COPY_TITLE,
    line,
    `الاسم: ${order.customer_name.trim()}`,
    `الهاتف: ${order.customer_phone}`,
    order.customer_phone2 && `رقم احتياطي: ${order.customer_phone2}`,
    address && `العنوان: ${address}`,
    `${BOLD}المبلغ المطلوب: ${money(order.total)}`,
    line,
    "الطلب:",
    ...order.items.map(i => `• ${i.name_ar} × ${i.quantity} = ${money(i.price * i.quantity)}`),
    line,
    `المنتجات: ${money(subtotal)}`,
    (order.delivery_fee ?? 0) > 0 && `التوصيل: ${money(order.delivery_fee ?? 0)}`,
    `${BOLD}الإجمالي: ${money(order.total)}`,
    order.notes && `ملاحظات: ${order.notes}`,
  ].filter((l): l is string => Boolean(l));
}

function buildOrderText(order: Order) {
  return buildOrderLines(order)
    .map(l => l.startsWith(BOLD) ? boldDigits(l.slice(BOLD.length)) : l)
    .join("\n");
}

function buildOrderHtml(order: Order) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = buildOrderLines(order)
    .map(l => l.startsWith(BOLD) ? `<b>${esc(l.slice(BOLD.length))}</b>` : esc(l))
    .join("<br>");
  return `<div dir="rtl">${body}</div>`;
}

function CopyOrderButton({ order, withLabel }: { order: Order; withLabel?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const text = buildOrderText(order);
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        // Plain text for WhatsApp, HTML so bold survives when pasted into a document for printing
        await navigator.clipboard.write([new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html":  new Blob([buildOrderHtml(order)], { type: "text/html" }),
        })]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[CopyOrderButton]", err);
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="نسخ تفاصيل الطلب"
      className={`inline-flex items-center justify-center gap-1 rounded-lg transition-opacity hover:opacity-70 ${withLabel ? "px-2 py-1 text-[11px] font-medium" : "w-7 h-7"}`}
      style={{ background: copied ? "#dcfce7" : "var(--forest-pale)", color: copied ? "#16a34a" : "var(--forest-mid)" }}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
      )}
      {withLabel && (copied ? "تم النسخ" : "نسخ الطلب")}
    </button>
  );
}

/* ─── Confirm status move (archive / restore) ─── */
type StatusMove = { order: Order; to: "done" | "pending" };

function ConfirmMoveDialog({
  move, onConfirm, onCancel, loading,
}: { move: StatusMove; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  const toArchive = move.to === "done";
  const tint = STATUS_CONFIG[move.to];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div onClick={onCancel} className="absolute inset-0" style={{ background: "rgba(28,58,26,0.45)", backdropFilter: "blur(4px)" }} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" style={{ background: "#fff" }}>
        <div className="p-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: tint.bg }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={tint.color} strokeWidth="1.8" className="w-5 h-5">
              {toArchive
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4M5 7v11a2 2 0 002 2h10a2 2 0 002-2V7M9 4h6M10 12h4" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3" />}
            </svg>
          </div>
          <h3 className="text-[18px] mb-1" style={{ color: "#1a2810" }}>
            {toArchive ? "هل تريدين نقل هذا الطلب للأرشيف؟" : "إرجاع هذا الطلب للطلبات النشطة؟"}
          </h3>
          <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
            طلب <span className="font-semibold mx-1" style={{ color: "#1a2810" }}>{move.order.customer_name.trim()}</span>
            {toArchive ? " سيُنقل إلى الأرشيف بحالة \"تم\"." : " سيرجع إلى الطلبات بحالة \"جديد\"."}
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
              style={{ background: "var(--forest-bg)", color: "#fff" }}
            >
              {loading ? "جاري النقل..." : toArchive ? "تأكيد" : "إرجاع"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Orders page ─── */
export default function OrdersPage() {
  const { orders, setOrders, ordersLoading, toast } = useAdmin();
  const [expandedOrder,   setExpandedOrder]   = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [ordersView,      setOrdersView]      = useState<OrdersView>("active");
  const [confirmMove,     setConfirmMove]     = useState<StatusMove | null>(null);
  const [moveLoading,     setMoveLoading]     = useState(false);

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      console.error("[updateOrderStatus]", error);
      toast("تعذّر تحديث حالة الطلب", "error");
      return false;
    }
    let completed_at: string | null = null;
    if (status === "done") {
      // Best-effort: requires the completed_at column (see supabase/migrations)
      completed_at = new Date().toISOString();
      const { error: tsError } = await supabase.from("orders").update({ completed_at }).eq("id", id);
      if (tsError) { console.warn("[updateOrderStatus] completed_at not saved", tsError); completed_at = null; }
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, ...(status === "done" ? { completed_at } : {}) } : o));
    return true;
  };

  /* "تم" moves the order to the archive — ask first */
  const handleStatusClick = async (order: Order, status: Order["status"]) => {
    if (status === order.status) return;
    if (status === "done") { setConfirmMove({ order, to: "done" }); return; }
    const ok = await updateOrderStatus(order.id, status);
    if (ok && status === "postponed") toast("تم نقل الطلب للمؤجلة");
    if (ok && order.status === "postponed") toast("تم إرجاع الطلب للطلبات");
  };

  const handleConfirmMove = async () => {
    if (!confirmMove) return;
    const { order, to } = confirmMove;
    setMoveLoading(true);
    const ok = await updateOrderStatus(order.id, to);
    setMoveLoading(false);
    setConfirmMove(null);
    if (ok) {
      if (expandedOrder === order.id) setExpandedOrder(null);
      toast(to === "done" ? "تم نقل الطلب للأرشيف" : "تم إرجاع الطلب للطلبات");
    }
  };

  const copyAddress = (order: Order) => {
    const parts = [order.governorate, order.area, order.street_address].filter(Boolean);
    navigator.clipboard.writeText(parts.join(" — "));
    setCopiedAddressId(order.id);
    setTimeout(() => setCopiedAddressId(null), 2000);
  };

  const todayCount = orders.filter(o => {
    const d = new Date(o.created_at);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }).length;

  const doneOrders     = orders.filter(o => o.status === "done");
  const totalSales     = doneOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalSalesNet  = doneOrders.reduce((sum, o) => sum + orderSubtotal(o), 0); // without delivery

  const formatDate = (s: string) => {
    const d = new Date(s);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const h   = d.getHours();
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h % 12 || 12}:${min} ${h >= 12 ? "PM" : "AM"}`;
  };

  // Anything not postponed/done counts as active, so legacy statuses never disappear from view
  const activeOrders    = orders.filter(o => o.status !== "done" && o.status !== "postponed");
  const postponedOrders = orders.filter(o => o.status === "postponed");
  const listOrders      = ordersView === "postponed" ? postponedOrders : activeOrders;
  const archivedOrders  = doneOrders
    .slice()
    .sort((a, b) => (b.completed_at ?? b.created_at).localeCompare(a.completed_at ?? a.created_at));

  return (
    <div>
      <PageHeader
        title="الطلبات"
        subtitle={new Date().toLocaleDateString("ar-JO-u-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      />

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {([
                  {
                    label: "إجمالي الطلبات",
                    value: orders.length,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    ),
                    accent: "var(--forest)",
                    pale: "var(--forest-pale)",
                  },
                  {
                    label: "طلبات اليوم",
                    value: todayCount,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                      </svg>
                    ),
                    accent: "#1e40af",
                    pale: "#eff6ff",
                  },
                  {
                    label: "إجمالي المبيعات",
                    value: `${totalSalesNet.toFixed(2)} د.أ`,
                    sub: `بدون التوصيل · شامل التوصيل: ${totalSales.toFixed(2)} د.أ`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ),
                    accent: "var(--gold)",
                    pale: "var(--gold-light)",
                  },
                ] as { label: string; value: string | number; sub?: string; icon: React.ReactNode; accent: string; pale: string }[]).map(stat => (
                  <div key={stat.label} className="rounded-2xl p-5 border flex items-center gap-4"
                    style={{ background: "#fff", borderColor: "var(--border)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: stat.pale, color: stat.accent }}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--text-light)" }}>{stat.label}</p>
                      <p className="text-xl font-semibold" style={{ color: stat.accent }}>
                        {stat.value}
                      </p>
                      {stat.sub && (
                        <p className="text-[12px] mt-0.5 tabular-nums" style={{ color: "var(--text-muted)" }}>{stat.sub}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active / postponed / archive tabs */}
              <div className="flex gap-1 mb-5 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
                {([
                  { id: "active"    as OrdersView, label: "الطلبات", count: activeOrders.length },
                  { id: "postponed" as OrdersView, label: "مؤجلة",   count: postponedOrders.length },
                  { id: "archive"   as OrdersView, label: "الأرشيف", count: archivedOrders.length },
                ]).map(t => {
                  const active = ordersView === t.id;
                  return (
                    <button key={t.id} onClick={() => { setOrdersView(t.id); setExpandedOrder(null); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-[13px] -mb-px transition-colors whitespace-nowrap"
                      style={{
                        color: active ? "var(--forest-bg)" : "var(--text-muted)",
                        fontWeight: active ? 600 : 400,
                        borderBottom: active ? "2px solid var(--forest-bg)" : "2px solid transparent",
                      }}>
                      {t.label}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                        style={{ background: active ? "var(--forest-bg)" : "#eef0ec", color: active ? "#fff" : "var(--text-light)" }}>
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Archive (read-only, can be restored) ── */}
              {ordersView === "archive" && (ordersLoading ? <Spinner /> : archivedOrders.length === 0 ? (
                <EmptyState title="الأرشيف فارغ" subtitle="الطلبات المكتملة ستظهر هنا" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {archivedOrders.map(order => {
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <div key={order.id} className="rounded-2xl border overflow-hidden"
                        style={{ background: "#fff", borderColor: "var(--border)" }}>
                        <div className="px-4 py-3" onClick={() => setExpandedOrder(isExpanded ? null : order.id)} style={{ cursor: "pointer" }}>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-semibold text-[14px]" style={{ color: "#1a2810" }}>{order.customer_name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-baseline gap-1">
                                <span className="text-[16px]" style={{ color: "var(--text-dark)" }}>{order.total}</span>
                                <span className="text-[11px]" style={{ color: "var(--text-light)" }}>د.أ</span>
                              </div>
                              <CopyOrderButton order={order} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: "var(--text-light)" }}>
                            <span dir="ltr" style={{ fontVariantNumeric: "tabular-nums" }}>{order.customer_phone}</span>
                            <span>{order.items.length} {order.items.length === 1 ? "منتج" : "منتجات"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                            <StatusBadge status={order.status} />
                            <span style={{ color: "var(--text-light)" }}>
                              {order.completed_at ? "اكتمل في" : "تاريخ الطلب"}
                            </span>
                            <span dir="ltr" style={{ color: "var(--text-muted)" }}>
                              {formatDate(order.completed_at ?? order.created_at)}
                            </span>
                          </div>
                          <div className="mt-2.5"><OrderTotals order={order} /></div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 py-3 space-y-1" style={{ borderTop: "1px solid var(--border)", background: "#f9f8f6" }}>
                            {order.items.map((item, j) => (
                              <div key={j} className="flex items-center justify-between text-[12px]">
                                <span style={{ color: "#1a2810" }}>{item.name_ar}</span>
                                <span dir="ltr" style={{ color: "var(--text-muted)" }}>{item.price.toFixed(2)} × {item.quantity}</span>
                              </div>
                            ))}
                            {(order.governorate || order.area || order.street_address) && (
                              <p className="text-[11px] pt-1.5" style={{ color: "var(--text-muted)" }}>
                                {[order.governorate, order.area, order.street_address].filter(Boolean).join("، ")}
                              </p>
                            )}
                            {order.customer_phone2 && (
                              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                رقم احتياطي: <span dir="ltr">{order.customer_phone2}</span>
                              </p>
                            )}
                            {order.completed_at && (
                              <p className="text-[11px]" style={{ color: "var(--text-light)" }}>
                                تاريخ الطلب: <span dir="ltr">{formatDate(order.created_at)}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Restore to active orders */}
                        <div className="px-4 py-2 flex justify-end" style={{ borderTop: "1px solid var(--border)", background: "#fcfcfb" }}>
                          <button
                            onClick={() => setConfirmMove({ order, to: "pending" })}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-opacity hover:opacity-70"
                            style={{ background: STATUS_CONFIG.pending.bg, color: STATUS_CONFIG.pending.color }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3" />
                            </svg>
                            إرجاع للطلبات
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* ── Active / postponed orders (collapsed rows, click to expand) ── */}
              {ordersView !== "archive" && (ordersLoading ? <Spinner /> : listOrders.length === 0 ? (
                ordersView === "postponed"
                  ? <EmptyState title="لا توجد طلبات مؤجلة" subtitle="الطلبات المؤجلة ستظهر هنا" />
                  : <EmptyState title="لا توجد طلبات" subtitle="ستظهر الطلبات هنا فور وصولها" />
              ) : (
                <>
                <div className="hidden md:block rounded-2xl overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "#f9f8f6", borderBottom: "1px solid var(--border)" }}>
                        {[
                          { label: "العميل" },
                          { label: "الهاتف" },
                          { label: "التاريخ",  center: true },
                          { label: "المبلغ" },
                          { label: "الحالة",   center: true },
                          { label: "", slim: true },
                          { label: "", slim: true },
                        ].map((h, i) => (
                          <th key={i}
                            className={`px-4 py-3 text-[11px] font-semibold ${h.slim ? "w-10" : ""} ${h.center ? "text-center" : "text-right"}`}
                            style={{ color: "var(--text-light)", whiteSpace: "nowrap" }}>
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {listOrders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      const [datePart, timePart] = formatDate(order.created_at).split(", ");

                      return (
                        <tbody key={order.id}>
                          <tr
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            style={{
                              background: isExpanded ? "#f9f8f6" : "#fff",
                              borderBottom: isExpanded ? "none" : "1px solid var(--border)",
                              cursor: "pointer",
                            }}
                            onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "#fafaf9"; }}
                            onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                          >
                            {/* Customer name */}
                            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                              <span className="text-[13.5px] font-semibold" style={{ color: "#1a2810" }}>
                                {order.customer_name}
                              </span>
                            </td>

                            {/* Phone */}
                            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[12px]" dir="ltr" style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                  {order.customer_phone}
                                </span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 shrink-0" style={{ color: "var(--text-light)" }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                            </td>

                            {/* Date — single line */}
                            <td className="px-4 py-3.5 align-middle whitespace-nowrap text-center" dir="ltr">
                              <span className="text-[12px] font-medium" style={{ color: "#1a2810" }}>{datePart}</span>
                              <span className="text-[11px] mx-1" style={{ color: "var(--text-light)" }}>•</span>
                              <span className="text-[11px]" style={{ color: "var(--text-light)" }}>{timePart}</span>
                            </td>

                            {/* Total */}
                            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                              <div className="flex items-baseline gap-1.5">
                                <span style={{ fontSize: 17, fontWeight: 600, color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
                                  {order.total}
                                </span>
                                <span className="text-[11px]" style={{ color: "var(--text-light)" }}>د.أ</span>
                                <span className="text-[10px]" style={{ color: "var(--text-light)" }}>
                                  · {order.items.length} {order.items.length === 1 ? "منتج" : "منتجات"}
                                </span>
                              </div>
                              <div className="text-[11px] mt-0.5 tabular-nums" style={{ color: "var(--text-muted)" }}>
                                المنتجات: {orderSubtotal(order).toFixed(2)} · التوصيل: {Number(order.delivery_fee ?? 0).toFixed(2)}
                              </div>
                            </td>

                            {/* Status — segmented buttons with icons */}
                            <td className="px-4 py-3 align-middle text-center" onClick={e => e.stopPropagation()}>
                              <div className="inline-flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", fontSize: 11 }}>
                                {STATUS_OPTIONS.map((opt, idx) => {
                                  const isActive = order.status === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      onClick={() => handleStatusClick(order, opt.value)}
                                      className="flex items-center gap-1"
                                      style={{
                                        padding: "5px 9px",
                                        fontWeight: isActive ? 600 : 400,
                                        background: isActive ? STATUS_CONFIG[opt.value].bg : "transparent",
                                        color: isActive ? STATUS_CONFIG[opt.value].color : "var(--text-light)",
                                        borderLeft: idx > 0 ? "1px solid var(--border)" : "none",
                                        transition: "background 0.15s, color 0.15s",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {opt.icon}
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Copy order + WhatsApp */}
                            <td className="px-2 py-3 align-middle text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="inline-flex items-center gap-1.5">
                              <CopyOrderButton order={order} />
                              <a
                                href={waLink(order.customer_phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`واتساب — ${order.customer_phone}`}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-opacity hover:opacity-70"
                                style={{ background: "#e8faf0", color: "#25d366" }}
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                              </a>
                              </div>
                            </td>

                            {/* Expand arrow — leftmost */}
                            <td className="px-3 py-3 align-middle" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-60"
                                title="تفاصيل الطلب"
                                style={{
                                  color: isExpanded ? "var(--forest)" : "var(--text-light)",
                                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s, opacity 0.15s",
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                                </svg>
                              </button>
                            </td>
                          </tr>

                          {/* Expanded rows — one per item */}
                          {isExpanded && (
                            <>
                              {order.items.map((item, j) => (
                                <tr key={`item-${order.id}-${j}`}
                                  style={{ background: "#f9f8f6", borderBottom: "1px solid #e8e5e0" }}>
                                  {/* name → under العميل */}
                                  <td className="px-4 py-2 align-middle">
                                    <span className="text-[12.5px]" style={{ color: "var(--text-dark)" }}>{item.name_ar}</span>
                                  </td>
                                  {/* phone col */}
                                  <td />
                                  {/* date col */}
                                  <td />
                                  {/* total col */}
                                  <td />
                                  {/* calculation → under الحالة */}
                                  <td className="px-4 py-2 align-middle text-center">
                                    <span className="text-[12px] whitespace-nowrap" dir="ltr" style={{ color: "var(--text-muted)" }}>
                                      {item.price.toFixed(2)} × {item.quantity}
                                    </span>
                                  </td>
                                  {/* subtotal → under واتساب */}
                                  <td className="px-2 py-2 align-middle text-center">
                                    <div className="inline-flex items-baseline gap-1" dir="ltr">
                                      <span className="text-[13px] font-semibold" style={{ color: "var(--text-dark)" }}>
                                        {(item.price * item.quantity).toFixed(2)}
                                      </span>
                                      <span className="text-[10px]" style={{ color: "var(--text-light)" }}>د.أ</span>
                                    </div>
                                  </td>
                                  <td />
                                </tr>
                              ))}

                              {/* Details card row — address + pricing summary */}
                              <tr style={{ background: "#f7f6f3", borderTop: "1px solid #e0dbd3", borderBottom: "1px solid var(--border)" }}>
                                <td className="px-4 py-4 align-top" colSpan={7}>
                                  <div className="flex gap-3">

                                    {/* ── Delivery info ── */}
                                    <div className="flex-1 rounded-xl p-3" style={{ background: "#fff", border: "1px solid #ede8e0" }}>
                                      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2.5" style={{ color: "#c0b8a8" }}>
                                        معلومات التوصيل
                                      </p>
                                      <div className="flex flex-col gap-2">

                                        {/* Address */}
                                        {(order.governorate || order.area || order.street_address) && (
                                          <div className="flex items-start gap-2">
                                            <span className="text-[11px] shrink-0 mt-0.5 w-16" style={{ color: "#b0a898" }}>العنوان</span>
                                            <button
                                              onClick={() => copyAddress(order)}
                                              className="flex items-start gap-1.5 text-right transition-opacity hover:opacity-70 flex-1"
                                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                            >
                                              <span className="text-[12px] leading-snug" style={{ color: "#2a2218" }}>
                                                {[order.governorate, order.area, order.street_address].filter(Boolean).join("، ")}
                                              </span>
                                              {copiedAddressId === order.id ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="w-3 h-3 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                              ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#c0b8a8" }}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                                              )}
                                            </button>
                                          </div>
                                        )}

                                        {/* Backup phone */}
                                        {order.customer_phone2 && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-[11px] shrink-0 w-16" style={{ color: "#b0a898" }}>رقم احتياطي</span>
                                            <span className="text-[12px]" dir="ltr" style={{ color: "#4a4238" }}>{order.customer_phone2}</span>
                                          </div>
                                        )}

                                        {/* Notes */}
                                        {order.notes && (
                                          <div className="flex items-start gap-2">
                                            <span className="text-[11px] shrink-0 mt-0.5 w-16" style={{ color: "#b0a898" }}>ملاحظات</span>
                                            <span className="text-[12px] leading-snug" style={{ color: "#7a7068" }}>{order.notes}</span>
                                          </div>
                                        )}

                                      </div>
                                    </div>

                                    {/* ── Price summary ── */}
                                    <div className="w-44 shrink-0 rounded-xl p-3" style={{ background: "#fff", border: "1px solid #ede8e0" }}>
                                      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2.5" style={{ color: "#c0b8a8" }}>
                                        ملخص المبلغ
                                      </p>
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[11.5px]" style={{ color: "#a8a090" }}>المنتجات</span>
                                          <span className="text-[12.5px] tabular-nums" style={{ color: "#2a2218" }}>
                                            {orderSubtotal(order).toFixed(2)}{" "}
                                            <span className="text-[10px]" style={{ color: "#b0a898" }}>د.أ</span>
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[11.5px]" style={{ color: "#a8a090" }}>التوصيل</span>
                                          <span className="text-[12.5px] tabular-nums" style={{ color: "#2a2218" }}>
                                            {Number(order.delivery_fee ?? 0).toFixed(2)}{" "}
                                            <span className="text-[10px]" style={{ color: "#b0a898" }}>د.أ</span>
                                          </span>
                                        </div>
                                        <div
                                          className="flex justify-between items-baseline pt-2 mt-0.5"
                                          style={{ borderTop: "1px solid #ede8e0" }}
                                        >
                                          <span className="text-[12px] font-semibold" style={{ color: "#4a4238" }}>الإجمالي</span>
                                          <div className="flex items-baseline gap-1" dir="ltr">
                                            <span className="text-[17px] font-semibold" style={{ color: "var(--text-dark)" }}>{order.total}</span>
                                            <span className="text-[10.5px]" style={{ color: "#b0a898" }}>د.أ</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      );
                    })}
                  </table>
                </div>

                {/* ── Mobile / tablet cards ── */}
                <div className="md:hidden space-y-3">
                  {listOrders.map(order => {
                    const isExpanded = expandedOrder === order.id;
                    const [datePart, timePart] = formatDate(order.created_at).split(", ");
                    return (
                      <div key={order.id} className="rounded-2xl border overflow-hidden"
                        style={{ background: "#fff", borderColor: "var(--border)" }}>

                        {/* Top info — tap to expand */}
                        <div className="px-4 py-3"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          style={{ cursor: "pointer" }}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-semibold text-[14px]" style={{ color: "#1a2810" }}>
                              {order.customer_name}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-mono" dir="ltr" style={{ color: "var(--text-muted)" }}>
                              {order.customer_phone}
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[16px]" style={{ color: "var(--text-dark)" }}>
                                {order.total}
                              </span>
                              <span className="text-[11px]" style={{ color: "var(--text-light)" }}>د.أ</span>
                              <span className="text-[10px] mr-1" style={{ color: "var(--text-light)" }}>
                                · {order.items.length} {order.items.length === 1 ? "منتج" : "منتجات"}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] mt-1" dir="ltr" style={{ color: "var(--text-light)" }}>
                            {datePart} • {timePart}
                          </p>
                          <div className="mt-2.5"><OrderTotals order={order} /></div>
                        </div>

                        {/* Actions bar */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2"
                          style={{ borderTop: "1px solid var(--border)", background: "#f9f8f6" }}>
                          <div className="inline-flex rounded-xl overflow-hidden"
                            style={{ border: "1px solid var(--border)", fontSize: 11 }}>
                            {STATUS_OPTIONS.map((opt, idx) => {
                              const isActive = order.status === opt.value;
                              return (
                                <button key={opt.value}
                                  onClick={() => handleStatusClick(order, opt.value)}
                                  className="flex items-center gap-1"
                                  style={{ padding: "5px 9px", background: isActive ? STATUS_CONFIG[opt.value].bg : "transparent", color: isActive ? STATUS_CONFIG[opt.value].color : "var(--text-light)", fontWeight: isActive ? 600 : 400, borderLeft: idx > 0 ? "1px solid var(--border)" : "none", whiteSpace: "nowrap" }}>
                                  {opt.icon}{opt.label}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CopyOrderButton order={order} />
                            <a href={waLink(order.customer_phone)}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium"
                              style={{ background: "#e8faf0", color: "#15803d" }}>
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                              واتساب
                            </a>
                            <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg"
                              style={{ color: isExpanded ? "var(--forest)" : "var(--text-light)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Expanded items */}
                        {isExpanded && (
                          <div className="px-4 py-3 space-y-1.5"
                            style={{ borderTop: "1px solid var(--border)", background: "#fff" }}>
                            {order.items.map((item, j) => (
                              <div key={j} className="flex items-center justify-between py-1"
                                style={{ borderBottom: j < order.items.length - 1 ? "1px solid #f0ede8" : "none" }}>
                                <span className="text-[12px]" style={{ color: "#1a2810" }}>{item.name_ar}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: "#f5f4f0", color: "var(--text-light)" }}>×{item.quantity}</span>
                                  <span className="text-[12px] font-semibold" style={{ color: "var(--gold)" }} dir="ltr">{(item.price * item.quantity).toFixed(2)} د.أ</span>
                                </div>
                              </div>
                            ))}

                            {/* Address + phone2 + notes */}
                            {(order.governorate || order.area || order.street_address || order.customer_phone2 || order.notes) && (
                              <div className="rounded-lg p-3 space-y-1.5 mt-1" style={{ background: "#f7f8f5", border: "1px solid var(--border)" }}>
                                {(order.governorate || order.area || order.street_address) && (
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-semibold mb-0.5" style={{ color: "var(--text-light)" }}>عنوان التوصيل</p>
                                      <p className="text-[12px] leading-snug" style={{ color: "var(--text-dark)" }}>
                                        {[order.governorate, order.area, order.street_address].filter(Boolean).join(" — ")}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => copyAddress(order)}
                                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors shrink-0"
                                      style={{
                                        background: copiedAddressId === order.id ? "#dcfce7" : "var(--forest-pale)",
                                        color: copiedAddressId === order.id ? "#16a34a" : "var(--forest-mid)",
                                        whiteSpace: "nowrap",
                                        border: "none",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {copiedAddressId === order.id ? (
                                        <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>تم</>
                                      ) : (
                                        <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>نسخ</>
                                      )}
                                    </button>
                                  </div>
                                )}
                                {order.customer_phone2 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--text-light)" }}>رقم احتياطي:</span>
                                    <span className="text-[12px]" dir="ltr" style={{ color: "var(--text-muted)" }}>{order.customer_phone2}</span>
                                  </div>
                                )}
                                {order.notes && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-[10px] font-semibold shrink-0 mt-0.5" style={{ color: "var(--text-light)" }}>ملاحظات:</span>
                                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{order.notes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </>
              ))}

      {confirmMove && (
        <ConfirmMoveDialog
          move={confirmMove}
          loading={moveLoading}
          onConfirm={handleConfirmMove}
          onCancel={() => setConfirmMove(null)}
        />
      )}
    </div>
  );
}
