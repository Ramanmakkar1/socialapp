"use client";

import { useEffect, useId, useState } from "react";
import { Bookmark, Check, Copy, FolderOpen, Hash, Save, Trash2 } from "lucide-react";

type TagSet = {
  id: string;
  name: string;
  broad: string;
  niche: string;
  branded: string;
};

const STORAGE_KEY = "poskoo.hashtagSets.v1";

function parseTags(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((tag) => tag.trim().replace(/^#+/, ""))
    .filter(Boolean);
}

function setToText(set: TagSet): string {
  return [...parseTags(set.broad), ...parseTags(set.niche), ...parseTags(set.branded)]
    .map((tag) => `#${tag}`)
    .join(" ");
}

function countTags(set: TagSet): number {
  return parseTags(set.broad).length + parseTags(set.niche).length + parseTags(set.branded).length;
}

const emptyDraft = { broad: "", niche: "", branded: "" };

type Tier = keyof typeof emptyDraft;
const TIERS: { key: Tier; label: string; color: string; chip: string }[] = [
  { key: "broad", label: "Broad", color: "#6b4eff", chip: "bg-[#6b4eff]/10 text-[#5236e0]" },
  { key: "niche", label: "Niche", color: "#1fa971", chip: "bg-[#1fa971]/12 text-[#146b43]" },
  { key: "branded", label: "Branded", color: "#ff8a5b", chip: "bg-[#ff8a5b]/15 text-[#a8410f]" },
];
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function HashtagStrategyWorksheet() {
  const id = useId();
  const [draft, setDraft] = useState(emptyDraft);
  const [name, setName] = useState("");
  const [sets, setSets] = useState<TagSet[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [nameError, setNameError] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TagSet[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved sets from localStorage after mount
        if (Array.isArray(parsed)) setSets(parsed.filter((item) => item && typeof item.name === "string"));
      }
    } catch {
      // Ignore unreadable local data and start with an empty worksheet.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    } catch {
      // Storage can be full or blocked; the worksheet still works for this visit.
    }
  }, [sets, loaded]);

  const selected = sets.find((item) => item.id === selectedId) ?? null;
  const draftCount = countTags({ id: "", name: "", ...draft });

  function updateDraft(field: keyof typeof emptyDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function saveSet() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    const next: TagSet = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      ...draft,
    };
    setSets((current) => [...current, next]);
    setSelectedId(next.id);
    setName("");
    setNameError(false);
    setCopyStatus("idle");
  }

  function deleteSet(setId: string) {
    setSets((current) => current.filter((item) => item.id !== setId));
    if (selectedId === setId) setSelectedId("");
  }

  async function copySelected() {
    if (!selected) {
      setCopyStatus("failed");
      return;
    }
    try {
      await navigator.clipboard.writeText(setToText(selected));
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("failed");
    }
  }

  // At-a-glance numbers, all from the parsed draft.
  const tierCounts = TIERS.map((t) => ({ ...t, n: parseTags(draft[t.key]).length }));
  const draftTags = TIERS.flatMap((t) => parseTags(draft[t.key]).map((tag) => tag.toLowerCase()));
  const duplicates = draftTags.length - new Set(draftTags).size;
  const draftLine = setToText({ id: "", name: "", ...draft });

  const field = (key: Tier, label: string, hint: string) => {
    const tier = tierCounts.find((t) => t.key === key)!;
    return (
      <div className="min-w-0">
        <label htmlFor={`${id}-${key}`} className="flex items-center justify-between gap-2 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ background: tier.color }} aria-hidden="true" />
            {label}
          </span>
          <span className={`rounded-md px-1.5 text-xs font-semibold tabular-nums ${tier.chip}`}>{tier.n}</span>
        </label>
        <textarea
          id={`${id}-${key}`}
          value={draft[key]}
          onChange={(event) => updateDraft(key, event.target.value)}
          rows={3}
          placeholder={hint}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          style={{ boxShadow: `inset 3px 0 0 ${tier.color}` }}
        />
      </div>
    );
  };

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>Draft tags</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${draftCount > 30 ? "text-[var(--poskoo-red)]" : "text-[var(--poskoo-ink)]"}`}>
            {draftCount}
            <span className="text-base font-medium text-[#5f5873]"> / 30</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full" style={{ width: `${Math.min(100, (draftCount / 30) * 100)}%`, background: draftCount > 30 ? "var(--poskoo-red)" : "var(--poskoo-violet)" }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Tier mix</p>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            {tierCounts.filter((t) => t.n > 0).map((t) => (
              <i key={t.key} className="h-full" style={{ width: `${(t.n / Math.max(1, draftCount)) * 100}%`, background: t.color }} />
            ))}
          </div>
          <ul className="mt-2 space-y-0.5 text-xs text-[#3d3450]">
            {tierCounts.map((t) => (
              <li key={t.key} className="flex items-center gap-1.5">
                <i className="h-2 w-2 flex-none rounded-full" style={{ background: t.color }} aria-hidden="true" />
                <b className="tabular-nums text-[var(--poskoo-ink)]">{t.n}</b> {t.label.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Duplicates</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${duplicates ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>{duplicates}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{duplicates ? "Same tag used twice in this draft." : "No repeated tags."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Saved sets</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{sets.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Stored in this browser.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Builder */}
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold tracking-normal">
              <Hash className="h-5 w-5 text-[var(--poskoo-violet)]" />
              Build a set
            </h2>
            <p className="mt-1 text-sm text-[var(--poskoo-muted)]">
              Group tags into three tiers. Separate tags with spaces, commas or new lines; the # is optional.
            </p>
          </div>
          {field("broad", "Broad tags", "e.g. #fitness #wellness #healthylifestyle")}
          {field("niche", "Niche tags", "e.g. #denverpersonaltrainer #strengthcoach")}
          {field("branded", "Branded tags", "e.g. #yourbrand #yourbrandresults")}

          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5f5873]">Draft preview</p>
            {draftLine ? (
              <p className="mt-1.5 max-h-32 overflow-y-auto break-words text-sm leading-relaxed text-[#3b5bdb]">{draftLine}</p>
            ) : (
              <p className="mt-1.5 rounded-lg border border-dashed border-[var(--poskoo-line)] p-2.5 text-center text-xs text-[#5f5873]">Add tags to any tier to see the set as it will paste.</p>
            )}
          </div>
          <p className="text-xs text-[var(--poskoo-muted)]">
            {draftCount} {draftCount === 1 ? "tag" : "tags"} in this draft. Hashtag reach is not guaranteed — relevance and
            your content matter more than filling every slot.
          </p>

          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
            <label htmlFor={`${id}-name`} className="text-sm font-semibold">
              Set name
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id={`${id}-name`}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (nameError) setNameError(false);
                }}
                maxLength={60}
                placeholder="e.g. Denver gym — launch week"
                aria-invalid={nameError || undefined}
                className={`min-h-11 min-w-0 flex-1 rounded-xl border bg-[var(--poskoo-paper)] px-3 text-base focus:border-[var(--poskoo-violet)] ${nameError ? "border-[var(--poskoo-coral)]" : "border-[var(--poskoo-line)]"}`}
              />
              <button
                type="button"
                onClick={saveSet}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-violet)] px-4 text-sm font-semibold text-white transition hover:-translate-y-px hover:opacity-95"
              >
                <Save className="h-4 w-4" />
                Save set
              </button>
            </div>
            <span aria-live="polite" className={`mt-1.5 block text-xs ${nameError ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-muted)]"}`}>
              {nameError ? "Give this set a name before saving." : `${draftCount} ${draftCount === 1 ? "tag" : "tags"}`}
            </span>
          </div>
        </div>

        {/* Saved sets */}
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <h2 className="flex items-center justify-between gap-2 font-semibold tracking-normal">
            <span className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />
              Saved sets
            </span>
            <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-xs font-semibold tabular-nums text-[var(--poskoo-violet)]">{sets.length}</span>
          </h2>
          <button
            type="button"
            onClick={copySelected}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copyStatus === "copied" ? (
              <Check className="h-5 w-5 text-[var(--poskoo-lime)]" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            <span aria-live="polite">{copyStatus === "copied" ? "Copied" : "Copy selected"}</span>
          </button>

          {sets.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-[var(--poskoo-line)] px-3 py-6 text-center">
              <FolderOpen className="h-7 w-7 text-[var(--poskoo-violet)]" aria-hidden="true" />
              <p className="text-sm text-[var(--poskoo-muted)]">
                No saved sets yet. Name a set and save it to keep it in this browser.
              </p>
            </div>
          ) : (
            <ul className="max-h-[360px] space-y-2 overflow-y-auto">
              {sets.map((item) => {
                const n = countTags(item);
                return (
                  <li key={item.id}>
                    <div
                      className={`flex items-center gap-2 rounded-xl border p-2 pl-3 transition-colors ${
                        item.id === selectedId
                          ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/10"
                          : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-ink)]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(item.id);
                          setCopyStatus("idle");
                        }}
                        aria-pressed={item.id === selectedId}
                        className="min-h-11 min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-sm font-semibold">{item.name}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-[var(--poskoo-muted)]">
                          <span className="flex h-1.5 w-16 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
                            {TIERS.map((t) => {
                              const c = parseTags(item[t.key] ?? "").length;
                              return c ? <i key={t.key} className="h-full" style={{ width: `${(c / Math.max(1, n)) * 100}%`, background: t.color }} /> : null;
                            })}
                          </span>
                          {n} {n === 1 ? "tag" : "tags"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSet(item.id)}
                        aria-label={`Delete ${item.name}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[var(--poskoo-muted)] hover:text-[var(--poskoo-coral)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {selected && (
            <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
              <p className="text-xs font-medium text-[var(--poskoo-muted)]">Selected: {selected.name}</p>
              <p className="mt-2 max-h-40 overflow-y-auto break-words text-sm leading-relaxed text-[var(--poskoo-violet)]">{setToText(selected) || "No tags yet."}</p>
            </div>
          )}

          {copyStatus === "failed" && (
            <p role="status" className="text-sm text-[var(--poskoo-muted)]">
              {selected
                ? "Clipboard access is unavailable. Select the tags and copy them manually."
                : "Choose a saved set to copy."}
            </p>
          )}

          <p className="text-xs text-[var(--poskoo-muted)]">
            Sets are saved only in this browser. Clearing site data removes them. Hashtag reach is not guaranteed, and
            Instagram may limit or restrict tags — review each set before posting.
          </p>
        </div>
      </div>
    </div>
  );
}
