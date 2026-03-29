import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { AsideColumn } from "@/components/AsideColumn";
import { NavigationLoader } from "@/components/NavigationLoader";
import { AdSenseLoader, AdSlot } from "@/components/ads/GoogleAdSense";
import { getQuizSections } from "@/lib/quiz";
import { SITE_NAME, SITE_DESCRIPTION, getBaseUrl } from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const baseUrl = getBaseUrl();

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${SITE_NAME} | Trivia quizzes`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["quiz", "trivia", "multiple choice", "games"],
  authors: [{ name: SITE_NAME, url: baseUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Trivia quizzes`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Trivia quizzes`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sections = await getQuizSections();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: baseUrl,
    description: SITE_DESCRIPTION,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: baseUrl,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${baseUrl}/#organization` },
  };

  return (
    <html lang="en" className={outfit.variable}>
      <body className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased font-sans">
        <AdSenseLoader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NavigationLoader />
        <SiteHeader sections={sections} />

        <div className="flex flex-1 flex-col px-3 pb-6 pt-0 md:px-4">
          <div className="mx-auto w-full max-w-7xl">
            <AdSlot placement="top" className="mb-4" />
          </div>

          <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 lg:gap-6">
            <div className="hidden w-[160px] shrink-0 lg:block">
              <div className="sticky top-20">
                <AdSlot placement="rail-left" />
              </div>
            </div>

            <main className="min-w-0 flex-1 md:max-w-2xl md:mx-auto lg:mx-0 w-full">
              {children}
            </main>

            <AsideColumn />
          </div>

          <div className="mx-auto mt-8 w-full max-w-7xl">
            <AdSlot placement="bottom" />
          </div>

          <Footer />
        </div>
      </body>
    </html>
  );
}
