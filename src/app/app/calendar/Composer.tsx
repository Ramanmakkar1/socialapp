"use client";

import { useEffect, useId, useState, useTransition } from "react";
import Link from "next/link";
import { AtSign, Facebook, Instagram } from "lucide-react";
import { savePost } from "./actions";
import { BRAND } from "@/lib/brand";
import { PLATFORMS, checkCaption, type PlatformId } from "@/lib/platforms";

const PLATFORM_ORDER: PlatformId[] = ["instagram", "facebook", "threads"];
const HANDLE = `@${BRAND.name.toLowerCase()}`;

const PLATFORM_ICON: Record<PlatformId, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  threads: AtSign,
};

function counterClass(length: number, max: number): string {
  if (length > max) return "text-brand-2";
  if (length >= max * 0.9) return "text-warn";
  return "text-muted";
}

function previewCaption(platform: PlatformId, text: string): string {
  if (platform !== "instagram") return text;
  if (text.length <= 125) return text;
  return `${text.slice(0, 125)}… more`;
}

function effectiveCaption(
  platform: PlatformId,
  main: string,
  customize: Record<PlatformId, boolean>,
  custom: Record<PlatformId, string>,
): string {
  return customize[platform] ? custom[platform] : main;
}

type RuleOption = { id: string; name: string; status: string };

