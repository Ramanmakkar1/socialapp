"use client";

import { useEffect, useId, useState } from "react";
import { Check, Copy, Hash, Save, Trash2 } from "lucide-react";

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

  const field = (key: keyof typeof emptyDraft, label: string, hint: string) => (
    <div>
      <label htmlFor={`${id}-${key}`} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={`${id}-${key}`}
        value={draft[key]}
        onChange={(event) => updateDraft(key, event.target.value)}
        rows={3}
        placeholder={hint}
        className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
      />
    </div>
  );

  return (
    <div className="grid gap-6 text-left lg:grid-cols-[1fr_1fr]">
      <div className="min-w-0 space-y-5">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
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
        <p className="text-xs text-[var(--poskoo-muted)]">
          {draftCount} {draftCount === 1 ? "tag" : "tags"} in this draft. Hashtag reach is not guaranteed — relevance and
          your content matter more than filling every slot.
        </p>

        <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">
            Set name
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              id={`${id}-name`}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(false);
              }}
              maxLength={60}
              placeholder="e.g. Denver gym — launch week"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base focus:border-[var(--poskoo-violet)]"
            />
            <button
              type="button"
              onClick={saveSet}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--poskoo-violet)] px-4 text-sm font-medium text-white hover:opacity-90"
            >
              <Save className="h-4 w-4" />
              Save set
            </button>
            <span aria-live="polite" className="text-xs text-[var(--poskoo-muted)]">
              {nameError ? "Give this set a name before saving." : `${draftCount} ${draftCount === 1 ? "tag" : "tags"}`}
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Saved sets</h2>
          <button
            type="button"
            onClick={copySelected}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium hover:text-[var(--poskoo-violet)]"
          >
            {copyStatus === "copied" ? (
              <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span aria-live="polite">{copyStatus === "copied" ? "Copied" : "Copy selected"}</span>
          </button>
        </div>

        {sets.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--poskoo-muted)]">
            No saved sets yet. Name a set and save it to keep it in this browser.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sets.map((item) => (
              <li key={item.id}>
                <div
                  className={`flex flex-wrap items-center gap-2 rounded-xl border p-3 ${
                    item.id === selectedId
                      ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/10"
                      : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)]"
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
                    <span className="block truncate text-sm font-medium">{item.name}</span>
                    <span className="block text-xs text-[var(--poskoo-muted)]">
                      {countTags(item)} {countTags(item) === 1 ? "tag" : "tags"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSet(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--poskoo-line)] text-[var(--poskoo-muted)] hover:text-[var(--poskoo-coral)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="mt-4 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
            <p className="text-xs font-medium text-[var(--poskoo-muted)]">Selected: {selected.name}</p>
            <p className="mt-2 break-words text-sm text-[var(--poskoo-violet)]">{setToText(selected) || "No tags yet."}</p>
          </div>
        )}

        {copyStatus === "failed" && (
          <p role="status" className="mt-4 text-sm text-[var(--poskoo-muted)]">
            {selected
              ? "Clipboard access is unavailable. Select the tags and copy them manually."
              : "Choose a saved set to copy."}
          </p>
        )}

        <p className="mt-4 text-xs text-[var(--poskoo-muted)]">
          Sets are saved only in this browser. Clearing site data removes them. Hashtag reach is not guaranteed, and
          Instagram may limit or restrict tags — review each set before posting.
        </p>
      </div>
    </div>
  );
}
