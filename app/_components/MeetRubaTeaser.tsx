"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FACTS = [
  "أخصائية مختبرات طبية وجيناتكس",
  "أوّل مدرِّبة حناء معتمدة عالمياً في الأردن من قِبَل البورد الأمريكي",
  "درّبت أكثر من ٥٠٠ طالبة داخل وخارج الأردن في مجال رسم وتصنيع منتجات الحناء",
  "دبلوما الأكاديمية العالمية للتدريب والتطوير البريطانية في تصنيع المنتجات الطبيعية",
  "أخصائية تغذية معتمدة من ISSA",
  "أم، رياضية، مهتمة بأنماط الحياة الصحية المتوازنة ومعنية بالعناية التجميلية الطبيعية الآمنة",
  "منتجات طبيعية، آمنة، مرخّصة ومصنّعة في مصانع GMP وحاصلة على ISO 22716",
];

export default function MeetRubaTeaser() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
      });

      tl.fromTo(".mrt-heading",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
        0,
      );
      tl.fromTo(".mrt-fact",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.55, ease: "power2.out", stagger: 0.08 },
        0.3,
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      dir="rtl"
      className="relative w-full overflow-hidden"
      style={{ scrollMarginTop: "72px" }}
    >
      {/* ── Mobile layout: image on top, content below ── */}
      <div className="md:hidden" style={{ background: "var(--surface)" }}>
        {/* Wrapper: relative so the top-fade can escape the overflow:hidden image container */}
        <div className="relative mx-auto" style={{ width: "75%" }}>
          {/* Image container: overflow:hidden required by Next.js fill */}
          <div className="relative" style={{ aspectRatio: "4 / 5", overflow: "hidden" }}>
            <Image
              src="/images/ruba-farraj-mobile.jpeg"
              alt="ربى فرّاج"
              fill
              className="object-cover"
              style={{ objectPosition: "center top" }}
              sizes="75vw"
            />
            {/* Bottom fade into content */}
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(to top, var(--surface) 0%, rgba(var(--surface-rgb),0) 30%)",
            }} />
          </div>
          {/* Top fade — outside overflow:hidden so it's never clipped */}
          <div aria-hidden="true" style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "30%",
            pointerEvents: "none",
            background: "linear-gradient(to bottom, var(--surface) 0%, rgba(var(--surface-rgb),0) 100%)",
            zIndex: 1,
          }} />
        </div>

        {/* Content */}
        <div style={{
          background: "var(--surface)",
          padding: "2rem 1.5rem 3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.4rem",
        }}>
          <h2 className="mrt-heading font-display section-title" style={{
            color: "var(--forest)",
          }}>
            من هي ربى فرّاج؟
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {FACTS.map((fact) => (
              <div key={fact} className="mrt-fact" style={{ display: "flex", alignItems: "baseline", gap: "0.7rem" }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--gold)", flexShrink: 0, marginTop: 6,
                }} />
                <span style={{ fontSize: "var(--fs-base)", color: "var(--text-1)", lineHeight: 1.65 }}>
                  {fact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop layout: full-bleed image with overlaid content panel ── */}
      <div className="hidden md:block relative w-full overflow-hidden"
        style={{ minHeight: "clamp(620px, 90vh, 960px)" }}>

        {/* Full-bleed photo */}
        <div className="absolute inset-0">
          <Image
            src="/images/ruba-farraj.jpeg"
            alt="ربى فرّاج"
            fill
            className="object-cover"
            style={{ objectPosition: "center 12%" }}
            sizes="100vw"
          />
        </div>

        {/* Top fade — matches the surface/cream colour of the section above */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom, var(--surface) 0%, rgba(var(--surface-rgb),0) 18%)",
        }} />

        {/* Bottom fade */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to top, var(--surface) 0%, rgba(var(--surface-rgb),0) 22%)",
        }} />

        {/* Right fade — cream zone */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "linear-gradient(to right, transparent 0%, transparent 36%, rgba(var(--surface-rgb),0.05) 44%, rgba(var(--surface-rgb),0.36) 55%, rgba(var(--surface-rgb),0.82) 70%, rgba(var(--surface-rgb),0.97) 83%, var(--surface) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0,
          width: "clamp(400px, 58%, 700px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(2rem, 4vw, 5rem) clamp(1.5rem, 3vw, 3rem)",
          gap: "1.4rem",
        }}>

          <h2 className="mrt-heading font-display section-title" style={{
            color: "var(--forest)",
          }}>
            من هي ربى فرّاج؟
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {FACTS.map((fact) => (
              <div key={fact} className="mrt-fact" style={{ display: "flex", alignItems: "baseline", gap: "0.7rem" }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--gold)", flexShrink: 0, marginTop: 6,
                }} />
                <span style={{ fontSize: "var(--fs-base)", color: "var(--text-1)", lineHeight: 1.65 }}>
                  {fact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
