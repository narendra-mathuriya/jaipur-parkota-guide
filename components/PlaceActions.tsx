"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

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
        className="inline-flex min-h-12 items-center justify-between rounded-lg bg-[#f4f4f5] px-5 py-3 text-sm font-semibold !text-[#050506] transition hover:bg-zinc-200 [&_svg]:!text-[#050506]"
      >
        Share place
        <Share2 size={17} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-12 items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.12] hover:text-white"
      >
        {copied ? "Copied" : "Copy link"}
        {copied ? (
          <Check size={17} aria-hidden="true" />
        ) : (
          <Copy size={17} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
