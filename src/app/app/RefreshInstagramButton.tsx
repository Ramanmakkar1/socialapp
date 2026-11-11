"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshInstagramData } from "./igActions";

// Re-fetches the cached Instagram posts/profile. Stays "Refreshing…" until the new data is on screen.
export default function RefreshInstagramButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        setFailed(false);
        startTransition(async () => {
          try {
            const res = await refreshInstagramData();
            if (!res.ok) setFailed(true);
          } catch {
            setFailed(true);
          }
        });
      }}
    >
      <RefreshCw width={14} height={14} aria-hidden="true" className={pending ? "animate-spin motion-reduce:animate-none" : undefined} />
      {pending ? "Refreshing…" : failed ? "Retry refresh" : "Refresh"}
    </button>
  );
}
