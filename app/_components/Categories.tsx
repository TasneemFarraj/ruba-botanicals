"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories, supabase } from "../_lib/supabase";
import type { Category } from "../_types";
import { ui } from "../_lib/translations";
import EmptyState from "./shared/EmptyState";
import SectionHeader from "./shared/SectionHeader";

const t = ui.categories;

const CARD_PALETTES = [
  { bg: "linear-gradient(155deg, #2d5a18 0%, #162e0b 100%)" },
  { bg: "linear-gradient(155deg, #4a7c2a 0%, #2a4a16 100%)" },
  { bg: "linear-gradient(155deg, #8a6b2e 0%, #5c4518 100%)" },
  { bg: "linear-gradient(155deg, #1e4a38 0%, #0f2a20 100%)" },
  { bg: "linear-gradient(155deg, #5c3d2e 0%, #38261c 100%)" },
  { bg: "linear-gradient(155deg, #3a5c2a 0%, #1e3014 100%)" },
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((cats) => { setCategories(cats); setLoading(false); });

    const channel = supabase
      .channel("categories-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        getCategories().then(setCategories);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section
      style={{ background: "var(--white)", paddingTop: "var(--section-py)", paddingBottom: "var(--section-py)" }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <SectionHeader
          heading={t.heading}
          desc={t.subheading}
          className="mb-8"
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl" style={{ aspectRatio: "3/4", background: "var(--cream-card)" }} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState title="لا توجد فئات حتى الآن" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} palette={CARD_PALETTES[i % CARD_PALETTES.length]} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

function CategoryCard({ category, palette }: { category: Category; palette: { bg: string } }) {
  return (
    <Link
      href={`/products/category/${category.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
      style={{ aspectRatio: "3/4" }}
    >
      {category.image_url ? (
        <>
          <Image
            src={category.image_url}
            alt={category.name_ar}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(8,16,6,0.78) 0%, rgba(8,16,6,0.08) 55%, transparent 100%)" }}
          />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: palette.bg }} />
      )}

      {/* Category name — always at bottom */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
        <span
          className="font-display text-white leading-snug"
          style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          {category.name_ar}
        </span>

        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white select-none"
          style={{ fontSize: 22, lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
          aria-hidden="true"
        >
          ›
        </span>
      </div>
    </Link>
  );
}
