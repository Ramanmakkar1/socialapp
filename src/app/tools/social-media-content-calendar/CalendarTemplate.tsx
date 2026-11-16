"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Check, Copy, Download, Layers, Lightbulb, Plus, Printer, RotateCcw, Share2, Trash2 } from "lucide-react";

type Row = { day: string; platform: string; format: string; idea: string };

type ApprovalItem = { id: string; title: string; detail: string };

const APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: "copy",
    title: "Copy",
    detail: "Caption, hook and call to action are written, proofread and match the post idea.",
  },
  {
    id: "media",
    title: "Media",
    detail: "Image or video is cropped to the platform size, sharp, and has descriptive alt text.",
  },
  {
    id: "links",
    title: "Links",
    detail: "Every link opens the right page, is tagged with UTM fields, and has no broken or placeholder URL.",
  },
  {
    id: "formatting",
    title: "Platform formatting",
    detail: "Caption length, hashtags, line breaks and aspect ratio fit the platform you are posting to.",
  },
  {
    id: "approver",
    title: "Approver",
    detail: "A named person has reviewed the post and signed off on the final copy and media.",
  },
  {
    id: "time",
    title: "Publish time",
    detail: "Date, time and time zone are confirmed, and the post is at least a minute in the future.",
  },
];

const SAMPLE: Row[] = [
  { day: "Monday", platform: "Instagram", format: "Reel", idea: "Behind the scenes of how we make our best-selling product" },
  { day: "Tuesday", platform: "Instagram", format: "Carousel", idea: "5 mistakes to avoid when choosing a product like ours" },
  { day: "Wednesday", platform: "Facebook", format: "Image post", idea: "Customer question of the week, answered in one image" },
  { day: "Thursday", platform: "Threads", format: "Text post", idea: "A quick opinion on a trend in our niche" },
  { day: "Friday", platform: "Instagram", format: "Story", idea: "Poll: which new colour should we launch next?" },
  { day: "Saturday", platform: "Instagram", format: "Reel", idea: "A 15-second tutorial using our product" },
  { day: "Sunday", platform: "Facebook", format: "Link post", idea: "Share this week's blog post with a short takeaway" },
];

const PLATFORMS = ["Instagram", "Facebook", "Threads", "TikTok", "LinkedIn", "YouTube", "Pinterest", "X"];
const FORMATS = ["Reel", "Carousel", "Image post", "Story", "Text post", "Video", "Link post", "Live"];
const inputClass =
  "w-full min-w-0 min-h-11 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base sm:text-sm text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";
