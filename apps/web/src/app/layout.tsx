import type { Metadata } from "next";
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
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <a href="/" className="text-xl font-bold text-cyan-400">
              Gen Z News
            </a>
            <div className="flex gap-6">
              <a
                href="/category/tech"
                className="text-zinc-400 hover:text-white transition"
              >
                Tech
              </a>
              <a
                href="/category/culture"
                className="text-zinc-400 hover:text-white transition"
              >
                Culture
              </a>
              <a
                href="/category/lifestyle"
                className="text-zinc-400 hover:text-white transition"
              >
                Lifestyle
              </a>
              <a
                href="/category/news"
                className="text-zinc-400 hover:text-white transition"
              >
                News
              </a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-auto border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} Gen Z News. Built for the next gen.
        </footer>
      </body>
    </html>
  );
}
