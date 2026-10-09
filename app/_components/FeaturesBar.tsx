"use client";

import { useState, useEffect } from "react";

const TESTIMONIALS = [
  {
    quote: "منتجات استثنائية حوّلت روتيني الجمالي تمامًا. شعري أقوى وروحي أكثر ارتياحًا.",
    author: "نور، عميلة مميزة",
  },
  {
    quote: "حناء طبيعية بنسبة 100٪ ورائحة رائعة! أنصح بها كل من تهتم بعنايتها.",
    author: "رنا، عميلة دائمة",
  },
  {
    quote: "خدمة راقية وجودة لا مثيل لها. كل طلب يوصل بسرعة وبعبوة أنيقة.",
    author: "لمى، عميلة مميزة",
  },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <rect x="1" y="3" width="15" height="12" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="1.8" />
        <circle cx="18.5" cy="18.5" r="1.8" />
        <path d="M7.3 18.5h9.4" />
      </svg>
    ),
    title: "توصيل مجاني",
    subtitle: "للطلبات فوق 70 د.أ",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    title: "دفع آمن",
    subtitle: "نضمن خصوصيتك",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path d="M17 8c-8 2-10.1 8.2-12.2 11.7a1 1 0 001.1.65C9 20 16 19 17 8z" />
        <path d="M12.2 6.5C13.4 5.4 16 3 20 2c0 4-.5 7.5-4 10" />
        <path d="M12 19v3" />
      </svg>
    ),
    title: "مكونات طبيعية",
    subtitle: "لا كيماويات ضارة",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path d="M3 18v-6a9 9 0 0118 0v6" />
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
      </svg>
    ),
    title: "رد فوري",
    subtitle: "واتساب خلال 24 ساعة",
  },
];

export default function FeaturesBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % TESTIMONIALS.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <section
      style={{ background: "var(--white)" }}
    >
      <div
        className="max-w-7xl mx-auto px-6 md:px-10"
        style={{ paddingTop: "var(--section-py)", paddingBottom: "var(--section-py)" }}
      >
        <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-0">

          {/* Features — first in DOM = right side in RTL flex */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 md:pe-10">
            {FEATURES.map(({ icon, title, subtitle }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center transition-transform duration-300 hover:scale-125 cursor-default"
                  style={{ color: "var(--forest-mid)" }}
                >
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--text-dark)", letterSpacing: "0.04em" }}>
                    {title}
                  </p>
                  <p style={{ fontSize: "var(--fs-xs)", marginTop: "0.25rem", color: "var(--text-muted)" }}>
                    {subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Vertical divider (desktop) */}
          <div className="hidden md:block w-px shrink-0 self-stretch" style={{ background: "var(--border)" }} />

          {/* Horizontal divider (mobile) */}
          <div className="block md:hidden h-px" style={{ background: "var(--border)" }} />

          {/* Testimonial — last in DOM = left side in RTL flex */}
          <div className="md:w-64 shrink-0 flex flex-col justify-center md:ps-10">
            <span
              className="text-6xl leading-none mb-2 select-none"
              style={{ color: "var(--text-light)", opacity: 0.35, fontFamily: "Georgia, serif" }}
            >
              "
            </span>
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
            >
              <p style={{ fontSize: "var(--fs-base)", lineHeight: 1.75, marginBottom: "0.75rem", color: "var(--text-muted)" }}>
                {t.quote}
              </p>
              <p style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-light)" }}>
                — {t.author}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 350); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === idx ? "20px" : "8px",
                    height: "8px",
                    background: i === idx ? "var(--forest-mid)" : "var(--text-light)",
                    opacity: i === idx ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