export default function Composer({ rules = [] }: { rules?: RuleOption[] }) {
  const mainId = useId();
  const scheduleId = useId();
  const dmRuleId = useId();
  const imageId = useId();

  const [enabled, setEnabled] = useState<Record<PlatformId, boolean>>({
    instagram: true,
    facebook: true,
    threads: true,
  });
  const [activeTab, setActiveTab] = useState<PlatformId>("instagram");
  const [mainCaption, setMainCaption] = useState("");
  const [customize, setCustomize] = useState<Record<PlatformId, boolean>>({
    instagram: false,
    facebook: false,
    threads: false,
  });
  const [customCaption, setCustomCaption] = useState<Record<PlatformId, string>>({
    instagram: "",
    facebook: "",
    threads: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Client-only: avoids SSR UTC vs browser timezone hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- boss-mandated pattern for #new composer
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  function togglePlatform(platform: PlatformId) {
    const next = { ...enabled, [platform]: !enabled[platform] };
    setEnabled(next);
    if (!next[platform] && activeTab === platform) {
      const fallback = PLATFORM_ORDER.find((p) => next[p]);
      if (fallback) setActiveTab(fallback);
    }
  }

  const selected = PLATFORM_ORDER.filter((p) => enabled[p]);

  function buildSaveInput(mode: "draft" | "schedule") {
    const platforms = PLATFORM_ORDER.filter((p) => enabled[p]);
    const overrides: Partial<Record<string, string>> = {};
    for (const p of platforms) {
      if (customize[p]) {
        overrides[p] = customCaption[p];
      }
    }
    return {
      caption: mainCaption,
      platforms,
      overrides,
      scheduledAt: scheduledAt || null,
      mode,
      imageUrl: imageUrl.trim() !== "" ? imageUrl.trim() : null,
      dmRuleId: selectedRuleId || null,
    };
  }

  function handleSave(mode: "draft" | "schedule") {
    setFeedback(null);
    startTransition(async () => {
      const result = await savePost(buildSaveInput(mode));
      if (!result.ok) {
        setFeedback({ kind: "err", text: result.error });
        return;
      }
      if (mode === "draft") {
        setFeedback({ kind: "ok", text: "Draft saved" });
      } else {
        const when = scheduledAt
          ? new Date(scheduledAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "";
        setFeedback({ kind: "ok", text: `Scheduled for ${when}` });
      }
      setMainCaption("");
      setCustomCaption({ instagram: "", facebook: "", threads: "" });
      setImageUrl("");
      setSelectedRuleId("");
    });
  }

  return (
    <section id="new" className="mt-6 scroll-mt-20" aria-labelledby={`${mainId}-heading`}>
      <h2 id={`${mainId}-heading`} className="sr-only">
        New post composer
      </h2>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-6">
          <div>
            <span className="text-sm font-medium text-ink-2">Platforms</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLATFORM_ORDER.map((platform) => {
                const Icon = PLATFORM_ICON[platform];
                const on = enabled[platform];
                return (
                  <button
                    key={platform}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${on ? "Remove" : "Add"} ${PLATFORMS[platform].label}`}
                    onClick={() => togglePlatform(platform)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      on ? "border-brand bg-brand/10 text-brand" : "border-line bg-surface text-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {PLATFORMS[platform].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor={mainId} className="text-sm font-medium text-ink-2">
              Caption
            </label>
            <textarea
              id={mainId}
              value={mainCaption}
              onChange={(e) => setMainCaption(e.target.value)}
              rows={6}
              placeholder="Write once — customize per platform below if you need to."
              className="mt-2 w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor={imageId} className="text-sm font-medium text-ink-2">
              Image or video link (https, .jpg, .png or .mp4)
            </label>
            <input
              id={imageId}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…/photo.jpg"
              className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            />
            {(() => {
              let url: URL | null = null;
              try {
                url = new URL(imageUrl);
              } catch {
                url = null;
              }
              if (url && url.protocol === "https:") {
                return (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url.href}
                      alt="Post image preview"
                      className="mt-2 h-32 w-auto rounded-xl border border-line object-cover"
                    />
                    <p className="mt-1 text-xs text-muted">
                      Paste a public https link; a .mp4 link is posted as a Reel. Upload is coming
                      soon.
                    </p>
                  </>
                );
              }
              return (
                <p className="mt-1 text-xs text-muted">
                  Paste a public https link; a .mp4 link is posted as a Reel. Upload is coming soon.
                </p>
              );
            })()}
          </div>

          <div>
            {rules.length > 0 ? (
              <>
                <label htmlFor={dmRuleId} className="text-sm font-medium text-ink-2">
                  Auto-DM rule (optional)
                </label>
                <select
                  id={dmRuleId}
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                >
                  <option value="">None</option>
                  {rules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name}
                      {rule.status === "paused" ? " (paused)" : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted">
                  We switch this rule on when the post goes live, so you can keep it paused until then.
                </p>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-ink-2">Auto-DM rule (optional)</span>
                <p className="mt-1 text-xs text-muted">
                  <Link href="/app/auto-dm" className="text-brand hover:underline">
                    Create an auto-DM rule
                  </Link>
                </p>
              </>
            )}
          </div>

          {selected.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1 border-b border-line">
                {selected.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === platform}
                    onClick={() => setActiveTab(platform)}
                    className={`rounded-t-lg px-3 py-2 text-sm font-medium ${
                      activeTab === platform ? "border border-b-0 border-line bg-surface text-ink" : "text-muted"
                    }`}
                  >
                    {PLATFORMS[platform].label}
                  </button>
                ))}
              </div>
              <div className="rounded-b-xl rounded-tr-xl border border-line bg-surface p-4">
                {(() => {
                  const platform = activeTab;
                  if (!enabled[platform]) return null;
                  const config = PLATFORMS[platform];
                  const text = effectiveCaption(platform, mainCaption, customize, customCaption);
                  const check = checkCaption(platform, text);
                  return (
                    <>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
                        <input
                          type="checkbox"
                          checked={customize[platform]}
                          onChange={(e) =>
                            setCustomize((c) => ({ ...c, [platform]: e.target.checked }))
                          }
                          className="rounded border-line text-brand focus:ring-brand"
                        />
                        Customize for {config.label}
                      </label>
                      {customize[platform] && (
                        <textarea
                          aria-label={`${config.label} caption`}
                          value={customCaption[platform]}
                          onChange={(e) =>
                            setCustomCaption((c) => ({ ...c, [platform]: e.target.value }))
                          }
                          rows={4}
                          className="mt-3 w-full resize-y rounded-lg border border-line bg-bg px-3 py-2 text-sm focus:border-brand focus:outline-none"
                        />
                      )}
                      <p className={`mt-3 text-sm tabular-nums ${counterClass(check.length, config.captionMax)}`}>
                        {check.length.toLocaleString("en-US")} / {config.captionMax.toLocaleString("en-US")}
                      </p>
                      {check.errors.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-brand-2" aria-live="polite">
                          {check.errors.map((msg) => (
                            <li key={msg}>{msg}</li>
                          ))}
                        </ul>
                      )}
                      {check.warnings.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-warn" aria-live="polite">
                          {check.warnings.map((msg) => (
                            <li key={msg}>{msg}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={scheduleId} className="text-sm font-medium text-ink-2">
                Schedule
              </label>
              <input
                id={scheduleId}
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted">Timezone: {timeZone || "…"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave("draft")}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={isPending || !scheduledAt}
              onClick={() => handleSave("schedule")}
              className="btn-primary rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Schedule"}
            </button>
          </div>
          {feedback && (
            <p
              className={`text-sm ${feedback.kind === "ok" ? "text-ok" : "text-brand-2"}`}
              aria-live="polite"
            >
              {feedback.text}
            </p>
          )}

          <p className="text-xs text-muted">Publishing arrives in Phase 2 via official Meta APIs.</p>
        </div>

        <div className="space-y-4">
          <span className="text-sm font-medium text-ink-2">Preview</span>
          {selected.map((platform) => {
            const text = effectiveCaption(platform, mainCaption, customize, customCaption);
            const Icon = PLATFORM_ICON[platform];
            return (
              <article
                key={platform}
                aria-label={`${PLATFORMS[platform].label} preview`}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-full bg-surface-2"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="h-3.5 w-3.5 text-brand" aria-hidden />
                      {BRAND.name}
                    </div>
                    <div className="truncate text-xs text-muted">{HANDLE}</div>
                  </div>
                </div>
                <div
                  className="mt-3 aspect-square w-full rounded-lg bg-surface-2"
                  aria-hidden
                />
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink-2">
                  {previewCaption(platform, text) || (
                    <span className="text-muted">Your caption appears here.</span>
                  )}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
