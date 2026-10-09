"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, getFeedbackImages, uploadToBucket, removeFromBucket } from "../../_lib/supabase";
import type { FeedbackImage, Product } from "../../_types";
import EmptyState from "../../_components/shared/EmptyState";
import { Spinner, ConfirmDialog, FormCard, Select, PageHeader, primaryBtn, inputClass, inputStyle, labelClass, labelStyle, type SelectOption } from "./ui";
import { useAdmin } from "./AdminApp";

export default function FeedbackManager({ products }: { products: Product[] }) {
  const { toast } = useAdmin();
  const [items,     setItems]     = useState<FeedbackImage[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [productId, setProductId] = useState("");
  const [customer,  setCustomer]  = useState("");
  const [files,     setFiles]     = useState<{ file: File; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("");
  const [toDelete,  setToDelete]  = useState<FeedbackImage | null>(null);
  const [deleting,  setDeleting]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFeedbackImages().then(data => { setItems(data); setLoading(false); });
  }, []);

  const productName = (id: string | null) => products.find(p => p.id === id)?.name_ar ?? "—";

  const pickFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const picked = Array.from(list)
      .filter(f => f.type.startsWith("image/"))
      .map(file => ({ file, url: URL.createObjectURL(file) }));
    setFiles(f => [...f, ...picked]);
  };

  const dropFile = (url: string) => {
    URL.revokeObjectURL(url);
    setFiles(f => f.filter(x => x.url !== url));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId)     { setError("اختاري المنتج"); return; }
    if (!files.length)  { setError("اختاري صورة واحدة على الأقل"); return; }
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(files.map(f => uploadToBucket("feedback-images", f.file, productId)));
      const { data, error: insError } = await supabase
        .from("feedback_images")
        .insert(urls.map(image_url => ({ product_id: productId, image_url, customer_name: customer.trim() || null })))
        .select();
      if (insError) throw new Error(insError.message);
      setItems(prev => [...(data ?? []), ...prev]);
      files.forEach(f => URL.revokeObjectURL(f.url));
      setFiles([]);
      setCustomer("");
      toast("تمت إضافة الفيدباك");
    } catch (err) {
      console.error("[FeedbackManager]", err);
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { error: delError } = await supabase.from("feedback_images").delete().eq("id", toDelete.id);
    if (delError) {
      toast("تعذّر حذف الصورة", "error");
    } else {
      removeFromBucket("feedback-images", toDelete.image_url);
      setItems(prev => prev.filter(i => i.id !== toDelete.id));
      toast("تم الحذف بنجاح");
    }
    setDeleting(false);
    setToDelete(null);
  };

  const visible = filter ? items.filter(i => i.product_id === filter) : items;
  const sortedProducts = [...products].sort((a, b) => a.name_ar.localeCompare(b.name_ar, "ar"));
  const toOption = (p: Product): SelectOption => ({ value: p.id, label: p.name_ar, image: p.image_no_bg_url ?? p.image_url ?? null, hint: p.unit });
  const productOptions = sortedProducts.map(toOption);
  const filterOptions: SelectOption[] = [
    { value: "", label: `كل المنتجات (${items.length})` },
    ...sortedProducts.filter(p => items.some(i => i.product_id === p.id)).map(p => ({
      ...toOption(p),
      hint: `${items.filter(i => i.product_id === p.id).length} صورة`,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="الفيدباك" subtitle="صور آراء الزبائن تظهر أسفل صفحة المنتج في الموقع" />

      <FormCard title="إضافة صور فيدباك">
        <form onSubmit={handleUpload} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-2.5 rounded-xl">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>المنتج <span style={{ color: "#ef4444" }}>*</span></label>
              <Select value={productId} onChange={setProductId} options={productOptions} placeholder="اختاري المنتج..." searchable />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>اسم الزبونة (اختياري)</label>
              <input type="text" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="مثال: سارة"
                className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {files.map(f => (
              <div key={f.url} className="relative w-24 h-24 rounded-xl overflow-hidden" style={{ border: "1px solid #e5e9e4", background: "#f7f8f7" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => dropFile(f.url)} title="إزالة"
                  className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: "rgba(255,255,255,0.95)", color: "#dc2626" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3 h-3"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:border-[var(--forest-mid)]"
              style={{ borderColor: "#e5e9e4", background: "#f7f8f7", color: "var(--text-light)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
              <span className="text-[11px]">صورة</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { pickFiles(e.target.files); e.target.value = ""; }} />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={uploading} className={`${primaryBtn} w-full sm:w-auto`}>
              {uploading ? "جاري الرفع..." : "رفع الفيدباك"}
            </button>
          </div>
        </form>
      </FormCard>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <p className="text-[13px] font-semibold" style={{ color: "var(--text-dark)" }}>
            الصور المرفوعة <span className="font-normal" style={{ color: "var(--text-light)" }}>({visible.length})</span>
          </p>
          <Select value={filter} onChange={setFilter} options={filterOptions} compact className="w-full sm:w-72" />
        </div>

        {loading ? <Spinner /> : visible.length === 0 ? (
          <EmptyState title="لا توجد صور فيدباك" subtitle="الصور التي ترفعينها ستظهر هنا" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visible.map(item => (
              <div key={item.id} className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "var(--border)" }}>
                <a href={item.image_url} target="_blank" rel="noopener noreferrer" className="block aspect-square" style={{ background: "#f7f8f7" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={`فيدباك ${productName(item.product_id)}`} className="w-full h-full object-cover" loading="lazy" />
                </a>
                <div className="px-3 py-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium truncate" style={{ color: "var(--text-dark)" }}>{productName(item.product_id)}</p>
                    {item.customer_name && <p className="text-[11.5px] truncate" style={{ color: "var(--text-muted)" }}>{item.customer_name}</p>}
                  </div>
                  <button type="button" onClick={() => setToDelete(item)} title="حذف"
                    className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                    style={{ color: "#ef4444" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          name={`صورة فيدباك ${productName(toDelete.product_id)}`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
