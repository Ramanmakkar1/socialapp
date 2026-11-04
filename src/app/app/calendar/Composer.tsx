"use client";

import { useEffect, useId, useState, useTransition } from "react";
import Link from "next/link";
import { AtSign, Facebook, Instagram, Sparkles } from "lucide-react";
import { savePost } from "./actions";
import { aiAvailable, suggestCaptions } from "./aiActions";
import { BRAND } from "@/lib/brand";
import type { CaptionIdea } from "@/lib/ai";
import { PLATFORMS, checkCaption, type PlatformId } from "@/lib/platforms";

const PLATFORM_ORDER: PlatformId[] = ["instagram", "facebook", "threads"];
const LIVE_PLATFORMS: PlatformId[] = ["instagram"];
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
  const igFormatLegendId = useId();
  const aiTopicId = useId();
  const aiToneId = useId();

  const [enabled, setEnabled] = useState<Record<PlatformId, boolean>>({
    instagram: true,
    facebook: false,
    threads: false,
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
  const [mediaUrls, setMediaUrls] = useState<string[]>([""]);
  const [igFormat, setIgFormat] = useState<"feed" | "story">("feed");
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [aiOn, setAiOn] = useState<boolean | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("friendly");
  const [aiIdeas, setAiIdeas] = useState<CaptionIdea[]>([]);
  const [aiError, setAiError] = useState("");
  const [aiPending, startAiTransition] = useTransition();

  useEffect(() => {
    // Client-only: avoids SSR UTC vs browser timezone hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- boss-mandated pattern for #new composer
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    let active = true;
    aiAvailable()
      .then((available) => {
        if (active) setAiOn(available);
      })
      .catch(() => {
        if (active) setAiOn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function togglePlatform(platform: PlatformId) {
    if (!LIVE_PLATFORMS.includes(platform)) return;
    const next = { ...enabled, [platform]: !enabled[platform] };
    setEnabled(next);
    if (platform === "instagram" && !next.instagram) {
      setIgFormat("feed");
    }
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
      imageUrl: mediaUrls[0]?.trim() !== "" ? mediaUrls[0].trim() : null,
      mediaUrls,
      dmRuleId: selectedRuleId || null,
      igFormat: enabled.instagram ? igFormat : "feed",
    };
  }

  const filledMediaCount = mediaUrls.map((u) => u.trim()).filter((u) => u !== "").length;
  const storyMediaError =
    enabled.instagram && igFormat === "story" && filledMediaCount > 1;

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
      setMediaUrls([""]);
      setIgFormat("feed");
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
                const live = LIVE_PLATFORMS.includes(platform);
                const on = enabled[platform];
                return (
                  <button
                    key={platform}
                    type="button"
                    disabled={!live}
                    aria-disabled={!live || undefined}
                    aria-pressed={live ? on : undefined}
                    aria-label={
                      live
                        ? `${on ? "Remove" : "Add"} ${PLATFORMS[platform].label}`
                        : `${PLATFORMS[platform].label} publishing coming soon`
                    }
                    onClick={() => togglePlatform(platform)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      live
                        ? on
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-line bg-surface text-muted"
                        : "cursor-not-allowed border-line bg-surface text-muted opacity-60"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {PLATFORMS[platform].label}
                    {!live && (
                      <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                        Soon
                      </span>
                    )}
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
            <button
              type="button"
              disabled={aiOn === false}
              onClick={() => setAiOpen((open) => !open)}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {aiOn === false ? "AI captions: coming soon" : "Write with AI"}
            </button>
            {aiOpen && aiOn && (
              <div className="mt-3 rounded-xl border border-line bg-surface p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={aiTopicId} className="text-sm font-medium text-ink-2">
                      What is this post about?
                    </label>
                    <input
                      id={aiTopicId}
                      type="text"
                      maxLength={300}
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="sm:w-44">
                    <label htmlFor={aiToneId} className="text-sm font-medium text-ink-2">
                      Tone
                    </label>
                    <select
                      id={aiToneId}
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    >
                      {(["friendly", "professional", "playful", "bold"] as const).map((tone) => (
                        <option key={tone} value={tone}>{tone[0].toUpperCase() + tone.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={aiPending || !aiTopic.trim()}
                  onClick={() => {
                    setAiError("");
                    setAiIdeas([]);
                    startAiTransition(async () => {
                      try {
                        const result = await suggestCaptions({ topic: aiTopic, draft: mainCaption, tone: aiTone });
                        if (result.ok) setAiIdeas(result.ideas);
                        else setAiError(result.error);
                      } catch {
                        setAiError("AI request failed. Try again.");
                      }
                    });
                  }}
                  className="mt-3 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-60"
                >
                  {aiPending ? "Thinking…" : "Get ideas"}
                </button>
                {aiError && <p className="mt-2 text-sm text-brand-2" aria-live="polite">{aiError}</p>}
                {aiIdeas.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {aiIdeas.map((idea, index) => (
                      <article key={`${index}-${idea.caption}`} className="rounded-xl border border-line bg-bg p-3">
                        <p className="whitespace-pre-wrap text-sm text-ink-2">{idea.caption}</p>
                        {idea.hashtags.length > 0 && (
                          <p className="mt-2 text-sm text-muted">{idea.hashtags.join(" ")}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMainCaption(idea.hashtags.length > 0 ? `${idea.caption}\n\n${idea.hashtags.join(" ")}` : idea.caption);
                            setAiOpen(false);
                          }}
                          className="mt-2 text-sm font-medium text-brand"
                        >
                          Use this
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <span className="text-sm font-medium text-ink-2">
              Image or video link (https, .jpg, .png or .mp4)
            </span>
            <div className="mt-2 space-y-2">
              {mediaUrls.map((url, index) => {
                const fieldId = index === 0 ? imageId : `${imageId}-${index}`;
                return (
                  <div key={fieldId} className="flex gap-2">
                    <input
                      id={fieldId}
                      type="url"
                      value={url}
                      onChange={(e) =>
                        setMediaUrls((prev) =>
                          prev.map((u, i) => (i === index ? e.target.value : u)),
                        )
                      }
                      placeholder="https://…/photo.jpg"
                      className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                    />
                    {mediaUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMediaUrls((prev) =>
                            prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
                          )
                        }
                        className="shrink-0 rounded-lg border border-line px-2 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {mediaUrls.length < 10 && (
              <button
                type="button"
                onClick={() =>
                  setMediaUrls((prev) => (prev.length >= 10 ? prev : [...prev, ""]))
                }
                className="mt-2 text-sm font-medium text-brand hover:underline"
              >
                + Add another image
              </button>
            )}
            {(() => {
              const previewUrl = mediaUrls.map((u) => u.trim()).find((u) => u !== "") ?? "";
              let parsed: URL | null = null;
              try {
                parsed = previewUrl ? new URL(previewUrl) : null;
              } catch {
                parsed = null;
              }
              if (parsed && parsed.protocol === "https:") {
                return (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={parsed.href}
                      alt="Post image preview"
                      className="mt-2 h-32 w-auto rounded-xl border border-line object-cover"
                    />
                    <p className="mt-1 text-xs text-muted">
                      Paste a public https link; a .mp4 link is posted as a Reel. 2–10 image links =
                      carousel post. Upload is coming soon.
                    </p>
                  </>
                );
              }
              return (
                <p className="mt-1 text-xs text-muted">
                  Paste a public https link; a .mp4 link is posted as a Reel. 2–10 image links =
                  carousel post. Upload is coming soon.
                </p>
              );
            })()}
            {storyMediaError && (
              <p className="mt-2 text-sm text-brand-2" aria-live="polite">
                Stories need exactly one image or video link.
              </p>
            )}
          </div>

          {enabled.instagram && (
            <fieldset className="border-0 p-0">
              <legend id={igFormatLegendId} className="text-sm font-medium text-ink-2">
                Post as
              </legend>
              <div
                className="mt-2 flex flex-wrap gap-4 text-sm text-ink-2"
                role="radiogroup"
                aria-labelledby={igFormatLegendId}
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="ig_format"
                    value="feed"
                    checked={igFormat === "feed"}
                    onChange={() => setIgFormat("feed")}
                    className="rounded border-line text-brand focus:ring-brand"
                  />
                  Feed
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="ig_format"
                    value="story"
                    checked={igFormat === "story"}
                    onChange={() => setIgFormat("story")}
                    className="rounded border-line text-brand focus:ring-brand"
                  />
                  Story
                </label>
              </div>
              {igFormat === "story" && (
                <p className="mt-1 text-xs text-muted">
                  Stories need one image or one video. Captions are not shown on Stories.
                </p>
              )}
            </fieldset>
          )}

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
              disabled={isPending || storyMediaError}
              onClick={() => handleSave("draft")}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={isPending || !scheduledAt || storyMediaError}
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
