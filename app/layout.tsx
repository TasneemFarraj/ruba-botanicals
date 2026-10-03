import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Amiri, Cormorant_Garamond } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://rubafarraj.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "RUBA BOTANICAL | حناء وأعشاب طبيعية أردنية",
    template: "%s | RUBA BOTANICAL",
  },
  description:
    "من الطبيعة تبدأ العناية الآمنة ويزهر الجمال — حناء، أعشاب ومكوّنات طبيعية مختارة بعناية ومدروسة بثقة. نقش حناء، حناء شعر، عناية طبيعية من قلب عمّان.",

  keywords: [
    "حناء طبيعية",
    "حناء أردنية",
    "ربى بوتانيكال",
    "Ruba Botanical",
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

  authors: [{ name: "Ruba Botanical", url: SITE_URL }],
  creator: "Ruba Botanical",
  publisher: "RUBA BOTANICAL",

  category: "Beauty & Personal Care",

  alternates: {
    canonical: "/",
    languages: {
      "ar-JO": "/",
    },
  },

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
    siteName: "RUBA BOTANICAL",
    title: "RUBA BOTANICAL | حناء وأعشاب طبيعية أردنية",
    description:
      "من الطبيعة تبدأ العناية الآمنة ويزهر الجمال — حناء، أعشاب ومكوّنات طبيعية مختارة بعناية ومدروسة بثقة.",
    images: [
      {
        url: "/images/hero-henna-products.jpg",
        width: 1200,
        height: 630,
        alt: "RUBA BOTANICAL — حناء وأعشاب طبيعية أردنية",
        type: "image/jpeg",
      },
      {
        url: "/images/henna-naqsh-gold.jpg",
        width: 1200,
        height: 630,
        alt: "حناء نقش ذهبي — ربى بوتانيكال",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RUBA BOTANICAL | حناء وأعشاب طبيعية أردنية",
    description:
      "من الطبيعة تبدأ العناية الآمنة ويزهر الجمال — حناء وأعشاب طبيعية مختارة بعناية.",
    images: ["/images/hero-henna-products.jpg"],
    creator: "@rubafarrajhenna",
  },

  verification: {
    google: "",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RUBA BOTANICAL",
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
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "RUBA BOTANICAL",
      alternateName: "ربى بوتانيكال",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/ruba-logo.png`,
      },
      description:
        "من الطبيعة تبدأ العناية الآمنة ويزهر الجمال — حناء وأعشاب طبيعية مختارة بعناية ومدروسة بثقة.",
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
      name: "RUBA BOTANICAL",
      description:
        "حناء وأعشاب طبيعية أردنية — نقش، شعر، عناية طبيعية من قلب عمّان",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "ar-JO",
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: "RUBA BOTANICAL",
      alternateName: "ربى بوتانيكال",
      image: `${SITE_URL}/images/hero-henna-products.jpg`,
      url: SITE_URL,
      telephone: "+962789795740",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "عمّان",
        addressCountry: "JO",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 31.9454,
        longitude: 35.9284,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        opens: "09:00",
        closes: "21:00",
      },
      servesCuisine: "Natural Beauty & Henna",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "منتجات ربى بوتانيكال",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "حناء النقش" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "حناء الشعر الطبيعية" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "العناية الطبيعية بالشعر" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "العناية الطبيعية بالجسم" } },
        ],
      },
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
        <link rel="canonical" href={SITE_URL} />
      </head>
      <body className="grain antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
