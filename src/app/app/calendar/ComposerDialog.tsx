"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { composerOpenFromParams, hrefWithoutComposer } from "@/lib/composerUrl";
import styles from "./calendar.module.css";

// The post composer as a centered window over the calendar (stays mounted while closed,
// so a half-written post is still there when it is opened again).
export default function ComposerDialog({ title, children }: { title: string; children: ReactNode }) {
  const params = useSearchParams();
  const pathname = usePathname() ?? "/app/calendar";
  const router = useRouter();
  const urlOpen = composerOpenFromParams(new URLSearchParams(params.toString()));
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open state follows the URL after navigation
    if (urlOpen) setOpen(true);
  }, [urlOpen]);

  useEffect(() => {
    // Old links to /app/calendar#new still open the composer.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash is only known in the browser
    if (window.location.hash === "#new") setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (urlOpen) router.replace(hrefWithoutComposer(pathname, new URLSearchParams(params.toString())), { scroll: false });
  }, [urlOpen, router, pathname, params]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div className={styles.dialogBackdrop} hidden={!open} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={styles.dialogPanel}>
        <div className={styles.dialogHead}>
          <h2 className={styles.dialogTitle}>{title}</h2>
          <button type="button" onClick={close} className={styles.dialogClose} aria-label="Close">
            <X width={20} height={20} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.dialogBody}>{children}</div>
      </div>
    </div>
  );
}
