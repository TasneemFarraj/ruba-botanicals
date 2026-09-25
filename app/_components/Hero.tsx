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
    }, 2600);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    ["/images/hero-bg-light.jpg", "/images/hero-bg-dark.jpg"].forEach((href) => {
      const link = document.createElement("link");
      link.rel  = "preload";
      link.as   = "image";
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(".he-img",  { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" }, 0);
      tl.fromTo(".he-h1",   { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.95, stagger: 0.22, ease: "power3.out" }, 0.3);
      tl.fromTo(".he-cta",  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7,  ease: "power2.out" }, "-=0.3");
      tl.fromTo(".he-stat", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5,  ease: "power2.out" }, "-=0.2");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      className="relative w-full hero-section"
      style={{ minHeight: "100vh", marginTop: "-60px" }}
    >
      <div
        className="relative flex flex-col md:flex-row items-center"
        style={{ minHeight: "100vh" }}
      >

        {/* ── Product slides ── */}
        <div className="he-img relative w-full md:w-[56%] order-2 md:order-1" style={{ minHeight: "clamp(260px, 42vw, 100vh)" }}>
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: i === active ? 1 : 0,
                transition: "opacity 1.3s ease",
                zIndex: i === active ? 2 : 1,
                filter: "drop-shadow(0 30px 30px rgba(0,0,0,0.25))",
              }}
            >
              <Image
                src={slide.img} alt={slide.alt} fill
                className="object-contain object-center"
                style={{ padding: "clamp(1.5rem, 5vw, 5rem)" }}
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 56vw"
              />
            </div>
          ))}

          <div
            className="absolute bottom-4 z-20 flex items-center gap-2"
            style={{ left: "50%", transform: "translateX(-50%)" }}
            dir="ltr"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === active ? 20 : 6,
                  height: 4,
                  borderRadius: 99,
                  background: i === active ? "rgba(28,58,26,0.5)" : "rgba(28,58,26,0.18)",
                  border: "none",
                  padding: 0,
                  cursor: "default",
                  transition: "width 0.35s ease, background 0.35s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Stats — mobile only, below image ── */}
        <div className="he-stat md:hidden w-full order-3 flex items-center justify-center" style={{ borderTop: "1px solid var(--border-mid)", padding: "1.6rem 1rem 2rem", gap: 0 }}>
          {STAT_VALUES.map(({ value, suffix }, i) => (
            <Fragment key={i}>
              <div className="flex-1 text-center">
                <div dir="ltr" style={{ lineHeight: 1 }}>
                  <CountUp value={value} suffix={suffix} />
                </div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, letterSpacing: "0.04em", fontWeight: 600 }}>
                  {t.statLabels[i]}
                </p>
              </div>
              {i < STAT_VALUES.length - 1 && (
                <span style={{ width: 1, height: 30, background: "var(--border-mid)", flexShrink: 0 }} />
              )}
            </Fragment>
          ))}
        </div>

        {/* ── Text column ── */}
        <div className="he-text relative z-10 flex flex-col justify-center w-full md:w-[44%] px-6 md:px-10 lg:px-16 xl:px-24 order-1 md:order-2 pt-32 md:pt-0">

          <h1
            className="he-h1 font-display"
            style={{ fontSize: "clamp(2rem, 6.2vw, 5.8rem)", lineHeight: 1.0, color: "var(--text-dark)", letterSpacing: "-0.02em", marginBottom: "0.1em" }}
          >
            {t.h1a}
          </h1>

          <h1
            className="he-h1 font-display"
            style={{ fontWeight: 700, fontSize: "clamp(2rem, 3.8vw, 3.4rem)", lineHeight: 1.1, color: "var(--hero-h1b)", letterSpacing: "-0.01em", marginBottom: "clamp(1.8rem, 3vw, 2.6rem)" }}
          >
            {t.h1b}
          </h1>

          <p style={{ fontSize: "clamp(1.2rem, 1.6vw, 1.35rem)", color: "var(--text-muted)", lineHeight: 2.0, maxWidth: 340, marginBottom: "clamp(2rem, 3.5vw, 3rem)", whiteSpace: "pre-line", minHeight: "3.5em", fontFamily: "var(--font-display), Georgia, serif" }}>
            <TypewriterChar text={t.desc} startDelay={1400} speed={48} />
          </p>

          <div className="he-cta" style={{ marginBottom: "clamp(2.5rem, 4vw, 3.5rem)" }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 rounded-xl"
              style={{ background: "linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)", color: "#e8f4e0", fontSize: 15, fontWeight: 600, padding: "11px 38px", letterSpacing: "0.05em", transition: "all 0.28s ease", boxShadow: "0 6px 24px rgba(28,58,26,0.28), inset 0 1px 0 rgba(255,255,255,0.07)" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 10px 32px rgba(28,58,26,0.42), inset 0 1px 0 rgba(255,255,255,0.1)"; const arrow = el.querySelector(".he-arrow") as HTMLElement; if (arrow) arrow.style.transform = "translateX(-4px)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 6px 24px rgba(28,58,26,0.28), inset 0 1px 0 rgba(255,255,255,0.07)"; const arrow = el.querySelector(".he-arrow") as HTMLElement; if (arrow) arrow.style.transform = "translateX(0)"; }}
            >
              {t.shopNow}
              <span className="he-arrow" aria-hidden="true" style={{ fontSize: 18, display: "inline-block", transition: "transform 0.28s ease" }}>›</span>
            </Link>
          </div>

          <div className="he-stat hidden md:flex items-center" style={{ borderTop: "1px solid var(--border-mid)", paddingTop: "1.6rem", gap: 0 }}>
            {STAT_VALUES.map(({ value, suffix }, i) => (
              <Fragment key={i}>
                <div className="flex-1 text-center">
                  <div dir="ltr" style={{ lineHeight: 1 }}>
                    <CountUp value={value} suffix={suffix} />
                  </div>
                  <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 6, letterSpacing: "0.04em", fontWeight: 600, textShadow: "0 1px 4px rgba(253,248,243,0.45)" }}>
                    {t.statLabels[i]}
                  </p>
                </div>
                {i < STAT_VALUES.length - 1 && (
                  <span style={{ width: 1, height: 30, background: "var(--border-mid)", flexShrink: 0 }} />
                )}
              </Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

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
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 2,
            height: "0.75em",
            background: "var(--text-muted)",
            marginRight: 3,
            verticalAlign: "middle",
            borderRadius: 1,
            animation: "tw-blink 0.65s step-end infinite",
          }}
        />
      )}
    </>
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
        const elapsed = Math.min((now - startTime) / duration, 1);
        setCount(Math.round(elapsed * elapsed * elapsed * value));
        if (elapsed < 1) requestAnimationFrame(tick);
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
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 400,
        fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color: "var(--forest)",
        display: "inline-block",
        minWidth: "3ch",
        textShadow: "0 1px 8px rgba(253,248,243,0.5)",
      } as React.CSSProperties}
    >
      {count}{suffix}
    </span>
  );
}
