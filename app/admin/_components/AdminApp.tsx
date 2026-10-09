"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../_lib/supabase";
import type { Category, Order, Product } from "../../_types";
import { Toast, type ToastState } from "./ui";

/* ══════════════════════════════════════════════════════════════════════════
   Shared admin data — fetched once when the admin logs in and kept while
   moving between admin pages, so navigation is instant (no re-auth / re-fetch)
══════════════════════════════════════════════════════════════════════════ */
type AdminCtx = {
  user: User;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  ordersLoading: boolean;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  productsLoading: boolean;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categoriesLoading: boolean;
  toast: (message: string, type?: ToastState["type"]) => void;
};

const AdminContext = createContext<AdminCtx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminApp>");
  return ctx;
}

/* ─── Navigation ─── */
const ic = "w-[18px] h-[18px] shrink-0";
const NAV = [
  { href: "/admin",            label: "الطلبات",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ic}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { href: "/admin/sales",      label: "المبيعات", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ic}><path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg> },
  { href: "/admin/products",   label: "المنتجات", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ic}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg> },
  { href: "/admin/categories", label: "الأقسام",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ic}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg> },
  { href: "/admin/feedback",   label: "الفيدباك", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ic}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

/* ─── Root: the login page renders bare, everything else gets the shell ─── */
export default function AdminApp({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  return <AdminRoot>{children}</AdminRoot>;
}

function AdminRoot({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user,        setUser]        = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* onAuthStateChange fires immediately with INITIAL_SESSION, no need for getSession() */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f6f3" }}>
        <div className="w-7 h-7 border-[2.5px] rounded-full animate-spin" style={{ borderColor: "#1c3a1a", borderTopColor: "transparent" }} />
      </div>
    );
  }
  return <AdminData user={user}>{children}</AdminData>;
}

function AdminData({ user, children }: { user: User; children: React.ReactNode }) {
  const [orders,            setOrders]            = useState<Order[]>([]);
  const [ordersLoading,     setOrdersLoading]     = useState(true);
  const [products,          setProducts]          = useState<Product[]>([]);
  const [productsLoading,   setProductsLoading]   = useState(true);
  const [categories,        setCategories]        = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [toastState,        setToastState]        = useState<(ToastState & { id: number }) | null>(null);

  const toast = useCallback((message: string, type: ToastState["type"] = "success") => {
    setToastState({ message, type, id: Date.now() });
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) console.error("[fetchOrders]", error);
    setOrders(data ?? []);
    setOrdersLoading(false);
  }, []);

  /* All three lists load in parallel, once */
  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) console.error("[fetchOrders]", error);
      setOrders(data ?? []);
      setOrdersLoading(false);
    });
    supabase.from("products").select("*").order("sort_order").then(({ data, error }) => {
      if (error) console.error("[fetchProducts]", error);
      setProducts(data ?? []);
      setProductsLoading(false);
    });
    supabase.from("categories").select("*").order("sort_order").then(({ data, error }) => {
      if (error) console.error("[fetchCategories]", error);
      setCategories(data ?? []);
      setCategoriesLoading(false);
    });
  }, []);

  /* Realtime: new orders */
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        toast("طلب جديد! 🌿");
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, toast]);

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <AdminContext.Provider value={{
      user, orders, setOrders, ordersLoading, products, setProducts, productsLoading,
      categories, setCategories, categoriesLoading, toast,
    }}>
      <Shell user={user} pendingCount={pendingCount}>{children}</Shell>
      {toastState && (
        <Toast key={toastState.id} message={toastState.message} type={toastState.type} onDone={() => setToastState(null)} />
      )}
    </AdminContext.Provider>
  );
}

/* ─── Layout: dark sidebar (desktop) · top bar + bottom tabs (mobile) ─── */
function Shell({ user, pendingCount, children }: { user: User; pendingCount: number; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#f4f6f3", fontFamily: "var(--font-ibm), sans-serif", color: "#16231a" }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 right-0 z-30 w-64 flex-col"
        style={{ background: "linear-gradient(180deg, #17331a 0%, #10260f 100%)" }}>
        <div className="px-6 pt-7 pb-6">
          <p className="text-[19px] font-bold text-white">ربى فرّاج</p>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>لوحة التحكم</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(item => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-[14.5px] transition-colors"
                style={{
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.68)",
                  fontWeight: active ? 600 : 500,
                }}>
                {active && <span className="absolute right-0 top-2.5 bottom-2.5 w-1 rounded-l-full" style={{ background: "#d4a24c" }} />}
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.href === "/admin" && pendingCount > 0 && (
                  <span className="text-[11px] font-bold min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center"
                    style={{ background: "#d4a24c", color: "#10260f" }}>{pendingCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)" }}>
          <p className="text-[12px] truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{user.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <Link href="/" target="_blank"
              className="flex-1 text-center text-[12.5px] font-medium py-2 rounded-lg transition-colors hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>
              عرض الموقع
            </Link>
            <button onClick={() => supabase.auth.signOut()}
              className="flex-1 text-[12.5px] font-medium py-2 rounded-lg transition-colors hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ background: "#17331a", color: "#fff" }}>
        <p className="text-[16px] font-bold">ربى فرّاج <span className="text-[12px] font-normal opacity-60">· لوحة التحكم</span></p>
        <div className="flex items-center gap-1">
          <Link href="/" target="_blank" className="text-[12px] px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.12)" }}>الموقع</Link>
          <button onClick={() => supabase.auth.signOut()} className="text-[12px] px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.12)" }}>خروج</button>
        </div>
      </header>

      {/* Content */}
      <main className="lg:mr-64 min-h-screen pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex border-t" style={{ background: "#fff", borderColor: "#e3e8e1" }}>
        {NAV.map(item => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium"
              style={{ color: active ? "#17331a" : "#7d8a78" }}>
              {active && <span className="absolute top-0 inset-x-4 h-[3px] rounded-b-full" style={{ background: "#17331a" }} />}
              {item.icon}
              {item.label}
              {item.href === "/admin" && pendingCount > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-20px)] text-[9.5px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center"
                  style={{ background: "#d4a24c", color: "#10260f" }}>{pendingCount}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
