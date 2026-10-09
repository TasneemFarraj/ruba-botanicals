"use client";

import { useRef, useState } from "react";
import { supabase } from "../../_lib/supabase";
import type { Category } from "../../_types";
import EmptyState from "../../_components/shared/EmptyState";
import { useAdmin } from "./AdminApp";
import { Spinner, ConfirmDialog, PageHeader, primaryBtn, secondaryBtn, inputClass, inputStyle, numberClass, labelClass, labelStyle } from "./ui";

/* ─── Inline add / edit form (replaces the card while editing) ─── */
function CategoryForm({ category, nextOrder, onDone, onCancel }: {
  category: Category | null;
  nextOrder: number;
  onDone: (saved: Category) => void;
  onCancel: () => void;
}) {
  const { toast } = useAdmin();
  const [name,    setName]    = useState(category?.name_ar ?? "");
  const [slug,    setSlug]    = useState(category?.slug ?? "");
  const [order,   setOrder]   = useState(String(category?.sort_order ?? nextOrder));
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState(category?.image_url ?? "");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { setError("الاسم والرابط (slug) مطلوبان"); return; }
    setSaving(true);
    setError("");
    try {
      let imageUrl: string | null = category?.image_url ?? null;
      if (file) {
        const catId = category?.id ?? crypto.randomUUID();
        const ext   = file.name.split(".").pop() ?? "jpg";
        const path  = `categories/${catId}/image-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
        if (upErr) throw new Error(`فشل رفع الصورة: ${upErr.message}`);
        imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      const payload = { name_ar: name.trim(), slug: slug.trim(), sort_order: parseInt(order) || 0, image_url: imageUrl };
      const { data, error: dbErr } = category
        ? await supabase.from("categories").update(payload).eq("id", category.id).select().single()
        : await supabase.from("categories").insert([payload]).select().single();
      if (dbErr) throw new Error(dbErr.code === "23505" ? "هذا الرابط (slug) مستخدم لقسم آخر" : dbErr.message);
      toast(category ? "تم تعديل القسم" : "تمت إضافة القسم");
      onDone(data as Category);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاولي مجدداً");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="rounded-2xl border-2 p-4 sm:p-5 space-y-4"
      style={{ background: "#fff", borderColor: "var(--forest-light)", boxShadow: "0 8px 30px rgba(28,58,26,0.10)" }}>
      <p className="text-[15px] font-bold" style={{ color: "#16231a" }}>{category ? "تعديل القسم" : "قسم جديد"}</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-xl">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-4">
        <button type="button" onClick={() => imgRef.current?.click()}
          className="relative w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center transition-colors hover:border-[var(--forest-light)]"
          style={{ borderColor: "#d5dcd1", background: "#fafbf9" }}>
          {preview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
            : <span className="text-[12.5px] font-medium" style={{ color: "#66735f" }}>+ صورة القسم</span>}
          {preview && (
            <span className="absolute bottom-1.5 inset-x-1.5 text-[11px] font-medium py-1 rounded-lg text-white" style={{ background: "rgba(0,0,0,0.55)" }}>
              تغيير الصورة
            </span>
          )}
        </button>
        <input ref={imgRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } e.target.value = ""; }} />

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr_90px] gap-3 content-start">
          <div>
            <label className={labelClass} style={labelStyle}>اسم القسم <span style={{ color: "#dc2626" }}>*</span></label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="مثال: حناء شعر"
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>الرابط (slug) <span style={{ color: "#dc2626" }}>*</span></label>
            <input value={slug} dir="ltr" placeholder="henna-hair"
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              className={`${inputClass} font-mono text-left`} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>الترتيب</label>
            <input type="number" inputMode="numeric" value={order} dir="ltr"
              onChange={e => setOrder(e.target.value.replace(/\D/g, ""))}
              className={`${inputClass} ${numberClass} text-center`} style={inputStyle} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className={`${secondaryBtn} flex-1 sm:flex-none`}>إلغاء</button>
        <button type="submit" disabled={saving} className={`${primaryBtn} flex-[2] sm:flex-none sm:px-6`}>
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </form>
  );
}

export default function CategoriesManager() {
  const { categories, setCategories, categoriesLoading, products, toast } = useAdmin();
  const [editing,  setEditing]  = useState<string | null>(null); // category id, or "new"
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const nextOrder = sorted.length ? (sorted[sorted.length - 1].sort_order ?? 0) + 1 : 0;
  const countIn = (id: string) => products.filter(p => p.category_id === id).length;

  const upsert = (saved: Category) => {
    setCategories(prev => prev.some(c => c.id === saved.id) ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved]);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("categories").delete().eq("id", toDelete.id);
    setDeleting(false);
    if (error) {
      toast(error.code === "23503" ? "لا يمكن حذف قسم فيه منتجات — انقلي المنتجات أولاً" : "تعذّر حذف القسم", "error");
    } else {
      setCategories(prev => prev.filter(c => c.id !== toDelete.id));
      toast("تم حذف القسم");
    }
    setToDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="الأقسام"
        subtitle={`${categories.length} قسم`}
        actions={editing !== "new" && (
          <button type="button" onClick={() => setEditing("new")} className={primaryBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
            إضافة قسم
          </button>
        )}
      />

      {editing === "new" && (
        <div className="mb-5">
          <CategoryForm category={null} nextOrder={nextOrder} onDone={upsert} onCancel={() => setEditing(null)} />
        </div>
      )}

      {categoriesLoading ? <Spinner /> : sorted.length === 0 && editing !== "new" ? (
        <EmptyState title="لا توجد أقسام" subtitle="أضيفي أول قسم للمتجر" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(cat => editing === cat.id ? (
            <div key={cat.id} className="sm:col-span-2 xl:col-span-3">
              <CategoryForm category={cat} nextOrder={nextOrder} onDone={upsert} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <div key={cat.id} className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: "#fff", borderColor: "#e3e8e1" }}>
              <div className="relative h-36" style={{ background: "#eef2ec" }}>
                {cat.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={cat.image_url} alt={cat.name_ar} className="w-full h-full object-cover" loading="lazy" />
                  : <span className="absolute inset-0 flex items-center justify-center text-[40px] font-bold" style={{ color: "#c5cfc0" }}>{cat.name_ar.charAt(0)}</span>}
                <span className="absolute top-2.5 right-2.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.92)", color: "#16231a" }}>
                  #{cat.sort_order}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between gap-3 flex-1">
                <div className="min-w-0">
                  <p className="text-[15.5px] font-bold truncate" style={{ color: "#16231a" }}>{cat.name_ar}</p>
                  <p className="text-[12.5px] mt-0.5" style={{ color: "#66735f" }}>
                    {countIn(cat.id)} منتج · <span className="font-mono" dir="ltr">{cat.slug}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => setEditing(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors hover:bg-[#eef2ec]" style={{ color: "#2d5a0e" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    تعديل
                  </button>
                  <button type="button" onClick={() => setToDelete(cat)} title="حذف"
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50" style={{ color: "#dc2626" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog name={toDelete.name_ar} loading={deleting} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
