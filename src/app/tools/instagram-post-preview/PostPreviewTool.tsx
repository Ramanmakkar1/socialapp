"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Heart, ImagePlus, MessageCircle, Send } from "lucide-react";
import { analyzeCaption, PLATFORM_LIMITS } from "@/lib/captionLimits";

export default function PostPreviewTool() {
  const [caption, setCaption] = useState("A little behind the scenes ✨\n\nGood things start with a first draft. What are you creating today?");
  const [handle, setHandle] = useState("your.studio");
  const [portrait, setPortrait] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const analysis = analyzeCaption(caption, "instagram");
  const displayHandle = handle.trim().replace(/^@+/, "") || "your.studio";
  const field = "mt-2 block w-full min-w-0 rounded-xl border border-line bg-bg p-3 text-ink focus-visible:outline-2 focus-visible:outline-brand";

  useEffect(() => {
    return () => { if (image) URL.revokeObjectURL(image); };
  }, [image]);

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
    } catch {
      setCopyStatus("Could not copy. Select the caption and copy it manually.");
    }
  }

  return (
    <div className="glow grid min-w-0 gap-8 rounded-3xl border border-line bg-surface p-4 sm:p-8 lg:grid-cols-2">
      <div className="min-w-0 space-y-5">
        <div>
          <label htmlFor={`${id}-handle`} className="text-sm font-medium">Display handle</label>
          <input id={`${id}-handle`} value={handle} maxLength={30} autoComplete="off" spellCheck={false} onChange={(e) => setHandle(e.target.value)} className={field} />
          <p className="mt-2 text-xs text-ink-2">Display only. We never look up profiles or connect to Instagram.</p>
        </div>
        <div>
          <label htmlFor={`${id}-caption`} className="text-sm font-medium">Caption</label>
          <textarea id={`${id}-caption`} rows={7} value={caption} onChange={(e) => { setCaption(e.target.value); setExpanded(false); setCopyStatus(""); }} className={`${field} resize-y`} />
          <p className="mt-2 text-sm text-ink-2">{analysis.chars.toLocaleString("en-US")} / {PLATFORM_LIMITS.instagram.max?.toLocaleString("en-US")} characters</p>
          {analysis.overBy > 0 && <p className="mt-1 text-sm text-ink-2" role="status">Over the caption limit by {analysis.overBy} characters. Shorten before posting.</p>}
        </div>
        <div>
          <label htmlFor={`${id}-image`} className="text-sm font-medium">Local image</label>
          <input ref={fileRef} id={`${id}-image`} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} aria-describedby={`${id}-privacy ${id}-error`} className="mt-2 block min-h-11 w-full min-w-0 max-w-full text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-brand/10 file:px-3 file:py-3 file:text-ink" />
          <p id={`${id}-privacy`} className="mt-2 text-xs text-ink-2">JPG, PNG or WebP · up to 10 MB · stays in this browser tab.</p>
          <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-ink-2">{error}</p>
          {image && <button type="button" onClick={() => { setImage(null); setError(""); }} className="min-h-11 text-sm font-medium text-brand underline">Remove image</button>}
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Preview shape</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {[false, true].map((value) => (
              <label key={String(value)} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm">
                <input type="radio" name={`${id}-shape`} checked={portrait === value} onChange={() => setPortrait(value)} className="accent-[var(--brand)]" />
                {value ? "Portrait · 4:5" : "Square · 1:1"}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={copyCaption} disabled={!caption} className="btn-primary min-h-11 rounded-full px-5 py-3 text-sm font-medium disabled:opacity-50">Copy caption</button>
        <p role="status" aria-live="polite" aria-atomic="true" className="min-h-6 text-sm text-ink-2">{copyStatus}</p>
      </div>
      <div className="min-w-0">
        <h2 className="mb-3 text-sm font-medium text-ink-2">Your feed preview</h2>
        <article aria-label="Instagram feed mockup" className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-bg shadow-sm">
          <div className="flex min-w-0 items-center gap-3 p-4">
            <span aria-hidden="true" className="btn-primary grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold">{Array.from(displayHandle)[0]?.toUpperCase()}</span>
            <span className="min-w-0 break-all text-sm font-semibold">{displayHandle}</span>
          </div>
          <div className={`relative grid w-full place-items-center overflow-hidden bg-brand/10 ${portrait ? "aspect-[4/5]" : "aspect-square"}`}>
            {image ? (
              // Native image keeps blob URLs local; no image optimizer or upload endpoint.
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image} src={image} alt="Your selected image with an approximate centered crop" onError={() => { setImage(null); setError("This image could not be opened. Choose a readable JPG, PNG or WebP."); }} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-11 flex-col items-center gap-3 rounded-xl p-6 text-brand focus-visible:outline-2 focus-visible:outline-brand">
                <ImagePlus className="h-12 w-12" aria-hidden="true" /><span className="text-sm font-medium">Choose your image</span>
              </button>
            )}
          </div>
          <div className="p-4">
            <div aria-hidden="true" className="mb-3 flex gap-4 text-ink"><Heart className="h-6 w-6" /><MessageCircle className="h-6 w-6" /><Send className="h-6 w-6" /></div>
            <p id={`${id}-preview`} className="whitespace-pre-wrap text-sm [overflow-wrap:anywhere]"><strong>{displayHandle}</strong>{" "}{expanded ? caption : analysis.foldPreview}</p>
            {analysis.folded && <button type="button" aria-expanded={expanded} aria-controls={`${id}-preview`} onClick={() => setExpanded(!expanded)} className="min-h-11 text-sm font-medium text-brand underline">{expanded ? "Show less" : "… more"}</button>}
          </div>
        </article>
        <p className="mx-auto mt-4 max-w-sm text-xs leading-relaxed text-ink-2">Cropping and caption truncation are approximations. This centered crop and estimated caption fold may differ from Instagram on your device. Your original file is unchanged.</p>
      </div>
    </div>
  );
}
