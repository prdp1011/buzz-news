import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { prisma } from "database";
import { Footer } from "@/components/Footer";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MobileNav } from "@/components/MobileNav";
import { RightSidebar } from "@/components/RightSidebar";
import { NavigationLoader } from "@/components/NavigationLoader";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Buzz News | News That Actually Hits Different",
    template: "%s | Buzz News",
  },
  description:
    "Your daily dose of news that matters. AI-powered summaries, no paywalls, multiple perspectives.",
  openGraph: {
    type: "website",
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

  return (
    <html lang="en" className={outfit.variable}>
      <body className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased font-sans">
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
