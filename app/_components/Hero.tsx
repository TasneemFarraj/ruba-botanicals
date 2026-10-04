"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ui } from "../_lib/translations";

const t = ui.hero;

const STATS = [
  { value: 7000, suffix: "+", label: t.statLabels[0] },
  { value: 100,  suffix: "%", label: t.statLabels[1] },
  { value: 12,   suffix: "+", label: t.statLabels[2] },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      /* Image: zoom-out + fade — same feel as original */
      tl.fromTo(".he-img",
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.8, ease: "power3.out" }, 0);

      /* Overlay appears with image */
      tl.fromTo(".he-overlay",
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power1.out" }, 0);

      /* Headings — stagger exactly like original .he-h1 */
      tl.fromTo(".he-h1",
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 0.95, stagger: 0.22, ease: "power3.out" }, 0.6);

      /* CTA */
      tl.fromTo(".he-cta",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.3");

      /* Stats */
      tl.fromTo(".he-stat",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.2");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh", marginTop: "-60px" }}
    >
      {/* Full-screen images */}
      <Image
        src="/images/hero-desktop.jpg"
        alt="منتجات حناء وأعشاب طبيعية"
        fill
        className="he-img hidden md:block object-cover object-center"
        priority
        sizes="100vw"
      />
      <Image
        src="/images/hero-mobile.jpg"
        alt="منتجات حناء وأعشاب طبيعية"
        fill
        className="he-img block md:hidden object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Desktop overlay — right-side heavy */}
      <div className="he-overlay absolute inset-0" style={{ background: "rgba(var(--hero-tint-rgb), var(--hero-dim))" }} />
      <div className="he-overlay hidden md:block absolute inset-0" style={{
        background: "linear-gradient(to left, rgba(var(--hero-tint-rgb),0.92) 0%, rgba(var(--hero-tint-rgb),0.55) 36%, rgba(var(--hero-tint-rgb),0.06) 65%, transparent 100%)",
      }} />
      <div className="he-overlay absolute inset-x-0 top-0 z-10" style={{
        height: 150,
        background: "linear-gradient(to bottom, rgba(var(--hero-tint-rgb),0.72) 0%, transparent 100%)",
      }} />
      {/* Mobile overlay — top-heavy where text lives */}
      <div className="he-overlay md:hidden absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(var(--hero-tint-rgb),0.94) 0%, rgba(var(--hero-tint-rgb),0.82) 35%, rgba(var(--hero-tint-rgb),0.35) 60%, transparent 100%)",
      }} />

      {/* Text block — top on mobile, bottom-right on desktop */}
      <div
        className="absolute z-20 right-0 w-full md:w-auto top-[60px] md:top-auto md:bottom-10"
        dir="rtl"
        style={{
          padding: "clamp(1.2rem, 3vw, 2.8rem) clamp(1.4rem, 3.5vw, 3.2rem) clamp(1.4rem, 2.5vw, 2.4rem)",
          maxWidth: "clamp(300px, 46vw, 560px)",
        }}
      >
        {/* H1a */}
        <h1
          className="he-h1 font-display"
          style={{
            fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)",
            lineHeight: 1.08,
            fontWeight: 700,
            color: "var(--forest)",
            letterSpacing: "-0.02em",
            marginBottom: "0.28em",
          }}
        >
          {t.h1a}
        </h1>

        {/* H1b */}
        <h2
          className="he-h1 font-display"
          style={{
            fontSize: "clamp(1.3rem, 2.8vw, 2.4rem)",
            lineHeight: 1.2,
            fontWeight: 600,
            color: "var(--forest-mid)",
            letterSpacing: "-0.02em",
            marginBottom: "clamp(1.4rem, 2.8vw, 2.4rem)",
          }}
        >
          {t.h1b}
        </h2>

        {/* Description — TypewriterChar like original */}
        <p
          className="he-cta"
          style={{
            fontSize: "clamp(0.92rem, 1.4vw, 1.1rem)",
            color: "rgba(var(--hero-ink-rgb),0.72)",
            lineHeight: 1.9,
            marginBottom: "1.5rem",
            fontFamily: "var(--font-display), Georgia, serif",
            minHeight: "3em",
          }}
        >
          <TypewriterChar text={t.desc} startDelay={1600} speed={42} />
        </p>

        {/* CTA Button */}
        <div className="he-cta" style={{ marginBottom: "1.6rem" }}>
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#fff",
              background: "linear-gradient(135deg, #2a6325 0%, #3d8c35 100%)",
              borderRadius: 99,
              padding: "10px 30px",
              boxShadow: "0 6px 24px rgba(28,80,24,0.35)",
              transition: "all 0.25s ease",
              fontFamily: "var(--font-display), Georgia, serif",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-2px) scale(1.02)";
              el.style.boxShadow = "0 10px 32px rgba(28,80,24,0.5)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0) scale(1)";
              el.style.boxShadow = "0 6px 24px rgba(28,80,24,0.35)";
            }}
          >
            {t.shopNow}
            <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>›</span>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="he-stat flex items-center"
          style={{
            borderTop: "1px solid rgba(var(--hero-ink-rgb),0.18)",
            paddingTop: "0.9rem",
            gap: 0,
          }}
        >
          {STATS.map(({ value, suffix, label }, i) => (
            <Fragment key={i}>
              <div className="flex-1 text-center">
                <div dir="ltr"><CountUp value={value} suffix={suffix} /></div>
                <p style={{
                  fontSize: 10,
                  color: "rgba(var(--hero-ink-rgb),0.5)",
                  marginTop: 4,
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}>
                  {label}
                </p>
              </div>
              {i < STATS.length - 1 && (
                <span style={{ width: 1, height: 26, background: "rgba(var(--hero-ink-rgb),0.15)", flexShrink: 0 }} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TypewriterChar — exactly like the original ── */
function TypewriterChar({ text, startDelay = 0, speed = 48 }: {
  text: string;
  startDelay?: number;
  speed?: number;
}) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => {
      setShowCursor(true);
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(iv);
          setTimeout(() => setShowCursor(false), 900);
        }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t0);
  }, [text, startDelay, speed]);

  return (
    <>
      {displayed}
      {showCursor && (
        <span aria-hidden style={{
          display: "inline-block",
          width: 2,
          height: "0.75em",
          background: "rgba(var(--hero-ink-rgb),0.6)",
          marginRight: 3,
          verticalAlign: "middle",
          borderRadius: 1,
          animation: "tw-blink 0.65s step-end infinite",
        }} />
      )}
    </>
  );
}

/* ── CountUp ── */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref     = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const duration = 2600;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setCount(Math.round(p * p * value));
        if (p < 1) requestAnimationFrame(tick);
        else setCount(value);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} style={{
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "clamp(1.5rem, 2vw, 2rem)",
      color: "var(--forest-mid)",
      lineHeight: 1,
      display: "inline-block",
      minWidth: "2ch",
    } as React.CSSProperties}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}