"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Sun, Moon, Search, X, Clock, Package, Ban } from "lucide-react";
import { gsap } from "gsap";
import { useCart } from "./CartProvider";
import { useTheme } from "./ThemeProvider";
import { getCategories, getNavProducts } from "../_lib/supabase";
import type { Category, Product } from "../_types";

const SERVICES = [
  { title: "خدمة منزلية",  href: "/products?cat=home-service", links: ["حجز موعد", "مناطق الخدمة", "الأسعار"] },
  { title: "حفلات وأعراس", href: "/products?cat=events",       links: ["حفلات الأعراس", "حفلات التخرج", "المناسبات الخاصة"] },
  { title: "دورات معتمدة", href: "/products?cat=courses",      links: ["دورة المبتدئين", "دورة الاحتراف", "شهادة معتمدة"] },
];

export default function Navbar() {
  const dropRef    = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [openMenu,    setOpenMenu]    = useState<string | null>(null);
  const [openMob,     setOpenMob]     = useState<string | null>(null);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [navProducts, setNavProducts] = useState<Product[]>([]);
  const [logoError,   setLogoError]   = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [atAbout,     setAtAbout]     = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { count, openCart }    = useCart();
  const pathname               = usePathname();
  const router                 = useRouter();
  const isHome                 = pathname === "/";

  useEffect(() => {
    getCategories().then(setCategories);
    getNavProducts().then(setNavProducts);
  }, []);

  const SERVICE_CATS = new Set(["دورات الحناء", "حفلات وخدمة منزلية"]);

  const grouped = useMemo(() => {
    return categories
      .filter((cat) => !SERVICE_CATS.has(cat.name_ar))
      .map((cat) => ({
        cat,
        prods: navProducts.filter((p) => p.category_id === cat.id).slice(0, 5),
      }))
      .filter((g) => g.prods.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, navProducts]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const el = document.getElementById("about");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setAtAbout(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!dropRef.current || !openMenu) return;
    gsap.fromTo(dropRef.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
  }, [openMenu]);

  /* focus input when search opens */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  /* close search on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleEnter = (key: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpenMenu(key);
  };
  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* ── Nav bar ─────────────────────────────────────────── */}
      <nav
        dir="rtl"
        className="sticky top-0 z-50 w-full"
        style={{
          background:   isHome && !scrolled ? "transparent" : "var(--white)",
          borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
          transition:   "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          fontFamily:   "var(--font-display), Georgia, serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between" style={{ height: 60 }}>

          {/* Logo */}
          <button onClick={() => isHome ? window.scrollTo({ top: 0, behavior: "smooth" }) : router.push("/")} className="shrink-0 flex items-center" aria-label="ربى للحناء">
            {logoError ? (
              <span className="font-display" style={{ fontSize: 18, color: "var(--forest)" }}>ربى للحناء</span>
            ) : (
              <Image src="/images/ruba-logo.png" alt="ربى للحناء" width={110} height={44} priority className="h-11 w-auto" onError={() => setLogoError(true)} />
            )}
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-12">
            <div onMouseEnter={() => handleEnter("shop")} onMouseLeave={handleLeave}>
              <button className={`font-display nav-underline text-[16px] transition-colors duration-200 cursor-pointer ${openMenu === "shop" ? "nav-active" : ""}`} style={{ color: openMenu === "shop" ? "var(--forest)" : "var(--forest)" }}>
                المتجر
              </button>
            </div>
            <div onMouseEnter={() => handleEnter("services")} onMouseLeave={handleLeave}>
              <button className={`font-display nav-underline text-[16px] transition-colors duration-200 cursor-pointer ${openMenu === "services" ? "nav-active" : ""}`} style={{ color: openMenu === "services" ? "var(--forest)" : "var(--forest)" }}>
                خدماتنا
              </button>
            </div>
            <a
              href="/#about"
              className={`font-display nav-underline text-[16px] transition-colors duration-200${atAbout ? " nav-active" : ""}`}
              style={{ color: atAbout ? "var(--forest)" : "var(--forest)", textDecoration: "none" }}
              onClick={(e) => {
                const el = document.getElementById("about");
                if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); }
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = atAbout ? "var(--forest)" : "var(--forest)")}
            >
              من ربى؟
            </a>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Search icon */}
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="w-7 h-7 flex items-center justify-center transition-colors duration-300"
              style={{ color: "var(--forest)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--forest)")}
              aria-label="بحث"
            >
              {searchOpen ? <X size={14} strokeWidth={1.8} /> : <Search size={14} strokeWidth={1.8} />}
            </button>

            <button
              onClick={toggleTheme}
              className="hidden md:flex items-center justify-center transition-colors duration-300"
              style={{ color: "var(--forest)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--forest)")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} strokeWidth={1.8} /> : <Moon size={14} strokeWidth={1.8} />}
            </button>

            <span className="hidden md:block w-px h-4" style={{ background: "var(--border)" }} />

            <button
              onClick={openCart}
              className="relative w-7 h-7 flex items-center justify-center transition-colors duration-300"
              style={{ color: "var(--forest)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--forest)")}
              aria-label="السلة"
            >
              <ShoppingBag size={15} strokeWidth={1.6} />
              {count > 0 && (
                <span
                  className="absolute flex items-center justify-center rounded-full font-bold leading-none pointer-events-none"
                  style={{
                    minWidth: 14,
                    height: 14,
                    fontSize: 8,
                    background: "var(--forest)",
                    color: "#fff",
                    top: -2,
                    insetInlineEnd: -2,
                    padding: "0 2px",
                  }}
                >
                  {count}
                </span>
              )}
            </button>

            <button onClick={() => setMenuOpen((o) => !o)} className="md:hidden flex flex-col justify-center items-center gap-[5px] w-7 h-7" aria-label={menuOpen ? "إغلاق" : "القائمة"}>
              <Burger open={menuOpen} />
            </button>
          </div>
        </div>

        {/* ── Search overlay ───────────────────────────────── */}
        <div
          className="overflow-hidden"
          style={{
            maxHeight: searchOpen ? 68 : 0,
            opacity: searchOpen ? 1 : 0,
            transition: "max-height 0.35s ease, opacity 0.25s ease",
            borderTop: searchOpen ? "1px solid var(--border)" : "none",
            background: searchOpen && isHome && !scrolled ? "var(--cream)" : "transparent",
          }}
        >
          <form
            onSubmit={handleSearch}
            dir="rtl"
            className="max-w-2xl mx-auto px-6 md:px-10 flex items-center gap-2.5"
            style={{ height: 68 }}
          >
            <div
              className="flex-1 flex items-center gap-2.5 px-4 rounded-lg"
              style={{ background: "var(--surface-card)", height: 38 }}
            >
              <Search size={13} strokeWidth={1.8} style={{ color: "var(--text-light)", flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي عن أي منتج..."
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ color: "var(--text-1)", fontFamily: "var(--font-display), Georgia, serif" }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="transition-opacity hover:opacity-50" style={{ color: "var(--text-light)" }}>
                  <X size={11} strokeWidth={1.8} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="shrink-0 px-4 rounded-lg text-[13px] font-medium"
              style={{
                height: 38,
                background: searchQuery.trim() ? "var(--forest)" : "var(--surface-card)",
                color: searchQuery.trim() ? "#fff" : "var(--text-light)",
                transition: "background 0.25s ease, color 0.25s ease",
                cursor: "pointer",
              }}
            >
              بحث
            </button>
          </form>
        </div>

        {/* ── Mega dropdown ────────────────────────────────── */}
        {openMenu && (
          <div
            ref={dropRef}
            dir="rtl"
            className="absolute inset-x-0 top-full z-40"
            style={{ background: isHome && !scrolled ? "var(--cream)" : "var(--white)", borderTop: "1px solid var(--border)" }}
            onMouseEnter={() => leaveTimer.current && clearTimeout(leaveTimer.current)}
            onMouseLeave={handleLeave}
          >
            <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">

              {openMenu === "shop" && (
                grouped.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>جارٍ التحميل…</p>
                ) : (
                  <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                    {grouped.map(({ cat, prods }) => (
                      <div key={cat.id}>
                        <Link href={`/products/category/${cat.slug}`} onClick={() => setOpenMenu(null)}
                          className="block mb-3 pb-2 border-b transition-colors duration-200"
                          style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--forest)", borderColor: "var(--border)" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest-light)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest)")}
                        >
                          {cat.name_ar}
                        </Link>
                        <ul className="flex flex-col gap-1.5">
                          {prods.map((p) => (
                            <li key={p.id}>
                              <Link href={`/products/${p.id}`} onClick={() => setOpenMenu(null)}
                                className="text-[13px] leading-snug transition-colors duration-200 block"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest)")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
                              >
                                {p.name_ar}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
              )}

              {openMenu === "services" && (
                <div className="grid grid-cols-3 gap-8">
                  {SERVICES.map((col) => (
                    <div key={col.title}>
                      <Link href={col.href} onClick={() => setOpenMenu(null)}
                        className="block mb-3 pb-2 border-b transition-colors duration-200"
                        style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--forest)", borderColor: "var(--border)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest-light)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest)")}
                      >
                        {col.title}
                      </Link>
                      <ul className="flex flex-col gap-1.5">
                        {col.links.map((lk) => (
                          <li key={lk}>
                            <Link href={col.href} onClick={() => setOpenMenu(null)}
                              className="text-[13px] transition-colors duration-200 block"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest)")}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
                            >
                              {lk}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}
      </nav>

      {/* ── Mobile drawer ────────────────────────────────────── */}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(2px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        dir="rtl"
        className="fixed inset-y-0 right-0 z-50 md:hidden flex flex-col overflow-hidden"
        style={{
          width: "min(300px, 85vw)",
          background: "var(--white)",
          fontFamily: "var(--font-display), Georgia, serif",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 58, borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setMenuOpen(false)} aria-label="إغلاق"
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200"
            style={{ color: "var(--text-light)", background: "var(--surface-card)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-dark)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-light)")}
          >
            <X size={13} strokeWidth={1.8} />
          </button>
          {logoError ? (
            <span className="font-display" style={{ fontSize: 16, color: "var(--forest)" }}>ربى للحناء</span>
          ) : (
            <Image src="/images/ruba-logo.png" alt="ربى للحناء" width={90} height={36} className="h-9 w-auto" onError={() => setLogoError(true)} />
          )}
        </div>

        {/* Search */}
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              if (q) { setMenuOpen(false); router.push(`/products?q=${encodeURIComponent(q)}`); setSearchQuery(""); }
            }}
            className="flex items-center gap-2 px-3.5 rounded-lg overflow-hidden"
            style={{ background: "var(--surface-card)", height: 38 }}
          >
            <Search size={13} strokeWidth={1.8} style={{ color: "var(--text-light)", flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن منتج..."
              className="flex-1 min-w-0 bg-transparent outline-none text-[13px]"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-display), Georgia, serif" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ background: "var(--border)", color: "var(--text-light)" }}
              >
                <X size={9} strokeWidth={2} />
              </button>
            )}
          </form>
        </div>

        {/* Nav links — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <MobSection label="المتجر" open={openMob === "shop"} onToggle={() => setOpenMob((o) => (o === "shop" ? null : "shop"))}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-5 py-2.5 text-[13px] transition-colors duration-200"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
              >
                {cat.name_ar}
              </Link>
            ))}
          </MobSection>

          <MobSection label="خدماتنا" open={openMob === "services"} onToggle={() => setOpenMob((o) => (o === "services" ? null : "services"))}>
            {SERVICES.map((col) => (
              <Link
                key={col.title}
                href={col.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-5 py-2.5 text-[13px] transition-colors duration-200"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--forest)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
              >
                {col.title}
              </Link>
            ))}
          </MobSection>

          <div style={{ borderBottom: "1px solid var(--border)" }}>
            <a
              href="/#about"
              className="flex items-center justify-between px-5 py-4 text-[15px] font-medium transition-colors duration-200"
              style={{ color: "var(--text-muted)", textDecoration: "none" }}
              onClick={(e) => {
                setMenuOpen(false);
                const el = document.getElementById("about");
                if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); }
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              من ربى؟
            </a>
          </div>
        </div>

        {/* Shipping notes */}
        <div className="shrink-0 px-5 py-3 flex flex-col gap-1.5" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { Icon: Clock,   text: "يرجى تأكيد الطلبات قبل الساعة 6 مساء" },
            { Icon: Package, text: "التوصيل من 1 إلى 4 أيام عمل" },
            { Icon: Ban,     text: "لا يوجد توصيل يوم الجمعة" },
          ].map(({ Icon, text }) => (
            <p key={text} className="flex items-center gap-2" style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.65 }}>
              <Icon size={11} style={{ flexShrink: 0 }} />
              {text}
            </p>
          ))}
        </div>

        {/* Footer row */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-[13px] transition-colors duration-200"
            style={{ color: "var(--text-muted)" }}
          >
            {theme === "dark" ? <Sun size={14} strokeWidth={1.8} /> : <Moon size={14} strokeWidth={1.8} />}
            {theme === "dark" ? "فاتح" : "داكن"}
          </button>
          <button
            onClick={() => { openCart(); setMenuOpen(false); }}
            className="relative flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200"
            style={{ color: "var(--forest)" }}
          >
            <ShoppingBag size={14} strokeWidth={1.6} />
            السلة
            {count > 0 && (
              <span className="inline-flex items-center justify-center rounded-full font-bold text-[8px]"
                style={{ minWidth: 14, height: 14, background: "var(--forest)", color: "#fff", padding: "0 2px" }}>
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <>
      <span className="block h-[1.5px] w-5 transition-all duration-300 origin-center" style={{ background: "var(--forest)", transform: open ? "translateY(6.5px) rotate(45deg)" : "none" }} />
      <span className="block h-[1.5px] w-5 transition-all duration-200" style={{ background: "var(--forest)", opacity: open ? 0 : 1 }} />
      <span className="block h-[1.5px] w-5 transition-all duration-300 origin-center" style={{ background: "var(--forest)", transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
    </>
  );
}

function MobSection({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-[15px] font-medium transition-colors duration-200"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transition: "transform 0.25s ease", transform: open ? "rotate(180deg)" : "none", color: "var(--text-light)", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div style={{
        maxHeight: open ? 400 : 0,
        overflow: "hidden",
        transition: "max-height 0.3s ease",
      }}>
        <div className="pb-2">{children}</div>
      </div>
    </div>
  );
}
