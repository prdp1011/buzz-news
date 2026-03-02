import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { prisma } from "database";
import { Footer } from "@/components/Footer";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MobileNav } from "@/components/MobileNav";
import { RightSidebar } from "@/components/RightSidebar";
import { NavigationLoader } from "@/components/NavigationLoader";
import { SITE_NAME, SITE_DESCRIPTION, getBaseUrl } from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${SITE_NAME} | News That Actually Hits Different`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["news", "AI summaries", "tech news", "trending", "buzz"],
  authors: [{ name: SITE_NAME, url: baseUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | News That Actually Hits Different`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | News That Actually Hits Different`,
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
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NavigationLoader />
        <LeftSidebar categories={categories} />
        <MobileNav categories={categories} />

        {/* Main content - offset for left sidebar on desktop */}
        <div className="flex flex-1 flex-col lg:pl-16 px-3 py-4 md:p-2 md:py-0">
          <div className="mx-auto flex max-w-6xl gap-8 px-0 py-0 md:px-4 md:py-6">
            {/* Center - main feed: 470px width on desktop, full width on mobile */}
            <main className="w-full shrink-0 md:mx-auto md:max-w-[470px] md:flex-1">
              {children}
            </main>

            {/* Right sidebar */}
            <RightSidebar />
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
