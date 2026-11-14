"use client";

import { useState } from "react";
import HashtagGenerator, { PLATFORM, type HashtagPlatform } from "../instagram-hashtag-generator/HashtagGenerator";
import t from "@/components/tools/tools.module.css";

// Only the platform names that need special casing live here; every other label is derived from the key.
const SPECIAL_LABELS: Record<string, string> = { x: "X", tiktok: "TikTok", linkedin: "LinkedIn", youtube: "YouTube" };
const label = (p: HashtagPlatform) => SPECIAL_LABELS[p] ?? p.charAt(0).toUpperCase() + p.slice(1);

// Derive the picker from the shared generator definition so the buttons can never drift.
const PLATFORMS = Object.keys(PLATFORM) as HashtagPlatform[];

export default function HashtagPicker() {
  const [active, setActive] = useState<HashtagPlatform>("instagram");

  return (
    <div className="min-w-0 space-y-4">
      <div role="group" aria-label="Platform" className="flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => (
          <button key={p} type="button" className={t.filter} aria-pressed={active === p} onClick={() => setActive(p)}>
            {label(p)}
          </button>
        ))}
      </div>
      <HashtagGenerator key={active} platform={active} />
    </div>
  );
}
