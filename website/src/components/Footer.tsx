import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
            BA
          </div>
          <span className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} BeyondAgtest. MIT License.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Docs
          </Link>
          <a
            href="https://github.com/hmkhan10/beyondagtest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/hmkhan10/beyondagtest/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            License
          </a>
        </div>
      </div>
    </footer>
  );
}
