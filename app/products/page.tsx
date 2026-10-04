import { Suspense } from "react";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import ProductPageClient from "./ProductPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "جميع المنتجات",
  description: "تسوّقي منتجات ربى فرّاج الطبيعية للعناية بالشعر والجسم، والحناء النقية، بتركيبات مدروسة بخبرة علمية.",
  alternates: { canonical: "/products" },
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
          />
        </div>
      }>
        <ProductPageClient searchParams={searchParams} />
      </Suspense>
      <Footer />
    </>
  );
}
