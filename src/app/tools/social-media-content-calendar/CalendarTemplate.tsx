"use client";

import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";

type Row = { day: string; platform: string; format: string; idea: string };

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
    </div>
  );
}
