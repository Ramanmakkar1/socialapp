"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

const tabs = [
  { id: "schedule", label: "Schedule a post" },
  { id: "dm", label: "Turn a comment into a lead" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const calendarDays = [
  { weekday: "Mon", date: 15 },
  { weekday: "Tue", date: 16 },
  { weekday: "Wed", date: 17 },
  { weekday: "Thu", date: 18, scheduled: true },
  { weekday: "Fri", date: 19 },
  { weekday: "Sat", date: 20 },
  { weekday: "Sun", date: 21 },
];

function SchedulePreview() {
  return (
    <div
      className="demoPanel scheduleDemo"
      id="schedule-panel"
      role="tabpanel"
      aria-labelledby="schedule-tab"
      tabIndex={0}
    >
      <div className="calendarCard">
        <div className="calendarTop">
          <div>
            <span className="previewLabel">Example calendar</span>
            <h3>September</h3>
          </div>
          <span className="scheduleTime">9:00 AM</span>
        </div>
        <ol className="calendarWeek" aria-label="Example week, September 15 to 21">
          {calendarDays.map((day) => (
            <li
              className={day.scheduled ? "calendarDay hasPost" : "calendarDay"}
              key={day.date}
              aria-label={day.scheduled ? "Thursday 18, one example post scheduled" : undefined}
            >
              <span className="calendarDow">{day.weekday}</span>
              <span className="calendarDate">{day.date}</span>
              {day.scheduled ? <span className="calendarMarker" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
        <p className="scheduledSlot"><span aria-hidden="true" />Example post · Thu 18, 9:00 AM</p>
      </div>

      <div className="postPreview">
        <span className="previewLabel">Example Instagram post</span>
        <div className="postAuthor"><span className="av" aria-hidden="true" />riya.makes</div>
        <div className="postArt">
          <svg viewBox="0 0 240 150" width="240" height="150" role="img" aria-label="Abstract sunrise artwork for the example post">
            <defs>
              <linearGradient id="demo-post-background" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--lilac)" />
                <stop offset="1" stopColor="var(--pink)" />
              </linearGradient>
            </defs>
            <rect width="240" height="150" rx="16" fill="url(#demo-post-background)" />
            <circle cx="174" cy="48" r="28" fill="var(--lime)" />
            <path d="M0 126 62 62l42 38 40-32 96 70v12H0z" fill="var(--violet)" opacity=".78" />
            <path d="M0 136 70 96l48 30 46-22 76 38v8H0z" fill="var(--coral)" opacity=".85" />
            <path d="m38 30 4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="var(--card)" />
          </svg>
        </div>
        <p className="postCaption">New week, new ideas. Comment LINK for the guide. ✨</p>
        <span className="exampleStatus">Example schedule · Thursday, 9:00 AM</span>
      </div>
    </div>
  );
}

function CommentPreview() {
  return (
    <div
      className="demoPanel demo"
      id="dm-panel"
      role="tabpanel"
      aria-labelledby="dm-tab"
      tabIndex={0}
      aria-label="Illustrative example: a comment, an automatic DM, and a saved lead"
    >
      <div className="ui c1">
        <div className="who"><span className="av" style={{ background: "var(--peach)" }} aria-hidden="true" />riya.makes <span className="t">sample</span></div>
        <p style={{ marginTop: "6px" }}>LINK please! 😍</p>
      </div>
      <svg className="arrow-doodle" viewBox="0 0 70 60" aria-hidden="true"><path d="M8 8c10 30 30 40 52 42" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeDasharray="5 6" strokeLinecap="round" /><path d="M50 42l11 8-13 3" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="ui c2">
        <div className="who" style={{ color: "#fff" }}>Example Poskoo DM</div>
        <p style={{ marginTop: "6px" }}>Hey Riya! Here&apos;s the guide you asked for. Want my weekly tips too?</p>
        <span className="linkbtn">Open the guide</span>
      </div>
      <div className="ui c3">
        <div className="ok"><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>Example: new lead saved</div>
        <p className="t" style={{ marginTop: "4px" }}>riya@studio.co · from your Reel</p>
      </div>
    </div>
  );
}

export function LandingDemo() {
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
        <h2>From scheduled post to <em className="s mark">new lead.</em></h2>
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
          <Link className="demoFeatureLink" href="/instagram-scheduler">Explore the Instagram scheduler <span aria-hidden="true">→</span></Link>
          <Link className="demoFeatureLink" href="/instagram-auto-dm">See Instagram comment-to-DM automation <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <div className="demoStage">
        <p className="demoNote">Illustrative demo · sample content only</p>
        {activeTab === "schedule" ? <SchedulePreview /> : <CommentPreview />}
      </div>
    </div>
  );
}
