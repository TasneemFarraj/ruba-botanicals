"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, deleteProduct } from "../../_lib/supabase";
import { getDiscount } from "../../_lib/utils";
import type { Product } from "../../_types";
import { useAdmin } from "./AdminApp";
import EmptyState from "../../_components/shared/EmptyState";
import { Spinner, Toggle, Select, ConfirmDialog, PageHeader, primaryBtn, type SelectOption } from "./ui";

type StockFilter = "all" | "in" | "out" | "discount";

export default function ProductsManager() {
  const { products, categories, productsLoading: loading, setProducts, toast } = useAdmin();
  const router = useRouter();
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const onDelete = setToDelete;

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const ok = await deleteProduct(toDelete.id);
    setDeleting(false);
    if (ok) {
      setProducts(prev => prev.filter(p => p.id !== toDelete.id));
      toast("تم حذف المنتج");
    } else {
      toast("تعذّر حذف المنتج", "error");
    }
    setToDelete(null);
  };
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("");
  const [stock,    setStock]    = useState<StockFilter>("all");

  const toggleField = async (product: Product, field: "is_best_seller" | "in_stock") => {
    const next = !product[field];
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [field]: next } : p));
    const { error } = await supabase.from("products").update({ [field]: next }).eq("id", product.id);
    if (error) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [field]: !next } : p));
      toast("تعذّر حفظ التغيير", "error");
    }
  };

  /* Filter, then group by category (in category order) */
  const q = query.trim();
  const filtered = products.filter(p =>
    (!q || p.name_ar.includes(q)) &&
    (!category || (category === "__none__" ? !categories.some(c => c.id === p.category_id) : p.category_id === category)) &&
    (stock === "all" || (stock === "in" ? p.in_stock : stock === "out" ? !p.in_stock : !!getDiscount(p)))
  );
  const bySort = (a: Product, b: Product) => (a.sort_order ?? 0) - (b.sort_order ?? 0);
  const groups = [
    ...categories.map(c => ({ id: c.id, name: c.name_ar, items: filtered.filter(p => p.category_id === c.id).sort(bySort) })),
    { id: "__none__", name: "بدون فئة", items: filtered.filter(p => !categories.some(c => c.id === p.category_id)).sort(bySort) },
  ].filter(g => g.items.length > 0);

  const counts = {
    all: products.length,
    in: products.filter(p => p.in_stock).length,
    out: products.filter(p => !p.in_stock).length,
    discount: products.filter(p => getDiscount(p)).length,
  };
  const categoryOptions: SelectOption[] = [
    { value: "", label: "كل الفئات" },
    ...categories.map(c => ({ value: c.id, label: c.name_ar, hint: `${products.filter(p => p.category_id === c.id).length} منتج` })),
  ];

  return (
    <div>
      <PageHeader
        title="المنتجات"
        subtitle={`${products.length} منتج في المتجر`}
        actions={
          <Link href="/admin/products/new" className={primaryBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
            إضافة منتج
          </Link>
        }
      />

      {/* ── Toolbar ── */}
      <div className="rounded-2xl border p-3 mb-5 flex flex-col md:flex-row gap-3 md:items-center" style={{ background: "#fff", borderColor: "#e3e8e1" }}>
        <div className="flex-1 flex items-center gap-2 px-3.5 rounded-xl border border-[#dfe4dc] focus-within:border-[var(--forest-light)]" style={{ background: "#fff" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" style={{ color: "var(--text-light)" }}>
            <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M20 20l-3.5-3.5" />
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحثي باسم المنتج..."
            className="flex-1 bg-transparent outline-none py-2.5 text-[14px]" style={{ color: "var(--text-dark)" }} />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="مسح" className="text-[18px] leading-none" style={{ color: "var(--text-light)" }}>×</button>
          )}
        </div>
        <Select value={category} onChange={setCategory} options={categoryOptions} className="md:w-56" />
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "#eef1ec" }}>
          {([
            { id: "all",      label: "الكل" },
            { id: "in",       label: "متوفر" },
            { id: "out",      label: "نفد" },
            { id: "discount", label: "عليها خصم" },
          ] as { id: StockFilter; label: string }[]).map(f => {
            const active = stock === f.id;
            return (
              <button key={f.id} type="button" onClick={() => setStock(f.id)}
                className="px-3 py-1.5 rounded-lg text-[12.5px] whitespace-nowrap transition-colors"
                style={{ background: active ? "#fff" : "transparent", color: active ? "var(--forest)" : "var(--text-muted)", fontWeight: active ? 700 : 500, boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
                {f.label} <span className="tabular-nums" style={{ opacity: 0.7 }}>{counts[f.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── List ── */}
      {loading ? <Spinner /> : products.length === 0 ? (
        <EmptyState title="لا توجد منتجات" />
      ) : groups.length === 0 ? (
        <EmptyState title="لا توجد نتائج" subtitle="جرّبي تغيير البحث أو الفلاتر" />
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <section key={group.id}>
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <h3 className="text-[14px] font-bold" style={{ color: "var(--forest)" }}>{group.name}</h3>
                <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--forest-pale)", color: "var(--forest-mid)" }}>
                  {group.items.length}
                </span>
                <span className="flex-1 h-px" style={{ background: "#e6eae3" }} />
              </div>

              <div className="rounded-2xl border overflow-hidden divide-y" style={{ background: "#fff", borderColor: "#e6eae3" }}>
                {group.items.map(product => {
                  const discount = getDiscount(product);
                  const img = product.image_no_bg_url ?? product.image_url;
                  return (
                    <div key={product.id}
                      className="flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-3 px-4 py-3 transition-colors hover:bg-[#fafbf9]"
                      style={{ borderColor: "#eef0ec" }}>
                      {/* Image + name */}
                      <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-3.5 flex-1 min-w-0 basis-full md:basis-auto">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--surface-card)", border: "1px solid #eef0ec" }}>
                          {img
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={img} alt={product.name_ar} className="w-full h-full object-contain p-1.5" loading="lazy" />
                            : <span className="absolute inset-0 flex items-center justify-center text-[18px]" style={{ color: "var(--text-light)" }}>{product.name_ar.charAt(0)}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14.5px] font-semibold leading-snug line-clamp-2" style={{ color: "var(--text-dark)" }}>{product.name_ar}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {product.unit && <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{product.unit}</span>}
                            {!product.in_stock && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>نفد</span>
                            )}
                            {product.is_best_seller && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--gold-pale)", color: "#8a5a14" }}>الأكثر مبيعاً</span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Price */}
                      <div className="w-28 shrink-0 md:text-left" dir="ltr">
                        {product.price != null && product.price > 0 ? (
                          <>
                            <p className="text-[15px] font-bold tabular-nums" style={{ color: "var(--gold)" }}>
                              {product.price} <span className="text-[11px] font-normal" style={{ color: "var(--text-muted)" }}>د.أ</span>
                            </p>
                            {discount && (
                              <p className="text-[11.5px] tabular-nums flex items-center gap-1.5 md:justify-start">
                                <s style={{ color: "var(--text-muted)" }}>{discount.original}</s>
                                <span className="font-bold px-1.5 rounded" style={{ background: "#fee2e2", color: "#b91c1c" }}>-{discount.percent}%</span>
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>بالاتفاق</p>
                        )}
                      </div>

                      {/* Toggles */}
                      <div className="flex items-center gap-4 shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Toggle value={product.in_stock} onChange={() => toggleField(product, "in_stock")} />
                          <span className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>متوفر</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Toggle value={product.is_best_seller} onChange={() => toggleField(product, "is_best_seller")} />
                          <span className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>مميز</span>
                        </label>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 mr-auto md:mr-0">
                        <button type="button" onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors hover:bg-[var(--forest-pale)]"
                          style={{ color: "var(--forest-mid)" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          تعديل
                        </button>
                        <button type="button" onClick={() => onDelete(product)} title="حذف"
                          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: "#dc2626" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      {toDelete && (
        <ConfirmDialog name={toDelete.name_ar} loading={deleting} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
