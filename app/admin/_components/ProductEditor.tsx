"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, getProductImages, uploadToBucket, removeFromBucket } from "../../_lib/supabase";
import { applyDiscount } from "../../_lib/utils";
import type { Product, ProductImage } from "../../_types";
import { useAdmin } from "./AdminApp";
import { Spinner, FormCard, Select, Toggle, AutoTextarea, PageHeader, primaryBtn, secondaryBtn, inputClass, inputStyle, numberClass, labelClass, labelStyle, type SelectOption } from "./ui";
import EmptyState from "../../_components/shared/EmptyState";

type HowToUseStep = { title: string; text: string };

/** A gallery tile: an existing product_images row, the legacy main image, or a pending upload */
type GalleryItem = {
  key: string;
  url: string;   // public URL, or a local object URL for pending uploads
  id?: string;   // product_images row id
  file?: File;
};

type FormState = {
  name_ar:          string;
  description_ar:   string;
  price:            string;
  original_price:   string;
  discount_percent: string;
  unit:             string;
  sort_order:       string;
  category_id:      string;
  is_best_seller:   boolean;
  in_stock:         boolean;
  storage_ar:       string;
  expiry_ar:        string;
  warnings_ar:      string;
};

const EMPTY_FORM: FormState = {
  name_ar: "", description_ar: "", price: "", original_price: "", discount_percent: "",
  unit: "", sort_order: "0", category_id: "", is_best_seller: false, in_stock: true,
  storage_ar: "", expiry_ar: "", warnings_ar: "",
};

function toForm(p: Product): FormState {
  return {
    name_ar:          p.name_ar ?? "",
    description_ar:   p.description_ar ?? "",
    price:            p.price?.toString() ?? "",
    original_price:   p.original_price?.toString() ?? "",
    discount_percent: p.discount_percent ? p.discount_percent.toString() : "",
    unit:             p.unit ?? "",
    sort_order:       p.sort_order?.toString() ?? "0",
    category_id:      p.category_id ?? "",
    is_best_seller:   p.is_best_seller ?? false,
    in_stock:         p.in_stock ?? true,
    storage_ar:       p.storage_ar ?? "",
    expiry_ar:        p.expiry_ar ?? "",
    warnings_ar:      p.warnings_ar?.join("\n") ?? "",
  };
}

