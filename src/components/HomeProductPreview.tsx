"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, MessageCircleHeart, Instagram, Facebook, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";

const tabs = ["Calendar", "Comment-to-DM"];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand";

export default function HomeProductPreview() {
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "ArrowLeft": next = (index - 1 + tabs.length) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <div className="glow relative mx-auto mt-14 min-w-0 max-w-5xl min-[1300px]:max-w-[80%] rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 text-xs text-ink-2">
        <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />{BRAND.name} · This week</span>
        <span className="rounded-full bg-surface-2 px-2 py-1">Product preview · sample data</span>
      </div>
      <div role="tablist" aria-label="Explore the product" className="grid grid-cols-2 gap-1 p-2 sm:flex">
        {tabs.map((label, index) => {
          const Icon = index === 0 ? CalendarDays : MessageCircleHeart;
          return (
            <button key={label} ref={(node) => { buttons.current[index] = node; }} type="button"
              role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`}
              aria-selected={active === index} tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)} onKeyDown={(event) => navigate(event, index)}
              className={`flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium sm:px-5 ${focus} ${active === index ? "bg-brand/10 text-ink shadow-sm" : "text-ink-2 hover:bg-surface-2"}`}>
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" />{label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} hidden={active !== 0}
        tabIndex={0} className={`min-w-0 rounded-xl p-2 sm:p-5 ${focus}`}>
        <div className="mb-4 px-1">
          <h2 className="font-semibold">Your week, ready to go.</h2>
          <p className="mt-1 text-sm text-ink-2">Content calendar · <span className="md:hidden">Mon–Wed</span><span className="hidden md:inline">Mon–Sun</span></p>
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-1.5 md:grid-cols-7 md:gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div key={day} className={`min-w-0 rounded-xl bg-surface-2 p-1.5 md:min-h-64 md:p-2 ${index > 2 ? "hidden md:block" : ""}`}>
              <div className="mb-3 text-sm font-medium text-ink-2">{day}</div>
              {index % 2 === 0 && (
                <div className="min-w-0 rounded-lg border border-line bg-surface p-1.5">
                  <svg aria-hidden="true" viewBox="0 0 100 64" className="mb-2 w-full rounded-md bg-brand/10">
                    <circle cx="75" cy="15" r="22" fill="var(--brand-2)" opacity=".2" />
                    <rect x="22" y="14" width="45" height="38" rx="10" fill="var(--brand)" opacity=".8" />
                    <path d="m41 25 15 9-15 9z" fill="var(--surface)" />
                    <path d="m79 38 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="var(--brand-2)" />
                  </svg>
                  <Instagram aria-label="Instagram" className="mb-1 h-3.5 w-3.5 text-brand" />
                  <div className="whitespace-nowrap text-xs font-medium text-ink">6:00 pm</div>
                  <div className="mt-1 break-words text-sm leading-5 text-ink-2">Reel · 5 tips</div>
                </div>
              )}
              {index % 3 === 1 && (
                <div className="mt-2 min-w-0 rounded-lg border border-line bg-surface p-1.5">
                  <Facebook aria-label="Facebook" className="mb-2 h-3.5 w-3.5 text-brand-2" />
                  <div className="whitespace-nowrap text-xs font-medium text-ink">9:30 am</div>
                  <div className="mt-1 break-words text-sm leading-5 text-ink-2">Carousel</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} hidden={active !== 1}
        tabIndex={0} className={`min-w-0 rounded-xl p-3 sm:p-5 ${focus}`}>
        <h2 className="font-semibold">A comment starts the conversation.</h2>
        <p className="mt-1 text-sm text-ink-2">Auto-DM · Reel “5 tips”</p>
        <ol className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <li className="min-w-0 rounded-xl border border-line p-3">
            <h3 className="mb-3 font-medium text-brand">Comment</h3>
            <div className="rounded-xl bg-surface-2 p-3"><span className="font-medium">@maya.fit</span> <span className="text-ink-2">commented</span> “GUIDE” 🔥</div>
            <p className="mt-3 text-xs text-ink-2">Keyword matches your DM rule.</p>
          </li>
          <li className="min-w-0 rounded-xl border border-line p-3">
            <h3 className="mb-3 font-medium text-brand">Reply</h3>
            <div className="rounded-xl border border-brand/30 bg-brand/10 p-3 leading-6">Hey Maya! Here’s your free guide 👉 <span className="break-all">link.to/guide</span> — want the 7-day plan too?</div>
            <div className="mt-3 rounded-xl bg-surface-2 p-3">yes please! 🙌</div>
          </li>
          <li className="min-w-0 rounded-xl border border-line p-3">
            <h3 className="mb-3 font-medium text-brand">Lead capture</h3>
            <div className="rounded-xl border border-brand-2/30 bg-brand-2/10 p-3 leading-6">Sure! What’s the best email to send it to?</div>
            <p className="mt-3 flex items-start gap-2 text-xs text-ink-2"><Check aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" />Next: save their email to your lead list.</p>
          </li>
        </ol>
      </div>
      <dl className="grid min-w-0 grid-cols-3 gap-2 border-t border-line p-3 text-center sm:p-5">
        {[["1,284", "DMs sent"], ["612", "Leads"], ["9.4%", "Click rate"]].map(([value, label]) => (
          <div key={label} className="min-w-0 rounded-xl bg-surface-2 px-1 py-3"><dt className="text-xs text-ink-2">{label}</dt><dd className="mt-1 text-lg font-semibold sm:text-2xl">{value}</dd></div>
        ))}
      </dl>
    </div>
  );
}
