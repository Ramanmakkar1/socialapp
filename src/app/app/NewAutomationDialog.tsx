"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, X } from "lucide-react";
import styles from "./newAutomation.module.css";

type Card = {
  trigger: "comment" | "story_reply" | "dm";
  label: string;
  title: string;
  text: string;
  tone: string;
  mock: "comment" | "story" | "keyword";
};

// All three triggers exist in the rule model (dm_rules.triggers: comment, story_reply, dm).
const CARDS: Card[] = [
  { trigger: "comment", label: "Comments", title: "DM on post or reel", text: "When someone comments a keyword on your post or reel.", tone: styles.lime, mock: "comment" },
  { trigger: "story_reply", label: "Stories", title: "DM on story", text: "When someone replies to your story.", tone: styles.blue, mock: "story" },
  { trigger: "dm", label: "Keywords", title: "DM on keyword", text: "When someone sends you a DM with a keyword.", tone: styles.pink, mock: "keyword" },
];

function Mock({ kind }: { kind: Card["mock"] }) {
  if (kind === "comment") {
    return (
      <div className={styles.mock} aria-hidden="true">
        <span className={styles.mockPost} />
        <span className={styles.mockComment}><i />jane: <b>LINK</b></span>
        <span className={styles.mockDm}>Here you go 👉</span>
      </div>
    );
  }
  if (kind === "story") {
    return (
      <div className={styles.mock} aria-hidden="true">
        <span className={styles.mockStory}><span /></span>
        <span className={styles.mockComment}><i />Reply: <b>🔥</b></span>
        <span className={styles.mockDm}>Thanks! Your link…</span>
      </div>
    );
  }
  return (
    <div className={styles.mock} aria-hidden="true">
      <span className={styles.mockIn}>PRICE?</span>
      <span className={styles.mockDm}>Our price list 👉</span>
      <span className={styles.mockIn}>thanks!</span>
    </div>
  );
}

// "Start a new automation" chooser. Each card opens the builder at /app/auto-dm?trigger=<trigger>.
export default function NewAutomationDialog({ label = "New Auto-DM", className }: { label?: string; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  function start(trigger: Card["trigger"]) {
    ref.current?.close();
    router.push(`/app/auto-dm?trigger=${trigger}`);
  }

  return (
    <>
      <button type="button" className={className ?? styles.trigger} aria-haspopup="dialog" onClick={() => ref.current?.showModal()}>
        <Plus width={16} height={16} aria-hidden="true" /> {label}
      </button>
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby="new-automation-title"
        aria-describedby="new-automation-sub"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className={styles.inner}>
          <div className={styles.head}>
            <div>
              <h2 id="new-automation-title" className={styles.title}>Start a new Auto-DM</h2>
              <p id="new-automation-sub" className={styles.sub}>Choose what triggers it, or pick a ready-made template</p>
            </div>
            <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Close">
              <X width={18} height={18} aria-hidden="true" />
            </button>
          </div>
          <ul className={styles.grid}>
            {CARDS.map((c) => (
              <li key={c.trigger}>
                <button type="button" className={styles.card} onClick={() => start(c.trigger)}>
                  <span className={`${styles.art} ${c.tone}`}><Mock kind={c.mock} /></span>
                  <span className={styles.label}>{c.label}</span>
                  <span className={styles.cardTitle}>{c.title}</span>
                  <span className={styles.cardText}>{c.text}</span>
                  <span className={styles.start}>Start here <ArrowRight width={14} height={14} aria-hidden="true" /></span>
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.foot}>
            <Link href="/app/templates" onClick={() => ref.current?.close()}>Browse templates →</Link>
          </p>
        </div>
      </dialog>
    </>
  );
}
