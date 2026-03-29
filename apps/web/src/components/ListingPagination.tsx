import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
};

/** Home listing: `/?page=2`, page 1 uses `/`. */
export function ListingPagination({ page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const href = (p: number) => (p <= 1 ? "/" : `/?page=${p}`);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-zinc-800 pt-6"
      aria-label="Page navigation"
    >
      {prev ? (
        <Link
          href={href(prev)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-amber-500/50 hover:text-amber-300"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-zinc-600">
          Previous
        </span>
      )}
      <span className="px-3 text-sm text-zinc-500">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link
          href={href(next)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-amber-500/50 hover:text-amber-300"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-zinc-600">
          Next
        </span>
      )}
    </nav>
  );
}
