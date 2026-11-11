import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GraphAccount } from "@/lib/igGraph";
import { cachedIgProfile, cachedRecentMedia } from "@/lib/igCached";
import { ruleMatchesMedia } from "@/lib/ruleMedia";
import TodaysActions from "./TodaysActions";
import home from "./home.module.css";

// Home parts that need the Instagram Graph API. Each one is rendered behind <Suspense>, so the page shell
// (welcome band, snapshot, automations, up next) never waits for Meta; the reads are cached for a short time.

export type HomeIgAccount = GraphAccount & { username: string | null };

/** "Today's actions": latest posts/reels with whether a comment automation covers each. */
export async function TodaysActionsFeed({
  account,
  scopes,
  hasAnyAccount,
  fallbackHandle,
}: {
  account: HomeIgAccount | null;
  scopes: { media_ids: string[] }[];
  hasAnyAccount: boolean;
  fallbackHandle: string | null;
}) {
  if (!account) {
    return (
      <div className={home.emptyCard}>
        {hasAnyAccount ? (
          <p>Instagram needs you to reconnect before your latest posts can load. <Link href="/api/instagram/connect" prefetch={false}>Reconnect Instagram</Link></p>
        ) : (
          <p>Connect Instagram to see your latest posts here. <Link href="/api/instagram/connect" prefetch={false}>Connect Instagram</Link></p>
        )}
      </div>
    );
  }
  const [p, m] = await Promise.allSettled([cachedIgProfile(account), cachedRecentMedia(account, 25)]);
  const profile = p.status === "fulfilled" ? p.value : null;
  if (m.status === "rejected") {
    return (
      <div className={home.emptyCard} role="status">
        <p>We couldn&apos;t load your posts from Instagram right now. Try Refresh in a minute.</p>
      </div>
    );
  }
  if (m.value.length === 0) {
    return (
      <div className={home.emptyCard}>
        <p>No posts yet. Your latest posts and reels will show here.</p>
      </div>
    );
  }
  const username = profile?.username || account.username || fallbackHandle || "instagram";
  return (
    <>
      <TodaysActions
        items={m.value.slice(0, 12).map((item) => ({ ...item, hasRule: scopes.some((rule) => ruleMatchesMedia(rule, item.id)) }))}
        username={username}
        avatarUrl={profile?.profilePictureUrl ?? null}
      />
      {profile?.username && (
        <a href={`https://www.instagram.com/${encodeURIComponent(profile.username)}/`} target="_blank" rel="noopener noreferrer" className={`${home.textLink} ${home.viewAll}`}>
          View all on Instagram <ArrowRight width={14} height={14} aria-hidden="true" />
        </a>
      )}
    </>
  );
}

/** Welcome band avatar: the Instagram profile picture when it loads, else the initial (also the Suspense fallback). */
export function InitialAvatar({ handle }: { handle: string | null }) {
  return (
    <span className={home.bandAvatar} aria-hidden="true">
      {(handle ?? "P").replace(/^@/, "").slice(0, 1).toUpperCase()}
    </span>
  );
}

export async function ProfileAvatar({ account, handle }: { account: HomeIgAccount | null; handle: string | null }) {
  if (!account) return <InitialAvatar handle={handle} />;
  const profile = await cachedIgProfile(account).catch(() => null);
  if (!profile?.profilePictureUrl) return <InitialAvatar handle={handle} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Instagram CDN URLs expire; no image optimizer cache.
    <img src={profile.profilePictureUrl} alt="" className={home.bandAvatar} width={56} height={56} />
  );
}

/** Followers tile value: live count from Instagram, falling back to the last daily snapshot. */
export async function LiveFollowers({ account, snapshot }: { account: HomeIgAccount | null; snapshot: number | null }) {
  const profile = account ? await cachedIgProfile(account).catch(() => null) : null;
  const value = profile?.followers ?? snapshot;
  return <>{value == null ? "–" : value.toLocaleString("en-US")}</>;
}
