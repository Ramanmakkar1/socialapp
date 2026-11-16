"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy, Link2, MessageCircle, Smartphone, Tag, TriangleAlert, UserRound } from "lucide-react";

const PRESETS = [
  { id: "bio", label: "Bio link", content: "bio_link", icon: UserRound },
  { id: "story", label: "Story sticker", content: "story_link_sticker", icon: Smartphone },
  { id: "dm", label: "Auto-DM", content: "auto_dm", icon: MessageCircle },
] as const;

type Result = { url: string; error: string | null };

export function buildUtmUrl(destination: string, f: { source: string; medium: string; campaign: string; content: string }): Result {
  const raw = destination.trim();
  if (!raw) return { url: "", error: null };
  // Bare domains like "example.com/shop" get https://; other schemes are rejected below.
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) || /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(raw) ? raw : `https://${raw}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return { url: "", error: "That doesn’t look like a valid web address. Example: https://example.com/page" };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { url: "", error: "Only http:// and https:// links can be tagged." };
  }
  if (u.username || u.password) {
    return { url: "", error: "Remove the username or password from the link before sharing it." };
  }
  if (!u.hostname.includes(".") && u.hostname !== "localhost") {
    return { url: "", error: "Add the full domain, for example example.com." };
  }
  const campaign = f.campaign.trim();
  if (!campaign) return { url: "", error: "Add a campaign name to build the link." };
  const fields: [string, string][] = [
    ["utm_source", f.source.trim() || "instagram"],
    ["utm_medium", f.medium.trim() || "social"],
    ["utm_campaign", campaign],
    ["utm_content", f.content.trim()],
  ];
  // Replace (never duplicate) the fields we manage; other query params and the #fragment stay as they were.
  for (const [key, value] of fields) {
    u.searchParams.delete(key);
    if (value) u.searchParams.set(key, value);
  }
  return { url: u.toString(), error: null };
}

export default function UtmBuilder() {
  const id = useId();
  const outRef = useRef<HTMLTextAreaElement>(null);
  const [destination, setDestination] = useState("");
  const [source, setSource] = useState("instagram");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const { url, error } = buildUtmUrl(destination, { source, medium, campaign, content });
  const parsed = url ? new URL(url) : null;
  const utmParams = parsed ? [...parsed.searchParams.entries()].filter(([k]) => k.startsWith("utm_")) : [];
  const otherParams = parsed ? [...parsed.searchParams.keys()].filter((k) => !k.startsWith("utm_")).length : 0;
  const steps = [
    // The destination is valid when it would build with any campaign name.
    { label: "Destination", done: !!buildUtmUrl(destination, { source, medium, campaign: "x", content }).url },
    { label: "Campaign name", done: !!campaign.trim() },
    { label: "Link ready", done: !!url },
  ];

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("ok");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("fail");
      outRef.current?.focus();
      outRef.current?.select();
    }
  }

  const field = (key: string, label: string, value: string, set: (v: string) => void, hint: string, placeholder = "") => (
    <div className="min-w-0">
      <label htmlFor={`${id}-${key}`} className="text-sm font-semibold">{label}</label>
      <input
        id={`${id}-${key}`}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        aria-describedby={`${id}-${key}-hint`}
        onChange={(e) => { set(e.target.value); setCopyState("idle"); }}
        className="mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base outline-none focus:border-[var(--poskoo-violet)]"
      />
      <p id={`${id}-${key}-hint`} className="mt-1 text-xs text-[#5f5873]">{hint}</p>
    </div>
  );

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Inputs */}
        <div className="min-w-0 space-y-5 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold">Where will this link go on Instagram?</legend>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={content === p.content}
                    onClick={() => { setSource("instagram"); setMedium("social"); setContent(p.content); setCopyState("idle"); }}
                    className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-1 text-center text-[13px] font-medium leading-tight ${content === p.content ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
                  >
                    <Icon className="h-4 w-4 flex-none max-[380px]:hidden" aria-hidden="true" />{p.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {field("dest", "Destination URL", destination, setDestination, "Your page, e.g. https://example.com/offer. Existing query parameters and #sections are kept.", "https://example.com/offer")}
            </div>
            {field("source", "Campaign source (utm_source)", source, setSource, "Where the visit comes from. Default: instagram.")}
            {field("medium", "Campaign medium (utm_medium)", medium, setMedium, "The channel type. Default: social.")}
            {field("campaign", "Campaign name (utm_campaign) *", campaign, setCampaign, "Required. Keep it short and consistent, e.g. spring_sale.", "spring_sale")}
            {field("content", "Content (utm_content, optional)", content, setContent, "Tells placements apart, e.g. bio_link or story_link_sticker.")}
          </div>
          {error ? (
            <p className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)]/50 bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#8a2f12]" role="alert">
              <TriangleAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />{error}
            </p>
          ) : null}
        </div>

        {/* Result */}
        <aside aria-label="Campaign link result" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <ol className="grid grid-cols-3 gap-1.5" aria-label="Progress">
            {steps.map((s) => (
              <li key={s.label} className="min-w-0">
                <span className={`block h-1.5 rounded-full ${s.done ? "bg-[var(--poskoo-violet)]" : "bg-[var(--poskoo-line)]"}`} aria-hidden="true" />
                <span className={`mt-1 block truncate text-[11px] font-semibold ${s.done ? "text-[var(--poskoo-ink)]" : "text-[#5f5873]"}`}>{s.done ? "✓ " : ""}{s.label}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={copy}
            disabled={!url}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copyState === "ok" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copyState === "ok" ? "Copied" : "Copy link"}
          </button>
          <p aria-live="polite" className="text-xs text-[#3d3450] empty:hidden">
            {copyState === "ok" ? "Link copied to your clipboard." : null}
            {copyState === "fail" ? "Your browser blocked copying. The link is selected above: press Ctrl+C (⌘C on Mac) or long-press and choose Copy." : null}
          </p>
          <div>
            <label htmlFor={`${id}-out`} className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
              Your campaign link
              {url ? <span className="normal-case tracking-normal tabular-nums">{url.length} chars</span> : null}
            </label>
            <textarea
              id={`${id}-out`}
              ref={outRef}
              readOnly
              rows={4}
              value={url}
              placeholder="Fill in a destination and campaign name to build the link."
              onFocus={(e) => e.currentTarget.select()}
              className="mt-2 w-full resize-none break-all rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 font-mono text-xs text-[var(--poskoo-violet)] outline-none focus:border-[var(--poskoo-violet)]"
            />
          </div>
          {parsed ? (
            <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--poskoo-ink)]"><Link2 className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" /><span className="truncate">{parsed.hostname}{parsed.pathname !== "/" ? parsed.pathname : ""}</span></p>
              <ul className="mt-2 space-y-1">
                {utmParams.map(([k, v]) => (
                  <li key={k} className="flex min-w-0 items-center gap-2 text-xs">
                    <Tag className="h-3 w-3 flex-none text-[#5f5873]" aria-hidden="true" />
                    <span className="flex-none font-mono text-[#5f5873]">{k}</span>
                    <span className="min-w-0 truncate rounded-md bg-[var(--poskoo-band)] px-1.5 font-semibold text-[var(--poskoo-violet)]">{v}</span>
                  </li>
                ))}
              </ul>
              {otherParams > 0 && <p className="mt-2 text-xs text-[#5f5873]">{otherParams} existing parameter{otherParams === 1 ? "" : "s"} kept.</p>}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[var(--poskoo-line)] p-3 text-center text-xs text-[#5f5873]">Each UTM field appears here once the link is built.</p>
          )}
          <p className="text-xs text-[#5f5873]">Runs only in your browser. Nothing is shortened, saved or sent anywhere.</p>
        </aside>
      </div>
    </div>
  );
}
