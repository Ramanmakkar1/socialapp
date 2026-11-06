"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  BIO_LIMIT,
  BIO_TEMPLATES,
  NICHES,
  bioLength,
  fillBio,
  type NicheId,
} from "@/lib/bioTemplates";
import { FONT_STYLES, convert } from "@/lib/igFonts";

const DEFAULT_CTA = 'DM "START" for my free guide';

export default function BioTool() {
  const [name, setName] = useState("");
  const [what, setWhat] = useState("");
  const [cta, setCta] = useState(DEFAULT_CTA);
  const [nicheId, setNicheId] = useState<NicheId>("creator");
  const [nameStyle, setNameStyle] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameId = useId();
  const whatId = useId();
  const ctaId = useId();
  const nicheIdSelect = useId();
  const styleId = useId();

  const displayName = nameStyle ? convert(name, nameStyle) : name;

  const values = useMemo(
    () => ({ name: displayName, what, cta }),
    [displayName, what, cta],
  );

  const templates = BIO_TEMPLATES[nicheId];

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(id);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={nameId} className="text-sm font-medium">
            Name or brand
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          />
        </div>
        <div>
          <label htmlFor={whatId} className="text-sm font-medium">
            What you do
          </label>
          <input
            id={whatId}
            type="text"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="Content creator, bakery, trainer…"
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={ctaId} className="text-sm font-medium">
            Call to action
          </label>
          <input
            id={ctaId}
            type="text"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          />
        </div>
        <div>
          <label htmlFor={nicheIdSelect} className="text-sm font-medium">
            Niche
          </label>
          <select
            id={nicheIdSelect}
            value={nicheId}
            onChange={(e) => setNicheId(e.target.value as NicheId)}
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          >
            {NICHES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={styleId} className="text-sm font-medium">
            Style the name (optional)
          </label>
          <select
            id={styleId}
            value={nameStyle}
            onChange={(e) => setNameStyle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          >
            <option value="">Plain text</option>
            {FONT_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {templates.map((template, index) => {
          const filled = fillBio(template, values);
          const len = bioLength(filled);
          const cardId = `${nicheId}-${index}`;
          const over = len > BIO_LIMIT;
          return (
            <div
              key={cardId}
              className="flex flex-col rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4"
            >
              <p className="min-h-[4.5rem] flex-1 whitespace-pre-line break-words text-[#3d3450]">
                {filled || (
                  <span className="text-[var(--poskoo-muted)]">Fill in the fields above</span>
                )}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-medium tabular-nums ${over ? "text-[var(--poskoo-coral)]" : "text-[#3d3450]"}`}
                >
                  {len}/{BIO_LIMIT}
                </span>
                <button
                  type="button"
                  onClick={() => copy(cardId, filled)}
                  disabled={!filled}
                  aria-label={`${copied === cardId ? "Copied" : "Copy"} bio ${index + 1}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1 text-xs font-medium hover:text-[var(--poskoo-violet)] disabled:opacity-50"
                >
                  {copied === cardId ? (
                    <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied === cardId ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
