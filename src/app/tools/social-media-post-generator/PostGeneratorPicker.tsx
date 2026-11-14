"use client";

import { useState } from "react";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";
import t from "@/components/tools/tools.module.css";

type Platform = "instagram" | "tiktok" | "facebook" | "linkedin" | "pinterest" | "x";

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "pinterest", label: "Pinterest" },
  { id: "x", label: "X (Twitter)" },
];

/** Pick a platform, then reuse the caption generator with that platform's rules and limits. */
export function PostGeneratorPicker() {
  const [active, setActive] = useState<Platform>("instagram");

  return (
    <div>
      <div
        role="group"
        aria-label="Platform"
        className={t.filters}
        style={{ flexWrap: "wrap", marginBottom: "1.5rem" }}
      >
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={t.filter}
            aria-pressed={active === p.id}
            onClick={() => setActive(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <CaptionGeneratorTool key={active} platform={active} />
    </div>
  );
}
