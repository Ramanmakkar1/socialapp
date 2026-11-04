import { Settings } from "lucide-react";
import EmptyState from "../EmptyState";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

type Account = { platform: string; username: string | null; status: string; token_expires_at: Date | null };

const BANNERS: Record<string, { tone: "ok" | "warn"; text: string }> = {
  connected: { tone: "ok", text: "Instagram account connected." },
  error: { tone: "warn", text: "We couldn't connect your Instagram account. Please try again." },
  not_configured: { tone: "warn", text: "Instagram connection isn't set up on this server yet." },
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ig?: string | string[] }> }) {
  const user = await requireUser();
  const { ig } = await searchParams;
  const banner = typeof ig === "string" && Object.hasOwn(BANNERS, ig) ? BANNERS[ig] : null;
  const accounts = isDbConfigured()
    ? await query<Account>(
        "select platform, username, status, token_expires_at from socialapp.social_accounts where user_id=$1 order by created_at",
        [user.id]
      )
    : [];
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Settings</h1><p className="text-sm text-muted">Manage your connected accounts.</p></div>
      {banner && (
        <p className={`mt-4 rounded-xl border px-4 py-2 text-sm ${banner.tone === "ok" ? "border-ok text-ok" : "border-warn text-warn"}`}>{banner.text}</p>
      )}
      <div className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink-2">Connected accounts</h2>
        <a href="/api/instagram/connect" className="btn-primary">Connect Instagram</a>
      </div>
      {accounts.length === 0 ? (
        <EmptyState icon={Settings} title="No connected accounts" text="Connect your Instagram professional account to schedule posts and auto-DM commenters." phase={1} />
      ) : (
        <ul className="mt-4 space-y-3">
          {accounts.map((a, i) => (
            <li key={`${a.platform}-${a.username ?? i}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">@{a.username ?? "unknown"}</span>
                <span className="rounded-full border border-line px-2 text-xs capitalize text-muted">{a.platform}</span>
              </div>
              <div className="text-sm text-ink-2">
                <span className="capitalize">{a.status}</span>
                {a.token_expires_at && (
                  <span className="ml-3 text-muted">Token renews before {new Date(a.token_expires_at).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
