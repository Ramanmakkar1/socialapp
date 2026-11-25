"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Film, ImageIcon, Images, Loader2, PenLine, Search, Trash2, Upload, X } from "lucide-react";

import EmptyState from "@/app/app/EmptyState";
import { formatBytes, formatDuration } from "@/lib/mediaLimits";
import type { MediaAssetView } from "@/lib/mediaLibrary";
import { UploadCancelled, probeMediaFile, uploadWithProgress } from "@/lib/mediaUploadClient";
import { validateMediaFile } from "@/lib/mediaUpload";
import type { PlanName } from "@/lib/planLimits";
import styles from "./media.module.css";

type Kind = "all" | "image" | "video" | "gif";

const KIND_LABEL: Record<Kind, string> = { all: "All", image: "Images", video: "Videos", gif: "GIFs" };

/** Pure: client-side filter of the loaded items (search name + alt, type). */
export function filterItems(items: MediaAssetView[], q: string, kind: Kind): MediaAssetView[] {
  const needle = q.trim().toLowerCase();
  return items.filter((a) => {
    if (kind === "gif" && !a.gif) return false;
    if ((kind === "image" || kind === "video") && a.kind !== kind) return false;
    if (!needle) return true;
    return a.name.toLowerCase().includes(needle) || a.alt.toLowerCase().includes(needle);
  });
}

