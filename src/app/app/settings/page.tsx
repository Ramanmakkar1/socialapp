import { Settings } from "lucide-react";
import EmptyState from "../EmptyState";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

type Account = { platform: string; username: string | null; status: string; token_expires_at: Date | null };

function tokenState(a: Account): "ok" | "expiring" | "expired" {
  if (a.status === "expired") return "expired";
  if (a.token_expires_at) {
    const exp = new Date(a.token_expires_at).getTime();
    const now = Date.now();
    if (exp < now) return "expired";
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (exp - now <= sevenDaysMs) return "expiring";
  }
  return "ok";
}

const TOKEN_PILL: Record<ReturnType<typeof tokenState>, { label: string; className: string }> = {
  ok: { label: "Connected", className: "rounded-full border border-ok px-2.5 py-0.5 text-xs font-medium text-ok" },
  expiring: { label: "Expires soon", className: "rounded-full border border-warn px-2.5 py-0.5 text-xs font-medium text-warn" },
  expired: { label: "Reconnect needed", className: "rounded-full border border-warn px-2.5 py-0.5 text-xs font-medium text-warn" },
};

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
          {accounts.map((a, i) => {
            const state = tokenState(a);
            const pill = TOKEN_PILL[state];
            return (
              <li key={`${a.platform}-${a.username ?? i}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">@{a.username ?? "unknown"}</span>
                  <span className="rounded-full border border-line px-2 text-xs capitalize text-muted">{a.platform}</span>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                  <span className={pill.className}>{pill.label}</span>
                  {state === "ok" && a.token_expires_at && (
                    <span className="text-muted">Token valid until {new Date(a.token_expires_at).toLocaleDateString()}</span>
                  )}
                  {(state === "expiring" || state === "expired") && (
                    <>
                      <p className="max-w-xs text-right text-xs text-muted">Instagram needs you to reconnect so auto-DMs keep sending.</p>
                      <a href="/api/instagram/connect" className="btn-primary">
                        Reconnect
                      </a>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
