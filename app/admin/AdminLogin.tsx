"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../_lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/admin");
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.replace("/admin");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      dir="rtl"
      style={{ background: "var(--surface)", fontFamily: "var(--font-display), Georgia, serif" }}
    >
      <div className="w-full max-w-[360px]">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <svg viewBox="0 0 64 80" fill="none" className="w-9 h-11" aria-hidden="true">
            <path d="M32 72 C32 72 30 50 32 28" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="var(--forest)"/>
            <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="var(--forest)"/>
            <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="var(--forest)"/>
            <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="var(--forest)"/>
            <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="var(--forest)"/>
          </svg>
          <div className="text-center">
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 400, color: "var(--forest)", lineHeight: 1 }}>
              ربى للحناء
            </h1>
            <p style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 4 }}>
              لوحة التحكم
            </p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="space-y-4"
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid var(--border)",
            padding: "28px 28px 24px",
            boxShadow: "0 4px 24px rgba(28,58,26,0.06)",
          }}
        >
          <p className="text-[12px] text-center" style={{ color: "var(--text-2)", marginBottom: 2 }}>
            أدخل بياناتك للمتابعة
          </p>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: 12,
              padding: "10px 14px",
              borderRadius: 10,
            }}>
              {error}
            </div>
          )}

          <Field label="البريد الإلكتروني">
            <input
              type="email" required value={email} dir="ltr"
              onChange={e => setEmail(e.target.value)}
              onFocus={e  => { e.target.style.borderColor = "var(--forest)"; }}
              onBlur={e   => { e.target.style.borderColor = "var(--border-mid)"; }}
              style={inputSt}
            />
          </Field>

          <Field label="كلمة المرور">
            <input
              type="password" required value={password} dir="ltr"
              onChange={e => setPassword(e.target.value)}
              onFocus={e  => { e.target.style.borderColor = "var(--forest)"; }}
              onBlur={e   => { e.target.style.borderColor = "var(--border-mid)"; }}
              style={inputSt}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl font-semibold transition-opacity disabled:opacity-50"
            style={{
              background: "var(--forest)",
              color: "#e8f4e0",
              padding: "11px 0",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-center mt-5" style={{ fontSize: 11, color: "var(--text-3)" }}>
          مخصص للمشرف فقط
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border-mid)",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  color: "var(--text-1)",
  outline: "none",
  transition: "border-color 0.15s",
};
