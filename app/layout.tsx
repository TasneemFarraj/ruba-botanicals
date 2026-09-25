import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Amiri } from "next/font/google";
import "./globals.css";
import Providers from "./_components/Providers";

const ibm = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-display",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "ربى للحناء | حناء طبيعية أردنية فاخرة",
  description:
    "ربى للحناء — حناء طبيعية أردنية. نقش، شعر، أعشاب، مناسبات، دورات معتمدة وخدمة منزلية.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibm.variable} ${amiri.variable}`}>
      <head>
        {/* Runs once during SSR to prevent flash of wrong theme/language before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="grain antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
