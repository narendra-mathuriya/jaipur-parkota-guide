"use client";

import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  ["Directory", "#explore"],
  ["Editorial", "#editorial"],
  ["FAQ", "#faq"]
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="glass-panel mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-4 sm:px-5">
        <a
          href="#top"
          className="flex min-h-11 items-center gap-3"
          aria-label="Jaipur Explorer home"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_26px_rgba(216,197,159,0.8)]" />
          <span className="text-sm font-semibold tracking-[0.22em] text-silver uppercase">
            Jaipur Explorer
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="min-h-11 rounded-full px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href="#explore"
          className="hidden min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.14] md:inline-flex"
        >
          <Search size={16} aria-hidden="true" />
          Explore
        </a>

        <button
          type="button"
          className="grid min-h-11 min-w-11 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-white md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <nav
          className="glass-panel mx-auto mt-2 grid max-w-7xl gap-1 rounded-[2rem] p-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {navItems.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="min-h-11 rounded-full px-5 py-3 text-sm text-zinc-200 transition active:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
