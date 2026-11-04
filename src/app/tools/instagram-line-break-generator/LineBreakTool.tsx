"use client";

import { useId, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PLATFORM_LIMITS, countChars } from "@/lib/captionLimits";
import { formatForInstagram, hasCollapsedSpacing, type BlankLineStyle } from "@/lib/lineBreaks";

const SAMPLE =
  "New drop is live ✨\n\nComment GUIDE and we'll DM you the styling guide.\n\nThanks for the support!\n\n#fashion #smallbusiness";

const igMax = PLATFORM_LIMITS.instagram.max;

export default function LineBreakTool() {
  const [text, setText] = useState(SAMPLE);
  const [blankLine, setBlankLine] = useState<BlankLineStyle>("invisible");
  const [copied, setCopied] = useState(false);
  const inputId = useId();
  const styleId = useId();

  const formatted = useMemo(() => formatForInstagram(text, { blankLine }), [text, blankLine]);
  const chars = countChars(formatted);
  const overBy = igMax !== null && chars > igMax ? chars - igMax : 0;
  const needsFix = hasCollapsedSpacing(text);

  async function copy() {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="glow rounded-3xl border border-line bg-surface p-4 text-left sm:p-6">
      <fieldset className="border-0 p-0">
        <legend id={styleId} className="text-sm font-medium">
          Blank line style
        </legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm" role="radiogroup" aria-labelledby={styleId}>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="blankLine"
              checked={blankLine === "invisible"}
              onChange={() => setBlankLine("invisible")}
              className="accent-[var(--brand)]"
            />
            Invisible (Braille blank)
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="blankLine"
              checked={blankLine === "dot"}
              onChange={() => setBlankLine("dot")}
              className="accent-[var(--brand)]"
            />
            Dot (.)
          </label>
        </div>
      </fieldset>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <label htmlFor={inputId} className="text-sm font-medium">
            Your caption
          </label>
          <textarea
            id={inputId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            placeholder="Paste or type your caption with blank lines…"
            className="mt-2 w-full resize-y rounded-xl border border-line bg-bg p-3 text-base leading-6 outline-none focus:border-brand"
          />
          <div className="mt-3 rounded-xl border border-line bg-bg p-3 text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-ink-2">Characters (formatted)</span>
              <span className={`font-semibold tabular-nums ${overBy > 0 ? "text-brand-2" : "text-ok"}`}>
                {chars.toLocaleString("en-US")}
                {igMax !== null && <span className="font-normal text-muted"> / {igMax.toLocaleString("en-US")}</span>}
              </span>
            </div>
            {overBy > 0 && (
              <p className="mt-2 text-sm font-medium text-brand-2">
                {overBy.toLocaleString("en-US")} characters over the Instagram limit.
              </p>
            )}
          </div>
          {needsFix && (
            <p className="mt-3 text-sm text-warn">
              This caption has blank lines or trailing spaces that Instagram may collapse. Copy the formatted output into
              Instagram.
            </p>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium">Instagram preview</h3>
            <button
              type="button"
              onClick={copy}
              disabled={!formatted}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium hover:text-brand disabled:opacity-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-bg">
            <div className="flex items-center gap-2 p-3">
              <span className="h-8 w-8 rounded-full bg-[linear-gradient(135deg,var(--brand),var(--brand-2))]" />
              <span className="text-sm font-semibold">yourbrand</span>
            </div>
            <div className="aspect-[4/3] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand)_25%,transparent),color-mix(in_srgb,var(--brand-2)_25%,transparent))]" />
            <p className="whitespace-pre-wrap break-words p-3 text-sm leading-5" aria-live="polite">
              <span className="font-semibold">yourbrand</span>{" "}
              {formatted || <span className="text-muted">Your formatted caption appears here</span>}
            </p>
          </div>
          <p className="mt-2 text-xs text-muted">
            Paste the copied text into the Instagram caption field. Blank lines use an invisible character or a dot so
            spacing stays visible in the app.
          </p>
        </div>
      </div>
    </div>
  );
}
