"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { AtSign, Facebook, Instagram, Linkedin, Plus, Youtube, X } from "lucide-react";
import styles from "./shell.module.css";

export type ConnectAvailability = {
  /** Instagram (and Facebook Pages through Meta login) need the Meta app keys. */
  instagram: boolean;
  /** Facebook Page publishing comes with the Instagram "Login with Facebook" flow. */
  facebook: boolean;
  threads: boolean;
  youtube: boolean;
};

type Network = {
  id: string;
  name: string;
  sub: string;
  icon: ReactNode;
  href?: string;
  /** Supported by the app, but the server keys are missing. */
  off?: boolean;
  soon?: boolean;
};

// Small inline marks for networks the app does not support yet (no brand icons in lucide).
function Mark({ children }: { children: string }) {
  return <span className={styles.netMarkText} aria-hidden="true">{children}</span>;
}

export function networks(a: ConnectAvailability): Network[] {
  return [
    { id: "instagram", name: "Instagram", sub: "Business or Creator", icon: <Instagram width={22} height={22} aria-hidden="true" />, href: "/api/instagram/connect", off: !a.instagram },
    { id: "facebook", name: "Facebook", sub: "Page", icon: <Facebook width={22} height={22} aria-hidden="true" />, href: "/api/instagram/connect", off: !a.facebook },
    { id: "threads", name: "Threads", sub: "Profile", icon: <AtSign width={22} height={22} aria-hidden="true" />, href: "/api/threads/connect", off: !a.threads },
    { id: "youtube", name: "YouTube", sub: "Channel", icon: <Youtube width={22} height={22} aria-hidden="true" />, href: "/api/youtube/connect", off: !a.youtube },
    { id: "linkedin", name: "LinkedIn", sub: "Page or Profile", icon: <Linkedin width={22} height={22} aria-hidden="true" />, soon: true },
    { id: "tiktok", name: "TikTok", sub: "Business or Creator", icon: <Mark>Tk</Mark>, soon: true },
    { id: "pinterest", name: "Pinterest", sub: "Business", icon: <Mark>P</Mark>, soon: true },
    { id: "bluesky", name: "Bluesky", sub: "Profile", icon: <Mark>Bs</Mark>, soon: true },
    { id: "mastodon", name: "Mastodon", sub: "Profile", icon: <Mark>M</Mark>, soon: true },
  ];
}

// "Connect a New Channel" window (Buffer-style grid of networks). Only networks with a real
// OAuth route are links; the rest are disabled "Coming soon" cards.
export default function ConnectChannelDialog({ availability, label, compact = false }: { availability: ConnectAvailability; label: string; compact?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const list = networks(availability);

  useEffect(() => {
    // Old links to Settings with #connect open the window.
    if (window.location.hash === "#connect") ref.current?.showModal();
  }, []);

  return (
    <>
      <button type="button" className={compact ? styles.connectIconBtn : `${styles.channel} ${styles.channelAdd}`} onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        <span className={styles.channelAvatar} aria-hidden="true"><Plus width={14} height={14} /></span>
        {!compact && <span className={styles.channelName}>{label}</span>}
        {compact && <span className="sr-only">{label}</span>}
      </button>
      <dialog
        ref={ref}
        className={styles.connectDialog}
        aria-labelledby="connect-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className={styles.connectInner}>
          <div className={styles.connectHead}>
            <h2 id="connect-title" className={styles.connectTitle}>Connect a New Channel</h2>
            <button type="button" className={styles.connectClose} onClick={() => ref.current?.close()} aria-label="Close">
              <X width={18} height={18} aria-hidden="true" />
            </button>
          </div>
          {!availability.instagram && (
            <p role="status" className={styles.connectNote}>
              Connecting Instagram is not switched on yet. You can already write posts, save drafts and set up auto-DM rules; they start working once your account is connected.
            </p>
          )}
          <ul className={styles.connectGrid}>
            {list.map((n) => {
              const body = (
                <>
                  <span className={`${styles.connectIcon} ${styles[`netBg_${n.id}`] ?? ""}`}>{n.icon}</span>
                  <span className={styles.connectText}>
                    <b>{n.name}</b>
                    <span>{n.sub}</span>
                    {n.soon && <span className={styles.soonTag}>Coming soon</span>}
                    {!n.soon && n.off && <span className={styles.soonTag}>Not set up yet</span>}
                  </span>
                </>
              );
              return (
                <li key={n.id}>
                  {n.href && !n.off ? (
                    <a href={n.href} className={styles.connectCard}>{body}</a>
                  ) : (
                    <span className={`${styles.connectCard} ${styles.connectCardOff}`} aria-disabled="true">{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className={styles.connectFoot}>Instagram needs a professional (Business or Creator) account. <Link href="/help/getting-started">See the setup steps</Link></p>
        </div>
      </dialog>
    </>
  );
}
