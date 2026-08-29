"use client";

import { useState } from "react";
import { supabase } from "../_lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-light text-forest mb-2">
            ربى للحناء
          </h1>
          <p className="text-xs text-charcoal/40 tracking-widest uppercase">
            لوحة التحكم
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl border border-sand/30 p-8 space-y-5 shadow-sm"
        >
          <h2 className="font-display text-2xl font-semibold text-forest mb-2">
            تسجيل الدخول
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal/50 mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="w-full bg-cream/50 border border-sand/60 rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/50 mb-1.5">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="w-full bg-cream/50 border border-sand/60 rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-3 rounded-xl text-sm font-medium hover:bg-sage transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-center text-xs text-charcoal/30 mt-6">
          مخصص للمشرف فقط
        </p>
      </div>
    </div>
  );
}
