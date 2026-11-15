"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

// Published media is deleted from Poskoo's storage after posting, so an old
// thumbnail URL can 404. Show a neutral placeholder instead of a broken image.
export function TopThumb({ src, className }: { src: string | null | undefined; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={className} aria-hidden="true" style={{ display: "grid", placeItems: "center", color: "var(--poskoo-muted)" }}>
        <ImageIcon width={16} height={16} />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts
  return <img src={src} alt="" className={className} loading="lazy" onError={() => setFailed(true)} />;
}
