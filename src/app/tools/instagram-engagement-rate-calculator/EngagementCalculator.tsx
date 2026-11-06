"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { engagementRate } from "@/lib/engagementRate";
import ui from "@/components/ui/ui.module.css";

type Mode = "followers" | "reach";

type Fields = {
  likes: string;
  comments: string;
  saves: string;
  shares: string;
  base: string;
};

const empty: Fields = { likes: "", comments: "", saves: "", shares: "", base: "" };

function Field({
  id,
  label,
  optional,
  value,
  onChange,
}: {
  id: string;
  label: string;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional ? <span className="font-normal text-[var(--poskoo-muted)]"> (optional)</span> : null}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--poskoo-violet)]"
        placeholder="0"
      />
    </div>
  );
}

export default function EngagementCalculator() {
  const [mode, setMode] = useState<Mode>("followers");
  const [values, setValues] = useState<Fields>(empty);
  const uid = useId();

  const baseLabel = mode === "followers" ? "Followers" : "Reach";

  const filled =
    values.likes.trim() !== "" && values.comments.trim() !== "" && values.base.trim() !== "";

  const rate = useMemo(() => {
    if (!filled) return null;
    return engagementRate({
      likes: Number(values.likes),
      comments: Number(values.comments),
      saves: values.saves === "" ? undefined : Number(values.saves),
      shares: values.shares === "" ? undefined : Number(values.shares),
      base: Number(values.base),
    });
  }, [filled, values]);

  const baseWord = mode === "followers" ? "followers" : "reach";
  const formula = `(likes + comments + saves + shares) ÷ ${baseWord} × 100`;

  function set(field: keyof Fields, v: string) {
    setValues((prev) => ({ ...prev, [field]: v }));
  }

  return (
    <div className="text-left">
      <div role="tablist" aria-label="Engagement rate basis" className="flex gap-1 rounded-full bg-[var(--poskoo-band)] p-1">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "followers"}
          onClick={() => setMode("followers")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${mode === "followers" ? ui.inkFill : "text-[#3d3450] hover:text-[var(--poskoo-ink)]"}`}
        >
          By followers
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "reach"}
          onClick={() => setMode("reach")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${mode === "reach" ? ui.inkFill : "text-[#3d3450] hover:text-[var(--poskoo-ink)]"}`}
        >
          By reach
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id={`${uid}-likes`} label="Likes" value={values.likes} onChange={(v) => set("likes", v)} />
        <Field id={`${uid}-comments`} label="Comments" value={values.comments} onChange={(v) => set("comments", v)} />
        <Field id={`${uid}-saves`} label="Saves" optional value={values.saves} onChange={(v) => set("saves", v)} />
        <Field id={`${uid}-shares`} label="Shares" optional value={values.shares} onChange={(v) => set("shares", v)} />
        <Field id={`${uid}-base`} label={baseLabel} value={values.base} onChange={(v) => set("base", v)} />
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-6 text-center" aria-live="polite">
        <p className="text-sm text-[#3d3450]">Engagement rate</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
          {rate === null ? "—" : `${rate.toFixed(2)}%`}
        </p>
        <p className="mt-3 text-sm text-[var(--poskoo-muted)]">{formula}</p>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/signup" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
          Turn those comments into leads with auto-DMs
        </Link>
      </p>
    </div>
  );
}
