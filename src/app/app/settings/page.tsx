import { Settings } from "lucide-react";
import EmptyState from "../EmptyState";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { saveBrandVoice } from "./actions";

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

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ig?: string | string[]; voice?: string | string[] }> }) {
  const user = await requireUser();
  const { ig, voice: voiceParam } = await searchParams;
  const voiceSaved = voiceParam === "saved";
  const banner = typeof ig === "string" && Object.hasOwn(BANNERS, ig) ? BANNERS[ig] : null;
  const accounts = isDbConfigured()
    ? await query<Account>(
        "select platform, username, status, token_expires_at from socialapp.social_accounts where user_id=$1 order by created_at",
        [user.id]
      )
    : [];
  const voiceRows = isDbConfigured()
    ? await query<{ brand_voice: string | null }>("select brand_voice from socialapp.users where id=$1", [user.id])
    : [];
  const voice = voiceRows[0]?.brand_voice ?? null;
  return (
    <>
      <div><h1 className="text-2xl font-semibold">Settings</h1><p className="text-sm text-muted">Manage your connected accounts and brand voice.</p></div>
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
      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink-2">Brand voice</h2>
        <p className="mt-1 text-sm text-muted">
          Tell the AI how your posts should sound, e.g. &apos;Friendly and short, a bit funny, no slang, we are a yoga studio in Toronto&apos;. Used by Write with AI.
        </p>
        {isDbConfigured() ? (
          <form action={saveBrandVoice} className="mt-3 space-y-3">
            <textarea
              name="brand_voice"
              maxLength={500}
              rows={4}
              defaultValue={voice ?? ""}
              className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
              placeholder="Friendly, short sentences, 1-2 emojis…"
            />
            <button type="submit" className="btn-primary">Save brand voice</button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted">Brand voice can be saved once the database is set up on this server.</p>
        )}
        {voiceSaved && <p className="mt-2 text-sm text-ok">Brand voice saved.</p>}
      </section>
    </>
  );
}
