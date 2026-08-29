"use client";

import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";
import { CartProvider } from "./CartProvider";
import CartDrawer from "./CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
