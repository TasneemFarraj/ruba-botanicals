import Link from "next/link";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--surface)" }}
    >
      {/* Botanical illustration */}
      <div style={{ color: "var(--forest)", opacity: 0.12, marginBottom: "2rem" }}>
        <svg viewBox="0 0 64 80" fill="none" width="80" height="100" aria-hidden="true">
          <path d="M32 72 C32 72 30 50 32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="currentColor"/>
          <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="currentColor"/>
          <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="currentColor"/>
          <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="currentColor"/>
          <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="currentColor"/>
        </svg>
      </div>

      {/* 404 number */}
      <p
        className="font-display"
        style={{
          fontSize: "clamp(5rem, 18vw, 9rem)",
          fontWeight: 700,
          color: "var(--forest)",
          opacity: 0.08,
          lineHeight: 1,
          marginBottom: "-1rem",
          letterSpacing: "-0.04em",
        }}
      >
        404
      </p>

      {/* Heading */}
      <h1
        className="font-display"
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2rem)",
          fontWeight: 700,
          color: "var(--text-1)",
          marginBottom: "0.75rem",
        }}
      >
        الصفحة غير موجودة
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 14,
          color: "var(--text-3)",
          maxWidth: 300,
          lineHeight: 1.7,
          marginBottom: "2.5rem",
        }}
      >
        يبدو أن هذه الصفحة غير موجودة أو تم نقلها.
        <br />
        دعينا نعيدك إلى المكان الصحيح.
      </p>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl font-semibold transition-opacity hover:opacity-85 active:scale-[0.97]"
        style={{
          padding: "12px 28px",
          fontSize: 14,
          background: "linear-gradient(135deg,#254a22,#1c3a1a,#162f14)",
          color: "#fff",
          boxShadow: "0 2px 14px rgba(28,58,26,0.22)",
          letterSpacing: "0.02em",
        }}
      >
        <svg viewBox="0 0 64 80" fill="none" width="13" height="16" aria-hidden="true">
          <path d="M32 72 C32 72 30 50 32 28" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="rgba(255,255,255,0.8)"/>
          <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="rgba(255,255,255,0.8)"/>
          <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="rgba(255,255,255,0.8)"/>
          <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="rgba(255,255,255,0.8)"/>
          <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="rgba(255,255,255,0.8)"/>
        </svg>
        العودة للرئيسية
      </Link>
    </div>
  );
}
