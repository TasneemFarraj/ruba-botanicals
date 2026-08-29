"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Sun, Moon } from "lucide-react";
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
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [openMenu,    setOpenMenu]    = useState<string | null>(null);
  const [openMob,     setOpenMob]     = useState<string | null>(null);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [navProducts, setNavProducts] = useState<Product[]>([]);
  const [logoError,   setLogoError]   = useState(false);

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
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!dropRef.current || !openMenu) return;
    gsap.fromTo(dropRef.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
  }, [openMenu]);

  const handleEnter = (key: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpenMenu(key);
  };
  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  return (
    <>
      {/* ── Nav bar ─────────────────────────────────────────── */}
      <nav
        dir="rtl"
        className="sticky top-0 z-50 w-full"
        style={{
          background:     scrolled ? "var(--nav-glass)" : (isHome ? "var(--cream)" : "var(--white)"),
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom:   `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
          boxShadow:      scrolled ? "0 2px 20px rgba(28,58,26,0.05)" : "none",
          transition:     "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          fontFamily:    "var(--font-ibm), system-ui, sans-serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 lg:px-12 flex items-center justify-between" style={{ height: 60 }}>

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
              <button className={`font-display nav-underline text-[15px] transition-colors duration-200 cursor-pointer ${openMenu === "shop" ? "nav-active" : ""}`} style={{ color: openMenu === "shop" ? "var(--forest)" : "var(--text-muted)" }}>
                المتجر
              </button>
            </div>
            <div onMouseEnter={() => handleEnter("services")} onMouseLeave={handleLeave}>
              <button className={`font-display nav-underline text-[15px] transition-colors duration-200 cursor-pointer ${openMenu === "services" ? "nav-active" : ""}`} style={{ color: openMenu === "services" ? "var(--forest)" : "var(--text-muted)" }}>
                خدماتنا
              </button>
            </div>
            <HoverLink>من نحن</HoverLink>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={toggleTheme}
              className="hidden md:flex items-center justify-center transition-colors duration-200"
              style={{ color: "var(--text-light)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-light)")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <span className="hidden md:block w-px h-3.5" style={{ background: "var(--border)" }} />

            <button
              onClick={openCart}
              className="relative flex items-center justify-center transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              aria-label="السلة"
            >
              <ShoppingBag size={16} />
              {count > 0 && (
                <span className="absolute min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold leading-none"
                  style={{ background: "var(--forest-light)", color: "#fff", top: "-5px", insetInlineEnd: "-5px" }}>
                  {count}
                </span>
              )}
            </button>

            <button onClick={() => setMenuOpen((o) => !o)} className="md:hidden flex flex-col justify-center items-center gap-[5px] w-7 h-7" aria-label={menuOpen ? "إغلاق" : "القائمة"}>
              <Burger open={menuOpen} />
            </button>
          </div>
        </div>

        {/* ── Mega dropdown ────────────────────────────────── */}
        {openMenu && (
          <div
            ref={dropRef}
            dir="rtl"
            className="absolute inset-x-0 top-full z-40"
            style={{ background: "var(--nav-glass)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(28,58,26,0.08)" }}
            onMouseEnter={() => leaveTimer.current && clearTimeout(leaveTimer.current)}
            onMouseLeave={handleLeave}
          >
            <div className="max-w-7xl mx-auto px-8 lg:px-12 py-8">

              {openMenu === "shop" && (
                grouped.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>جارٍ التحميل…</p>
                ) : (
                  <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                    {grouped.map(({ cat, prods }) => (
                      <div key={cat.id}>
                        <Link href={`/products?cat=${cat.slug}`} onClick={() => setOpenMenu(null)}
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
                              <Link href={`/products?cat=${cat.slug}&open=${p.id}`} onClick={() => setOpenMenu(null)}
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
      <div
        dir="rtl"
        className={`fixed inset-0 z-40 overflow-y-auto md:hidden transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "var(--white)", fontFamily: "var(--font-ibm), system-ui, sans-serif" }}
      >
        <div className="flex items-center justify-between px-8 border-b" style={{ height: 56, borderColor: "var(--border)" }}>
          {logoError ? (
            <span className="font-display" style={{ fontSize: 19, color: "var(--forest)" }}>ربى للحناء</span>
          ) : (
            <Image src="/images/ruba-logo.png" alt="ربى للحناء" width={110} height={44} className="h-11 w-auto" onError={() => setLogoError(true)} />
          )}
          <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center" aria-label="إغلاق">
            <Burger open />
          </button>
        </div>

        <div className="flex flex-col px-8 pt-4 pb-12">
          {/* Theme toggle row */}
          <div className="flex items-center gap-5 py-4 mb-2 border-b" style={{ borderColor: "var(--border)" }}>
            <button onClick={toggleTheme} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "فاتح" : "داكن"}
            </button>
          </div>

          <MobSection label="المتجر" open={openMob === "shop"} onToggle={() => setOpenMob((o) => (o === "shop" ? null : "shop"))}>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/products?cat=${cat.slug}`} onClick={() => setMenuOpen(false)} className="text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                  {cat.name_ar}
                </Link>
              ))}
            </div>
          </MobSection>

          <MobSection label="خدماتنا" open={openMob === "services"} onToggle={() => setOpenMob((o) => (o === "services" ? null : "services"))}>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {SERVICES.map((col) => (
                <Link key={col.title} href={col.href} onClick={() => setMenuOpen(false)} className="text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                  {col.title}
                </Link>
              ))}
            </div>
          </MobSection>

          <MobSimple onClick={() => setMenuOpen(false)}>من نحن</MobSimple>
        </div>
      </div>
    </>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <>
      <span className="block h-[1.5px] w-5 transition-all duration-300 origin-center" style={{ background: "var(--forest)", transform: open ? "rotate(45deg) translateY(6.5px)" : "none" }} />
      <span className="block h-[1.5px] w-5 transition-all duration-200" style={{ background: "var(--forest)", opacity: open ? 0 : 1 }} />
      <span className="block h-[1.5px] w-5 transition-all duration-300 origin-center" style={{ background: "var(--forest)", transform: open ? "rotate(-45deg) translateY(-6.5px)" : "none" }} />
    </>
  );
}

function HoverLink({ children }: { children: React.ReactNode }) {
  return (
    <button className="font-display nav-underline text-[15px] transition-colors duration-200 cursor-pointer" style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forest)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
    >
      {children}
    </button>
  );
}

function MobSection({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b py-4" style={{ borderColor: "var(--border)" }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between font-medium" style={{ fontSize: 20, color: "var(--text-dark)" }}>
        {label}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

function MobSimple({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="border-b py-4" style={{ borderColor: "var(--border)" }}>
      <button onClick={onClick} className="w-full text-start font-medium" style={{ fontSize: 20, color: "var(--text-dark)" }}>
        {children}
      </button>
    </div>
  );
}
