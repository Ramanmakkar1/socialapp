"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { ArrowRight, AtSign, Bookmark, Check, Copy, Hash, Heart, ImagePlus, MessageCircle, MoreHorizontal, Send, Type } from "lucide-react";
import { analyzeCaption, PLATFORM_LIMITS } from "@/lib/captionLimits";
import { readCaptionHandoff } from "@/lib/captionHandoff";
import UseInSchedulerLink from "@/components/UseInSchedulerLink";
import ui from "@/components/ui/ui.module.css";

export default function PostPreviewTool() {
  const [caption, setCaption] = useState("A little behind the scenes ✨\n\nGood things start with a first draft. What are you creating today?");
  const [handle, setHandle] = useState("your.studio");
  const [portrait, setPortrait] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [imported, setImported] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const consumed = useRef(false);
  const id = useId();
  const analysis = analyzeCaption(caption, "instagram");
  const displayHandle = handle.trim().replace(/^@+/, "") || "your.studio";
  const limits = PLATFORM_LIMITS.instagram;
  const charPct = limits.max ? Math.min(100, (analysis.chars / limits.max) * 100) : 0;
  const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
  const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
  const field = "mt-2 block min-h-11 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-[var(--poskoo-ink)] focus-visible:outline-2 focus-visible:outline-[var(--poskoo-violet)]";

  useEffect(() => {
    return () => { if (image) URL.revokeObjectURL(image); };
  }, [image]);

  // One-shot read of the caption handoff: consume and remove it exactly once
  // on mount. Direct visits (empty storage) leave the sample caption intact.
  useEffect(() => {
    if (consumed.current) return;
    const result = readCaptionHandoff();
    if (result.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCaption(result.caption);
      setImported(true);
    }
    consumed.current = true;
  }, []);

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP image up to 10 MB. Your current preview is unchanged.");
      return;
    }
    setError("");
    setImage(URL.createObjectURL(file));
  }

  async function copyCaption() {
    setCopyStatus("Copying caption…");
    try {
      await navigator.clipboard.writeText(caption);
      setCopyStatus("Caption copied.");
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1800);
    } catch {
      setCopyStatus("Could not copy. Select the caption and copy it manually.");
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><Type className="h-3 w-3" aria-hidden="true" />Characters</p>
          <p className={`mt-0.5 text-xl font-bold tabular-nums ${analysis.overBy > 0 ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>{analysis.chars.toLocaleString("en-US")}<span className="text-base font-medium text-[#5f5873]"> / {limits.max?.toLocaleString("en-US")}</span></p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full" style={{ width: `${charPct}%`, background: analysis.overBy > 0 ? "var(--poskoo-coral)" : "var(--poskoo-green)" }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Hash className="h-3 w-3" aria-hidden="true" />Hashtags</p>
          <p className={`mt-0.5 text-xl font-bold tabular-nums ${analysis.overHashtags > 0 ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>{analysis.hashtags.length}<span className="text-base font-medium text-[#5f5873]"> / {limits.hashtags}</span></p>
          <p className="mt-1 text-xs text-[#3d3450]">Instagram allows up to {limits.hashtags}.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><AtSign className="h-3 w-3" aria-hidden="true" />Mentions</p>
          <p className={`mt-0.5 text-xl font-bold tabular-nums ${analysis.overMentions > 0 ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>{analysis.mentions.length}<span className="text-base font-medium text-[#5f5873]"> / {limits.mentions}</span></p>
          <p className="mt-1 text-xs text-[#3d3450]">@ tags in the caption.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Feed fold</p>
          <p className="mt-0.5 text-xl font-bold text-[var(--poskoo-ink)]">{analysis.folded ? "“… more”" : "Fits"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Est. ~{limits.foldAt} characters show before the cut.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="min-w-0 space-y-5 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <div>
          <label htmlFor={`${id}-handle`} className="text-sm font-semibold">Display handle</label>
          <input id={`${id}-handle`} value={handle} maxLength={30} autoComplete="off" spellCheck={false} onChange={(e) => setHandle(e.target.value)} className={field} />
          <p className="mt-2 text-xs text-[#3d3450]">Display only. We never look up profiles or connect to Instagram.</p>
        </div>
        <div>
          <label htmlFor={`${id}-caption`} className="text-sm font-semibold">Caption</label>
          <textarea id={`${id}-caption`} rows={7} value={caption} onChange={(e) => { setCaption(e.target.value); setExpanded(false); setCopyStatus(""); }} className={`${field} resize-y`} />
          <p className="mt-2 text-sm text-[#3d3450]">{analysis.chars.toLocaleString("en-US")} / {PLATFORM_LIMITS.instagram.max?.toLocaleString("en-US")} characters</p>
          {analysis.overBy > 0 && <p className="mt-1 text-sm font-medium text-[var(--poskoo-coral)]" role="status">Over the caption limit by {analysis.overBy} characters. Shorten before posting.</p>}
        </div>
        <div>
          <label htmlFor={`${id}-image`} className="text-sm font-semibold">Local image</label>
          <input ref={fileRef} id={`${id}-image`} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} aria-describedby={`${id}-privacy ${id}-error`} className="mt-2 block min-h-11 w-full min-w-0 max-w-full rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1.5 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--poskoo-violet)]/10 file:px-3 file:py-2.5 file:font-medium file:text-[var(--poskoo-ink)]" />
          <p id={`${id}-privacy`} className="mt-2 text-xs text-[#3d3450]">JPG, PNG or WebP · up to 10 MB · stays in this browser tab.</p>
          <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[#3d3450] empty:hidden">{error}</p>
          {image && <button type="button" onClick={() => { setImage(null); setError(""); }} className="min-h-11 text-sm font-medium text-[var(--poskoo-violet)] underline">Remove image</button>}
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">Preview shape</legend>
          <div className="mt-2 grid grid-cols-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            {[false, true].map((value) => (
              <label key={String(value)} className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-[13px] font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)] ${portrait === value ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}>
                <input type="radio" name={`${id}-shape`} checked={portrait === value} onChange={() => setPortrait(value)} className="sr-only" />
                {value ? "Portrait · 4:5" : "Square · 1:1"}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-4">
          <p className="text-sm font-semibold">Take it to the scheduler</p>
          <p className="mt-1 text-sm text-[#3d3450]">
            Copy this caption, then continue to sign up and paste it into your first scheduled post.
          </p>
          <UseInSchedulerLink text={caption} className="mt-3" />
        </div>
        {imported && (
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-4 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-violet)]/10 p-3">
            <p className="font-medium text-[var(--poskoo-ink)]">Caption imported from the Instagram caption counter</p>
            <p className="mt-1 text-xs text-[#3d3450]">Emoji and line breaks carried over exactly — length and preview updated above. Edit freely, then copy or schedule.</p>
          </div>
        )}
      </div>
      <aside aria-labelledby={`${id}-feed`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
        <button type="button" onClick={copyCaption} disabled={!caption} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40">
          {justCopied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
          {justCopied ? "Copied" : "Copy caption"}
        </button>
        <p role="status" aria-live="polite" aria-atomic="true" className="text-center text-sm text-[#3d3450] empty:hidden">{copyStatus}</p>
        <div className="flex items-center justify-between gap-2">
          <h2 id={`${id}-feed`} className="text-sm font-semibold tracking-normal text-[var(--poskoo-ink)]">Your feed preview</h2>
          <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Caption flows into a phone feed preview" className="h-10 w-auto flex-none motion-safe:hero-float motion-reduce:animate-none">
            <defs>
              <linearGradient id="handoff-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--poskoo-violet)" />
                <stop offset="100%" stopColor="var(--poskoo-coral)" />
              </linearGradient>
            </defs>
            <rect x="14" y="14" width="96" height="56" rx="10" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" strokeWidth="2" />
            <line x1="24" y1="34" x2="86" y2="34" stroke="#3d3450" strokeWidth="3" strokeLinecap="round" />
            <line x1="24" y1="46" x2="70" y2="46" stroke="#3d3450" strokeWidth="3" strokeLinecap="round" />
            <line x1="24" y1="58" x2="50" y2="58" stroke="#3d3450" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="70" r="4" fill="var(--poskoo-coral)" />
            <path d="M116 44h24" stroke="var(--poskoo-violet)" strokeWidth="4" strokeLinecap="round" />
            <path d="M142 40L152 48L142 56" fill="none" stroke="var(--poskoo-violet)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="150" y="8" width="44" height="80" rx="10" fill="var(--poskoo-ink)" />
            <rect x="156" y="14" width="32" height="44" rx="6" fill="var(--poskoo-card)" />
            <line x1="164" y1="26" x2="182" y2="26" stroke="#3d3450" strokeWidth="2" strokeLinecap="round" />
            <line x1="164" y1="34" x2="176" y2="34" stroke="#3d3450" strokeWidth="2" strokeLinecap="round" />
            <circle cx="172" cy="76" r="3" fill="var(--poskoo-coral)" />
          </svg>
        </div>
        <div className="mx-auto w-full max-w-sm rounded-[2rem] bg-[var(--poskoo-ink)] p-2 shadow-[var(--poskoo-shadow-float)]">
        <article aria-label="Instagram feed mockup" className="w-full overflow-hidden rounded-[1.6rem] bg-[var(--poskoo-card)]">
          <div className="flex min-w-0 items-center gap-3 px-3 py-3">
            <span aria-hidden="true" className="h-9 w-9 shrink-0 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]"><span className={`${ui.inkFill} grid h-full w-full place-items-center rounded-full border-2 border-white text-sm font-semibold`}>{Array.from(displayHandle)[0]?.toUpperCase()}</span></span>
            <span className="min-w-0 flex-1 break-all text-sm font-semibold">{displayHandle}</span>
            <MoreHorizontal className="h-5 w-5 flex-none text-[var(--poskoo-ink)]" aria-hidden="true" />
          </div>
          <div className={`relative grid w-full place-items-center overflow-hidden bg-[var(--poskoo-violet)]/10 ${portrait ? "aspect-[4/5]" : "aspect-square"}`}>
            {image ? (
              // Native image keeps blob URLs local; no image optimizer or upload endpoint.
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image} src={image} alt="Your selected image with an approximate centered crop" onError={() => { setImage(null); setError("This image could not be opened. Choose a readable JPG, PNG or WebP."); }} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-11 flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--poskoo-violet)]/30 p-6 text-[var(--poskoo-violet)] focus-visible:outline-2 focus-visible:outline-[var(--poskoo-violet)]">
                <ImagePlus className="h-12 w-12" aria-hidden="true" /><span className="text-sm font-medium">Choose your image</span>
              </button>
            )}
          </div>
          <div className="p-3">
            <div aria-hidden="true" className="mb-3 flex gap-4 text-[var(--poskoo-ink)]"><Heart className="h-6 w-6" /><MessageCircle className="h-6 w-6" /><Send className="h-6 w-6" /><Bookmark className="ml-auto h-6 w-6" /></div>
            <p id={`${id}-preview`} className="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm [overflow-wrap:anywhere]"><strong>{displayHandle}</strong>{" "}{expanded ? caption : analysis.foldPreview}</p>
            {analysis.folded && <button type="button" aria-expanded={expanded} aria-controls={`${id}-preview`} onClick={() => setExpanded(!expanded)} className="min-h-11 text-sm font-medium text-[var(--poskoo-violet)] underline">{expanded ? "Show less" : "… more"}</button>}
          </div>
        </article>
        </div>
        <p className="text-xs leading-relaxed text-[#3d3450]">Cropping and caption truncation are approximations. This centered crop and estimated caption fold may differ from Instagram on your device. Your original file is unchanged.</p>
        <p className="text-sm leading-relaxed text-[#3d3450]">
          Working sequence: <span className="font-semibold">check length</span> in the caption counter,{" "}
          <span className="font-semibold">inspect the approximate feed preview</span> here, then{" "}
          <span className="font-semibold">explore scheduling</span> to publish it automatically.
        </p>
        <p>
          <Link
            href="/instagram-scheduler"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[var(--poskoo-violet)] underline"
          >
            Open the Instagram scheduler <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </aside>
      </div>
    </div>
  );
}
