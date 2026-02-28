export function VibeCheck() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-200">
        <span>⚡</span> Vibe Check
      </h3>
      <p className="text-zinc-500 text-sm">
        Polls & interactive content coming soon. Drop your hot takes here.
      </p>
      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/30 py-4 text-center text-sm text-zinc-400">
          Option A
        </div>
        <div className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/30 py-4 text-center text-sm text-zinc-400">
          Option B
        </div>
      </div>
    </section>
  );
}
