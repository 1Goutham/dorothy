import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SiteEffects from "@/components/SiteEffects";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-200-normal.woff2", weight: "200" },
    { path: "./fonts/poppins-latin-300-normal.woff2", weight: "300" },
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const tamil = localFont({
  src: [
    { path: "./fonts/noto-sans-tamil-tamil-400-normal.woff2", weight: "400" },
    { path: "./fonts/noto-sans-tamil-tamil-500-normal.woff2", weight: "500" },
    { path: "./fonts/noto-sans-tamil-tamil-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-tamil",
  display: "swap",
  preload: false,
});

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dorothy.in";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Dorothy · Your life is more than what the world sees",
  description: "A free, community-led support ecosystem for transgender people in India, starting in Tamil Nadu.",
  icons: { icon: "/favicon.svg" },
  referrer: "no-referrer",
  openGraph: { siteName: "Dorothy", type: "website", images: ["/assets/goddess/poster.webp"] },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${tamil.variable}`} suppressHydrationWarning>
      <head>
        {/* marks JS as available before paint, so reveal and the hero poster don't flash */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        {children}
        <Footer />
        <SiteEffects />
      </body>
    </html>
  );
}
