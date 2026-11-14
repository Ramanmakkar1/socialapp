import type { ReactNode } from "react";
import Link from "next/link";
import { Flame, Hash, Info } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { planForUser } from "@/lib/planLimits";
import { accountWeek, isStale, scoreTrends, trendWatchLimit, type TrendMediaInput } from "@/lib/trends";
import { listTrendMedia, listWatches, trendConnection, type TrendConnection, type WatchRow } from "@/lib/trendsData";
import LoadFailed from "../calendar/LoadFailed";
import RefreshControls from "./RefreshControls";
import TrendsBoard from "./TrendsBoard";
import WatchPanel, { type WatchView } from "./WatchPanel";
import styles from "./trends.module.css";

export const metadata = {
  title: "Trends",
  description: "Top Reels of the week from the Instagram Business and Creator accounts you watch, ranked by engagement.",
};

const CONNECT_HREF = "/api/instagram/connect?via=facebook";

function Header({ refresh }: { refresh?: ReactNode }) {
  return (
    <header className={styles.head}>
      <span className={styles.headIcon} aria-hidden="true"><Flame width={20} height={20} /></span>
      <div className={styles.headText}>
        <h1 className={styles.h1}>Trends</h1>
        <p className={styles.sub}>What&apos;s working this week for the Instagram accounts you watch</p>
      </div>
      {refresh}
    </header>
  );
}

function ConnectBanner({ connection }: { connection: TrendConnection }) {
  if (connection.state === "ready") return null;
  const copy =
    connection.state === "expired"
      ? {
          title: "Reconnect Instagram via Facebook to update trends",
          text: `The Facebook connection for${connection.username ? ` @${connection.username}` : " your Instagram account"} has expired. Reconnect it and watched accounts refresh again.`,
          cta: "Reconnect via Facebook",
        }
      : connection.state === "instagram_login_only"
        ? {
            title: "Trends needs Instagram connected via Facebook",
            text: `${connection.username ? `@${connection.username} is` : "Your Instagram account is"} connected with Instagram Login. Meta only lets apps look up other accounts (Business Discovery) through an Instagram professional account linked to a Facebook Page and connected with Facebook Login. Your current connection keeps working for posting and Auto-DM.`,
            cta: "Connect Instagram via Facebook",
          }
        : {
            title: "Connect Instagram to see trends",
            text: "Connect your Instagram Business or Creator account through Facebook (it must be linked to a Facebook Page). We use it only to read public numbers of the accounts you choose to watch.",
            cta: "Connect Instagram via Facebook",
          };
  return (
    <div className={`${styles.banner} ${connection.state === "expired" ? styles.bannerWarn : ""}`} role="note">
      <div className={styles.bannerText}>
        <b>{copy.title}</b>
        <p>{copy.text}</p>
      </div>
      {/* Plain <a>: an OAuth redirect route, must not be prefetched. */}
      <a href={CONNECT_HREF} className={styles.primary}>{copy.cta}</a>
    </div>
  );
}

function toWatchViews(watches: WatchRow[], media: TrendMediaInput[], now: number): WatchView[] {
  const byUser = new Map<string, TrendMediaInput[]>();
  for (const m of media) {
    const list = byUser.get(m.username) ?? [];
    list.push(m);
    byUser.set(m.username, list);
  }
  return watches.map((w) => {
    const week = accountWeek(byUser.get(w.username) ?? [], now);
    return {
      id: w.id,
      username: w.username,
      name: w.name,
      profilePictureUrl: w.profile_picture_url,
      followers: w.followers_count,
      followersChange: w.followers_count !== null && w.followers_week_ago !== null ? w.followers_count - w.followers_week_ago : null,
      postsThisWeek: week.postsThisWeek,
      avgEngagement: week.avgEngagementThisWeek,
      changePct: week.changePct,
      fetchedAt: w.fetched_at ? new Date(w.fetched_at).toISOString() : null,
      attempted: w.attempted_at !== null,
      error: w.error_kind ? w.error_message : null,
    };
  });
}

export default async function TrendsPage() {
  const user = await requireUser();
  let connection: TrendConnection = { state: "none" };
  let watches: WatchRow[] = [];
  let media: TrendMediaInput[] = [];
  let plan: Awaited<ReturnType<typeof planForUser>> = "Free";
  if (isDbConfigured()) {
    try {
      [connection, watches, media, plan] = await Promise.all([
        trendConnection(user.id),
        listWatches(user.id),
        listTrendMedia(user.id),
        planForUser(user.id),
      ]);
    } catch {
      return (
        <div className={styles.page}>
          <Header />
          <LoadFailed className="mt-6" message="Trends could not be loaded. Reload to try again." reloadHref="/app/trends" />
        </div>
      );
    }
  }
  // eslint-disable-next-line react-hooks/purity -- server component: "now" is the request time
  const now = Date.now();
  const items = scoreTrends(media, now);
  const limit = trendWatchLimit(plan);
  const canRead = connection.state === "ready";
  const anyStale = watches.some((w) => isStale(w.attempted_at, now));

  return (
    <div className={styles.page}>
      <Header refresh={watches.length > 0 ? <RefreshControls autoRefresh={canRead && anyStale} disabled={!canRead} /> : undefined} />
      <ConnectBanner connection={connection} />
      <div className={styles.layout}>
        <TrendsBoard items={items} hasWatches={watches.length > 0} />
        <div className={styles.side}>
          <WatchPanel watches={toWatchViews(watches, media, now)} limit={limit} plan={plan} canRead={canRead} />
          <section className={styles.card} aria-labelledby="trends-hashtags">
            <div className={styles.soon}>
              <span className={styles.soonIcon} aria-hidden="true"><Hash width={16} height={16} /></span>
              <div>
                <h2 id="trends-hashtags" className={styles.h2}>Hashtag trends <span className={styles.soonPill}>Needs Meta approval</span></h2>
                <p className={styles.note}>Top posts for a hashtag need Meta&apos;s hashtag search permission, which Poskoo has applied for. Until then, you can find hashtags for your next post with our free <Link href="/tools/instagram-hashtag-generator" target="_blank" rel="noopener" className="underline font-medium">Instagram hashtag generator</Link>.</p>
              </div>
            </div>
          </section>
          <section className={styles.card} aria-labelledby="trends-about">
            <div className={styles.soon}>
              <span className={styles.soonIcon} aria-hidden="true"><Info width={16} height={16} /></span>
              <div>
                <h2 id="trends-about" className={styles.h2}>Where these numbers come from</h2>
                <p className={styles.note}>
                  Likes, comments and followers come from Instagram&apos;s public business data (Meta&apos;s Business Discovery API) for the accounts you watch, read through your own connected account and refreshed about every 6 hours. Only Business and Creator accounts can be read. Views, saves, shares and trending audio aren&apos;t available, so we don&apos;t show them.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
