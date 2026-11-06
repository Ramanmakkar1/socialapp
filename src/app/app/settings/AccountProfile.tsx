import { GraphError, fetchIgProfile, type GraphAccount } from "@/lib/igGraph";

// Connected-account card details from Instagram (instagram_business_basic): avatar, name, followers, posts.
export default async function AccountProfile({ account, fallbackUsername }: { account: GraphAccount; fallbackUsername: string | null }) {
  let profile: Awaited<ReturnType<typeof fetchIgProfile>> | null = null;
  let error: string | null = null;
  try {
    profile = await fetchIgProfile(account);
  } catch (err) {
    error = err instanceof GraphError ? err.message : "Profile is not available right now.";
  }
  const username = profile?.username || fallbackUsername || "unknown";
  return (
    <div className="flex min-w-0 items-center gap-3">
      {profile?.profilePictureUrl ? (
        // Instagram CDN URLs expire, so a plain <img> (no Next image cache) is used on purpose.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.profilePictureUrl} alt={`@${username} profile picture`} width={44} height={44} className="h-11 w-11 shrink-0 rounded-full border border-[var(--poskoo-line)] object-cover" />
      ) : (
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--poskoo-band)] font-semibold text-[var(--poskoo-violet)]">
          {username.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--poskoo-ink)]">@{username}{profile?.name ? <span className="ml-2 font-normal text-[var(--poskoo-muted)]">{profile.name}</span> : null}</p>
        {profile ? (
          <p className="text-xs text-[var(--poskoo-muted)]">
            {(profile.followers ?? 0).toLocaleString("en-US")} followers · {(profile.mediaCount ?? 0).toLocaleString("en-US")} posts
          </p>
        ) : (
          <p className="text-xs text-[var(--poskoo-coral)]">{error}</p>
        )}
      </div>
    </div>
  );
}
