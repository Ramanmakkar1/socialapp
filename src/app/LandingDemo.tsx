"use client";

import Link from "next/link";
import { AnimArt } from "@/components/AnimArt";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

const tabs = [
  { id: "schedule", label: "Schedule a post" },
  { id: "dm", label: "Turn a comment into a lead" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SchedulePreview() {
  return (
    <div
      className="demoPanel demoScene"
      id="schedule-panel"
      role="tabpanel"
      aria-labelledby="schedule-tab"
      tabIndex={0}
    >
      <AnimArt name="demo-schedule" label="A creator relaxes in a beanbag with a coffee while a weekly calendar of posts publishes on its own." />
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
      <AnimArt name="demo-dm" label="A LINK comment on a post sends a paper-plane DM with a link to a happy follower, who is saved in a box of new leads." />
      <div className="demoChip chipA"><span className="dot" style={{ background: "var(--peach)" }} aria-hidden="true" />riya.makes: &ldquo;LINK please! 😍&rdquo;</div>
      <div className="demoChip chipB"><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>Example: new lead saved</div>
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
        <p className="eyebrow">Two workflows, one app</p>
        <h2>From scheduled post to <em className="s mark">new lead</em></h2>
        <p>Switch between two sample workflows: plan a post on your calendar, then turn a keyword comment into a DM conversation.</p>
        <div className="demoTabs" role="tablist" aria-label="Product demo">
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
        {activeTab === "schedule" ? <SchedulePreview /> : <CommentPreview />}
      </div>
    </div>
  );
}
