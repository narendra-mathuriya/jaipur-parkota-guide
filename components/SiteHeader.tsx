"use client";

import {
  BookOpenText,
  Compass,
  HelpCircle,
  Menu,
  Search,
  X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  ["Explore", "#explore", Compass],
  ["Notes", "#editorial", BookOpenText],
  ["FAQ", "#faq", HelpCircle]
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#050506]/78 px-3 py-3 backdrop-blur-2xl sm:px-5">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3">
        <a
          href="#top"
          className="group flex min-h-11 min-w-0 items-center gap-3"
          aria-label="Jaipur Explorer home"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-sm font-semibold text-white transition group-hover:border-white/20 group-hover:bg-white/[0.1]">
            JE
          </span>
          <span className="truncate text-sm font-semibold tracking-[0.08em] text-white uppercase">
            Jaipur Explorer
          </span>
        </a>

        <nav
          className="hidden items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.035] p-1 md:flex"
          aria-label="Primary"
        >
          {navItems.map(([label, href, Icon]) => (
            <a
              key={label}
              href={href}
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>

        <a
          href="#explore"
          className="hidden min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white px-3 py-2 text-sm font-semibold !text-[#050506] transition hover:bg-zinc-200 md:inline-flex"
        >
          <Search size={16} aria-hidden="true" />
          Search
        </a>

        <button
          type="button"
          className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X size={19} aria-hidden="true" />
          ) : (
            <Menu size={19} aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <nav
          className="mx-auto mt-3 grid max-w-7xl gap-2 rounded-lg border border-white/[0.08] bg-[#0a0a0b]/96 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:hidden"
          aria-label="Mobile navigation"
        >
          {navItems.map(([label, href, Icon]) => (
            <a
              key={label}
              href={href}
              className="inline-flex min-h-12 items-center gap-3 rounded-md px-3 py-3 text-sm text-zinc-200 transition active:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </a>
          ))}
          <a
            href="#explore"
            className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-3 py-3 text-sm font-semibold !text-[#050506]"
            onClick={() => setOpen(false)}
          >
            <Search size={17} aria-hidden="true" />
            Search directory
          </a>
        </nav>
      ) : null}
    </header>
  );
}
