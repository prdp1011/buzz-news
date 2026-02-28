import type { Metadata } from "next";
import Link from "next/link";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gen Z News | News That Actually Hits Different",
    template: "%s | Gen Z News",
  },
  description:
    "Your daily dose of news that matters. AI-powered summaries, no paywalls, multiple perspectives.",
  openGraph: {
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <LeftSidebar />

        {/* Mobile header - shown when left sidebar is hidden */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-amber-400">
            <span className="text-xl">✨</span>
            Gen Z News
          </Link>
          <nav className="flex gap-2">
            <Link href="/" className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white">
              Home
            </Link>
            <Link href="/category/tech" className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white">
              Tech
            </Link>
          </nav>
        </header>

        {/* Main content - offset for left sidebar on desktop */}
        <div className="lg:pl-16">
          <div className="mx-auto flex max-w-6xl gap-8 px-0 py-0 md:px-4 md:py-6">
            {/* Center - main feed: 470px width on desktop, full width on mobile */}
            <main className="w-full shrink-0 md:mx-auto md:max-w-[470px] md:flex-1">
              {children}
            </main>

            {/* Right sidebar */}
            <RightSidebar />
          </div>
        </div>
      </body>
    </html>
  );
}
