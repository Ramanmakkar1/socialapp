"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AtSign, BarChart3, CalendarDays, ChevronRight, Facebook, Instagram, Youtube } from "lucide-react";
import { NEW_NETWORK_ICON } from "@/components/brandIcons";
import { channelHref, type SidebarChannel } from "@/lib/sidebarChannelsShared";
import styles from "./shell.module.css";

const CHANNEL_ICON: Record<string, typeof Instagram> = { instagram: Instagram, facebook: Facebook, threads: AtSign, youtube: Youtube, ...NEW_NETWORK_ICON };

function Avatar({ c }: { c: SidebarChannel }) {
  const Icon = CHANNEL_ICON[c.platform] ?? AtSign;
  return (
    <span className={styles.channelAvatar} aria-hidden="true">
      {c.name.replace(/^@/, "").slice(0, 1).toUpperCase()}
      <span className={`${styles.channelBadge} ${styles[`badge_${c.platform}`] ?? ""}`}><Icon width={9} height={9} /></span>
    </span>
  );
}

// "Channels · N": one row per connected account (avatar + network badge, name, scheduled count).
// A row opens to that channel's Publish (queue / drafts / sent) and Insights; the open row follows the route.
export default function SidebarChannels({
  channels,
  reconnectHrefs,
  connect,
}: {
  channels: SidebarChannel[];
  /** platform -> one-click reconnect URL, for rows that are not active. */
  reconnectHrefs: Record<string, string>;
  /** The "Connect a channel" dialog trigger (server-rendered). */
  connect: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  return (
    <section className={styles.channels} aria-labelledby="sidebar-channels">
      <p id="sidebar-channels" className={styles.channelsTitle}>
        <span>Channels</span>
        {channels.length > 0 && <span className={styles.channelsCount}>· {channels.length}</span>}
      </p>
      <ul className={styles.channelList}>
        {channels.map((c, i) => {
          const ok = c.status === "active";
          const key = c.id ?? `${c.platform}-${i}`;
          if (!ok) {
            return (
              <li key={key}>
                {/* Reconnect = the same one-click connect as the Connect dialog (full navigation). */}
                <a href={reconnectHrefs[c.platform] ?? "/app/settings"} className={styles.channel} title={`${c.name} needs to be reconnected`}>
                  <Avatar c={c} />
                  <span className={styles.channelName}>{c.name}</span>
                  <span className={styles.channelWarn}>Reconnect</span>
                </a>
              </li>
            );
          }
          const href = channelHref(c);
          // Insights splits posts and growth per connected account (?account=<social_accounts id>).
          const insightsHref = c.id && !c.id.startsWith("yt-") ? `/app/insights?account=${encodeURIComponent(c.id)}` : "/app/insights";
          const here = Boolean(c.slug) && pathname === href;
          return (
            <li key={key}>
              <details className={styles.channelItem} open={here || undefined}>
                <summary className={`${styles.channel} ${here ? styles.channelActive : ""}`} title={`${c.name} · ${c.platform}`}>
                  <Avatar c={c} />
                  <span className={styles.channelName}>{c.name}</span>
                  {c.scheduled > 0 && <span className={styles.channelCount} aria-label={`${c.scheduled} scheduled`}>{c.scheduled}</span>}
                  <ChevronRight width={14} height={14} aria-hidden="true" className={styles.channelChevron} />
                </summary>
                <div className={styles.channelSub}>
                  <Link href={href} className={styles.channelSubItem} aria-current={here ? "page" : undefined}>
                    <CalendarDays width={15} height={15} aria-hidden="true" />
                    <span className={styles.navLabel}>Publish</span>
                    {c.scheduled > 0 && <span className={styles.channelCount}>{c.scheduled}</span>}
                  </Link>
                  <Link href={insightsHref} className={styles.channelSubItem}>
                    <BarChart3 width={15} height={15} aria-hidden="true" />
                    <span className={styles.navLabel}>Insights</span>
                  </Link>
                </div>
              </details>
            </li>
          );
        })}
        <li className={styles.channelConnect}>{connect}</li>
      </ul>
    </section>
  );
}
