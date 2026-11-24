import Link from "next/link";
import { isDbConfigured, query } from "@/lib/db";
import { GraphError, type AccountInsights, type GraphAccount, type IgProfile } from "@/lib/igGraph";
import { cachedAccountInsights, cachedIgProfile } from "@/lib/igCached";
import styles from "./insights/analytics.module.css";

type Row = GraphAccount & { username: string | null };

type Loaded = { row: Row; profile: IgProfile | null; insights: AccountInsights | null; error: string | null };

function num(v: number | null | undefined): string {
  return v == null ? "—" : v.toLocaleString("en-US");
}

// Instagram account-level insights for the last 7 days (instagram_business_manage_insights + basic profile).
export default async function AccountInsightsPanel({ userId }: { userId: string }) {
  if (!isDbConfigured()) return null;
  let rows: Row[] = [];
  try {
    rows = await query<Row>(
      "select id, external_id, access_token_enc, auth_type, username from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active' order by created_at limit 5",
      [userId]
    );
  } catch {
    return null;
  }
  if (rows.length === 0) return null;
  const loaded: Loaded[] = await Promise.all(
    rows.map(async (row) => {
      try {
        const [profile, insights] = await Promise.all([cachedIgProfile(row), cachedAccountInsights(row)]);
        return { row, profile, insights, error: null };
      } catch (err) {
        return { row, profile: null, insights: null, error: err instanceof GraphError ? err.message : "Instagram insights are not available right now." };
      }
    })
  );
  return (
    <div className={`${styles.panel} ${styles.pink}`}>
      <h2>Instagram account (last 7 days)</h2>
      <p className={styles.subtle}>Live numbers from Instagram Insights.</p>
      <ul className="mt-4 space-y-4">
        {loaded.map(({ row, profile, insights, error }) => (
          <li key={row.id}>
            <p className="font-medium">@{profile?.username || row.username || "instagram"}</p>
            {error ? (
              <p className="mt-1 text-sm text-[var(--poskoo-coral)]">
                {error}{" "}
                <Link href="/app/settings" className="font-semibold text-[var(--poskoo-violet)] hover:underline">Settings</Link>
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {(
                  [
                    ["Followers", profile?.followers],
                    ["Reach", insights?.reach],
                    ["Accounts engaged", insights?.accountsEngaged],
                    ["Interactions", insights?.totalInteractions],
                    ["Profile views", insights?.profileViews],
                  ] as [string, number | null | undefined][]
                ).map(([label, value]) => (
                  <div key={label} className={`${styles.statCard} ${styles.lilac}`}>
                    <div className="text-xs text-[var(--poskoo-muted)]">{label}</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">{num(value)}</div>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
