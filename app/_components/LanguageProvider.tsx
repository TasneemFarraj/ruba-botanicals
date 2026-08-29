"use client";

/* Language is now Arabic-only. This file is kept as a no-op stub. */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useLang() {
  return { lang: "ar" as const, toggleLang: () => {} };
}
