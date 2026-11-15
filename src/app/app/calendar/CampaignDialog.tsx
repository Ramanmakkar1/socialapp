"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import { createCampaign } from "./campaignActions";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";
import { validateMediaFile } from "@/lib/mediaUpload";
import { uploadWithProgress } from "@/lib/mediaUploadClient";
import type { PlanName } from "@/lib/planLimits";
import styles from "./calendar.module.css";
import { AI_SETTINGS_HREF } from "@/components/AiOffNote";

const TONES = ["friendly", "professional", "playful", "bold", "urgent"] as const;
const field =
  "mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none";
const label = "text-sm font-medium text-[var(--poskoo-ink)]";

function tomorrow(): string {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
}

type Created = { name: string; posts: { id: string; scheduledAt: string | null; caption: string; angle: string }[]; skipped: string[] };

/**
 * "Campaign from brief": a brief + channels in, N drafts out on the calendar. Never schedules:
 * the drafts are reviewed and scheduled one by one in the composer. When AI isn't configured on
 * the server (`aiReady` false) it explains that instead of showing the form (admins get a link to
 * the AI settings). `autoOpen` (/app/calendar?campaign=1, linked from the dashboard) opens it at once.
 */
export default function CampaignDialog({
  aiReady,
  aiAdmin = false,
  autoOpen = false,
  channels,
  mediaPlan = "Free",
}: {
  aiReady: boolean;
  aiAdmin?: boolean;
  autoOpen?: boolean;
  channels: PlatformId[];
  mediaPlan?: PlanName;
}) {
  const router = useRouter();
  const ids = useId();
  const [open, setOpen] = useState(autoOpen);
  const [goal, setGoal] = useState("");
  const [offer, setOffer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(7);
  const [postCount, setPostCount] = useState(5);
  const [tone, setTone] = useState<(typeof TONES)[number]>("friendly");
  const [picked, setPicked] = useState<PlatformId[]>(() => channels.slice(0, 3));
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    titleRef.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function toggle(p: PlatformId) {
    setPicked((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));
  }

  function addLink() {
    const url = linkInput.trim();
    if (!/^https:\/\/\S+$/i.test(url)) {
      setError("Media links must start with https://");
      return;
    }
    setError("");
    setMediaUrls((list) => (list.includes(url) || list.length >= 10 ? list : [...list, url]));
    setLinkInput("");
  }

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files).slice(0, 10 - mediaUrls.length)) {
        const check = validateMediaFile({ type: file.type, size: file.size, name: file.name }, mediaPlan);
        if (!check.ok) {
          setError(`${file.name}: ${check.error}`);
          continue;
        }
        const res = await uploadWithProgress(
          "/api/media/upload",
          file,
          {
            "Content-Type": file.type || "application/octet-stream",
            "X-File-Name": encodeURIComponent(file.name),
            "X-Networks": picked.join(","),
            "X-Ig-Format": "feed",
          },
          () => {},
        );
        const body = res.body as { url?: string; error?: string };
        if (res.status < 200 || res.status >= 300 || !body.url) {
          setError(body.error || "Could not upload that file. Please try again.");
          continue;
        }
        const url = body.url;
        setMediaUrls((list) => [...list, url]);
      }
    } catch {
      setError("Could not upload that file. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const result = await createCampaign({ goal, offer, startDate: startDate || undefined, days, postCount, tone, platforms: picked, mediaUrls });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setCreated({ name: result.name, posts: result.posts, skipped: result.skipped });
        router.refresh();
      } catch {
        setError("Could not create the campaign. Please try again.");
      }
    });
  }

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No time";

  return (
    <>
      <button type="button" onClick={() => { setCreated(null); setOpen(true); }} className={styles.campaignBtn}>
        <Sparkles width={16} height={16} aria-hidden="true" /> <span>Campaign from brief</span>
      </button>
      <div className={styles.dialogBackdrop} hidden={!open} onMouseDown={(e) => { if (e.target === e.currentTarget && !pending) setOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby={`${ids}-title`} className={styles.dialogPanel} data-preview="off">
          <div className={styles.dialogHead}>
            <h2 id={`${ids}-title`} ref={titleRef} tabIndex={-1} className={styles.dialogTitle}>Campaign from a brief</h2>
            <div className={styles.dialogTools}>
              <button type="button" onClick={() => setOpen(false)} className={styles.dialogClose} aria-label="Close" disabled={pending}>
                <X width={20} height={20} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className={styles.dialogBody}>
            <div className="p-5">
              {!aiReady ? (
                <div role="status" className="rounded-xl bg-[var(--poskoo-band)] p-4 text-sm text-[var(--poskoo-ink)]">
                  <p className="inline-flex items-center gap-1.5 font-semibold"><Info className="h-4 w-4" aria-hidden /> AI isn&apos;t switched on yet</p>
                  <p className="mt-1 text-[var(--poskoo-muted)]">
                    {aiAdmin ? (
                      <>
                        Campaign drafting uses AI. Add an Anthropic API key in{" "}
                        <Link href={AI_SETTINGS_HREF} className="font-medium text-[var(--poskoo-violet)] underline">Admin → Settings → AI</Link>{" "}
                        to switch it on for everyone.{" "}
                      </>
                    ) : (
                      <>Campaign drafting uses AI, which is coming soon. </>
                    )}
                    You can still plan posts yourself with{" "}
                    <Link href="/app/calendar?compose=1" className="font-medium text-[var(--poskoo-violet)] underline">New post</Link>{" "}
                    or save ideas on the <Link href="/app/calendar?view=ideas" className="font-medium text-[var(--poskoo-violet)] underline">Ideas board</Link>.
                  </p>
                </div>
              ) : created ? (
                <div aria-live="polite">
                  <p className="text-sm text-[var(--poskoo-ink)]">
                    <strong>{created.posts.length} draft{created.posts.length === 1 ? "" : "s"}</strong> saved for <strong>{created.name}</strong>. Nothing is scheduled yet: open each draft, check it and schedule it.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {created.posts.map((p) => (
                      <li key={p.id} className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
                        <p className="text-xs font-medium text-[var(--poskoo-muted)]">{fmt(p.scheduledAt)}{p.angle ? ` · ${p.angle}` : ""}</p>
                        <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-[var(--poskoo-ink)]">{p.caption}</p>
                        <Link href={`/app/calendar?draft=${p.id}#new`} className="mt-1 inline-block text-sm font-medium text-[var(--poskoo-violet)]" onClick={() => setOpen(false)}>Review draft</Link>
                      </li>
                    ))}
                  </ul>
                  {created.skipped.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-[var(--poskoo-coral)]">
                      {created.skipped.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link href={`/app/calendar?view=list&status=draft`} className="rounded-full bg-[var(--poskoo-ink)] px-4 py-2 text-sm font-medium text-white" onClick={() => setOpen(false)}>See all drafts</Link>
                    <button type="button" onClick={() => setCreated(null)} className="rounded-full border border-[var(--poskoo-line)] px-4 py-2 text-sm font-medium text-[var(--poskoo-ink)]">New campaign</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <p className="text-sm text-[var(--poskoo-muted)]">
                    Describe the campaign and AI drafts the posts at good times on your calendar. Everything is saved as a draft for you to review; nothing is published automatically.
                  </p>
                  <div>
                    <label htmlFor={`${ids}-goal`} className={label}>Goal</label>
                    <textarea id={`${ids}-goal`} required minLength={3} maxLength={600} rows={2} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Get 50 sign-ups for our Saturday pottery workshop" className={field} />
                  </div>
                  <div>
                    <label htmlFor={`${ids}-offer`} className={label}>Offer or key details (optional)</label>
                    <textarea id={`${ids}-offer`} maxLength={600} rows={2} value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Early-bird price $45 until Thursday, link: https://…" className={field} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <label htmlFor={`${ids}-start`} className={label}>Start</label>
                      <input id={`${ids}-start`} type="date" min={tomorrow()} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
                    </div>
                    <div>
                      <label htmlFor={`${ids}-days`} className={label}>Days</label>
                      <input id={`${ids}-days`} type="number" min={1} max={60} value={days} onChange={(e) => setDays(Number(e.target.value))} className={field} />
                    </div>
                    <div>
                      <label htmlFor={`${ids}-count`} className={label}>Posts</label>
                      <input id={`${ids}-count`} type="number" min={1} max={14} value={postCount} onChange={(e) => setPostCount(Number(e.target.value))} className={field} />
                    </div>
                    <div>
                      <label htmlFor={`${ids}-tone`} className={label}>Tone</label>
                      <select id={`${ids}-tone`} value={tone} onChange={(e) => setTone(e.target.value as (typeof TONES)[number])} className={field}>
                        {TONES.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <fieldset>
                    <legend className={label}>Channels</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {channels.map((p) => (
                        <label key={p} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-sm text-[var(--poskoo-ink)]">
                          <input type="checkbox" checked={picked.includes(p)} onChange={() => toggle(p)} className="rounded border-[var(--poskoo-line)] text-[var(--poskoo-violet)]" />
                          {PLATFORMS[p].label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <span className={label}>Media (optional)</span>
                    <p className="text-xs text-[var(--poskoo-muted)]">Files are shared across the drafts in turn. You can change media on each draft later.</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-sm font-medium text-[var(--poskoo-ink)]">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UploadCloud className="h-4 w-4" aria-hidden />}
                        Upload
                        <input type="file" accept="image/jpeg,image/png,video/mp4,video/quicktime" multiple className="sr-only" disabled={uploading || mediaUrls.length >= 10} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
                      </label>
                      <input type="url" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="or paste an https link" aria-label="Media link" className="min-w-0 flex-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-1.5 text-sm" />
                      <button type="button" onClick={addLink} disabled={!linkInput.trim()} className="rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-sm font-medium disabled:opacity-60">Add</button>
                    </div>
                    {mediaUrls.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-[var(--poskoo-muted)]">
                        {mediaUrls.map((u) => (
                          <li key={u} className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate">{u.split("/").pop()}</span>
                            <button type="button" onClick={() => setMediaUrls((l) => l.filter((x) => x !== u))} className="text-[var(--poskoo-coral)]">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {error && <p role="alert" className="text-sm text-[var(--poskoo-coral)]">{error}</p>}
                  <button type="submit" disabled={pending || uploading || picked.length === 0 || goal.trim().length < 3} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--poskoo-ink)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
                    {pending ? "Drafting posts… (up to a minute)" : `Draft ${postCount} post${postCount === 1 ? "" : "s"}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
