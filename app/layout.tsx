import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Amiri, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "./_components/Providers";
import { SITE_URL } from "./_lib/site";

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

const cormorant = Cormorant_Garamond({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Ruba Farraj Botanicals | ربى فرّاج",
    template: "%s | Ruba Farraj Botanicals",
  },
  description:
    "منتجات طبيعية من ربى فرّاج للعناية بالشعر والجسم، وحناء نقية، بتركيبات مدروسة بخبرة علمية. جمال آمن يبدأ من الطبيعة.",

  keywords: [
    "حناء طبيعية",
    "حناء أردنية",
    "ربى فرّاج بوتانيكالز",
    "Ruba Farraj Botanicals",
    "حناء نقش",
    "حناء شعر",
    "أعشاب طبيعية",
    "عناية طبيعية",
    "مكونات طبيعية",
    "حناء عمان",
    "henna jordan",
    "natural henna",
    "organic henna amman",
    "hair henna",
    "herbal hair care",
  ],

  authors: [{ name: "Ruba Farraj Botanicals", url: SITE_URL }],
  creator: "Ruba Farraj Botanicals",
  publisher: "Ruba Farraj Botanicals",

  category: "Beauty & Personal Care",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: SITE_URL,
    siteName: "Ruba Farraj Botanicals",
    title: "Ruba Farraj Botanicals | ربى فرّاج",
    description:
      "منتجات طبيعية للعناية بالشعر والجسم، وحناء نقية، بتركيبات مدروسة بخبرة علمية. جمال آمن يبدأ من الطبيعة.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1600,
        height: 837,
        alt: "Ruba Farraj Botanicals | ربى فرّاج",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ruba Farraj Botanicals | ربى فرّاج",
    description:
      "منتجات طبيعية للعناية بالشعر والجسم، وحناء نقية، بتركيبات مدروسة بخبرة علمية. جمال آمن يبدأ من الطبيعة.",
    images: ["/images/og-image.jpg"],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ruba Farraj Botanicals",
  },

  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
    url: false,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/#organization`,
      name: "Ruba Farraj Botanicals",
      alternateName: "ربى فرّاج بوتانيكالز",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/ruba-logo-google.png`,
      },
      description:
        "منتجات طبيعية للعناية بالشعر والجسم، وحناء نقية، بتركيبات مدروسة بخبرة علمية. جمال آمن يبدأ من الطبيعة.",
      foundingLocation: {
        "@type": "Place",
        name: "عمّان، الأردن",
        addressCountry: "JO",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+962789795740",
        contactType: "customer service",
        availableLanguage: ["Arabic"],
      },
      sameAs: [
        "https://www.instagram.com/rubafarrajhenna",
        "https://www.facebook.com/share/1Eyz9QZt6g/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Ruba Farraj Botanicals",
      description:
        "منتجات طبيعية للعناية بالشعر والجسم، وحناء نقية، بتركيبات مدروسة بخبرة علمية.",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "ar-JO",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibm.variable} ${amiri.variable} ${cormorant.variable}`}>
      <head>
        {/* Runs once during SSR to prevent flash of wrong theme/language before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="theme-color" content="#2d4a2d" />
        <meta name="msapplication-TileColor" content="#2d4a2d" />
      </head>
      <body className="grain antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
