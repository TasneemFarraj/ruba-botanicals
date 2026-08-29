import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Amiri, Playfair_Display, Noto_Naskh_Arabic } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-stat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const naskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["400", "500"],
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
    <html lang="ar" dir="rtl" className={`${ibm.variable} ${amiri.variable} ${playfair.variable} ${naskh.variable}`}>
      <head>
        {/* Runs once during SSR to prevent flash of wrong theme/language before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="grain antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
