"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import home from "./home.module.css";

export type FirstSessionChecklistProps = {
  /** An Instagram channel is connected (active social account). */
  connected: boolean;
  /** At least one post exists for this user (any status, including drafts). */
  postCreated: boolean;
  /** A post is scheduled, publishing or already published. */
  postScheduled: boolean;
  /** At least one Auto-DM rule exists for this user (any status). */
  automationCreated: boolean;
};

type Step = { label: string; detail: string; href: string; done: boolean };

// First-session checklist for the dashboard. Completed steps are derived on the
// server from existing account and post data; the whole card hides once every
// step is done.
export default function FirstSessionChecklist({ connected, postCreated, postScheduled, automationCreated }: FirstSessionChecklistProps) {
  const steps: Step[] = [
    { label: "Connect a channel", detail: "Pick a network in the Connect window: one click, then approve on the network's own screen.", href: "/app#connect", done: connected },
    { label: "Create a post", detail: "Compose a caption and add media.", href: "/app/publish#new", done: postCreated },
    { label: "Schedule it", detail: "Pick a date and time on the calendar.", href: "/app/publish", done: postScheduled },
    { label: "Create an auto-DM rule", detail: "Turn a comment or keyword into an automatic DM.", href: "/app/auto-dm", done: automationCreated },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;
  const firstOpen = steps.findIndex((s) => !s.done);

  return (
    <section className={home.fsc} aria-labelledby="first-session-heading">
      <div className={home.fscHead}>
        <svg className={home.fscArt} viewBox="0 0 88 72" aria-hidden="true" role="presentation" focusable="false">
          <path
            d="M46 4l1.4 3.2L50.6 8.6l-3.2 1.4L46 13.2l-1.4-3.2-3.2-1.4 3.2-1.4z"
            fill="var(--poskoo-lime)"
          />
          <rect x="4" y="8" width="44" height="58" rx="9" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" strokeWidth="1.5" />
          <rect x="11" y="15" width="30" height="19" rx="4" fill="var(--poskoo-violet)" opacity="0.16" />
          <circle cx="18" cy="21.5" r="2.4" fill="var(--poskoo-coral)" />
          <path
            d="M12 32l7.5-7.5 5 5 4.5-4.5 6 6"
            stroke="var(--poskoo-violet)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.7"
          />
          <rect x="11" y="40" width="24" height="4.5" rx="2.25" fill="var(--poskoo-line)" />
          <rect x="11" y="48" width="18" height="4.5" rx="2.25" fill="var(--poskoo-line)" />
          <rect x="11" y="56" width="12" height="4.5" rx="2.25" fill="var(--poskoo-lime)" />
          <rect x="52" y="14" width="32" height="31" rx="7" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" strokeWidth="1.5" />
          <path d="M52 21a7 7 0 017-7h18a7 7 0 017 7v3H52z" fill="var(--poskoo-violet)" />
          <circle cx="60" cy="31" r="2.2" fill="var(--poskoo-line)" />
          <circle cx="68" cy="31" r="2.2" fill="var(--poskoo-line)" />
          <rect x="73" y="28.5" width="8" height="7" rx="2" fill="var(--poskoo-coral)" />
          <circle cx="60" cy="39" r="2.2" fill="var(--poskoo-line)" />
          <circle cx="68" cy="39" r="2.2" fill="var(--poskoo-line)" />
          <circle cx="71" cy="56" r="11" fill="var(--poskoo-green)" />
          <path
            d="M65.5 56l3.8 3.8 7-8"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <div className={home.fscHeadText}>
          <h2 id="first-session-heading" className={home.fscTitle}>
            Your first session
          </h2>
          <p className={home.fscSub}>
            {doneCount} of {steps.length} done — your first post is close.
          </p>
        </div>
      </div>
      <div
        className={home.fscProgress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={doneCount}
        aria-label="First session progress"
      >
        <div className={home.fscFill} style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ol className={home.fscSteps}>
        {steps.map((step, index) => (
          <li key={step.label} className={home.fscStep}>
            <span className={`${home.fscDot} ${step.done ? home.fscDotDone : ""}`} aria-hidden="true">
              {step.done ? <Check width={13} height={13} /> : index + 1}
            </span>
            <span className="sr-only">{step.done ? "Completed: " : ""}</span>
            <span className={home.fscStepText}>
              {step.done ? (
                <span className={home.fscLabelDone}>{step.label}</span>
              ) : (
                <Link href={step.href} className={home.fscLink}>
                  {step.label}
                </Link>
              )}
              <span className={home.fscDetail}>{step.detail}</span>
            </span>
            {index === firstOpen && <span className={home.fscNext}>Next</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
