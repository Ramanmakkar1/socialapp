"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

const PRESETS = [
  { id: "bio", label: "Bio link", content: "bio_link" },
  { id: "story", label: "Story sticker", content: "story_link_sticker" },
  { id: "dm", label: "Auto-DM", content: "auto_dm" },
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
    <div>
      <label htmlFor={`${id}-${key}`} className="text-sm font-medium">{label}</label>
      <input
        id={`${id}-${key}`}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        aria-describedby={`${id}-${key}-hint`}
        onChange={(e) => { set(e.target.value); setCopyState("idle"); }}
        className="mt-2 min-h-11 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none ring-brand focus:ring-2"
      />
      <p id={`${id}-${key}-hint`} className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );

  return (
    <div className="glow rounded-3xl border border-line bg-surface p-4 text-left sm:p-6">
      <fieldset>
        <legend className="text-sm font-medium">Where will this link go on Instagram?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={content === p.content}
              onClick={() => { setSource("instagram"); setMedium("social"); setContent(p.content); setCopyState("idle"); }}
              className="min-h-11 rounded-full border border-line bg-bg px-4 text-sm font-medium hover:text-ink aria-pressed:border-brand aria-pressed:text-brand"
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {field("dest", "Destination URL", destination, setDestination, "Your page, e.g. https://example.com/offer. Existing query parameters and #sections are kept.", "https://example.com/offer")}
        </div>
        {field("source", "Campaign source (utm_source)", source, setSource, "Where the visit comes from. Default: instagram.")}
        {field("medium", "Campaign medium (utm_medium)", medium, setMedium, "The channel type. Default: social.")}
        {field("campaign", "Campaign name (utm_campaign) *", campaign, setCampaign, "Required. Keep it short and consistent, e.g. spring_sale.", "spring_sale")}
        {field("content", "Content (utm_content, optional)", content, setContent, "Tells placements apart, e.g. bio_link or story_link_sticker.")}
      </div>
      {error ? <p className="mt-4 text-sm text-brand-2" role="alert">{error}</p> : null}
      <div className="mt-6 rounded-xl border border-line bg-bg p-4">
        <label htmlFor={`${id}-out`} className="text-xs font-medium uppercase tracking-wide text-muted">Your campaign link</label>
        <textarea
          id={`${id}-out`}
          ref={outRef}
          readOnly
          rows={3}
          value={url}
          placeholder="Fill in a destination and campaign name to build the link."
          onFocus={(e) => e.currentTarget.select()}
          className="mt-2 w-full resize-none break-all rounded-lg border border-line bg-surface p-3 font-mono text-xs text-brand outline-none ring-brand focus:ring-2"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copy}
            disabled={!url}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-white disabled:opacity-40"
          >
            {copyState === "ok" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copyState === "ok" ? "Copied" : "Copy link"}
          </button>
          <p aria-live="polite" className="text-xs text-ink-2">
            {copyState === "ok" ? "Link copied to your clipboard." : null}
            {copyState === "fail" ? "Your browser blocked copying. The link is selected above: press Ctrl+C (⌘C on Mac) or long-press and choose Copy." : null}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Runs only in your browser. Nothing is shortened, saved or sent anywhere.</p>
    </div>
  );
}