const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium hover:border-[var(--poskoo-ink)]";
const primaryBtn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-sm font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const PLATFORM_HEX: Record<string, string> = {
  Instagram: "#e1306c", Facebook: "#1877f2", Threads: "#1e1631", TikTok: "#00a3a3",
  LinkedIn: "#0a66c2", YouTube: "#e5484d", Pinterest: "#bd081c", X: "#5f5873",
};
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default function CalendarTemplate() {
  const [rows, setRows] = useState<Row[]>(SAMPLE);
  const [postLabel, setPostLabel] = useState("");
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const approvedCount = APPROVAL_ITEMS.filter((item) => approved[item.id]).length;
  const allApproved = approvedCount === APPROVAL_ITEMS.length;

  const toggleApproval = (id: string) =>
    setApproved((current) => ({ ...current, [id]: !current[id] }));

  function approvalSummary() {
    const label = postLabel.trim() || "Untitled post";
    return [
      "Social media post approval summary",
      `Post: ${label}`,
      `Status: ${approvedCount} of ${APPROVAL_ITEMS.length} steps complete — ${allApproved ? "ready to publish" : "not ready yet"}`,
      "",
      "Checklist:",
      ...APPROVAL_ITEMS.map((item) => `${approved[item.id] ? "[x]" : "[ ]"} ${item.title} — ${item.detail}`),
    ].join("\n");
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(approvalSummary());
      if (copyTimer.current) clearTimeout(copyTimer.current);
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const update = (index: number, field: keyof Row, value: string) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const addRow = () =>
    setRows((current) => [...current, { day: "", platform: "Instagram", format: "Image post", idea: "" }]);
  const removeRow = (index: number) => setRows((current) => current.filter((_, i) => i !== index));

  function downloadCsv() {
    const lines = [["Day", "Platform", "Format", "Post idea"], ...rows.map((r) => [r.day, r.platform, r.format, r.idea])]
      .map((cells) => cells.map(csvCell).join(","));
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "social-media-content-calendar.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const platformCounts = PLATFORMS.map((p) => ({ p, n: rows.filter((r) => r.platform === p).length })).filter((x) => x.n > 0);
  const formatsUsed = new Set(rows.map((r) => r.format)).size;
  const missingIdeas = rows.filter((r) => !r.idea.trim()).length;

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><CalendarDays className="h-3 w-3" aria-hidden="true" />Planned</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums">{rows.length} <span className="text-sm font-medium text-[#5f5873]">{rows.length === 1 ? "post" : "posts"}</span></p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Share2 className="h-3 w-3" aria-hidden="true" />Platforms</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums">{platformCounts.length}</p>
          {rows.length > 0 && (
            <div className="mt-2 flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
              {platformCounts.map((x) => <i key={x.p} style={{ width: `${(x.n / rows.length) * 100}%`, background: PLATFORM_HEX[x.p] }} />)}
            </div>
          )}
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Layers className="h-3 w-3" aria-hidden="true" />Formats</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums">{formatsUsed}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Lightbulb className="h-3 w-3" aria-hidden="true" />Missing ideas</p>
          <p className={`mt-0.5 text-xl font-bold tabular-nums ${missingIdeas ? "text-[#b2401a]" : "text-[var(--poskoo-green)]"}`}>{missingIdeas}</p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--poskoo-ink)]">
              {rows.length} {rows.length === 1 ? "post" : "posts"} planned
            </p>
            {platformCounts.length > 0 && (
              <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#3d3450]">
                {platformCounts.map((x) => (
                  <li key={x.p} className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: PLATFORM_HEX[x.p] }} aria-hidden="true" />{x.p} <b className="tabular-nums text-[var(--poskoo-ink)]">{x.n}</b></li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={addRow} className={ghostBtn}>
              <Plus className="h-4 w-4" aria-hidden /> Add row
            </button>
            <button type="button" onClick={downloadCsv} className={primaryBtn}>
              {saved ? <Check className="h-4 w-4 text-[var(--poskoo-lime)]" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />} {saved ? "Downloaded" : "Download CSV"}
            </button>
            <span className="sr-only" aria-live="polite">{saved ? "CSV downloaded" : ""}</span>
          </div>
        </div>
        <p className="border-b border-[var(--poskoo-line)] px-3 py-2 text-xs text-[#3d3450]">
          The sample week is already filled in — edit any cell to make it yours, add rows, then download the CSV to open in
          Google Sheets or Excel. Nothing is uploaded.
        </p>

        {rows.length > 0 && (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="max-md:sr-only">
              <tr className="text-[11px] uppercase tracking-wide text-[#5f5873]">
                <th className="w-[150px] px-3 py-2.5 font-semibold">Day</th>
                <th className="w-[150px] px-3 py-2.5 font-semibold">Platform</th>
                <th className="w-[150px] px-3 py-2.5 font-semibold">Format</th>
                <th className="px-3 py-2.5 font-semibold">Post idea</th>
                <th className="w-14 px-3 py-2.5 font-semibold"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-[var(--poskoo-line)] align-top max-md:grid max-md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] max-md:gap-2 max-md:p-3" style={{ boxShadow: `inset 3px 0 0 ${PLATFORM_HEX[row.platform] ?? "transparent"}` }}>
                  <td className="px-3 py-2 max-md:col-span-2 max-md:p-0">
                    <input aria-label={`Day for row ${index + 1}`} className={`${inputClass} font-semibold`} value={row.day} placeholder="Monday" onChange={(e) => update(index, "day", e.target.value)} />
                  </td>
                  <td className="px-3 py-2 max-md:col-start-1 max-md:p-0">
                    <select aria-label={`Platform for row ${index + 1}`} className={inputClass} value={row.platform} onChange={(e) => update(index, "platform", e.target.value)}>
                      {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 max-md:col-span-2 max-md:p-0">
                    <select aria-label={`Format for row ${index + 1}`} className={inputClass} value={row.format} onChange={(e) => update(index, "format", e.target.value)}>
                      {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 max-md:col-span-3 max-md:p-0">
                    <input aria-label={`Post idea for row ${index + 1}`} className={inputClass} value={row.idea} placeholder="What will you post?" onChange={(e) => update(index, "idea", e.target.value)} />
                  </td>
                  <td className="px-3 py-2 max-md:col-start-3 max-md:row-start-1 max-md:p-0">
                    <button type="button" onClick={() => removeRow(index)} aria-label={`Remove row ${index + 1}`} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--poskoo-line)] text-[#5f5873] hover:border-[var(--poskoo-red)] hover:text-[var(--poskoo-red)]">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {rows.length === 0 && (
          <div className="grid place-items-center gap-2 px-4 py-10 text-center text-sm text-[#3d3450]">
            <CalendarDays className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
            <p>Your calendar is empty. Choose <strong>Add row</strong> to plan your first post.</p>
          </div>
        )}
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] !p-4 sm:!p-5" aria-labelledby="approval-heading">
        <h2 id="approval-heading" className="text-lg font-semibold text-[var(--poskoo-ink)]">
          Post approval checklist
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#3d3450]">
          A post is ready to publish when copy, media, links, platform formatting, an approver and the publish time are
          all confirmed. Add a post label, tick each step, then copy or print the plain-text approval summary. Everything
          stays in your browser — nothing is uploaded. When it is approved, schedule it with the{" "}
          <Link href="/instagram-scheduler" className="font-medium text-[var(--poskoo-violet)] hover:underline">
            Instagram scheduler
          </Link>{" "}
          or plan the rest of the week in the{" "}
          <Link
            href="/tools/social-media-content-calendar"
            className="font-medium text-[var(--poskoo-violet)] hover:underline"
          >
            social media content calendar
          </Link>
          .
        </p>

        <div className="mt-4 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div className="min-w-0">
            <label htmlFor="approval-post-label" className="text-sm font-semibold text-[var(--poskoo-ink)]">
              Post label
            </label>
            <input
              id="approval-post-label"
              type="text"
              value={postLabel}
              onChange={(e) => setPostLabel(e.target.value)}
              placeholder="e.g. Friday Reel — new colour launch"
              className={`${inputClass} mt-1`}
            />

            <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Post approval checklist">
              {APPROVAL_ITEMS.map((item) => {
                const checked = !!approved[item.id];
                const inputId = `approval-${item.id}`;
                return (
                  <li
                    key={item.id}
                    className={`rounded-2xl border transition-colors ${
                      checked ? "border-[var(--poskoo-green)]/50 bg-[var(--poskoo-green)]/[0.06]" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)]"
                    }`}
                  >
                    <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-center gap-3 px-4 pt-3">
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleApproval(item.id)}
                        className="h-5 w-5 shrink-0 accent-[var(--poskoo-violet)]"
                      />
                      <span className={`text-sm font-semibold ${checked ? "text-[#5f5873] line-through" : "text-[var(--poskoo-ink)]"}`}>
                        {item.title}
                      </span>
                      {checked && <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--poskoo-green)]" aria-hidden />}
                    </label>
                    <p className="px-4 pb-3 pl-12 text-sm leading-relaxed text-[#3d3450]">{item.detail}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside aria-label="Approval status" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 lg:sticky lg:top-24">
            <p className="text-sm font-semibold text-[var(--poskoo-ink)]" aria-live="polite">
              {approvedCount} of {APPROVAL_ITEMS.length} steps complete
            </p>
            <div
              className="h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
              role="progressbar"
              aria-valuenow={approvedCount}
              aria-valuemin={0}
              aria-valuemax={APPROVAL_ITEMS.length}
              aria-label="Approval progress"
            >
              <div
                className={`h-2 rounded-full motion-safe:transition-all ${allApproved ? "bg-[var(--poskoo-green)]" : "bg-[var(--poskoo-violet)]"}`}
                style={{ width: `${(approvedCount / APPROVAL_ITEMS.length) * 100}%` }}
              />
            </div>
            <p className={`text-xs font-semibold ${allApproved ? "text-[var(--poskoo-green)]" : "text-[#5f5873]"}`}>
              {allApproved ? "Ready to publish" : "Not ready yet"}
            </p>
            <button type="button" onClick={copySummary} className={`${primaryBtn} w-full`}>
              {copied ? <Check className="h-4 w-4 text-[var(--poskoo-lime)]" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy summary"}
            </button>
            <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button type="button" onClick={() => window.print()} className={`${ghostBtn} whitespace-nowrap px-2`}>
                <Printer className="h-4 w-4" aria-hidden /> Print summary
              </button>
              <button type="button" onClick={() => setApproved({})} disabled={approvedCount === 0} className={`${ghostBtn} whitespace-nowrap px-3 disabled:opacity-40`}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Reset
              </button>
            </div>
            {allApproved && (
              <p className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-green)]/40 bg-[var(--poskoo-green)]/10 px-3 py-2.5 text-sm font-medium text-[var(--poskoo-ink)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-green)]" aria-hidden />
                All steps confirmed — this post is ready to schedule.
              </p>
            )}
          </aside>
        </div>

        <div id="approval-print" style={{ display: "none" }}>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 14, lineHeight: 1.6 }}>
            {approvalSummary()}
          </pre>
        </div>
        <style>{`@media print { body * { visibility: hidden; } #approval-print, #approval-print * { visibility: visible; } #approval-print { display: block !important; position: absolute; left: 0; top: 0; width: 100%; padding: 24px; } }`}</style>
      </section>
    </div>
  );
}
