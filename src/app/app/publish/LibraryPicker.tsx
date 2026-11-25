"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Film, ImageIcon, Images, Search, X } from "lucide-react";

import type { MediaAssetView } from "@/lib/mediaLibrary";

/** Media-library picker for the composer: pick one or more files of the current workspace. */
export default function LibraryPicker({
  max,
  onPick,
  onClose,
}: {
  /** How many more files fit in the post. */
  max: number;
  onPick: (assets: MediaAssetView[]) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaAssetView[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/media/library?limit=200", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ items: MediaAssetView[] }>) : Promise.reject(new Error("load"))))
      .then((d) => {
        if (!cancelled) setItems(d.items);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (items ?? []).filter(
      (a) => (kind === "all" || a.kind === kind) && (!needle || a.name.toLowerCase().includes(needle) || a.alt.toLowerCase().includes(needle)),
    );
  }, [items, q, kind]);

  function toggle(id: string) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= max ? prev : [...prev, id]));
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add from media library"
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-[var(--poskoo-card)] shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--poskoo-line)] px-4 py-3">
          <Images className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden />
          <h2 className="m-0 flex-1 text-base font-semibold text-[var(--poskoo-ink)]">Media library</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[var(--poskoo-muted)] hover:bg-[var(--poskoo-band)]">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--poskoo-muted)]" aria-hidden />
            <span className="sr-only">Search media</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search files"
              className="w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] py-2 pl-9 pr-3 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
            />
          </label>
          <div className="inline-flex rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-0.5 text-sm" role="group" aria-label="Filter by type">
            {(["all", "image", "video"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className={`rounded-lg px-3 py-1.5 font-medium ${kind === k ? "bg-[var(--poskoo-card)] text-[var(--poskoo-ink)] shadow-sm" : "text-[var(--poskoo-muted)]"}`}
              >
                {k === "all" ? "All" : k === "image" ? "Images" : "Videos"}
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-[200px] flex-1 overflow-y-auto px-4 pb-4">
          {failed ? (
            <p className="py-10 text-center text-sm text-[var(--poskoo-coral)]">Could not load your media library.</p>
          ) : items === null ? (
            <p className="py-10 text-center text-sm text-[var(--poskoo-muted)]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--poskoo-muted)]">
              Your library is empty. Files you upload are saved here, or open <Link className="font-medium text-[var(--poskoo-violet)] underline" href="/app/media">Media library</Link>.
            </p>
          ) : shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--poskoo-muted)]">No files match.</p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-4">
              {shown.map((a) => {
                const n = picked.indexOf(a.id);
                const preview = a.kind === "video" ? a.thumbUrl : a.url;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => toggle(a.id)}
                      aria-pressed={n >= 0}
                      aria-label={`${n >= 0 ? "Unselect" : "Select"} ${a.name || a.kind}`}
                      className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-[var(--poskoo-band)] p-0 ${n >= 0 ? "border-[var(--poskoo-violet)]" : "border-transparent"}`}
                    >
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={a.alt} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-[var(--poskoo-muted)]">{a.kind === "video" ? <Film aria-hidden /> : <ImageIcon aria-hidden />}</span>
                      )}
                      {a.kind === "video" && <span className="absolute right-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[11px] font-semibold text-white">Video</span>}
                      {n >= 0 && (
                        <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[var(--poskoo-violet)] text-xs font-bold text-white">
                          {picked.length > 1 ? n + 1 : <Check className="h-3.5 w-3.5" aria-hidden />}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--poskoo-line)] px-4 py-3">
          <span className="flex-1 text-sm text-[var(--poskoo-muted)]">{picked.length > 0 ? `${picked.length} selected` : max > 0 ? `Pick up to ${max}` : "This post is full"}</span>
          <button type="button" onClick={onClose} className="rounded-xl border border-[var(--poskoo-line)] px-4 py-2 text-sm font-medium text-[var(--poskoo-ink)]">
            Cancel
          </button>
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() => onPick(picked.map((id) => (items ?? []).find((a) => a.id === id)).filter((a): a is MediaAssetView => Boolean(a)))}
            className="rounded-xl bg-[var(--poskoo-violet)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add to post
          </button>
        </div>
      </div>
    </div>
  );
}