export default function MediaLibrary({
  initialItems,
  usage: initialUsage,
  quota,
  plan,
  canDeleteAll,
  userId,
  loadFailed,
}: {
  initialItems: MediaAssetView[];
  usage: number;
  quota: number;
  plan: PlanName;
  imageMax: number;
  videoMax: number;
  canDeleteAll: boolean;
  userId: string;
  loadFailed: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [usage, setUsage] = useState(initialUsage);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ name: string; loaded: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dragDepth = useRef(0);

  const shown = useMemo(() => filterItems(items, q, kind), [items, q, kind]);
  const open = items.find((a) => a.id === openId) ?? null;
  const canDelete = useCallback((a: MediaAssetView) => canDeleteAll || a.uploadedBy === userId, [canDeleteAll, userId]);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/media/library?limit=200", { cache: "no-store" });
    if (!r.ok) return;
    const data = (await r.json()) as { items: MediaAssetView[]; usage: number };
    setItems(data.items);
    setUsage(data.usage);
  }, []);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setError("");
      setNotice("");
      const controller = new AbortController();
      abortRef.current = controller;
      let added = 0;
      try {
        for (const file of files.slice(0, 20)) {
          if (controller.signal.aborted) break;
          const check = validateMediaFile({ type: file.type, size: file.size, name: file.name }, plan);
          if (!check.ok) {
            setError(`${file.name}: ${check.error}`);
            continue;
          }
          const { facts, poster } = await probeMediaFile(file, check.kind);
          setProgress({ name: file.name, loaded: 0, total: file.size });
          const res = await uploadWithProgress(
            "/api/media/upload",
            file,
            {
              "Content-Type": file.type || "application/octet-stream",
              "X-File-Name": encodeURIComponent(file.name),
              ...(facts.width ? { "X-Media-Width": String(facts.width) } : {}),
              ...(facts.height ? { "X-Media-Height": String(facts.height) } : {}),
            },
            (loaded, total) => setProgress({ name: file.name, loaded, total }),
            controller.signal,
          );
          const body = res.body as { key?: string; error?: string };
          if (res.status < 200 || res.status >= 300 || !body.key) {
            setError(body.error || `Could not upload ${file.name}.`);
            continue;
          }
          if (poster) {
            await fetch("/api/media/upload", { method: "POST", body: poster, headers: { "Content-Type": "image/jpeg", "X-Thumb-For": body.key } }).catch(() => undefined);
          }
          added += 1;
        }
      } catch (err) {
        setError(err instanceof UploadCancelled ? "Upload cancelled." : "Could not upload that file. Please try again.");
      } finally {
        abortRef.current = null;
        setProgress(null);
        if (added > 0) {
          setNotice(added === 1 ? "1 file added to your library." : `${added} files added to your library.`);
          await refresh();
        }
      }
    },
    [plan, refresh],
  );

  // Drop anywhere on the page.
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      void upload(Array.from(e.dataTransfer?.files ?? []));
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [upload]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function remove(ids: string[]) {
    if (ids.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/media/library", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const data = (await r.json().catch(() => ({}))) as { deleted?: number; refused?: number; error?: string };
      if (!r.ok) {
        setError(data.error || "Could not delete those files.");
        return;
      }
      setSelected(new Set());
      if (openId && ids.includes(openId)) setOpenId(null);
      const parts = [`${data.deleted ?? 0} deleted`];
      if (data.refused) parts.push(`${data.refused} kept (only owners and admins can delete files others uploaded)`);
      setNotice(parts.join(", ") + ".");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const pct = quota > 0 ? Math.min(100, Math.round((usage / quota) * 100)) : 0;
  const selectedIds = [...selected].filter((id) => items.some((a) => a.id === id));

  return (
    <div className={styles.lib}>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search width={16} height={16} aria-hidden="true" />
          <span className="sr-only">Search media</span>
          <input type="search" placeholder="Search by file name or alt text" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className={styles.kinds} role="group" aria-label="Filter by type">
          {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
            <button key={k} type="button" className={`${styles.kind} ${kind === k ? styles.kindActive : ""}`} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <button type="button" className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={Boolean(progress)}>
          <Upload width={16} height={16} aria-hidden="true" /> Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/quicktime"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void upload(files);
          }}
        />
      </div>

      <div className={styles.usage}>
        <div className={styles.usageBar} role="meter" aria-valuemin={0} aria-valuemax={quota} aria-valuenow={usage} aria-label="Media library storage">
          <span style={{ width: `${pct}%` }} className={pct >= 90 ? styles.usageFull : undefined} />
        </div>
        <span>
          {usage > 0 ? formatBytes(usage) : "0 MB"} of {formatBytes(quota)} used on the {plan} plan
        </span>
      </div>

      {progress && (
        <div className={styles.progress} role="status">
          <Loader2 width={16} height={16} className={styles.spin} aria-hidden="true" />
          <span className={styles.progressName}>Uploading {progress.name}</span>
          <span className={styles.progressBar}><span style={{ width: `${progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0}%` }} /></span>
          <button type="button" className={styles.linkBtn} onClick={() => abortRef.current?.abort()}>Cancel</button>
        </div>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && !error && <p className={styles.notice} role="status">{notice}</p>}
      {loadFailed && <p className={styles.error}>We couldn&apos;t load your media library. Refresh to try again.</p>}

      {selectedIds.length > 0 && (
        <div className={styles.selectBar}>
          <span>{selectedIds.length} selected</span>
          <button type="button" className={styles.linkBtn} onClick={() => setSelected(new Set())}>Clear</button>
          <Link className={styles.useBtn} href={`/app/publish?compose=1&assets=${selectedIds.slice(0, 10).join(",")}`}>Use in new post</Link>
          <button type="button" className={styles.dangerBtn} disabled={busy} onClick={() => void remove(selectedIds)}>
            <Trash2 width={15} height={15} aria-hidden="true" /> Delete
          </button>
        </div>
      )}

      {items.length === 0 && !loadFailed ? (
        <EmptyState
          icon={Images}
          title="Your media library is empty"
          text="Upload images and videos once, then reuse them in any post. Drag files anywhere on this page."
          art="/illustrations/connect-account.webp"
          artWidth={1536}
          artHeight={1024}
        >
          <button type="button" className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
            <Upload width={16} height={16} aria-hidden="true" /> Upload files
          </button>
        </EmptyState>
      ) : shown.length === 0 ? (
        <p className={styles.none}>No files match your search.</p>
      ) : (
        <ul className={styles.grid}>
          {shown.map((a) => {
            const isSel = selected.has(a.id);
            const preview = a.kind === "video" ? a.thumbUrl : a.url;
            return (
              <li key={a.id} className={`${styles.tile} ${isSel ? styles.tileSel : ""}`}>
                <button type="button" className={styles.tileOpen} onClick={() => setOpenId(a.id)} aria-label={`Open ${a.name || "file"}`}>
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt={a.alt} loading="lazy" />
                  ) : (
                    <span className={styles.noThumb}>{a.kind === "video" ? <Film aria-hidden="true" /> : <ImageIcon aria-hidden="true" />}</span>
                  )}
                </button>
                <span className={styles.badge}>{a.gif ? "GIF" : a.kind === "video" ? (a.durationSec ? formatDuration(a.durationSec) : "Video") : "Image"}</span>
                {a.alt && <span className={styles.altBadge} title={a.alt}>ALT</span>}
                <label className={styles.check}>
                  <input type="checkbox" checked={isSel} onChange={() => toggle(a.id)} aria-label={`Select ${a.name || "file"}`} />
                  <span aria-hidden="true">{isSel && <Check width={13} height={13} />}</span>
                </label>
                <span className={styles.tileName}>{a.name || (a.kind === "video" ? "Video" : "Image")}</span>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <Details
          key={open.id}
          asset={open}
          canDelete={canDelete(open)}
          busy={busy}
          onClose={() => setOpenId(null)}
          onDelete={() => void remove([open.id])}
          onAlt={(alt) => setItems((prev) => prev.map((a) => (a.id === open.id ? { ...a, alt } : a)))}
        />
      )}

      {dragging && (
        <div className={styles.dropOverlay} aria-hidden="true">
          <Upload width={28} height={28} />
          <strong>Drop to add to your media library</strong>
        </div>
      )}
    </div>
  );
}

function Details({
  asset,
  canDelete,
  busy,
  onClose,
  onDelete,
  onAlt,
}: {
  asset: MediaAssetView;
  canDelete: boolean;
  busy: boolean;
  onClose: () => void;
  onDelete: () => void;
  onAlt: (alt: string) => void;
}) {
  const [alt, setAlt] = useState(asset.alt);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function saveAlt() {
    setSaved("saving");
    const r = await fetch("/api/media/library", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: asset.id, alt }) });
    if (r.ok) {
      const data = (await r.json()) as { alt: string };
      onAlt(data.alt);
      setSaved("saved");
    } else setSaved("error");
  }

  async function copyLink() {
    if (!asset.url) return;
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <aside className={styles.panel} role="dialog" aria-modal="true" aria-label={asset.name || "Media details"} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelHead}>
          <strong className={styles.panelTitle}>{asset.name || (asset.kind === "video" ? "Video" : "Image")}</strong>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close"><X width={18} height={18} /></button>
        </div>
        <div className={styles.preview}>
          {asset.kind === "video" && asset.url ? (
            <video src={asset.url} poster={asset.thumbUrl ?? undefined} controls preload="metadata" />
          ) : asset.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.url} alt={asset.alt} />
          ) : null}
        </div>
        <dl className={styles.facts}>
          <div><dt>Type</dt><dd>{asset.gif ? "GIF" : asset.kind === "video" ? "Video" : "Image"} · {asset.mime}</dd></div>
          <div><dt>Size</dt><dd>{formatBytes(asset.bytes)}</dd></div>
          {asset.width && asset.height ? <div><dt>Dimensions</dt><dd>{asset.width} × {asset.height}</dd></div> : null}
          {asset.durationSec ? <div><dt>Length</dt><dd>{formatDuration(asset.durationSec)}</dd></div> : null}
          <div><dt>Added</dt><dd>{new Date(asset.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</dd></div>
        </dl>
        {asset.kind === "image" && (
          <div className={styles.altBox}>
            <label htmlFor={`alt-${asset.id}`}><PenLine width={14} height={14} aria-hidden="true" /> Alt text</label>
            <textarea
              id={`alt-${asset.id}`}
              value={alt}
              maxLength={1000}
              rows={3}
              placeholder="Describe the image for people using screen readers"
              onChange={(e) => {
                setAlt(e.target.value);
                setSaved("idle");
              }}
            />
            <div className={styles.altRow}>
              <span>Sent to Bluesky, Mastodon, X and LinkedIn with the post.</span>
              <button type="button" className={styles.secondaryBtn} onClick={() => void saveAlt()} disabled={saved === "saving" || alt === asset.alt}>
                {saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : "Save alt text"}
              </button>
            </div>
            {saved === "error" && <p className={styles.error}>Could not save the alt text.</p>}
          </div>
        )}
        <div className={styles.panelActions}>
          <Link className={styles.useBtn} href={`/app/publish?compose=1&assets=${asset.id}`}>Use in new post</Link>
          <button type="button" className={styles.secondaryBtn} onClick={() => void copyLink()} disabled={!asset.url}>
            <Copy width={15} height={15} aria-hidden="true" /> {copied ? "Copied" : "Copy link"}
          </button>
          {canDelete && (
            <button type="button" className={styles.dangerBtn} disabled={busy} onClick={onDelete}>
              <Trash2 width={15} height={15} aria-hidden="true" /> Delete
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
