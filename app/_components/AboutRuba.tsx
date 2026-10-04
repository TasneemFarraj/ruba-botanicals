"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FlaskConical, Apple, BookOpen, Award, Users, ShieldCheck, Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CREDENTIALS: { num: string; cat: string; Icon: LucideIcon; text: string }[] = [
  { num: "01", cat: "العلم",    Icon: FlaskConical, text: "أخصائية مختبرات طبية وجيناتكس" },
  { num: "02", cat: "التغذية", Icon: Apple,        text: "أخصائية تغذية معتمدة من ISSA" },
  { num: "03", cat: "التصنيع", Icon: BookOpen,     text: "دبلوما بريطانية في تصنيع المنتجات الطبيعية — الأكاديمية العالمية للتدريب والتطوير" },
  { num: "04", cat: "الريادة", Icon: Award,        text: "أوّل مدرِّبة حناء معتمدة عالمياً في الأردن من قِبَل البورد الأمريكي" },
  { num: "05", cat: "التدريب", Icon: Users,        text: "درّبت أكثر من ٥٠٠ طالبة في رسم وتصنيع منتجات الحناء داخل وخارج الأردن" },
  { num: "06", cat: "الجودة",  Icon: ShieldCheck,  text: "منتجات طبيعية آمنة مرخّصة من مصانع GMP حاصلة على ISO 22716" },
  { num: "07", cat: "الحياة",  Icon: Sprout,       text: "أم ورياضية مهتمة بأنماط الحياة الصحية والعناية الجمالية الطبيعية المتوازنة" },
];

const STATS = [
  { value: "500+", label: "طالبة مدرَّبة" },
  { value: "12+",  label: "سنة خبرة" },
  { value: "100%", label: "طبيعي ونباتي" },
];

