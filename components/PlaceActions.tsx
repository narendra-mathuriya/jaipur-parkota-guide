"use client";

import { useState, type ReactNode } from "react";

export function PlaceActions({
  title,
  text,
  url
}: {
  title: string;
  text: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function sharePlace() {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }

    await copyLink();
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={sharePlace}
        className="inline-flex min-h-12 items-center justify-between rounded-lg bg-[#f4f4f5] px-5 py-3 text-sm font-semibold !text-[#050506] hover:bg-zinc-200 [&_svg]:!text-[#050506]"
      >
        Share place
        <ShareIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-12 items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-zinc-200 hover:bg-white/[0.12] hover:text-white"
      >
        {copied ? "Copied" : "Copy link"}
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

function BaseIcon({
  className,
  children
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <BaseIcon className={className}>
      <path d="M20 6 9 17l-5-5" />
    </BaseIcon>
  );
}

function CopyIcon({ className }: { className: string }) {
  return (
    <BaseIcon className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </BaseIcon>
  );
}

function ShareIcon({ className }: { className: string }) {
  return (
    <BaseIcon className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </BaseIcon>
  );
}
