import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-8 border-t border-zinc-800 bg-zinc-950 md:mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-base font-bold text-amber-400 md:gap-2"
            >
              <span className="text-lg md:text-xl">🧠</span>
              QuizLab
            </Link>
            <p className="mt-2 max-w-xs text-sm text-zinc-500 leading-relaxed md:mt-3">
              Free trivia quizzes by section — multiple choice and instant results.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Legal
              </h4>
              <ul className="mt-2 space-y-1 md:mt-3 md:space-y-2">
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Company
              </h4>
              <ul className="mt-2 space-y-1 md:mt-3 md:space-y-2">
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
                    href="mailto:buzznnews@gmail.com"
                    className="text-sm text-zinc-400 hover:text-amber-400 md:text-base"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-zinc-800 pt-6 text-sm md:mt-10"
          aria-label="Footer links"
        >
          <Link href="/privacy" className="text-zinc-400 hover:text-amber-400">
            Privacy
          </Link>
          <span className="text-zinc-700" aria-hidden>
            ·
          </span>
          <Link href="/terms" className="text-zinc-400 hover:text-amber-400">
            Terms
          </Link>
          <span className="text-zinc-700" aria-hidden>
            ·
          </span>
          <Link href="/about" className="text-zinc-400 hover:text-amber-400">
            About
          </Link>
        </nav>

        <div className="mt-6 flex flex-col gap-3 border-t border-zinc-800 pt-6 md:mt-8 md:gap-4 md:pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            © {currentYear} QuizLab. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Quiz content is for entertainment. Questions may reference public-domain rhymes and facts.
          </p>
        </div>
      </div>
    </footer>
  );
}