export default function AboutRuba() {
  const heroRef  = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const credsRef = useRef<HTMLElement>(null);

  /* ── Hero entrance ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.08 });
      tl.fromTo(".ah-photo",  { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1.7, ease: "power3.out" }, 0);
      tl.fromTo(".ah-logo",   { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" }, 0.65);
      tl.fromTo(".ah-sub",    { opacity: 0, y: 16 },       { opacity: 1, y: 0, duration: 0.7,  ease: "power2.out" }, 1.05);
      tl.fromTo(".ah-scroll", { opacity: 0 },              { opacity: 1, duration: 0.6 }, 1.4);

      /* Looping scroll-dot inside the mouse icon */
      gsap.fromTo(
        ".ah-scroll-dot",
        { y: 0, opacity: 1 },
        { y: 13, opacity: 0, duration: 1.1, ease: "power2.in", repeat: -1, repeatDelay: 0.45, delay: 2.1 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* ── Stats ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ah-stat", {
        opacity: 0, y: 14, stagger: 0.1, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 82%", toggleActions: "play none none none" },
      });
    }, statsRef);
    return () => ctx.revert();
  }, []);

  /* ── Quote ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ah-quote", {
        opacity: 0, y: 32, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: quoteRef.current, start: "top 75%", toggleActions: "play none none none" },
      });
    }, quoteRef);
    return () => ctx.revert();
  }, []);

  /* ── Story ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ah-para", {
        opacity: 0, y: 20, stagger: 0.15, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: storyRef.current, start: "top 78%", toggleActions: "play none none none" },
      });
    }, storyRef);
    return () => ctx.revert();
  }, []);

  /* ── Credentials ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ah-cred", {
        opacity: 0, x: 18, stagger: 0.07, duration: 0.55, ease: "power2.out",
        scrollTrigger: { trigger: credsRef.current, start: "top 78%", toggleActions: "play none none none" },
      });
    }, credsRef);
    return () => ctx.revert();
  }, []);

  return (
    <div dir="rtl">

      {/* ════════════════════════════════════════
          HERO — full-width photo, professional fade
      ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100svh", minHeight: 600 }}
      >

        {/* ── Photo — full bleed, no crop panels ── */}
        <div className="ah-photo absolute inset-0">
          {/* Mobile portrait */}
          <Image
            src="/images/ruba-farraj-mobile.jpeg"
            alt="ربى فرّاج — مؤسِّسة Ruba Botanicals"
            fill
            className="object-cover md:hidden"
            style={{ objectPosition: "center top" }}
            priority
            sizes="100vw"
          />
          {/* Desktop landscape */}
          <Image
            src="/images/ruba-farraj-field.jpg"
            alt="ربى فرّاج — مؤسِّسة Ruba Botanicals"
            fill
            className="object-cover hidden md:block"
            style={{ objectPosition: "left center" }}
            priority
            sizes="100vw"
          />
        </div>

        {/* ── Gradient 1: bottom melt — photo dissolves into the dark stats section ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 58%, rgba(28,58,26,0.1) 70%, rgba(28,58,26,0.32) 80%, rgba(28,58,26,0.62) 90%, rgba(28,58,26,0.84) 100%)",
          }}
        />

        {/* ── Gradient 2: right fade — photo dissolves into the page cream on the right edge ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background:
              "linear-gradient(to right, transparent 0%, transparent 44%, rgba(var(--surface-rgb),0.12) 56%, rgba(var(--surface-rgb),0.42) 68%, rgba(var(--surface-rgb),0.74) 80%, rgba(var(--surface-rgb),0.93) 90%, var(--surface) 100%)",
          }}
        />

        {/* ── Text overlay — centered in the cream fade zone ── */}
        <div
          style={{
            position: "absolute",
            top: 0, right: 0, bottom: 0,
            width: "clamp(280px, 44%, 480px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 clamp(1.5rem, 4vw, 3.5rem)",
            gap: "clamp(0.4rem, 0.8vw, 0.7rem)",
          }}
        >

          {/* Logo calligraphy */}
          <div
            className="ah-logo"
            style={{
              position: "relative",
              width: "clamp(190px, 72%, 280px)",
              aspectRatio: "4 / 3",
            }}
          >
            <Image
              src="/images/ruba-logo.png"
              alt="ربى فرّاج"
              fill
              className="object-contain"
              style={{ mixBlendMode: "multiply" }}
              sizes="300px"
            />
          </div>

          {/* Thin centered gold rule */}
          <div
            className="ah-sub"
            style={{
              width: "50%",
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--gold) 50%, transparent)",
            }}
          />

          {/* Subtitle — Amiri serif, centered, split into 3 clean lines */}
          <div className="ah-sub font-display" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "clamp(0.88rem, 1vw, 1rem)", color: "var(--text-2)", lineHeight: 1.5, letterSpacing: "0.01em" }}>
              أخصائية مختبرات طبية
            </p>
            <p style={{ fontSize: "clamp(0.88rem, 1vw, 1rem)", color: "var(--text-2)", lineHeight: 1.5, letterSpacing: "0.01em" }}>
              مدرِّبة حناء معتمدة دولياً
            </p>
            <p style={{ fontSize: "clamp(0.88rem, 1vw, 1rem)", color: "var(--text-2)", lineHeight: 1.5, letterSpacing: "0.01em" }}>
              أخصائية تغذية معتمدة — ISSA
            </p>
          </div>

          {/* Animated mouse scroll indicator — bottom center of section */}
          <div
            className="ah-scroll"
            style={{
              position: "absolute",
              bottom: "clamp(1.5rem, 3vw, 2.5rem)",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span style={{
              fontSize: 7.5,
              color: "var(--forest-light)",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}>
              اكتشفي القصة
            </span>
            {/* Mouse shell */}
            <div style={{
              width: 22, height: 36,
              border: "1.5px solid var(--forest-light)",
              borderRadius: 11,
              display: "flex",
              justifyContent: "center",
              paddingTop: 5,
            }}>
              {/* Animated scroll dot — GSAP loops this */}
              <div
                className="ah-scroll-dot"
                style={{
                  width: 3, height: 6,
                  background: "var(--forest-light)",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════ */}
      <section ref={statsRef} style={{ background: "var(--forest-bg)" }}>
        <div
          className="max-w-5xl mx-auto"
          style={{
            padding: "1.9rem clamp(1.5rem, 5vw, 3rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {STATS.flatMap(({ value, label }, i) => {
            const items = [];
            if (i > 0) {
              items.push(
                <div key={`sep-${i}`} style={{ width: 1, height: 30, background: "rgba(255,255,255,0.14)", flexShrink: 0 }} />
              );
            }
            items.push(
              <div
                key={value}
                className="ah-stat"
                style={{ padding: "0 clamp(1.5rem, 3.5vw, 2.8rem)", textAlign: "center" }}
              >
                <div
                  className="font-display"
                  style={{ fontSize: "clamp(1.9rem, 3vw, 2.5rem)", color: "#fff", lineHeight: 1, marginBottom: 4 }}
                >
                  {value}
                </div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em" }}>
                  {label}
                </div>
              </div>
            );
            return items;
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
          QUOTE
      ════════════════════════════════════════ */}
      <section
        ref={quoteRef}
        style={{
          background: "var(--surface)",
          padding: "clamp(5.5rem, 10vw, 10rem) clamp(2rem, 10vw, 14rem)",
          textAlign: "center",
        }}
      >
        <blockquote className="ah-quote">
          <span
            aria-hidden="true"
            style={{
              display: "block",
              fontFamily: "Georgia, serif",
              fontSize: "4.5rem",
              color: "var(--gold)",
              opacity: 0.3,
              lineHeight: 0.7,
              marginBottom: "1.4rem",
            }}
          >
            "
          </span>
          <p
            className="font-display"
            style={{
              fontSize: "clamp(1.4rem, 2.8vw, 2.3rem)",
              color: "var(--forest)",
              lineHeight: 1.68,
              maxWidth: 660,
              margin: "0 auto 1.8rem",
              letterSpacing: "-0.01em",
            }}
          >
            ما يُوضع على جسمكِ يجب أن تعرفي مكوّناته —
            <br />
            لأن جسمك يستحق الحقيقة، لا الوعود.
          </p>
          <cite style={{ fontSize: 9.5, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontStyle: "normal" }}>
            — ربى فرّاج
          </cite>
        </blockquote>
      </section>

      {/* ════════════════════════════════════════
          STORY
      ════════════════════════════════════════ */}
      <section
        ref={storyRef}
        style={{ background: "var(--white)", padding: "clamp(5rem, 9vw, 8rem) 0" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-14">

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "clamp(3rem, 5.5vw, 5rem)" }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>قصتها</span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(176,125,46,0.28), transparent)" }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "clamp(3rem, 7vw, 7rem)", alignItems: "start" }}>
            <div className="ah-para">
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(2rem, 3.6vw, 3rem)",
                  color: "var(--forest)",
                  lineHeight: 1.18,
                  letterSpacing: "-0.02em",
                  marginBottom: "1.9rem",
                }}
              >
                جمعت بين العلم
                <br />
                والإبداع والطبيعة
              </h2>
              <p style={{ fontSize: "0.91rem", color: "var(--text-2)", lineHeight: 2.35 }}>
                ربى فرّاج ليست مجرد صاحبة علامة تجارية — هي أخصائية علمية رأت في الطبيعة ما لا تراه أعين كثيرة. بدأت مسيرتها في مختبرات الطب والجيناتكس، ثم وجدت في الحناء والأعشاب لغة أعمق تجمع بين الجمال والصحة.
              </p>
            </div>
            <div className="ah-para" style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
              <p style={{ fontSize: "0.91rem", color: "var(--text-2)", lineHeight: 2.35 }}>
                اليوم تحمل اعتماداً عالمياً من البورد الأمريكي كأوّل مدرِّبة حناء معتمدة في الأردن، وتغذية معتمدة من ISSA، وشهادة بريطانية في تصنيع المنتجات الطبيعية — كل ذلك لأنها تؤمن بأن ما يُوضع على الجسم يجب أن يُفهم قبل أن يُصنع.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                {[
                  { n: "أردن + ١١ دولة", l: "نطاق التدريب" },
                  { n: "GMP · ISO 22716", l: "معايير التصنيع" },
                ].map(({ n, l }) => (
                  <div
                    key={l}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.875rem",
                      padding: "1.3rem 1rem",
                      textAlign: "center",
                    }}
                  >
                    <div className="font-display" style={{ fontSize: "1rem", color: "var(--forest)", marginBottom: 5, lineHeight: 1.3 }}>{n}</div>
                    <div style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: "0.06em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CREDENTIALS — editorial list
      ════════════════════════════════════════ */}
      <section
        ref={credsRef}
        style={{ background: "var(--surface)", padding: "clamp(5rem, 9vw, 8rem) 0" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-14">

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "clamp(2.8rem, 5vw, 4.5rem)" }}>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                color: "var(--forest)",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              ما يميّزها
            </h2>
            <span className="eyebrow" style={{ marginBottom: 0 }}>المؤهلات والإنجازات</span>
          </div>

          {/* Top border */}
          <div style={{ height: 1, background: "var(--border-mid)", marginBottom: 0 }} />

          {CREDENTIALS.map(({ num, cat, Icon, text }, i) => (
            <div
              key={i}
              className="ah-cred"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "clamp(1rem, 3vw, 2.5rem)",
                padding: "1.5rem 0.5rem",
                borderBottom: "1px solid var(--border)",
                borderRadius: "0.4rem",
                margin: "0 -0.5rem",
                transition: "background 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--forest-pale)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
            >
              {/* Index */}
              <span style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em", minWidth: 20, paddingTop: 3, flexShrink: 0 }}>
                {num}
              </span>

              {/* Category chip */}
              <div style={{ minWidth: 86, flexShrink: 0 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "var(--forest-pale)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: "999px",
                  padding: "4px 11px",
                  fontSize: 10, fontWeight: 600,
                  color: "var(--forest-mid)",
                  letterSpacing: "0.04em",
                }}>
                  <Icon size={11} strokeWidth={1.8} />
                  {cat}
                </span>
              </div>

              {/* Text */}
              <p style={{ fontSize: "0.9rem", color: "var(--text-1)", lineHeight: 1.82, flex: 1 }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      <section style={{
        background: "var(--forest-bg)",
        padding: "clamp(5rem, 9vw, 8rem) 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle warm radial */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 55% 65% at 50% 50%, rgba(176,125,46,0.09) 0%, transparent 70%)",
        }} />

        <span className="eyebrow" style={{ color: "rgba(176,125,46,0.65)" }}>ابدئي الآن</span>

        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          جاهزة تتعرفي على منتجات ربى؟
        </h2>

        <p style={{
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.38)",
          lineHeight: 2,
          maxWidth: 340,
          margin: "0 auto 3rem",
          position: "relative",
        }}>
          كل منتج قصة علم وطبيعة وشغف حقيقي.
        </p>

        <a
          href="/products"
          style={{
            position: "relative",
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.86)",
            fontSize: 12.5, fontWeight: 600,
            padding: "14px 42px", borderRadius: "0.875rem",
            letterSpacing: "0.07em", textDecoration: "none",
            transition: "background 0.25s ease, border-color 0.25s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "rgba(255,255,255,0.14)";
            el.style.borderColor = "rgba(255,255,255,0.32)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "rgba(255,255,255,0.07)";
            el.style.borderColor = "rgba(255,255,255,0.18)";
          }}
        >
          تسوقي المنتجات
          <span aria-hidden="true">›</span>
        </a>
      </section>

    </div>
  );
}
