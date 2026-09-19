"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/install", label: "Installation" },
  { href: "/docs/quickstart", label: "Quickstart" },
  { href: "/docs/cli", label: "CLI Reference" },
  { href: "/docs/dashboard", label: "Dashboard" },
  { href: "/docs/agents", label: "Custom Agents" },
  { href: "/docs/scheduling", label: "14-Day Scheduler" },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0">
      <nav className="sticky top-24 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? "bg-red-600/10 text-red-400 border border-red-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
