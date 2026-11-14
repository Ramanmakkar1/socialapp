"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

const ABOUT_MAX = 2600;
const PREVIEW_CHARS = 265;

const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]";
const areaClass = `${inputClass} min-h-[88px] resize-y`;

function skillsLine(skills: string) {
  const list = skills.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list.join(", ") : "";
}

export default function SummaryTool() {
  const [role, setRole] = useState("");
  const [who, setWho] = useState("");
  const [result, setResult] = useState("");
  const [skills, setSkills] = useState("");
  const [personal, setPersonal] = useState("");
  const [cta, setCta] = useState("Message me to talk about ...");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ids = { role: useId(), who: useId(), result: useId(), skills: useId(), personal: useId(), cta: useId() };

  const skillList = skillsLine(skills);
  const r = role.trim();
  const w = who.trim();
  const res = result.replace(/\.$/, "").trim();
  const help = w ? `I help ${w}${res ? ` ${res}` : ""}.` : res ? `${res}.` : "";
  const shortLead = r
    ? `I'm a ${r}${w ? ` helping ${w}` : ""}${res ? ` ${res}` : ""}.`
    : help;

  const drafts = [
    {
      id: "story",
      label: "Story",
      text: [r && `I'm a ${r}.`, help, skillList && `Along the way, I focus on ${skillList}.`, personal, cta]
        .filter(Boolean).join("\n\n"),
    },
    {
      id: "results",
      label: "Results-first",
      text: [help, skillList ? `${r ? `As a ${r}, ` : ""}I focus on ${skillList}.` : r && `I'm a ${r}.`, personal, cta]
        .filter(Boolean).join("\n\n"),
    },
    {
      id: "skills",
      label: "Skills & keywords",
      text: [r && `I'm a ${r}.`, help, skillList && `Skills: ${skillList}.`, personal, cta]
        .filter(Boolean).join("\n\n"),
    },
    {
      id: "short",
      label: "Short",
      text: [shortLead, personal, cta].filter(Boolean).join("\n\n"),
    },
  ];

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

  const fields = [
    { key: "role" as const, label: "Your role", placeholder: "e.g. Marketing Manager", value: role, set: setRole },
    { key: "who" as const, label: "Who you help", placeholder: "e.g. B2B SaaS teams", value: who, set: setWho },
  ];

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-2">
        {fields.slice(0, 2).map((field) => (
          <div key={field.key} className="min-w-0">
            <label htmlFor={ids[field.key]} className="text-sm font-semibold">{field.label}</label>
            <input id={ids[field.key]} type="text" value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder} className={inputClass} />
          </div>
        ))}
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor={ids.result} className="text-sm font-semibold">Result or proof you deliver</label>
          <textarea id={ids.result} value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g. grow pipeline from LinkedIn with content that ranks" className={areaClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={ids.skills} className="text-sm font-semibold">Top skills (comma-separated)</label>
          <input id={ids.skills} type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. SEO, content marketing" className={inputClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={ids.personal} className="text-sm font-semibold">Short personal line (optional)</label>
          <input id={ids.personal} type="text" value={personal} onChange={(e) => setPersonal(e.target.value)} placeholder="e.g. Based in London, coffee in hand" className={inputClass} />
        </div>
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor={ids.cta} className="text-sm font-semibold">Call to action</label>
          <input id={ids.cta} type="text" value={cta} onChange={(e) => setCta(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {drafts.map((draft) => {
          const over = draft.text.length > ABOUT_MAX;
          const preview = draft.text.slice(0, PREVIEW_CHARS);
          return (
            <section key={draft.id} className="flex min-w-0 flex-col rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">{draft.label}</h3>
                <button
                  type="button"
                  onClick={() => copy(draft.id, draft.text)}
                  aria-label={`${copied === draft.id ? "Copied" : "Copy"} ${draft.label} summary`}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition ${copied === draft.id ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] hover:border-[var(--poskoo-ink)]"}`}
                >
                  {copied === draft.id ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" /> : <Copy className="h-4 w-4" />}
                  {copied === draft.id ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-3 min-h-[80px] whitespace-pre-line text-base leading-relaxed text-[#3d3450]">{draft.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className={`font-semibold tabular-nums ${over ? "text-[#e25c4a]" : "text-[var(--poskoo-green)]"}`}>
                  {draft.text.length} / {ABOUT_MAX} characters
                </span>
                <span className="rounded-full bg-[var(--poskoo-band)] px-2 py-0.5 text-[11px] font-semibold text-[var(--poskoo-violet)]">
                  Preview before &ldquo;see more&rdquo;
                </span>
              </div>
              <p className="mt-2 border-l-2 border-[var(--poskoo-line)] pl-2 text-xs leading-relaxed text-[#5f5873]">
                {preview}
                {draft.text.length > PREVIEW_CHARS ? "..." : ""}
              </p>
            </section>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
    </div>
  );
}
