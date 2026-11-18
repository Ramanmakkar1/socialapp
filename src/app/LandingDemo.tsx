"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

const tabs = [
  { id: "schedule", label: "Schedule post" },
  { id: "dm", label: "Keyword comment" },
  { id: "lead", label: "Captured lead" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function ConversionArt({ activeStep }: { activeStep: TabId }) {
  const steps = [
    { id: "schedule", label: "Schedule post", x: 20 },
    { id: "dm", label: "Keyword comment", x: 215 },
    { id: "lead", label: "Captured lead", x: 410 },
  ] as const;

  return (
    <svg
      viewBox="0 0 600 380"
      width="600"
      height="380"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flexBasis: "100%", width: "100%", height: "auto" }}
    >
      <rect x="1" y="1" width="598" height="378" rx="30" fill="var(--card)" stroke="var(--line)" />
      <text x="300" y="40" textAnchor="middle" fill="var(--muted)" fontSize="12" fontWeight="700" letterSpacing="1.2">
        ONE POST. ONE CONVERSATION. ONE NEW LEAD.
      </text>
      <path d="M190 200H207M201 194L207 200L201 206M385 200H402M396 194L402 200L396 206" fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {steps.map((step, index) => {
        const active = activeStep === step.id;
        return (
          <g key={step.id} opacity={active ? 1 : 0.58}>
            <rect x={step.x} y="76" width="170" height="252" rx="22" fill="var(--card)" stroke={active ? "var(--violet)" : "var(--line)"} strokeWidth={active ? 3 : 1.5} />
            <circle cx={step.x + 28} cy="108" r="16" fill={active ? "var(--violet)" : "var(--mint)"} />
            <text x={step.x + 28} y="113" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="800">{index + 1}</text>
            <text x={step.x + 52} y="112" fill="var(--muted)" fontSize="10" fontWeight="700">STEP {index + 1}</text>
            <text x={step.x + 20} y="154" fill="var(--ink)" fontSize="17" fontWeight="750">{step.label}</text>
            {step.id === "schedule" && (
              <>
                <rect x={step.x + 20} y="176" width="130" height="78" rx="14" fill="var(--mint)" />
                <path d={`M${step.x + 38} 188V200M${step.x + 132} 188V200`} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
                <text x={step.x + 32} y="219" fill="var(--muted)" fontSize="11" fontWeight="700">THURSDAY</text>
                <text x={step.x + 32} y="241" fill="var(--ink)" fontSize="18" fontWeight="750">9:00 AM</text>
                <text x={step.x + 85} y="294" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700">Post queued</text>
              </>
            )}
            {step.id === "dm" && (
              <>
                <rect x={step.x + 20} y="176" width="130" height="65" rx="16" fill="var(--peach)" />
                <path d={`M${step.x + 40} 239L${step.x + 34} 249L${step.x + 53} 241`} fill="var(--peach)" />
                <text x={step.x + 85} y="203" textAnchor="middle" fill="var(--muted)" fontSize="10" fontWeight="700">NEW COMMENT</text>
                <text x={step.x + 85} y="225" textAnchor="middle" fill="var(--ink)" fontSize="16" fontWeight="750">LINK please!</text>
                <path d={`M${step.x + 45} 278H${step.x + 117}M${step.x + 107} 268L${step.x + 117} 278L${step.x + 107} 288`} fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <text x={step.x + 85} y="311" textAnchor="middle" fill="var(--ink)" fontSize="12" fontWeight="700">Auto-DM sent</text>
              </>
            )}
            {step.id === "lead" && (
              <>
                <circle cx={step.x + 85} cy="204" r="34" fill="var(--mint)" />
                <circle cx={step.x + 85} cy="196" r="10" fill="none" stroke="var(--ink)" strokeWidth="2" />
                <path d={`M${step.x + 65} 222C${step.x + 69} 207 ${step.x + 101} 207 ${step.x + 105} 222`} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
                <text x={step.x + 85} y="267" textAnchor="middle" fill="var(--ink)" fontSize="16" fontWeight="750">New contact</text>
                <text x={step.x + 85} y="294" textAnchor="middle" fill="var(--muted)" fontSize="12" fontWeight="650">Email captured</text>
                <circle cx={step.x + 137} cy="183" r="12" fill="var(--violet)" />
                <path d={`M${step.x + 132} 183L${step.x + 136} 187L${step.x + 143} 179`} fill="none" stroke="var(--card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </g>
        );
      })}
      <text x="300" y="358" textAnchor="middle" fill="var(--muted)" fontSize="12" fontWeight="600">A simple flow from content to customer</text>
    </svg>
  );
}

function SchedulePreview() {
  return (
    <div
      className="demoPanel demoScene"
      id="schedule-panel"
      role="tabpanel"
      aria-labelledby="schedule-tab"
      tabIndex={0}
    >
      <ConversionArt activeStep="schedule" />
      <span className="sr-only">Step 1: schedule a post for Thursday at 9:00 AM.</span>
      <div className="demoChip chipA"><span className="dot" style={{ background: "var(--violet)" }} aria-hidden="true" />Example: scheduled for Thu 9:00 AM</div>
      <div className="demoChip chipB"><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>Example: posted to Instagram</div>
    </div>
  );
}

function CommentPreview() {
  return (
    <div
      className="demoPanel demoScene"
      id="dm-panel"
      role="tabpanel"
      aria-labelledby="dm-tab"
      tabIndex={0}
    >
      <ConversionArt activeStep="dm" />
      <span className="sr-only">Step 2: a LINK comment automatically sends a DM with your link.</span>
      <div className="demoChip chipA"><span className="dot" style={{ background: "var(--peach)" }} aria-hidden="true" />riya.makes: &ldquo;LINK please! 😍&rdquo;</div>
      <div className="demoChip chipB"><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>Example: auto-DM sent</div>
    </div>
  );
}

function LeadPreview() {
  return (
    <div
      className="demoPanel demoScene"
      id="lead-panel"
      role="tabpanel"
      aria-labelledby="lead-tab"
      tabIndex={0}
    >
      <ConversionArt activeStep="lead" />
      <span className="sr-only">Step 3: the follower&rsquo;s email is captured and saved as a new lead.</span>
      <div className="demoChip chipA"><span className="dot" style={{ background: "var(--violet)" }} aria-hidden="true" />Example: email captured</div>
      <div className="demoChip chipB"><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>New lead ready to follow up</div>
    </div>
  );
}

/** `hideLink`: leave out the feature link that points at the page the demo sits on. */
export function LandingDemo({ hideLink }: { hideLink?: "/instagram-scheduler" | "/instagram-auto-dm" | "/social-media-scheduler" } = {}) {
  const [activeTab, setActiveTab] = useState<TabId>("schedule");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function activateTab(index: number) {
    setActiveTab(tabs[index].id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      activateTab(nextIndex);
    }
  }

  return (
    <div className="band landingDemo">
      <div className="copy">
        <p className="eyebrow">Three steps, one app</p>
        <h2>From scheduled post to <em className="s mark">new lead</em></h2>
        <p>Follow one sample workflow: schedule a post, turn a keyword comment into an automatic DM, and capture the lead.</p>
        <div className="demoTabs" role="tablist" aria-label="Scheduler to lead demo" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {tabs.map((tab, index) => (
            <button
              className="demoTab"
              id={`${tab.id}-tab`}
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              ref={(node) => { tabRefs.current[index] = node; }}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="demoActions">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
        </div>
        <div className="demoLinks">
          {hideLink !== "/instagram-scheduler" && <Link className="demoFeatureLink" href="/instagram-scheduler">Explore the Instagram scheduler <span aria-hidden="true">→</span></Link>}
          {hideLink !== "/instagram-auto-dm" && <Link className="demoFeatureLink" href="/instagram-auto-dm">See Instagram comment-to-DM automation <span aria-hidden="true">→</span></Link>}
        </div>
      </div>
      <div className="demoStage">
        <p className="demoNote">Illustrative demo · sample content only</p>
        {activeTab === "schedule" ? <SchedulePreview /> : activeTab === "dm" ? <CommentPreview /> : <LeadPreview />}
      </div>
    </div>
  );
}
