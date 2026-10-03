"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase, deleteProduct } from "../_lib/supabase";
import type { Product, Category, Order } from "../_types";
import AdminProductForm from "./AdminProductForm";
import { fmtPrice } from "../_lib/utils";
import type { User } from "@supabase/supabase-js";
import EmptyState from "../_components/shared/EmptyState";

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
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap"
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
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0"
      style={{ background: value ? "var(--forest)" : "#e2e8f0" }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
        style={{ right: value ? "2px" : "auto", left: value ? "auto" : "2px" }}
      />
    </button>
  );
}

/* ─── Toast ─── */
type ToastState = { message: string; type: "success" | "error" };

function Toast({ message, type, onDone }: ToastState & { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[13px] font-medium"
      style={{ background: type === "success" ? "var(--forest)" : "#dc2626", color: "#fff", minWidth: 200, maxWidth: "calc(100vw - 48px)" }}
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
function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title?: string; danger?: boolean }) {
  return (
    <button
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
function ConfirmDialog({
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
          <h3 className="font-display text-[18px] mb-1" style={{ color: "#1a2810" }}>تأكيد الحذف</h3>
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

/* ─── Category form modal ─── */
function CategoryForm({
  category,
  onClose,
  onSuccess,
}: {
  category: Category | null;
  onClose: () => void;
  onSuccess: (msg: string, updated: Category) => void;
}) {
  const [form, setForm] = useState({
    name_ar:    category?.name_ar   ?? "",
    slug:       category?.slug      ?? "",
    sort_order: String(category?.sort_order ?? 0),
    image_url:  category?.image_url ?? "",
  });
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(category?.image_url ?? "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  const inputSt = { background: "#f7f8f7", border: "1px solid #e5e9e4", color: "var(--text-dark)" };
  const inputCl = "w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-colors";
  const labelCl = "block text-[11px] font-medium mb-1";
  const labelSt = { color: "var(--text-muted)" };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImageFile(file); setImagePreview(reader.result as string); };
    reader.readAsDataURL(file);
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
      /* ── Step 1: upload image directly to Storage ── */
      let imageUrl: string | null = form.image_url || null;
      if (imageFile) {
        const catId  = category?.id ?? crypto.randomUUID();
        const ext    = imageFile.name.split(".").pop() ?? "jpg";
        const filePath = `categories/${catId}/image.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile, { upsert: true });

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

        imageUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath).data.publicUrl;
      }

      /* ── Step 2: save to categories table ── */
      const payload = {
        name_ar:    form.name_ar.trim(),
        slug:       form.slug.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        image_url:  imageUrl,
      };

      let saved: Category;
      if (category) {
        const { data: rows, error } = await supabase
          .from("categories").update(payload).eq("id", category.id).select();
        if (error) throw new Error(`DB update failed: ${error.message}`);
        if (!rows?.length) throw new Error(`فشل التحديث — تحقق من سياسات RLS في Supabase (id: ${category.id})`);
        saved = rows[0] as Category;
      } else {
        const { data: rows, error } = await supabase
          .from("categories").insert([payload]).select();
        if (error) throw new Error(`DB insert failed: ${error.message}`);
        if (!rows?.length) throw new Error("فشل الإدراج — تحقق من سياسات RLS في Supabase");
        saved = rows[0] as Category;
      }

      onSuccess(category ? "تم تعديل القسم بنجاح" : "تمت إضافة القسم بنجاح", saved);
    } catch (err) {
      console.error("[CategoryForm]", err);
      setError(err instanceof Error ? err.message : "حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div onClick={onClose} className="absolute inset-0"
        style={{ background: "rgba(28,58,26,0.45)", backdropFilter: "blur(4px)" }} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: "#fff" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-[15px]" style={{ color: "var(--forest)" }}>
            {category ? "تعديل القسم" : "إضافة قسم جديد"}
          </h2>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-opacity hover:opacity-50"
            style={{ color: "var(--text-light)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Image upload */}
            <div>
              <p className={labelCl} style={labelSt}>صورة القسم</p>
              <div
                onClick={() => imgRef.current?.click()}
                className="relative rounded-lg border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center transition-colors hover:border-[var(--forest-mid)]"
                style={{ height: 110, borderColor: "#e5e9e4", background: "#f7f8f7" }}
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="preview" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1" style={{ color: "var(--text-light)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-[10px]">رفع صورة</span>
                  </div>
                )}
              </div>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div>
              <label className={labelCl} style={labelSt}>
                الاسم <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="text" required value={form.name_ar} placeholder="مثال: حناء شعر"
                onChange={e => setForm({ ...form, name_ar: e.target.value })}
                className={inputCl} style={inputSt} />
            </div>
            <div>
              <label className={labelCl} style={labelSt}>
                <span className="font-mono">slug</span>
                <span className="text-[10px] font-normal mr-1.5" style={{ color: "var(--text-light)" }}>— معرّف الرابط مثل henna-hair</span>
                <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="text" required value={form.slug} dir="ltr" placeholder="henna-hair"
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className={`${inputCl} font-mono`} style={inputSt} />
            </div>
            <div>
              <label className={labelCl} style={labelSt}>الترتيب</label>
              <input type="number" inputMode="numeric" pattern="[0-9]*" value={form.sort_order} placeholder="0" dir="ltr"
                onChange={e => setForm({ ...form, sort_order: e.target.value.replace(/\D/g, "") })}
                className={`${inputCl} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                style={inputSt} />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t shrink-0" style={{ borderColor: "var(--border)" }}>
          <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={loading}
            className="w-full py-2 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--forest)", color: "#fff" }}>
            {loading ? "جاري الحفظ..." : category ? "حفظ التعديلات" : "إضافة القسم"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main admin page ─── */
export default function AdminPage() {
  const router      = useRouter();
  const initialized = useRef(false); // ensures data is fetched only once, even if auth fires multiple times
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [toast, setToast] = useState<ToastState | null>(null);

  /* Orders */
  const [orders,          setOrders]          = useState<Order[]>([]);
  const [ordersLoading,   setOrdersLoading]   = useState(false);
  const [expandedOrder,   setExpandedOrder]   = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  /* Products */
  const [products,        setProducts]        = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct,     setEditProduct]     = useState<Product | null>(null);

  /* Categories */
  const [categories,       setCategories]       = useState<Category[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategory,     setEditCategory]     = useState<Category | null>(null);
  const catFetchVer = useRef(0); // prevents stale fetchCategories responses from overwriting optimistic updates

  /* Confirm delete */
  const [confirmDelete, setConfirmDelete] = useState<{ type: "product" | "category"; id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ─ Auth — onAuthStateChange fires immediately with INITIAL_SESSION, no need for getSession() ─ */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [router]);

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
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) { console.error("[fetchCategories]", error); return; }
    setCategories(data ?? []);
  }, []);

  /* ─ Fetch data ONCE when user is first identified ─ */
  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;
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
        setToast({ message: "طلب جديد! 🌿", type: "success" });
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

  const copyAddress = (order: Order) => {
    const parts = [order.governorate, order.area, order.street_address].filter(Boolean);
    navigator.clipboard.writeText(parts.join(" — "));
    setCopiedAddressId(order.id);
    setTimeout(() => setCopiedAddressId(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      if (confirmDelete.type === "product") {
        await deleteProduct(confirmDelete.id);
        setProducts(prev => prev.filter(p => p.id !== confirmDelete.id));
      } else {
        await supabase.from("categories").delete().eq("id", confirmDelete.id);
        setCategories(prev => prev.filter(c => c.id !== confirmDelete.id));
      }
      setToast({ message: "تم الحذف بنجاح", type: "success" });
    } catch {
      setToast({ message: "حدث خطأ أثناء الحذف", type: "error" });
    } finally {
      setConfirmDelete(null);
      setDeleteLoading(false);
    }
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

  const Spinner = () => (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--forest)", borderTopColor: "transparent" }} />
    </div>
  );

  /* ─ Loading / auth ─ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fff" }}>
        <div className="w-6 h-6 border-2 rounded-xl animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!user) return null;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "orders",     label: "الطلبات",  badge: pendingCount },
    { id: "products",   label: "المنتجات" },
    { id: "categories", label: "الأقسام" },
  ];

  const thStyle: React.CSSProperties = {
    color: "var(--text-light)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    fontSize: 12,
  };
  const tdStyle: React.CSSProperties = { fontSize: 13 };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl"
      style={{ background: "#ffffff", fontFamily: "var(--font-display), Georgia, serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b"
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
            className="text-xs px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: "var(--forest)", color: "#fff" }}>
            تسجيل خروج
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar (desktop) ── */}
        <aside className="w-52 shrink-0 border-l min-h-full hidden sm:flex flex-col"
          style={{ background: "#f7f8f5", borderColor: "var(--border)" }}>

          {/* Section label */}
          <p className="px-4 pt-5 pb-2 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "var(--text-light)", letterSpacing: "0.1em" }}>
            القائمة
          </p>

          <nav className="px-3 space-y-0.5 flex-1">
            {[
              {
                ...tabs[0],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
              },
              {
                ...tabs[1],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                ),
              },
              {
                ...tabs[2],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ),
              },
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all text-right"
                  style={{
                    background: active ? "var(--forest-pale)" : "transparent",
                    color: active ? "var(--forest)" : "var(--text-muted)",
                    fontWeight: active ? 600 : 400,
                    boxShadow: active ? "inset 0 0 0 1px rgba(28,58,26,0.12)" : "none",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f0f2ee"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span style={{ color: active ? "var(--forest-mid)" : "var(--text-light)" }}>{tab.icon}</span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      style={{ background: "var(--forest)", color: "#fff" }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom divider + version */}
          <div className="px-4 py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-[10px]" style={{ color: "var(--text-light)" }}>ربى للحناء · لوحة التحكم</p>
          </div>
        </aside>

        {/* ── Mobile tab bar ── */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 flex border-t"
          style={{ background: "#f7f3ee", borderColor: "var(--border)" }}>
          {([
            { id: "orders"     as Tab, label: "الطلبات",  badge: pendingCount, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { id: "products"   as Tab, label: "المنتجات", badge: undefined,     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg> },
            { id: "categories" as Tab, label: "الأقسام",  badge: undefined,     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
          ] as { id: Tab; label: string; badge: number | undefined; icon: React.ReactNode }[]).map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors"
                style={{ color: active ? "var(--forest)" : "var(--text-light)" }}>
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1.5 right-[calc(50%-18px)] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "var(--forest)", color: "#fff" }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
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
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round"/>
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
                <EmptyState title="لا توجد طلبات" subtitle="ستظهر الطلبات هنا فور وصولها" />
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

                    {orders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      const [datePart, timePart] = formatDate(order.created_at).split(", ");

                      const STATUS_OPTIONS: { value: Order["status"]; label: string; icon: React.ReactNode }[] = [
                        {
                          value: "pending", label: "جديد",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0">
                              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l3.5 2" />
                            </svg>
                          ),
                        },
                        {
                          value: "confirmed", label: "مؤكد",
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          ),
                        },
                        {
                          value: "done", label: "تم ✓",
                          icon: null,
                        },
                      ];

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
                                <span className="font-display" style={{ fontSize: 17, fontWeight: 400, color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
                                  {order.total}
                                </span>
                                <span className="text-[11px]" style={{ color: "var(--text-light)" }}>د.أ</span>
                                <span className="text-[10px]" style={{ color: "var(--text-light)" }}>
                                  · {order.items.length} {order.items.length === 1 ? "منتج" : "منتجات"}
                                </span>
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
                                      onClick={() => updateOrderStatus(order.id, opt.value)}
                                      className="flex items-center gap-1"
                                      style={{
                                        padding: "5px 9px",
                                        fontWeight: isActive ? 600 : 400,
                                        background: isActive ? "var(--forest-pale)" : "transparent",
                                        color: isActive ? "var(--forest)" : "var(--text-light)",
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

                            {/* WhatsApp */}
                            <td className="px-2 py-3 align-middle text-center" onClick={e => e.stopPropagation()}>
                              <a
                                href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
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
                                            {(order.subtotal ?? (order.total - (order.delivery_fee ?? 0))).toFixed(2)}{" "}
                                            <span className="text-[10px]" style={{ color: "#b0a898" }}>د.أ</span>
                                          </span>
                                        </div>
                                        {(order.delivery_fee ?? 0) > 0 && (
                                          <div className="flex justify-between items-center">
                                            <span className="text-[11.5px]" style={{ color: "#a8a090" }}>التوصيل</span>
                                            <span className="text-[12.5px] tabular-nums" style={{ color: "#2a2218" }}>
                                              {(order.delivery_fee ?? 0).toFixed(2)}{" "}
                                              <span className="text-[10px]" style={{ color: "#b0a898" }}>د.أ</span>
                                            </span>
                                          </div>
                                        )}
                                        <div
                                          className="flex justify-between items-baseline pt-2 mt-0.5"
                                          style={{ borderTop: "1px solid #ede8e0" }}
                                        >
                                          <span className="text-[12px] font-semibold" style={{ color: "#4a4238" }}>الإجمالي</span>
                                          <div className="flex items-baseline gap-1" dir="ltr">
                                            <span className="font-display text-[17px] font-semibold" style={{ color: "var(--text-dark)" }}>{order.total}</span>
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
                  {orders.map(order => {
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
                              <span className="font-display text-[16px]" style={{ color: "var(--text-dark)" }}>
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
                        </div>

                        {/* Actions bar */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2"
                          style={{ borderTop: "1px solid var(--border)", background: "#f9f8f6" }}>
                          <div className="inline-flex rounded-xl overflow-hidden"
                            style={{ border: "1px solid var(--border)", fontSize: 11 }}>
                            {([
                              { value: "pending"   as Order["status"], label: "جديد", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l3.5 2"/></svg>) },
                              { value: "confirmed" as Order["status"], label: "مؤكد", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>) },
                              { value: "done"      as Order["status"], label: "تم",   icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/></svg>) },
                            ] as { value: Order["status"]; label: string; icon: React.ReactNode }[]).map((opt, idx) => {
                              const isActive = order.status === opt.value;
                              return (
                                <button key={opt.value}
                                  onClick={() => updateOrderStatus(order.id, opt.value)}
                                  className="flex items-center gap-1"
                                  style={{ padding: "5px 9px", background: isActive ? "var(--forest-pale)" : "transparent", color: isActive ? "var(--forest)" : "var(--text-light)", fontWeight: isActive ? 600 : 400, borderLeft: idx > 0 ? "1px solid var(--border)" : "none", whiteSpace: "nowrap" }}>
                                  {opt.icon}{opt.label}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
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

                            {/* Financial breakdown */}
                            <div className="space-y-1 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px]" style={{ color: "var(--text-light)" }}>المنتجات</span>
                                <span className="text-[12px] font-medium" style={{ color: "var(--text-dark)" }} dir="ltr">
                                  {(order.subtotal ?? (order.total - (order.delivery_fee ?? 0))).toFixed(2)} د.أ
                                </span>
                              </div>
                              {(order.delivery_fee ?? 0) > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px]" style={{ color: "var(--text-light)" }}>التوصيل — {order.governorate}</span>
                                  <span className="text-[12px] font-medium" style={{ color: "var(--text-dark)" }} dir="ltr">
                                    {(order.delivery_fee ?? 0).toFixed(2)} د.أ
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px dashed var(--border)" }}>
                                <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>الإجمالي الكلي</span>
                                <span className="text-[14px] font-bold" style={{ color: "var(--forest)" }}>{order.total} د.أ</span>
                              </div>
                            </div>

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
              )}
            </div>
          )}

          {/* ════ Products Tab ════ */}
          {activeTab === "products" && (() => {
            // Group products by category, sorted by sort_order within each group
            const knownCatIds = new Set(categories.map(c => c.id));
            const catMap = new Map<string, Product[]>();
            for (const p of products) {
              const key = (p.category_id && knownCatIds.has(p.category_id)) ? p.category_id : "__none__";
              if (!catMap.has(key)) catMap.set(key, []);
              catMap.get(key)!.push(p);
            }
            const productGroups: { catName: string; products: Product[] }[] = [];
            for (const cat of categories) {
              const grp = catMap.get(cat.id);
              if (grp && grp.length > 0) {
                productGroups.push({ catName: cat.name_ar, products: [...grp].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) });
              }
            }
            const noCat = catMap.get("__none__");
            if (noCat && noCat.length > 0) {
              productGroups.push({ catName: "بدون فئة", products: [...noCat].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) });
            }

            return (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--forest)" }}>
                  المنتجات
                </h2>
                <button
                  onClick={() => { setEditProduct(null); setShowProductForm(true); }}
                  className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
                  إضافة منتج
                </button>
              </div>

              {productsLoading ? <Spinner /> : products.length === 0 ? (
                <EmptyState title="لا توجد منتجات" />
              ) : (
                <>
                <div className="hidden md:block rounded-2xl border" style={{ borderColor: "var(--border)", overflowX: "auto" }}>
                    <table className="w-full">
                      <colgroup>
                        <col style={{ width: "52px" }} />
                        <col />
                        <col style={{ width: "80px" }} />
                        <col style={{ width: "90px" }} />
                        <col style={{ width: "70px" }} />
                        <col style={{ width: "72px" }} />
                      </colgroup>
                      <thead>
                        <tr style={{ background: "#f9f8f6", borderBottom: "1px solid var(--border)" }}>
                          {(["صورة", "الاسم", "السعر", "الأكثر مبيعًا", "متوفر", "إجراءات"] as const).map(h => {
                            const centered = ["صورة", "الأكثر مبيعًا", "متوفر", "إجراءات"].includes(h);
                            return (
                              <th key={h} className={`px-4 py-3 ${centered ? "text-center" : "text-right"}`} style={thStyle}>{h}</th>
                            );
                          })}
                        </tr>
                      </thead>
                      {productGroups.map(group => (
                        <tbody key={group.catName}>
                          {/* Category header row */}
                          <tr style={{ background: "#f2f4f0" }}>
                            <td colSpan={6} className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-semibold" style={{ color: "var(--forest)" }}>{group.catName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>{group.products.length}</span>
                              </div>
                            </td>
                          </tr>
                          {group.products.map((product, i) => (
                            <tr key={product.id}
                              style={{
                                background: i % 2 === 0 ? "#fff" : "#fafaf9",
                                borderBottom: "1px solid var(--border)",
                              }}>
                              <td className="px-4 py-3 text-center">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 mx-auto"
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
                              <td className="px-4 py-3">
                                <p className="font-medium line-clamp-2 leading-snug"
                                  style={{ color: "var(--text-dark)", ...tdStyle }}>
                                  {product.name_ar}
                                </p>
                              </td>
                              <td className="px-4 py-3 font-semibold whitespace-nowrap"
                                style={{ color: "var(--gold)", ...tdStyle }}>
                                {product.price != null ? fmtPrice(product.price) : "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Toggle
                                  value={product.is_best_seller}
                                  onChange={async () => {
                                    const next = !product.is_best_seller;
                                    await supabase.from("products").update({ is_best_seller: next }).eq("id", product.id);
                                    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_best_seller: next } : p));
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
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
                                <div className="flex items-center justify-center gap-1">
                                  <IconBtn title="تعديل" onClick={() => { setEditProduct(product); setShowProductForm(true); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </IconBtn>
                                  <IconBtn title="حذف" danger onClick={() => setConfirmDelete({ type: "product", id: product.id, name: product.name_ar })}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                                    </svg>
                                  </IconBtn>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ))}
                    </table>
                </div>

                {/* ── Mobile / tablet cards ── */}
                <div className="md:hidden space-y-5">
                  {productGroups.map(group => (
                    <div key={group.catName}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-[12px] font-semibold" style={{ color: "var(--forest)" }}>{group.catName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>{group.products.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.products.map(product => (
                          <div key={product.id} className="rounded-2xl border overflow-hidden"
                            style={{ background: "#fff", borderColor: "var(--border)" }}>
                            {/* Image + info */}
                            <div className="flex items-start gap-3 p-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                                style={{ background: "var(--cream)" }}>
                                {product.image_url ? (
                                  <Image src={product.image_url} alt={product.name_ar} width={56} height={56} className="object-contain w-full h-full p-1" />
                                ) : (
                                  <span className="text-sm" style={{ color: "var(--text-light)" }}>{product.name_ar.charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[13px] leading-snug mb-1 line-clamp-2" style={{ color: "var(--text-dark)" }}>
                                  {product.name_ar}
                                </p>
                                {product.price != null && (
                                  <p className="mt-1.5 font-semibold text-[14px]" style={{ color: "var(--gold)" }}>
                                    {fmtPrice(product.price)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {/* Toggles + actions */}
                            <div className="px-4 py-2.5 flex items-center justify-between"
                              style={{ borderTop: "1px solid var(--border)", background: "#f9f8f6" }}>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <Toggle value={product.is_best_seller} onChange={async () => {
                                    const next = !product.is_best_seller;
                                    await supabase.from("products").update({ is_best_seller: next }).eq("id", product.id);
                                    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_best_seller: next } : p));
                                  }} />
                                  <span className="text-[11px]" style={{ color: "var(--text-light)" }}>مميز</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Toggle value={product.in_stock} onChange={async () => {
                                    const next = !product.in_stock;
                                    await supabase.from("products").update({ in_stock: next }).eq("id", product.id);
                                    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock: next } : p));
                                  }} />
                                  <span className="text-[11px]" style={{ color: "var(--text-light)" }}>متوفر</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <IconBtn title="تعديل" onClick={() => { setEditProduct(product); setShowProductForm(true); }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </IconBtn>
                                <IconBtn title="حذف" danger onClick={() => setConfirmDelete({ type: "product", id: product.id, name: product.name_ar })}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                                  </svg>
                                </IconBtn>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}
            </div>
            );
          })()}

          {/* ════ Categories Tab ════ */}
          {activeTab === "categories" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--forest)" }}>
                  الأقسام
                </h2>
                <button
                  onClick={() => { setEditCategory(null); setShowCategoryForm(true); }}
                  className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
                  إضافة قسم
                </button>
              </div>

              <>
              <div className="hidden md:block rounded-2xl border" style={{ borderColor: "var(--border)", overflowX: "auto" }}>
                <table className="w-full">
                  <colgroup>
                    <col style={{ width: "56px" }} />
                    <col style={{ width: "48px" }} />
                    <col />
                    <col style={{ width: "200px" }} />
                    <col style={{ width: "88px" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: "#f9f8f6", borderBottom: "1px solid var(--border)" }}>
                      {["صورة", "#", "الاسم", "slug", "إجراءات"].map(h => (
                        <th key={h} className={`px-4 py-3 ${["صورة", "slug", "إجراءات"].includes(h) ? "text-center" : "text-right"}`} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center" style={{ ...tdStyle }}>
                          <EmptyState title="لا توجد أقسام" />
                        </td>
                      </tr>
                    ) : categories.map((cat, i) => (
                      <tr key={cat.id}
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#fafaf9",
                          borderBottom: "1px solid var(--border)",
                        }}>
                        <td className="px-4 py-3 text-center">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 mx-auto"
                            style={{ background: "var(--cream)" }}>
                            {cat.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={cat.image_url} alt={cat.name_ar} className="object-cover w-full h-full" />
                            ) : (
                              <span className="text-xs" style={{ color: "var(--text-light)" }}>{cat.name_ar.charAt(0)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-muted)", ...tdStyle }}>{cat.sort_order}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-dark)", ...tdStyle }}>{cat.name_ar}</td>
                        <td className="px-4 py-3 font-mono text-center" dir="ltr" style={{ color: "var(--text-light)", ...tdStyle }}>
                          {cat.slug}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <IconBtn title="تعديل" onClick={() => { setEditCategory(cat); setShowCategoryForm(true); }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </IconBtn>
                            <IconBtn title="حذف" danger onClick={() => setConfirmDelete({ type: "category", id: cat.id, name: cat.name_ar })}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                              </svg>
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile / tablet cards ── */}
              <div className="md:hidden space-y-2 mt-0">
                {categories.length === 0 ? (
                  <EmptyState title="لا توجد أقسام" />
                ) : categories.map(cat => (
                  <div key={cat.id} className="rounded-xl border px-4 py-3 flex items-center justify-between"
                    style={{ background: "#fff", borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>
                        {cat.sort_order}
                      </span>
                      <div>
                        <p className="font-medium text-[13px]" style={{ color: "var(--text-dark)" }}>{cat.name_ar}</p>
                        <p className="text-[11px] font-mono" dir="ltr" style={{ color: "var(--text-light)" }}>{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconBtn title="تعديل" onClick={() => { setEditCategory(cat); setShowCategoryForm(true); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </IconBtn>
                      <IconBtn title="حذف" danger onClick={() => setConfirmDelete({ type: "category", id: cat.id, name: cat.name_ar })}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                        </svg>
                      </IconBtn>
                    </div>
                  </div>
                ))}
              </div>
              </>
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
          onSuccess={(saved) => {
            setProducts(prev => {
              const exists = prev.some(p => p.id === saved.id);
              if (exists) return prev.map(p => p.id === saved.id ? saved : p);
              return [...prev, saved].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            });
            setShowProductForm(false);
            setEditProduct(null);
            setToast({ message: editProduct ? "تم تعديل المنتج بنجاح" : "تمت إضافة المنتج بنجاح", type: "success" });
          }}
        />
      )}
      {showCategoryForm && (
        <CategoryForm
          category={editCategory}
          onClose={() => { setShowCategoryForm(false); setEditCategory(null); }}
          onSuccess={(msg, saved) => {
            catFetchVer.current++;
            setCategories(prev => {
              const exists = prev.some(c => c.id === saved.id);
              if (exists) return prev.map(c => c.id === saved.id ? saved : c);
              return [...prev, saved].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            });
            setShowCategoryForm(false);
            setEditCategory(null);
            setToast({ message: msg, type: "success" });
          }}
        />
      )}

      {/* ── Confirm delete dialog ── */}
      {confirmDelete && (
        <ConfirmDialog
          name={confirmDelete.name}
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
