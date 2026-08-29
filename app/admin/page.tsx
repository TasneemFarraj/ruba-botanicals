"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase, deleteProduct } from "../_lib/supabase";
import type { Product, Category, Order } from "../_types";
import AdminLogin from "./AdminLogin";
import AdminProductForm from "./AdminProductForm";
import type { User } from "@supabase/supabase-js";

type Tab = "orders" | "products" | "categories";

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: Order["status"] }) {
  const config: Record<Order["status"], { label: string; bg: string; color: string }> = {
    pending:   { label: "جديد",  bg: "#fef3c7", color: "#92400e" },
    confirmed: { label: "مؤكد",  bg: "#dbeafe", color: "#1e40af" },
    done:      { label: "تم",    bg: "#d1fae5", color: "#065f46" },
  };
  const c = config[status];
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

/* ─── Toggle switch ─── */
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0"
      style={{ background: value ? "var(--forest-mid)" : "#d1d5db" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
        style={{ right: value ? "2px" : "auto", left: value ? "auto" : "2px" }}
      />
    </button>
  );
}

/* ─── Toast ─── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 left-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium animate-in"
      style={{ background: "var(--forest)", color: "#fff" }}
    >
      {message}
    </div>
  );
}

/* ─── Category form modal ─── */
function CategoryForm({
  category,
  onClose,
  onSuccess,
}: {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name_ar:    category?.name_ar   ?? "",
    slug:       category?.slug      ?? "",
    sort_order: String(category?.sort_order ?? 0),
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const inputStyle = {
    background: "#fff",
    border: "1px solid var(--border)",
    color: "var(--text-dark)",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim() || !form.slug.trim()) {
      setError("الاسم والـ slug مطلوبان");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        name_ar:    form.name_ar.trim(),
        slug:       form.slug.trim(),
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (category) {
        await supabase.from("categories").update(payload).eq("id", category.id);
      } else {
        await supabase.from("categories").insert([payload]);
      }
      onSuccess();
    } catch {
      setError("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0"
        style={{ background: "rgba(28,58,26,0.45)", backdropFilter: "blur(4px)" }} />
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl font-semibold" style={{ color: "var(--forest)" }}>
            {category ? "تعديل القسم" : "إضافة قسم جديد"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border text-sm transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            ✕
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                الاسم <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="text" required value={form.name_ar} placeholder="مثال: حناء شعر"
                onChange={e => setForm({ ...form, name_ar: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                الـ slug <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="text" required value={form.slug} dir="ltr" placeholder="henna-hair"
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>الترتيب</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.sort_order}
                placeholder="0"
                dir="ltr"
                onChange={e => setForm({ ...form, sort_order: e.target.value.replace(/\D/g, "") })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--forest)", color: "#fff" }}>
              {loading ? "جاري الحفظ..." : category ? "حفظ التعديلات" : "إضافة القسم"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Main admin page ─── */
export default function AdminPage() {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [toast, setToast] = useState("");

  /* Orders */
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  /* Products */
  const [products,         setProducts]         = useState<Product[]>([]);
  const [productsLoading,  setProductsLoading]  = useState(false);
  const [showProductForm,  setShowProductForm]  = useState(false);
  const [editProduct,      setEditProduct]      = useState<Product | null>(null);
  const [deleteProductId,  setDeleteProductId]  = useState<string | null>(null);

  /* Categories */
  const [categories,       setCategories]       = useState<Category[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategory,     setEditCategory]     = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  /* ─ Auth ─ */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ─ Data fetchers ─ */
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setOrdersLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setProducts(data ?? []);
    setProductsLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data ?? []);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
    fetchProducts();
    fetchCategories();
  }, [user, fetchOrders, fetchProducts, fetchCategories]);

  /* ─ Realtime orders ─ */
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        setToast("طلب جديد! 🌿");
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchOrders]);

  /* ─ Helpers ─ */
  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setDeleteProductId(null);
    fetchProducts();
  };

  const handleDeleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    setDeleteCategoryId(null);
    fetchCategories();
  };

  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name_ar ?? "—";

  const todayCount = orders.filter(o => {
    const d = new Date(o.created_at);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }).length;

  const totalSales = orders
    .filter(o => o.status === "done")
    .reduce((sum, o) => sum + o.total, 0);

  const formatDate = (s: string) => {
    const d = new Date(s);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const day   = d.getDate();
    const month = months[d.getMonth()];
    const year  = d.getFullYear();
    const h     = d.getHours();
    const min   = d.getMinutes().toString().padStart(2, "0");
    const ampm  = h >= 12 ? "PM" : "AM";
    const hour  = h % 12 || 12;
    return `${day} ${month} ${year}, ${hour}:${min} ${ampm}`;
  };

  const pendingCount = orders.filter(o => o.status === "pending").length;

  /* ─ Spinner ─ */
  const Spinner = () => (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
    </div>
  );

  /* ─ Loading / auth ─ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fff" }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!user) return <AdminLogin />;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "orders",     label: "الطلبات",  badge: pendingCount },
    { id: "products",   label: "المنتجات" },
    { id: "categories", label: "الأقسام" },
  ];

  const thStyle: React.CSSProperties = {
    color: "var(--text-light)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    fontSize: 11,
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl"
      style={{ background: "#ffffff", fontFamily: "var(--font-ibm), sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "#fff", borderColor: "var(--border)" }}>
        <div>
          <h1 className="font-display text-lg font-semibold" style={{ color: "var(--forest)" }}>
            لوحة التحكم — ربى للحناء
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-light)" }}>{user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}>
            عرض الموقع
          </a>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs px-4 py-2 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "var(--forest)", color: "#fff" }}>
            تسجيل خروج
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar (desktop) ── */}
        <aside className="w-52 shrink-0 border-l min-h-full hidden sm:block"
          style={{ background: "#f7f3ee", borderColor: "var(--border)" }}>
          <nav className="p-4 pt-6 space-y-1">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors text-right"
                  style={{
                    background: active ? "var(--forest)" : "transparent",
                    color: active ? "#fff" : "var(--text-muted)",
                  }}>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      style={{
                        background: active ? "rgba(255,255,255,0.25)" : "var(--forest)",
                        color: "#fff",
                      }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Mobile tab bar ── */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 flex border-t"
          style={{ background: "#f7f3ee", borderColor: "var(--border)" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 text-xs font-medium relative"
              style={{ color: activeTab === tab.id ? "var(--forest)" : "var(--text-light)" }}>
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-2 right-1/4 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 p-6 min-w-0 pb-20 sm:pb-6">

          {/* ════ Orders Tab ════ */}
          {activeTab === "orders" && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
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
                    value: `${totalSales.toFixed(2)} د.أ`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v1m0 8v1m-3.5-5.5c0-1.1.896-2 2-2h3a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h3c1.104 0 2-.9 2-2" />
                      </svg>
                    ),
                    accent: "var(--gold)",
                    pale: "var(--gold-light)",
                  },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-5 border flex items-center gap-4"
                    style={{ background: "#fff", borderColor: "var(--border)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: stat.pale, color: stat.accent }}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--text-light)" }}>{stat.label}</p>
                      <p className="font-display text-xl font-semibold" style={{ color: stat.accent }}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Orders table */}
              {ordersLoading ? <Spinner /> : orders.length === 0 ? (
                <div className="text-center py-20" style={{ color: "var(--text-light)" }}>
                  <p className="font-display text-3xl mb-2">لا توجد طلبات</p>
                  <p className="text-sm">ستظهر الطلبات هنا فور وصولها</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "#f9f8f6", borderBottom: "1px solid var(--border)" }}>
                        {["التاريخ", "العميل", "الإجمالي", "الحالة", ""].map(h => (
                          <th key={h} className="px-5 py-3 text-right text-[11px] font-semibold"
                            style={{ color: "var(--text-light)", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {orders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      const sc: Record<Order["status"], { bg: string; color: string; border: string }> = {
                        pending:   { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
                        confirmed: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
                        done:      { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
                      };
                      const s = sc[order.status];
                      const [datePart, timePart] = formatDate(order.created_at).split(", ");

                      return (
                        <tbody key={order.id}>
                          <tr
                            style={{
                              background: "#fff",
                              borderBottom: isExpanded ? "none" : "1px solid var(--border)",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fafaf9"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                          >
                            {/* Date */}
                            <td className="px-5 py-4 align-top">
                              <p className="text-[12px] font-medium whitespace-nowrap" style={{ color: "#1a2810" }}>
                                {datePart}
                              </p>
                              <p className="text-[11px] mt-0.5 whitespace-nowrap" style={{ color: "var(--text-light)" }}>
                                {timePart}
                              </p>
                            </td>

                            {/* Customer */}
                            <td className="px-5 py-4 align-top">
                              <p className="text-[13px] font-semibold" style={{ color: "#1a2810" }}>
                                {order.customer_name}
                              </p>
                              <p className="text-[11px] mt-0.5 font-mono" style={{ color: "var(--text-light)" }} dir="ltr">
                                {order.customer_phone}
                              </p>
                            </td>

                            {/* Total */}
                            <td className="px-5 py-4 align-top whitespace-nowrap">
                              <span className="text-[14px] font-semibold" style={{ color: "var(--gold)" }}>
                                {order.total}
                              </span>
                              <span className="text-[11px] mr-0.5" style={{ color: "var(--text-light)" }}>د.أ</span>
                              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-light)" }}>
                                {order.items.length} {order.items.length === 1 ? "منتج" : "منتجات"}
                              </p>
                            </td>

                            {/* Status select */}
                            <td className="px-5 py-4 align-top">
                              <select
                                value={order.status}
                                onChange={e => updateOrderStatus(order.id, e.target.value as Order["status"])}
                                className="text-[11px] font-semibold rounded-lg cursor-pointer outline-none"
                                style={{
                                  background: s.bg,
                                  color: s.color,
                                  border: `1px solid ${s.border}`,
                                  padding: "5px 10px",
                                }}
                              >
                                <option value="pending">جديد</option>
                                <option value="confirmed">مؤكد</option>
                                <option value="done">تم</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-center gap-3">
                                {/* WhatsApp */}
                                <a
                                  href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="واتساب"
                                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                                  style={{ background: "#25d366" }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1ebe5d"; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#25d366"; }}
                                >
                                  <svg viewBox="0 0 24 24" fill="#fff" className="w-3.5 h-3.5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                  </svg>
                                </a>

                                {/* Expand */}
                                <button
                                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                  className="flex items-center justify-center transition-all hover:opacity-60"
                                  style={{
                                    color: isExpanded ? "var(--forest)" : "var(--text-light)",
                                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s, opacity 0.15s",
                                  }}
                                  title="تفاصيل"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded panel — product chips */}
                          {isExpanded && (
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                              <td colSpan={5} className="px-5 pt-0 pb-4" style={{ background: "#fafaf9" }}>
                                <div className="flex flex-wrap gap-2 pt-3">
                                  {order.items.map((item, j) => (
                                    <div
                                      key={j}
                                      dir="rtl"
                                      className="flex items-center gap-2 rounded-xl px-3 py-2"
                                      style={{ background: "#fff", border: "1px solid var(--border)" }}
                                    >
                                      <span
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                        style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}
                                      >
                                        {item.quantity}
                                      </span>
                                      <span className="text-[12px]" style={{ color: "#1a2810" }}>{item.name_ar}</span>
                                      <span className="text-[12px] font-semibold" style={{ color: "var(--gold)" }}>
                                        {(item.price * item.quantity).toFixed(2)} د.أ
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                                  <span className="text-[11px]" style={{ color: "var(--text-light)" }}>الإجمالي</span>
                                  <span className="text-[13px] font-bold" style={{ color: "var(--forest)" }}>
                                    {order.total} د.أ
                                  </span>
                                  {order.notes && (
                                    <>
                                      <span style={{ color: "var(--border)" }}>·</span>
                                      <span className="text-[11px] italic" style={{ color: "#8aaa80" }}>
                                        {order.notes}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      );
                    })}
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════ Products Tab ════ */}
          {activeTab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--forest)" }}>
                  المنتجات
                </h2>
                <button
                  onClick={() => { setEditProduct(null); setShowProductForm(true); }}
                  className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-full transition-opacity hover:opacity-80"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  <span className="text-lg leading-none">+</span>
                  إضافة منتج
                </button>
              </div>

              {productsLoading ? <Spinner /> : products.length === 0 ? (
                <div className="text-center py-20" style={{ color: "var(--text-light)" }}>
                  <p className="font-display text-3xl mb-2">لا توجد منتجات</p>
                </div>
              ) : (
                <div className="rounded-2xl border" style={{ borderColor: "var(--border)", overflowX: "auto" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#f9f8f6", borderBottom: "1px solid var(--border)" }}>
                          {["صورة", "الاسم", "القسم", "السعر", "الأكثر مبيعاً", "متوفر", "إجراءات"].map(h => (
                            <th key={h} className="px-4 py-3 text-right text-xs" style={thStyle}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, i) => (
                          <tr key={product.id}
                            style={{
                              background: i % 2 === 0 ? "#fff" : "#fafaf9",
                              borderBottom: "1px solid var(--border)",
                            }}>
                            <td className="px-4 py-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                                style={{ background: "var(--cream)" }}>
                                {product.image_url ? (
                                  <Image src={product.image_url} alt={product.name_ar}
                                    width={40} height={40} className="object-contain w-full h-full p-1" />
                                ) : (
                                  <span className="text-xs" style={{ color: "var(--text-light)" }}>
                                    {product.name_ar.charAt(0)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-[160px]">
                              <p className="text-xs font-medium line-clamp-2 leading-snug"
                                style={{ color: "var(--text-dark)" }}>
                                {product.name_ar}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                                style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>
                                {getCategoryName(product.category_id)}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold whitespace-nowrap"
                              style={{ color: "var(--gold)" }}>
                              {product.price} د.أ
                            </td>
                            <td className="px-4 py-3">
                              <Toggle
                                value={product.is_best_seller}
                                onChange={async () => {
                                  const next = !product.is_best_seller;
                                  await supabase.from("products").update({ is_best_seller: next }).eq("id", product.id);
                                  setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_best_seller: next } : p));
                                }}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Toggle
                                value={product.in_stock}
                                onChange={async () => {
                                  const next = !product.in_stock;
                                  await supabase.from("products").update({ in_stock: next }).eq("id", product.id);
                                  setProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock: next } : p));
                                }}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setEditProduct(product); setShowProductForm(true); }}
                                  className="text-xs px-3 py-1.5 border rounded-full transition-opacity hover:opacity-70 whitespace-nowrap"
                                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                                  تعديل
                                </button>
                                {deleteProductId === product.id ? (
                                  <div className="flex gap-1.5">
                                    <button onClick={() => handleDeleteProduct(product.id)}
                                      className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-full whitespace-nowrap">
                                      تأكيد
                                    </button>
                                    <button onClick={() => setDeleteProductId(null)}
                                      className="text-xs px-2 py-1.5 border rounded-full"
                                      style={{ borderColor: "var(--border)" }}>
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => setDeleteProductId(product.id)}
                                    className="text-xs px-3 py-1.5 border border-red-200 text-red-400 rounded-full hover:border-red-400 whitespace-nowrap transition-colors">
                                    حذف
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              )}
            </div>
          )}

          {/* ════ Categories Tab ════ */}
          {activeTab === "categories" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--forest)" }}>
                  الأقسام
                </h2>
                <button
                  onClick={() => { setEditCategory(null); setShowCategoryForm(true); }}
                  className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-full transition-opacity hover:opacity-80"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  <span className="text-lg leading-none">+</span>
                  إضافة قسم
                </button>
              </div>

              <div className="rounded-2xl border" style={{ borderColor: "var(--border)", overflowX: "auto" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f9f8f6", borderBottom: "1px solid var(--border)" }}>
                      {["الاسم", "الـ slug", "الترتيب", "إجراءات"].map(h => (
                        <th key={h} className="px-4 py-3 text-right text-xs" style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-sm" style={{ color: "var(--text-light)" }}>
                          لا توجد أقسام
                        </td>
                      </tr>
                    ) : categories.map((cat, i) => (
                      <tr key={cat.id}
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#fafaf9",
                          borderBottom: "1px solid var(--border)",
                        }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-dark)" }}>{cat.name_ar}</td>
                        <td className="px-4 py-3 font-mono text-xs" dir="ltr" style={{ color: "var(--text-light)" }}>
                          {cat.slug}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{cat.sort_order}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditCategory(cat); setShowCategoryForm(true); }}
                              className="text-xs px-3 py-1.5 border rounded-full transition-opacity hover:opacity-70"
                              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                              تعديل
                            </button>
                            {deleteCategoryId === cat.id ? (
                              <div className="flex gap-1.5">
                                <button onClick={() => handleDeleteCategory(cat.id)}
                                  className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-full">
                                  تأكيد
                                </button>
                                <button onClick={() => setDeleteCategoryId(null)}
                                  className="text-xs px-2 py-1.5 border rounded-full"
                                  style={{ borderColor: "var(--border)" }}>
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteCategoryId(cat.id)}
                                className="text-xs px-3 py-1.5 border border-red-200 text-red-400 rounded-full hover:border-red-400 transition-colors">
                                حذف
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Modals ── */}
      {showProductForm && (
        <AdminProductForm
          product={editProduct}
          categories={categories}
          onClose={() => { setShowProductForm(false); setEditProduct(null); }}
          onSuccess={() => { setShowProductForm(false); setEditProduct(null); fetchProducts(); }}
        />
      )}
      {showCategoryForm && (
        <CategoryForm
          category={editCategory}
          onClose={() => { setShowCategoryForm(false); setEditCategory(null); }}
          onSuccess={() => { setShowCategoryForm(false); setEditCategory(null); fetchCategories(); }}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </div>
  );
}
