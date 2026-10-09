"use client";

import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";
import { CartProvider } from "./CartProvider";
import CartDrawer from "./CartDrawer";
import CartToast from "./CartToast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <CartToast />
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
