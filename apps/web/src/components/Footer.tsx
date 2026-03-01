import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-amber-400"
            >
              <span className="text-xl">✨</span>
              Buzz News
            </Link>
            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              Your daily dose of news that matters. AI-powered summaries, no
              paywalls, multiple perspectives.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Legal
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-zinc-400 hover:text-amber-400"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-zinc-400 hover:text-amber-400"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Company
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-zinc-400 hover:text-amber-400"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@buzznews.com"
                    className="text-sm text-zinc-400 hover:text-amber-400"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex flex-col gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            © {currentYear} Buzz News. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            News content is aggregated from external sources. We do not claim
            ownership of original articles.
          </p>
        </div>
      </div>
    </footer>
  );
}
