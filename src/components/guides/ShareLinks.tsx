"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import g from "./guides.module.css";

/** Copy link + X, LinkedIn and Facebook share links. Plain links, no third-party scripts. */
export function ShareLinks({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className={className ? `${g.share} ${className}` : g.share}>
      <span className={g.shareLabel}>Share</span>
      <button type="button" className={g.shareBtn} onClick={copy}>
        {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
      <a className={g.shareBtn} href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer">
        X<span className="sr-only"> (share on X, opens in a new tab)</span>
      </a>
      <a className={g.shareBtn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer">
        LinkedIn<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <a className={g.shareBtn} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer">
        Facebook<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
