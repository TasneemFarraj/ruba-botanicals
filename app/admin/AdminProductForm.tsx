"use client";

import { useState, useRef } from "react";
import { X, Upload, ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "../_lib/supabase";
import type { Product, Category } from "../_types";

interface Props {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

type FormState = {
  name_ar:        string;
  description_ar: string;
  price:          string;
  unit:           string;
  category_id:    string;
  is_best_seller: boolean;
  in_stock:       boolean;
  image_url:      string;
  image_no_bg_url: string;
};

export default function AdminProductForm({ product, categories, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    name_ar:         product?.name_ar         ?? "",
    description_ar:  product?.description_ar  ?? "",
    price:           product?.price?.toString() ?? "",
    unit:            product?.unit            ?? "",
    category_id:     product?.category_id     ?? "",
    is_best_seller:  product?.is_best_seller  ?? false,
    in_stock:        product?.in_stock        ?? true,
    image_url:       product?.image_url       ?? "",
    image_no_bg_url: product?.image_no_bg_url ?? "",
  });

  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [noBgFile,     setNoBgFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url       ?? "");
  const [noBgPreview,  setNoBgPreview]  = useState(product?.image_no_bg_url ?? "");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [catOpen,      setCatOpen]      = useState(false);

  const imgRef  = useRef<HTMLInputElement>(null);
  const noBgRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find(c => c.id === form.category_id);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "nobg") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (type === "main") { setImageFile(file); setImagePreview(reader.result as string); }
      else                 { setNoBgFile(file);  setNoBgPreview(reader.result as string);  }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim() || !form.price.trim()) {
      setError("اسم المنتج والسعر مطلوبان");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const tempId = product?.id ?? crypto.randomUUID();
      let imageUrl = form.image_url;
      let noBgUrl  = form.image_no_bg_url;

      if (imageFile) {
        const url = await uploadProductImage(imageFile, `${tempId}/main`);
        if (url) imageUrl = url;
      }
      if (noBgFile) {
        const url = await uploadProductImage(noBgFile, `${tempId}/nobg`);
        if (url) noBgUrl = url;
      }

      const payload = {
        name_ar:         form.name_ar.trim(),
        description_ar:  form.description_ar.trim() || undefined,
        price:           parseFloat(form.price),
        unit:            form.unit.trim() || undefined,
        category_id:     form.category_id || undefined,
        is_best_seller:  form.is_best_seller,
        in_stock:        form.in_stock,
        image_url:       imageUrl || undefined,
        image_no_bg_url: noBgUrl  || undefined,
        sort_order:      product?.sort_order ?? 0,
      };

      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload as Omit<Product, "id" | "created_at">);
      }
      onSuccess();
    } catch {
      setError("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors placeholder:text-[var(--text-light)]";
  const inputStyle = {
    background: "var(--cream)",
    border: "1px solid var(--border)",
    color: "var(--text-dark)",
  };
  const labelClass = "block text-xs font-medium mb-1.5";
  const labelStyle = { color: "var(--text-muted)" };
  const req = <span style={{ color: "#ef4444" }}> *</span>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0"
        style={{ background: "rgba(28,58,26,0.45)", backdropFilter: "blur(4px)" }} />

      <div className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "var(--cream)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl font-semibold" style={{ color: "var(--forest)" }}>
            {product ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Image uploads */}
            <div className="grid grid-cols-2 gap-4">
              {([
                { label: "صورة المنتج", ref: imgRef,  preview: imagePreview, type: "main" as const },
                { label: "بدون خلفية (PNG)", ref: noBgRef, preview: noBgPreview, type: "nobg" as const },
              ] as const).map(({ label, ref, preview, type }) => (
                <div key={type}>
                  <p className={labelClass} style={labelStyle}>{label}</p>
                  <div
                    onClick={() => ref.current?.click()}
                    className="relative aspect-square rounded-xl border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center transition-colors hover:border-[var(--forest-mid)]"
                    style={{ borderColor: "var(--border)", background: "var(--cream-card)" }}
                  >
                    {preview ? (
                      <Image src={preview} alt="preview" fill className="object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5" style={{ color: "var(--text-light)" }}>
                        <Upload size={18} />
                        <span className="text-[10px]">اضغط للرفع</span>
                      </div>
                    )}
                  </div>
                  <input ref={ref} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageChange(e, type)} />
                </div>
              ))}
            </div>

            {/* Name */}
            <div>
              <label className={labelClass} style={labelStyle}>الاسم{req}</label>
              <input
                type="text"
                required
                value={form.name_ar}
                placeholder="مثال: حناء شعر طبيعي"
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Price + Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>السعر (د.أ){req}</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  placeholder="0.00"
                  dir="ltr"
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>الوحدة</label>
                <input
                  type="text"
                  value={form.unit}
                  placeholder="مثال: 50g"
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Category — custom dropdown */}
            <div>
              <label className={labelClass} style={labelStyle}>الفئة</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCatOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
                  style={{
                    ...inputStyle,
                    color: selectedCategory ? "var(--text-dark)" : "var(--text-light)",
                  }}
                >
                  <span>{selectedCategory?.name_ar ?? "اختاري الفئة"}</span>
                  <ChevronDown
                    size={15}
                    style={{
                      color: "var(--text-light)",
                      transform: catOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {catOpen && (
                  <div
                    className="absolute top-full mt-1 right-0 left-0 rounded-xl shadow-lg overflow-y-auto max-h-52 z-10 border"
                    style={{ background: "#fff", borderColor: "var(--border)" }}
                  >
                    {/* Clear option */}
                    <button
                      type="button"
                      onClick={() => { setForm({ ...form, category_id: "" }); setCatOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-right transition-colors hover:bg-[var(--cream)]"
                      style={{ color: "var(--text-light)" }}
                    >
                      <span>بدون فئة</span>
                      {!form.category_id && <Check size={13} style={{ color: "var(--forest)" }} />}
                    </button>
                    <div style={{ borderTop: "1px solid var(--border)" }} />
                    {categories.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setForm({ ...form, category_id: c.id }); setCatOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-right transition-colors hover:bg-[var(--cream)]"
                        style={{ color: "var(--text-dark)" }}
                      >
                        <span>{c.name_ar}</span>
                        {form.category_id === c.id && <Check size={13} style={{ color: "var(--forest)" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass} style={labelStyle}>الوصف</label>
              <textarea
                rows={3}
                value={form.description_ar}
                placeholder="وصف مختصر للمنتج..."
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                className={`${inputClass} resize-none rounded-2xl placeholder:text-[var(--text-light)]`}
                style={inputStyle}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-1">
              {([
                { label: "الأكثر مبيعاً", key: "is_best_seller" as const },
                { label: "متوفر",          key: "in_stock"        as const },
              ] as const).map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                    className="w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0"
                    style={{ background: form[key] ? "var(--forest-mid)" : "#d1d5db" }}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200"
                      style={{ right: form[key] ? "2px" : "auto", left: form[key] ? "auto" : "2px" }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--forest)", color: "#fff" }}
            >
              {loading ? "جاري الحفظ..." : product ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
