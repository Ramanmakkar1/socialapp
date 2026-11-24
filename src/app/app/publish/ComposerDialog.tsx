"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Maximize2, Minimize2, X } from "lucide-react";
import { composerOpenFromParams, hrefWithoutComposer } from "@/lib/composerUrl";
import styles from "./calendar.module.css";

// Lets the composer close its window after a save (unless "Create another" is ticked).
const ComposerDialogContext = createContext<{ close: (href?: string) => void } | null>(null);

/** The surrounding composer window, or null when the composer is rendered on its own. */
export function useComposerDialog() {
  return useContext(ComposerDialogContext);
}

// The post composer as a centered window over the calendar (stays mounted while closed,
// so a half-written post is still there when it is opened again).
export default function ComposerDialog({ title, children }: { title: string; children: ReactNode }) {
  const params = useSearchParams();
  const pathname = usePathname() ?? "/app/publish";
  const router = useRouter();
  const urlOpen = composerOpenFromParams(new URLSearchParams(params.toString()));
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const [preview, setPreview] = useState(true);
  // Below 1024px the preview is a sheet over the form, opened from the header "Preview" button.
  const [sheet, setSheet] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open state follows the URL after navigation
    if (urlOpen) setOpen(true);
  }, [urlOpen]);

  useEffect(() => {
    // Old links to /app/publish#new still open the composer.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash is only known in the browser
    if (window.location.hash === "#new") setOpen(true);
  }, []);

  // `href` lets the composer pick where to land (e.g. also dropping ?idea= after a save).
  const close = useCallback((href?: string) => {
    setOpen(false);
    if (href) router.replace(href, { scroll: false });
    else if (urlOpen) router.replace(hrefWithoutComposer(pathname, new URLSearchParams(params.toString())), { scroll: false });
  }, [urlOpen, router, pathname, params]);

  const dialogApi = useMemo(() => ({ close }), [close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sheet) setSheet(false);
      else close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the window title (not the close button) so screen readers announce it and Tab starts in the form.
    (titleRef.current ?? panelRef.current)?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, sheet]);

  return (
    <div className={styles.dialogBackdrop} hidden={!open} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-dialog-title"
        className={`${styles.dialogPanel} ${wide ? styles.dialogPanelWide : ""}`}
        data-preview={preview ? "on" : "off"}
        data-sheet={sheet ? "open" : undefined}
      >
        <div className={styles.dialogHead}>
          <h2 id="composer-dialog-title" ref={titleRef} tabIndex={-1} className={styles.dialogTitle}>{title}</h2>
          <div className={styles.dialogTools}>
            <button type="button" onClick={() => setPreview((v) => !v)} className={`${styles.dialogTool} ${styles.desktopOnly}`} aria-pressed={preview}>
              {preview ? <EyeOff width={16} height={16} aria-hidden="true" /> : <Eye width={16} height={16} aria-hidden="true" />}
              <span>{preview ? "Hide preview" : "Preview"}</span>
            </button>
            <button type="button" onClick={() => setSheet((v) => !v)} className={`${styles.dialogTool} ${styles.mobileOnly}`} aria-pressed={sheet}>
              <Eye width={16} height={16} aria-hidden="true" />
              <span>{sheet ? "Close preview" : "Preview"}</span>
            </button>
            <button type="button" onClick={() => setWide((v) => !v)} className={`${styles.dialogClose} ${styles.wideOnly}`} aria-label={wide ? "Exit full screen" : "Full screen"} aria-pressed={wide}>
              {wide ? <Minimize2 width={18} height={18} aria-hidden="true" /> : <Maximize2 width={18} height={18} aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => close()} className={styles.dialogClose} aria-label="Close">
              <X width={20} height={20} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={styles.dialogBody}>
          <ComposerDialogContext.Provider value={dialogApi}>{children}</ComposerDialogContext.Provider>
        </div>
        {sheet && <button type="button" className={styles.sheetScrim} aria-label="Close preview" onClick={() => setSheet(false)} />}
      </div>
    </div>
  );
}
