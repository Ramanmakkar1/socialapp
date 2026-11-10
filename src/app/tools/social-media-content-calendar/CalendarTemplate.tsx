"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, Plus, Printer, Trash2 } from "lucide-react";

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
  "w-full min-h-11 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default function CalendarTemplate() {
  const [rows, setRows] = useState<Row[]>(SAMPLE);
  const [postLabel, setPostLabel] = useState("");
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
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
  }

  return (
    <div className="text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--poskoo-ink)]">
          {rows.length} {rows.length === 1 ? "post" : "posts"} planned
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={addRow} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] hover:text-[var(--poskoo-violet)]">
            <Plus className="h-4 w-4" aria-hidden /> Add row
          </button>
          <button type="button" onClick={downloadCsv} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--poskoo-violet)] px-4 text-sm font-semibold text-white hover:opacity-90">
            <Download className="h-4 w-4" aria-hidden /> Download CSV
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--poskoo-muted)]">
        The sample week is already filled in — edit any cell to make it yours, add rows, then download the CSV to open in
        Google Sheets or Excel. Nothing is uploaded.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--poskoo-line)]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[var(--poskoo-band)] text-xs uppercase tracking-wide text-[var(--poskoo-muted)]">
              <th className="px-3 py-3 font-semibold">Day</th>
              <th className="px-3 py-3 font-semibold">Platform</th>
              <th className="px-3 py-3 font-semibold">Format</th>
              <th className="px-3 py-3 font-semibold">Post idea</th>
              <th className="px-3 py-3 font-semibold"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-[var(--poskoo-line)] align-top">
                <td className="px-3 py-2">
                  <input aria-label={`Day for row ${index + 1}`} className={inputClass} value={row.day} placeholder="Monday" onChange={(e) => update(index, "day", e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <select aria-label={`Platform for row ${index + 1}`} className={inputClass} value={row.platform} onChange={(e) => update(index, "platform", e.target.value)}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select aria-label={`Format for row ${index + 1}`} className={inputClass} value={row.format} onChange={(e) => update(index, "format", e.target.value)}>
                    {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input aria-label={`Post idea for row ${index + 1}`} className={inputClass} value={row.idea} placeholder="What will you post?" onChange={(e) => update(index, "idea", e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => removeRow(index)} aria-label={`Remove row ${index + 1}`} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--poskoo-line)] text-[var(--poskoo-muted)] hover:text-[var(--poskoo-violet)]">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="mt-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-3 text-sm text-[var(--poskoo-muted)]">
          Your calendar is empty. Choose <strong>Add row</strong> to plan your first post.
        </p>
      )}

      <section className="mt-8 border-t border-[var(--poskoo-line)] pt-6" aria-labelledby="approval-heading">
        <h2 id="approval-heading" className="text-lg font-semibold text-[var(--poskoo-ink)]">
          Post approval checklist
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--poskoo-muted)]">
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

        <div className="mt-4">
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
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--poskoo-ink)]" aria-live="polite">
            {approvedCount} of {APPROVAL_ITEMS.length} steps complete
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] hover:text-[var(--poskoo-violet)]"
            >
              {copied ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] hover:text-[var(--poskoo-violet)]"
            >
              <Printer className="h-4 w-4" aria-hidden /> Print summary
            </button>
            {approvedCount > 0 && (
              <button
                type="button"
                onClick={() => setApproved({})}
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] hover:text-[var(--poskoo-violet)]"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--poskoo-band)]"
          role="progressbar"
          aria-valuenow={approvedCount}
          aria-valuemin={0}
          aria-valuemax={APPROVAL_ITEMS.length}
          aria-label="Approval progress"
        >
          <div
            className="h-2 rounded-full bg-[var(--poskoo-violet)] transition-all"
            style={{ width: `${(approvedCount / APPROVAL_ITEMS.length) * 100}%` }}
          />
        </div>

        <ul className="mt-4 space-y-2" aria-label="Post approval checklist">
          {APPROVAL_ITEMS.map((item) => {
            const checked = !!approved[item.id];
            const inputId = `approval-${item.id}`;
            return (
              <li
                key={item.id}
                className={`rounded-2xl border bg-[var(--poskoo-paper)] transition-colors ${
                  checked ? "border-[var(--poskoo-green)]/50" : "border-[var(--poskoo-line)]"
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
                  <span
                    className={`text-sm font-semibold ${
                      checked ? "text-[var(--poskoo-muted)] line-through" : "text-[var(--poskoo-ink)]"
                    }`}
                  >
                    {item.title}
                  </span>
                  {checked && <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--poskoo-green)]" aria-hidden />}
                </label>
                <p className="px-4 pb-3 pl-12 text-sm leading-relaxed text-[var(--poskoo-muted)]">{item.detail}</p>
              </li>
            );
          })}
        </ul>

        {allApproved && (
          <p className="mt-4 rounded-2xl border border-[var(--poskoo-green)]/40 bg-[var(--poskoo-green)]/10 px-4 py-3 text-sm font-medium text-[var(--poskoo-ink)]">
            All steps confirmed — this post is ready to schedule.
          </p>
        )}

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
