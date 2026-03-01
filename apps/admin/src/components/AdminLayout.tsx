import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/30 p-6">
        <Link href="/" className="text-xl font-bold text-cyan-400">
          Buzz Admin
        </Link>
        <nav className="mt-8 space-y-2">
          <Link
            href="/"
            className="block rounded-lg px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/posts"
            className="block rounded-lg px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Posts
          </Link>
          <Link
            href="/posts/new"
            className="block rounded-lg px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            New Post
          </Link>
          <Link
            href="/drafts"
            className="block rounded-lg px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Drafts
          </Link>
        </nav>
        <div className="mt-auto pt-8">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
