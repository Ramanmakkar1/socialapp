"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  USERNAME_STYLES,
  generateUsernames,
  type UsernameStyle,
} from "@/lib/usernameIdeas";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]";

export default function UsernameTool() {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState<UsernameStyle>("clean");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameId = useId();
  const nicheId = useId();
  const styleId = useId();

  const results = useMemo(() => generateUsernames({ name, niche, style }), [name, niche, style]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(value);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="text-left">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={nameId} className="text-sm font-medium">
            Your name or brand
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={nicheId} className="text-sm font-medium">
            Niche or topic
          </label>
          <input
            id={nicheId}
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Fitness, baking, travel…"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={styleId} className="text-sm font-medium">
            Style
          </label>
          <select
            id={styleId}
            value={style}
            onChange={(e) => setStyle(e.target.value as UsernameStyle)}
            className={fieldClass}
          >
            {USERNAME_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#3d3450]">
        We do not check Instagram. Before you settle on a name, type it into Edit profile &gt; Username in the
        Instagram app to see if it is free.
      </p>

      {results.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 text-[var(--poskoo-muted)]">
          Enter a name or a niche to see username ideas.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-live="polite">
          {results.map((u) => (
            <li
              key={u}
              className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-3"
            >
              <span className="break-all font-medium text-[#3d3450]">@{u}</span>
              <button
                type="button"
                onClick={() => copy(u)}
                aria-label={`${copied === u ? "Copied" : "Copy"} ${u}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1 text-xs font-medium hover:text-[var(--poskoo-violet)]"
              >
                {copied === u ? (
                  <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied === u ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