export default function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEdit = !!productId;
  const { products, setProducts, categories, toast } = useAdmin();

  // Opened from the products list → the product is already cached, so the form shows instantly
  const cached = productId ? products.find(p => p.id === productId) ?? null : null;

  const [loadingData,    setLoadingData]    = useState(isEdit && !cached);
  const [galleryLoading, setGalleryLoading] = useState(isEdit);
  const [notFound,    setNotFound]    = useState(false);
  const [product,     setProduct]     = useState<Product | null>(cached);
  const [form,        setForm]        = useState<FormState>(() => cached ? toForm(cached) : EMPTY_FORM);
  const [steps,       setSteps]       = useState<HowToUseStep[]>(() => cached?.how_to_use_ar ?? []);
  const [gallery,     setGallery]     = useState<GalleryItem[]>([]);
  const [savedRows,   setSavedRows]   = useState<ProductImage[]>([]);
  const [noBgFile,    setNoBgFile]    = useState<File | null>(null);
  const [noBgPreview, setNoBgPreview] = useState(cached?.image_no_bg_url ?? "");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [dragFrom,    setDragFrom]    = useState<number | null>(null);
  const [dragOver,    setDragOver]    = useState<number | null>(null);

  const galleryRef = useRef<HTMLInputElement>(null);
  const noBgRef    = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);

  /* ─ When editing: load the gallery (and the product itself if it isn't cached yet) ─ */
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    (async () => {
      const [rows, fetched] = await Promise.all([
        getProductImages(productId),
        cached
          ? Promise.resolve(cached)
          : supabase.from("products").select("*").eq("id", productId).maybeSingle().then(r => r.data as Product | null),
      ]);
      if (cancelled) return;
      if (!fetched) { setNotFound(true); setLoadingData(false); setGalleryLoading(false); return; }
      if (!cached) {
        setProduct(fetched);
        setForm(toForm(fetched));
        setSteps(fetched.how_to_use_ar ?? []);
        setNoBgPreview(fetched.image_no_bg_url ?? "");
      }
      setSavedRows(rows);
      setGallery(rows.length > 0
        ? rows.map(r => ({ key: r.id, id: r.id, url: r.image_url }))
        // No gallery yet — start from the current main image so it carries over on save
        : fetched.image_url ? [{ key: "legacy-main", url: fetched.image_url }] : []);
      setLoadingData(false);
      setGalleryLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per product; the cached copy is only a head start
  }, [productId]);

  useEffect(() => () => objectUrls.current.forEach(u => URL.revokeObjectURL(u)), []);

  const preview = (file: File) => {
    const u = URL.createObjectURL(file);
    objectUrls.current.push(u);
    return u;
  };

  /* ─ Discount ─ */
  const originalNum = parseFloat(form.original_price);
  const percentNum  = parseFloat(form.discount_percent);
  const hasDiscount = originalNum > 0 && percentNum > 0;
  const discounted  = hasDiscount ? applyDiscount(originalNum, Math.min(percentNum, 100)) : null;

  /* ─ Gallery ─ */
  const addGalleryFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const items = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({ key: crypto.randomUUID(), url: preview(f), file: f }));
    setGallery(g => [...g, ...items]);
  };
  const removeGalleryItem = (key: string) => setGallery(g => g.filter(i => i.key !== key));
  const makeMain = (index: number) => setGallery(g => [g[index], ...g.filter((_, i) => i !== index)]);
  const moveGalleryItem = (from: number, to: number) => {
    if (from === to || to < 0) return;
    setGallery(g => {
      if (to >= g.length) return g;
      const next = [...g];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  /* ─ Steps ─ */
  const addStep    = () => setSteps(s => [...s, { title: "", text: "" }]);
  const removeStep = (i: number) => setSteps(s => s.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof HowToUseStep, value: string) =>
    setSteps(s => s.map((step, idx) => idx === i ? { ...step, [field]: value } : step));
  const moveStep = (i: number, to: number) => setSteps(s => {
    if (to < 0 || to >= s.length) return s;
    const next = [...s];
    [next[i], next[to]] = [next[to], next[i]];
    return next;
  });

  /* ─ Save ─ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim()) { setError("اسم المنتج مطلوب"); return; }
    if (form.discount_percent && (percentNum < 0 || percentNum >= 100)) {
      setError("نسبة الخصم يجب أن تكون بين 0 و 99");
      return;
    }
    if (percentNum > 0 && !(originalNum > 0)) {
      setError("أدخلي السعر قبل الخصم لتطبيق نسبة الخصم");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const id = product?.id ?? crypto.randomUUID();

      /* 1. Upload pending files */
      const noBgUrl = noBgFile
        ? await uploadToBucket("product-images", noBgFile, id)
        : noBgPreview || null;
      const finalGallery = await Promise.all(gallery.map(async g =>
        g.file ? { ...g, url: await uploadToBucket("product-images", g.file, `${id}/gallery`), file: undefined } : g
      ));

      /* 2. Save the product — first gallery image is the main image */
      const warnings   = form.warnings_ar.split("\n").map(w => w.trim()).filter(Boolean);
      const cleanSteps = steps.filter(s => s.title.trim() || s.text.trim());
      const payload = {
        name_ar:          form.name_ar.trim(),
        description_ar:   form.description_ar.trim() || null,
        price:            hasDiscount ? discounted : (form.price.trim() ? parseFloat(form.price) : null),
        original_price:   hasDiscount ? originalNum : null,
        discount_percent: hasDiscount ? percentNum : 0,
        unit:             form.unit.trim() || null,
        category_id:      form.category_id || null,
        is_best_seller:   form.is_best_seller,
        in_stock:         form.in_stock,
        image_url:        finalGallery[0]?.url ?? null,
        image_no_bg_url:  noBgUrl,
        sort_order:       parseInt(form.sort_order) || 0,
        how_to_use_ar:    cleanSteps.length > 0 ? cleanSteps : null,
        storage_ar:       form.storage_ar.trim() || null,
        expiry_ar:        form.expiry_ar.trim() || null,
        warnings_ar:      warnings.length > 0 ? warnings : null,
      };
      const { data: saved, error: saveError } = isEdit
        ? await supabase.from("products").update(payload).eq("id", id).select().single()
        : await supabase.from("products").insert([{ id, ...payload }]).select().single();
      if (saveError) throw new Error(`فشل حفظ المنتج: ${saveError.message}`);

      /* 3. Sync gallery rows */
      const keptIds = new Set(finalGallery.flatMap(g => g.id ? [g.id] : []));
      const removed = savedRows.filter(r => !keptIds.has(r.id));
      if (removed.length > 0) {
        const { error: delError } = await supabase.from("product_images").delete().in("id", removed.map(r => r.id));
        if (delError) throw new Error(`فشل حذف الصور: ${delError.message}`);
      }
      const oldOrder = new Map(savedRows.map(r => [r.id, r.sort_order]));
      const reorders = finalGallery.flatMap((g, i) =>
        g.id && oldOrder.get(g.id) !== i
          ? [supabase.from("product_images").update({ sort_order: i }).eq("id", g.id)]
          : []);
      const reorderResults = await Promise.all(reorders);
      const reorderError = reorderResults.find(r => r.error)?.error;
      if (reorderError) throw new Error(`فشل ترتيب الصور: ${reorderError.message}`);
      const newRows = finalGallery.flatMap((g, i) =>
        g.id ? [] : [{ product_id: id, image_url: g.url, sort_order: i }]);
      if (newRows.length > 0) {
        const { error: insError } = await supabase.from("product_images").insert(newRows);
        if (insError) throw new Error(`فشل حفظ الصور: ${insError.message}`);
      }

      /* 4. Clean up storage for removed images that nothing references anymore */
      const stillUsed = new Set([...finalGallery.map(g => g.url), noBgUrl]);
      removed.filter(r => !stillUsed.has(r.image_url))
        .forEach(r => removeFromBucket("product-images", r.image_url));

      // Update the shared list so the products page is current without refetching
      setProducts(prev => prev.some(p => p.id === id)
        ? prev.map(p => p.id === id ? saved as Product : p)
        : [...prev, saved as Product]);
      toast(isEdit ? "تم حفظ التعديلات" : "تمت إضافة المنتج");
      router.push("/admin/products");
    } catch (err) {
      console.error("[ProductEditor]", err);
      setError(err instanceof Error ? err.message : "حدث خطأ، يرجى المحاولة مجدداً");
      setSaving(false);
    }
  };

  if (loadingData) return <Spinner />;
  if (notFound) {
    return <EmptyState title="المنتج غير موجود" actionLabel="العودة للمنتجات" onAction={() => router.push("/admin/products")} />;
  }

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const categoryOptions: SelectOption[] = [
    { value: "", label: "بدون فئة" },
    ...categories.map(c => ({ value: c.id, label: c.name_ar })),
  ];
  const sellingPrice = hasDiscount ? discounted : (form.price.trim() ? parseFloat(form.price) : null);
  const previewImage = noBgPreview || gallery[0]?.url || "";
  const iconCls = "w-[18px] h-[18px]";

  /* Arrow icons are drawn (not ‹ › characters, which flip in RTL text) */
  const ArrowRight = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>;
  const ArrowLeft  = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 6l-6 6 6 6" /></svg>;
  const ArrowUp    = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M6 11l6-6 6 6" /></svg>;
  const ArrowDown  = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" /></svg>;
  const tileBtn = "w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-default";

  return (
    <form onSubmit={handleSubmit} className="pb-36 lg:pb-24">
      <PageHeader
        backHref="/admin/products"
        title={isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
        subtitle={isEdit ? product?.name_ar : "أضيفي الصور والتفاصيل ثم احفظي"}
      />

      {error && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-[13.5px] px-4 py-3 rounded-xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 8v4M12 16h.01" /></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 lg:gap-6 items-start">
        {/* ══ Main column ══ */}
        <div className="space-y-5 lg:space-y-6 min-w-0">

          {/* Gallery */}
          <FormCard
            title="صور المنتج"
            hint="الصورة الأولى هي الرئيسية — رتّبي بالأسهم أو بالسحب"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5-5-9 9" /></svg>}
          >
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { addGalleryFiles(e.target.files); e.target.value = ""; }} />
            {galleryLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[0, 1, 2].map(i => <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: "#eef1ec" }} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-flow-row-dense gap-3"
                onDragOver={e => { if (dragFrom === null) e.preventDefault(); }}
                onDrop={e => { if (dragFrom === null) { e.preventDefault(); addGalleryFiles(e.dataTransfer.files); } }}>
                {gallery.map((g, i) => (
                  <div key={g.key}
                    draggable
                    onDragStart={e => { setDragFrom(i); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={e => { if (dragFrom !== null) { e.preventDefault(); setDragOver(i); } }}
                    onDragLeave={() => setDragOver(o => o === i ? null : o)}
                    onDrop={e => { if (dragFrom !== null) { e.preventDefault(); e.stopPropagation(); moveGalleryItem(dragFrom, i); } setDragFrom(null); setDragOver(null); }}
                    onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                    className={`rounded-2xl overflow-hidden flex flex-col cursor-grab active:cursor-grabbing ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                    style={{
                      background: "#fff",
                      border: i === 0 ? "2px solid #c08a2e" : "1px solid #e3e8e1",
                      outline: dragOver === i ? "2px dashed var(--forest-light)" : "none",
                      outlineOffset: 3,
                      opacity: dragFrom === i ? 0.4 : 1,
                    }}>
                    <div className={`relative ${i === 0 ? "aspect-square sm:aspect-auto sm:flex-1 sm:min-h-[240px]" : "aspect-square"}`} style={{ background: "#f4f6f3" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.url} alt={`صورة ${i + 1}`} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                      <span className="absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={i === 0 ? { background: "#c08a2e", color: "#fff" } : { background: "rgba(255,255,255,0.92)", color: "#16231a" }}>
                        {i === 0 ? "الرئيسية" : i + 1}
                      </span>
                      {g.file && (
                        <span className="absolute top-2 left-2 text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#2d5a0e", color: "#fff" }}>جديدة</span>
                      )}
                    </div>
                    {/* Controls — always visible so they work on touch screens */}
                    <div className="flex items-center justify-between gap-1 px-1.5 py-1.5" style={{ borderTop: "1px solid #eef1ec" }}>
                      <div className="flex items-center">
                        <button type="button" onClick={() => moveGalleryItem(i, i - 1)} disabled={i === 0}
                          title="تقديم" className={`${tileBtn} hover:bg-[#eef2ec]`} style={{ color: "#16231a" }}>{ArrowRight}</button>
                        <button type="button" onClick={() => moveGalleryItem(i, i + 1)} disabled={i === gallery.length - 1}
                          title="تأخير" className={`${tileBtn} hover:bg-[#eef2ec]`} style={{ color: "#16231a" }}>{ArrowLeft}</button>
                      </div>
                      <div className="flex items-center">
                        {i !== 0 && (
                          <button type="button" onClick={() => makeMain(i)} title="تعيين كصورة رئيسية"
                            className={`${tileBtn} hover:bg-[#fbf3e4]`} style={{ color: "#c08a2e" }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" /></svg>
                          </button>
                        )}
                        <button type="button" onClick={() => removeGalleryItem(g.key)} title="حذف الصورة"
                          className={`${tileBtn} hover:bg-red-50`} style={{ color: "#dc2626" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => galleryRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-[var(--forest-light)] hover:bg-[#f2f6ee] ${gallery.length === 0 ? "col-span-2 sm:col-span-3 lg:col-span-4 py-12" : "min-h-[160px]"}`}
                  style={{ borderColor: "#d5dcd1", background: "#fafbf9", color: "#66735f" }}>
                  <span className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#eef2ec", color: "#2d5a0e" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                  </span>
                  <span className="text-[13px] font-medium">{gallery.length === 0 ? "اضغطي أو اسحبي الصور هنا" : "إضافة صور"}</span>
                </button>
              </div>
            )}
          </FormCard>

          {/* Basic info */}
          <FormCard
            title="المعلومات الأساسية"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" /></svg>}
          >
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={labelStyle}>اسم المنتج <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="text" required value={form.name_ar} placeholder="مثال: حناء شعر طبيعي"
                  onChange={set("name_ar")} className={inputClass} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_110px] gap-3 sm:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass} style={labelStyle}>الفئة</label>
                  <Select value={form.category_id} onChange={v => setForm(f => ({ ...f, category_id: v }))}
                    options={categoryOptions} placeholder="اختاري الفئة" />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>الوحدة / الحجم</label>
                  <input type="text" value={form.unit} placeholder="مثال: 50g"
                    onChange={set("unit")} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>الترتيب</label>
                  <input type="number" inputMode="numeric" value={form.sort_order} placeholder="0" dir="ltr"
                    onChange={set("sort_order")} className={`${inputClass} ${numberClass} text-center`} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>الوصف</label>
                <AutoTextarea minRows={4} value={form.description_ar} placeholder="اكتبي وصف المنتج وفوائده..."
                  onChange={set("description_ar")} className={inputClass} style={inputStyle} />
              </div>
            </div>
          </FormCard>

          {/* How to use */}
          <FormCard
            title="طريقة الاستخدام"
            hint="خطوات مرقّمة تظهر في صفحة المنتج"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>}
          >
            {steps.length > 0 && (
              <ol className="space-y-3 mb-3">
                {steps.map((step, i) => (
                  <li key={i} className="rounded-2xl p-3 sm:p-4" style={{ background: "#f7f9f6", border: "1px solid #e8ece6" }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                        style={{ background: "#1c3a1a", color: "#fff" }}>{i + 1}</span>
                      <input type="text" value={step.title} placeholder="عنوان الخطوة (مثال: التحضير)"
                        onChange={e => updateStep(i, "title", e.target.value)}
                        className={`${inputClass} font-semibold`} style={inputStyle} />
                      <div className="flex items-center shrink-0">
                        <button type="button" onClick={() => moveStep(i, i - 1)} disabled={i === 0} title="لأعلى"
                          className={`${tileBtn} hover:bg-white`} style={{ color: "#16231a" }}>{ArrowUp}</button>
                        <button type="button" onClick={() => moveStep(i, i + 1)} disabled={i === steps.length - 1} title="لأسفل"
                          className={`${tileBtn} hover:bg-white`} style={{ color: "#16231a" }}>{ArrowDown}</button>
                        <button type="button" onClick={() => removeStep(i)} title="حذف الخطوة"
                          className={`${tileBtn} hover:bg-red-50`} style={{ color: "#dc2626" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <AutoTextarea value={step.text} placeholder="تفاصيل الخطوة..."
                      onChange={e => updateStep(i, "text", e.target.value)}
                      className={inputClass} style={inputStyle} />
                  </li>
                ))}
              </ol>
            )}
            <button type="button" onClick={addStep}
              className="w-full py-3 rounded-xl border-2 border-dashed text-[13.5px] font-semibold transition-colors hover:bg-[#f2f6ee] hover:border-[var(--forest-light)]"
              style={{ borderColor: "#d5dcd1", color: "#2d5a0e" }}>
              + إضافة خطوة
            </button>
          </FormCard>

          {/* Storage + warnings — free text, fields grow with the content */}
          <FormCard
            title="التخزين والصلاحية والتحذيرات"
            hint="اكتبي بحرية — الحقول تكبر مع النص"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={labelStyle}>شروط التخزين</label>
                  <AutoTextarea value={form.storage_ar} placeholder="مثال: يُحفظ في مكان بارد وجاف بعيداً عن الشمس"
                    onChange={set("storage_ar")} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>مدة الصلاحية</label>
                  <AutoTextarea value={form.expiry_ar} placeholder="مثال: سنتان من تاريخ الإنتاج"
                    onChange={set("expiry_ar")} className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>
                  التحذيرات <span className="font-normal text-[12px]" style={{ color: "#66735f" }}>— كل سطر يظهر كنقطة منفصلة</span>
                </label>
                <AutoTextarea minRows={4} value={form.warnings_ar}
                  placeholder={"مثال:\nيُنصح بإجراء اختبار الحساسية قبل الاستخدام\nيُبعد عن متناول الأطفال"}
                  onChange={set("warnings_ar")} className={inputClass} style={inputStyle} />
              </div>
            </div>
          </FormCard>
        </div>

        {/* ══ Side column ══ */}
        <div className="space-y-5 lg:space-y-6 xl:sticky xl:top-6">

          {/* Store preview */}
          <section className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e3e8e1" }}>
            <p className="px-5 pt-4 text-[12.5px] font-semibold" style={{ color: "#66735f" }}>معاينة في المتجر</p>
            <div className="p-5 pt-3 flex gap-4 items-center">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0" style={{ background: "var(--surface-card)" }}>
                {previewImage
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={previewImage} alt="" className="w-full h-full object-contain p-2" />
                  : <span className="absolute inset-0 flex items-center justify-center text-[11px]" style={{ color: "#8a9685" }}>بدون صورة</span>}
                {hasDiscount && (
                  <span className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#b91c1c", color: "#fff" }}>
                    خصم {Math.round(percentNum)}%
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-snug line-clamp-2" style={{ color: "#16231a" }}>
                  {form.name_ar.trim() || "اسم المنتج"}
                </p>
                {form.unit && <p className="text-[12.5px]" style={{ color: "#66735f" }}>{form.unit}</p>}
                <p className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[16px] font-bold" style={{ color: "#a8742a" }}>
                    {sellingPrice != null ? `${sellingPrice} د.أ` : "بالاتفاق"}
                  </span>
                  {hasDiscount && <s className="text-[13px]" style={{ color: "#66735f" }}>{originalNum}</s>}
                </p>
                {!form.in_stock && <p className="text-[11.5px] mt-1 font-medium" style={{ color: "#b45309" }}>نفد من المخزون</p>}
              </div>
            </div>
          </section>

          {/* Price & discount */}
          <FormCard
            title="السعر والخصم"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7.5 7.5h.01" /></svg>}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={labelStyle}>سعر قبل الخصم</label>
                  <div className="relative">
                    <input type="number" min="0" step="0.01" value={form.original_price} placeholder="0.00" dir="ltr"
                      onChange={set("original_price")} className={`${inputClass} ${numberClass} pl-10`} style={inputStyle} />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: "#66735f" }}>د.أ</span>
                  </div>
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>نسبة الخصم</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" step="1" value={form.discount_percent} placeholder="0" dir="ltr"
                      onChange={set("discount_percent")} className={`${inputClass} ${numberClass} pl-8`} style={inputStyle} />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold" style={{ color: "#66735f" }}>%</span>
                  </div>
                </div>
              </div>

              {hasDiscount ? (
                <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "#eef4e8" }}>
                  <span className="text-[13px] font-medium" style={{ color: "#2d5a0e" }}>السعر بعد الخصم</span>
                  <span className="text-[18px] font-bold tabular-nums" style={{ color: "#1c3a1a" }}>
                    {discounted?.toFixed(2)} <span className="text-[12px] font-normal">د.أ</span>
                  </span>
                </div>
              ) : (
                <div className="pt-4" style={{ borderTop: "1px solid #eef0ec" }}>
                  <label className={labelClass} style={labelStyle}>
                    السعر <span className="font-normal text-[12px]" style={{ color: "#66735f" }}>(بدون خصم)</span>
                  </label>
                  <div className="relative">
                    <input type="number" min="0" step="0.01" value={form.price} placeholder="0.00" dir="ltr"
                      onChange={set("price")} className={`${inputClass} ${numberClass} pl-10`} style={inputStyle} />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: "#66735f" }}>د.أ</span>
                  </div>
                  <p className="text-[12px] mt-2 leading-5" style={{ color: "#66735f" }}>
                    اتركيه فارغاً ليظهر &quot;بالاتفاق&quot;. لتطبيق خصم عبّئي الحقلين بالأعلى.
                  </p>
                </div>
              )}
            </div>
          </FormCard>

          {/* Visibility */}
          <FormCard
            title="الظهور في المتجر"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>}
          >
            <div className="space-y-4">
              {([
                { key: "in_stock" as const,       label: "متوفر",          desc: "إيقافه يعرض \"نفد من المخزون\"" },
                { key: "is_best_seller" as const, label: "الأكثر مبيعًا",  desc: "يظهر في قسم الأكثر مبيعاً بالرئيسية" },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: "#16231a" }}>{label}</p>
                    <p className="text-[12px]" style={{ color: "#66735f" }}>{desc}</p>
                  </div>
                  <Toggle value={form[key]} onChange={() => setForm(f => ({ ...f, [key]: !f[key] }))} />
                </div>
              ))}
            </div>
          </FormCard>

          {/* No-background image */}
          <FormCard title="صورة بدون خلفية" hint="PNG شفافة — تُستخدم في بطاقات المنتجات إن وُجدت"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4" /></svg>}
          >
            <button type="button"
              onClick={() => noBgRef.current?.click()}
              className="relative w-full rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-colors hover:border-[var(--forest-light)]"
              style={{
                height: 160,
                borderColor: "#d5dcd1",
                backgroundColor: "#fafbf9",
                backgroundImage: noBgPreview ? "repeating-conic-gradient(#eef0ec 0% 25%, #fff 0% 50%)" : undefined,
                backgroundSize: "16px 16px",
              }}
            >
              {noBgPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={noBgPreview} alt="بدون خلفية" className="w-full h-full object-contain p-3" />
              ) : (
                <span className="text-[13px] font-medium" style={{ color: "#66735f" }}>اضغطي لرفع صورة</span>
              )}
            </button>
            <input ref={noBgRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setNoBgFile(f); setNoBgPreview(preview(f)); }
                e.target.value = "";
              }} />
            {noBgPreview && (
              <button type="button" onClick={() => { setNoBgFile(null); setNoBgPreview(""); }}
                className="mt-2.5 text-[13px] font-medium hover:underline" style={{ color: "#dc2626" }}>
                إزالة الصورة
              </button>
            )}
          </FormCard>
        </div>
      </div>

      {/* ── Save bar — sits above the mobile tab bar, and beside the desktop sidebar ── */}
      <div className="fixed inset-x-0 bottom-[60px] lg:bottom-0 lg:right-64 z-20 border-t" style={{ background: "rgba(255,255,255,0.97)", borderColor: "#e3e8e1", backdropFilter: "blur(8px)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <p className="hidden md:block text-[13px] truncate" style={{ color: "#66735f" }}>
            {gallery.some(g => g.file) || noBgFile ? "سيتم رفع الصور الجديدة عند الحفظ" : ""}
          </p>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href="/admin/products" className={`${secondaryBtn} flex-1 md:flex-none`}>إلغاء</Link>
            <button type="submit" disabled={saving} className={`${primaryBtn} flex-[2] md:flex-none md:px-8`}>
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
