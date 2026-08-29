"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ui } from "../_lib/translations";

const t = ui.hero;

const SLIDES = [
  { img: "/images/hero-organic-henna.png",   alt: "حناء عضوية طبيعية ١٠٠٪"     },
  { img: "/images/hero-herbal-shampoo.png",  alt: "شامبو أعشاب المشاط الطبيعي" },
  { img: "/images/hero-hair-serum.png",      alt: "سيروم للشعر المغذي"          },
  { img: "/images/hero-scalp-scrub.png",     alt: "مقشر فروة الرأس بالسدر"     },
  { img: "/images/hero-sidr-cleanser.png",   alt: "غسول الوجه الطبيعي بالسدر"  },
];

const STAT_VALUES = [
  { value: 2000, suffix: "+" },
  { value: 100,  suffix: "%" },
  { value: 12,   suffix: "+" },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pausedRef  = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setActive((p) => (p + 1) % SLIDES.length);
    }, 4800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(".he-img",  { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" }, 0);
      tl.fromTo(".he-tag",  { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.3);
      tl.fromTo(".he-h1",   { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1,   stagger: 0.18, ease: "power3.out" }, 0.45);
      tl.fromTo(".he-sub",  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");
      tl.fromTo(".he-cta",  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.4");
      tl.fromTo(".he-stat", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.3");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      className="relative w-full"
      style={{ minHeight: "calc(100vh - 60px)", background: "var(--cream)" }}
    >
      {/* Decorative circle */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width:  "clamp(340px, 52vw, 760px)",
          height: "clamp(340px, 52vw, 760px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(193,174,138,0.10) 0%, transparent 70%)",
          top: "50%", right: "2%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Watermark */}
      <p
        aria-hidden="true"
        className="font-display select-none pointer-events-none absolute"
        style={{
          fontSize: "clamp(5rem, 14vw, 16rem)",
          color: "rgba(193,174,138,0.06)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          bottom: "4%", left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
        }}
      >
        ربى فرّاج
      </p>

      <div
        className="relative flex flex-col-reverse md:flex-row items-center"
        style={{ minHeight: "calc(100vh - 60px)" }}
      >

        {/* ── Text ──────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-center w-full md:w-[44%] px-8 sm:px-12 lg:px-16 xl:px-22 py-16 md:py-0">

          <div className="he-tag flex items-center gap-2 mb-7 self-start">
            <span style={{ width: 18, height: 1, background: "var(--gold)", display: "block" }} />
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase" }}>
              Natural &amp; Organic
            </span>
            <span style={{ width: 18, height: 1, background: "var(--gold)", display: "block" }} />
          </div>

          <h1 className="he-h1 font-display" style={{ fontSize: "clamp(3rem, 5.8vw, 5.2rem)", lineHeight: 1.04, color: "var(--text-dark)", letterSpacing: "-0.02em", marginBottom: "0.04em" }}>
            {t.h1a}
          </h1>
          <h1 className="he-h1 font-display" style={{ fontSize: "clamp(3rem, 5.8vw, 5.2rem)", lineHeight: 1.04, color: "var(--forest-mid)", letterSpacing: "-0.02em", marginBottom: "clamp(1.5rem, 2.8vw, 2.5rem)" }}>
            {t.h1b}
          </h1>

          <p className="he-sub" style={{ fontSize: "clamp(0.82rem, 1.05vw, 0.92rem)", color: "var(--text-muted)", lineHeight: 2.1, maxWidth: 310, marginBottom: "clamp(1.8rem, 3.2vw, 2.6rem)", whiteSpace: "pre-line" }}>
            {t.desc}
          </p>

          <div className="he-cta flex items-center gap-3 flex-wrap" style={{ marginBottom: "clamp(2.5rem, 4vw, 3.5rem)" }}>
            <Link
              href="/products"
              className="inline-flex items-center rounded-full"
              style={{ background: "var(--forest)", color: "#e8f4e0", fontSize: 12.5, fontWeight: 600, padding: "12px 30px", letterSpacing: "0.04em", transition: "background 0.25s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--forest-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--forest)")}
            >
              {t.shopNow}
            </Link>
            <Link
              href="#about"
              className="btn-ghost-hero inline-flex items-center gap-2 rounded-full group"
              style={{ fontSize: 12.5, fontWeight: 500, padding: "11px 26px" }}
            >
              {t.learnMore}
              <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">←</span>
            </Link>
          </div>

          <div className="flex items-center" style={{ borderTop: "1px solid var(--border)", paddingTop: "1.4rem" }}>
            {STAT_VALUES.map(({ value, suffix }, i) => (
              <Fragment key={i}>
                <div className="he-stat flex-1 text-center">
                  <div style={{ lineHeight: 1 }}>
                    <CountUp value={value} suffix={suffix} />
                  </div>
                  <p style={{ fontSize: 9.5, color: "var(--text-light)", marginTop: 5, letterSpacing: "0.06em" }}>
                    {t.statLabels[i]}
                  </p>
                </div>
                {i < STAT_VALUES.length - 1 && (
                  <span style={{ width: 1, height: 28, background: "var(--border)", flexShrink: 0 }} />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* ── Product image ──────────────────────────────────────── */}
        <div className="he-img relative w-full md:w-[56%]" style={{ minHeight: "clamp(340px, 62vw, 100vh)" }}>
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: i === active ? 1 : 0, transition: "opacity 1.3s ease", zIndex: i === active ? 2 : 1 }}
            >
              <Image
                src={slide.img} alt={slide.alt} fill
                className="object-contain object-center"
                style={{ padding: "clamp(2rem, 5vw, 5rem)" }}
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 56vw"
              />
            </div>
          ))}

          <div className="absolute bottom-6 z-20 flex items-center gap-2" style={{ left: "50%", transform: "translateX(-50%)" }} dir="ltr">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 99, background: i === active ? "var(--gold)" : "rgba(180,140,60,0.25)", border: "none", padding: 0, cursor: "default", transition: "width 0.4s ease, background 0.4s ease" }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

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
      const duration = 4200;
      const startTime = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        setCount(Math.round(t * t * t * value));
        if (t < 1) requestAnimationFrame(tick);
        else setCount(value);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5, rootMargin: "0px 0px -40px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span
      ref={ref}
      style={{ fontFamily: "var(--font-stat)", fontWeight: 300, fontSize: "clamp(2rem, 3.5vw, 2.6rem)", letterSpacing: "-0.01em", lineHeight: 1, color: "var(--text-dark)", display: "inline-block", minWidth: "3ch" } as React.CSSProperties}
    >
      {count}{suffix}
    </span>
  );
}
