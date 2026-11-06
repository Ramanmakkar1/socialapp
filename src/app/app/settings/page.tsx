import { Suspense } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import EmptyState from "../EmptyState";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { disconnectAccountAction, saveBrandVoice } from "./actions";
import AccountProfile from "./AccountProfile";
import styles from "../app-page.module.css";

export const metadata = { title: "Settings" };

type Account = {
  id: string;
  external_id: string;
  access_token_enc: string | null;
  platform: string;
  username: string | null;
  status: string;
  token_expires_at: Date | null;
};

function tokenState(a: Account): "ok" | "expiring" | "expired" {
  if (a.status === "expired" || a.status === "disconnected") return "expired";
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
  disconnected: { tone: "ok", text: "Instagram account disconnected. Its access token was deleted." },
  declined: { tone: "warn", text: "You declined the permissions Poskoo needs. Try again and keep all boxes ticked." },
  no_ig_business: { tone: "warn", text: "We couldn't find an Instagram professional account linked to your Facebook Page. Link one in Instagram settings, then reconnect." },
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ig?: string | string[]; voice?: string | string[] }> }) {
  const user = await requireUser();
  const { ig, voice: voiceParam } = await searchParams;
  const voiceSaved = voiceParam === "saved";
  const banner = typeof ig === "string" && Object.hasOwn(BANNERS, ig) ? BANNERS[ig] : null;
  const accounts = isDbConfigured()
    ? await query<Account>(
        "select id, external_id, access_token_enc, platform, username, status, token_expires_at from socialapp.social_accounts where user_id=$1 order by created_at",
        [user.id]
      )
    : [];
  const voiceRows = isDbConfigured()
    ? await query<{ brand_voice: string | null }>("select brand_voice from socialapp.users where id=$1", [user.id])
    : [];
  const voice = voiceRows[0]?.brand_voice ?? null;
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}><p className={styles.eyebrow}>Your workspace</p><h1 className={styles.title}>Settings</h1><p className={styles.subtitle}>Manage your connected accounts and brand voice.</p></div>
        <div className={styles.heroArt}><Image src="/landing/card-schedule.webp" width={900} height={900} alt="A creator planning posts on a calendar" /></div>
      </header>
      {banner && (
        <p className={`${styles.notice} ${banner.tone === "warn" ? styles.noticeWarn : ""}`}>{banner.text}</p>
      )}
      <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Connected accounts</h2>
        <a href="/api/instagram/connect" className="btn-primary">Connect Instagram</a>
      </div>
      <p className={styles.hint}>
        Instagram professional account linked to a Facebook Page required.{" "}
        <a href="/help/getting-started" className="underline hover:text-ink-2">See the setup steps</a>
      </p>
      {accounts.length === 0 ? (
        <EmptyState icon={Settings} title="No connected accounts" text="Connect your Instagram professional account to schedule posts and auto-DM commenters." />
      ) : (
        <ul className={styles.accountList}>
          {accounts.map((a, i) => {
            const state = tokenState(a);
            const pill = TOKEN_PILL[state];
            return (
            <li key={`${a.platform}-${a.username ?? i}`} className={styles.accountCard}>
                <div className={styles.accountIdentity}>
                  {a.platform === "instagram" && a.status === "active" && a.access_token_enc ? (
                    <Suspense fallback={<span className="font-medium">@{a.username ?? "unknown"}</span>}>
                      <AccountProfile account={a} fallbackUsername={a.username} />
                    </Suspense>
                  ) : (
                    <span className="font-medium">@{a.username ?? "unknown"}</span>
                  )}
                  <span className="rounded-full border border-line px-2 text-xs capitalize text-muted">{a.platform}</span>
                </div>
                <div className={styles.accountActions}>
                  <span className={`${styles.status} ${pill.className}`}>{pill.label}</span>
                  {state === "ok" && a.token_expires_at && (
                    <span className="text-muted">Token valid until {new Date(a.token_expires_at).toLocaleDateString()}</span>
                  )}
                  {(state === "expiring" || state === "expired") && (
                    <>
                      <p className="max-w-xs text-right text-xs text-muted">
                        {a.status === "disconnected"
                          ? "Disconnected. Connect again to schedule posts and send auto-DMs."
                          : state === "expired"
                            ? "Instagram access expired or was removed. Reconnect so posts publish and auto-DMs keep sending."
                            : "Instagram needs you to reconnect so auto-DMs keep sending."}
                      </p>
                      <a href="/api/instagram/connect" className="btn-primary">
                        Reconnect
                      </a>
                    </>
                  )}
                  {a.status !== "disconnected" && (
                    <form action={disconnectAccountAction}>
                      <input type="hidden" name="account_id" value={a.id} />
                      <button type="submit" className="text-xs font-medium text-ink-2 hover:underline">Disconnect</button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
      </ul>
      )}
      </section>
      <section className={`${styles.section} ${styles.voice}`}>
        <h2 className={styles.sectionTitle}>Brand voice</h2>
        <p className={styles.hint}>
          Tell the AI how your posts should sound, e.g. &apos;Friendly and short, a bit funny, no slang, we are a yoga studio in Toronto&apos;. Used by Write with AI.
        </p>
        {isDbConfigured() ? (
          <form action={saveBrandVoice} className={styles.voiceForm}>
            <textarea
              name="brand_voice"
              maxLength={500}
              rows={4}
              defaultValue={voice ?? ""}
              className={styles.textarea}
              placeholder="Friendly, short sentences, 1-2 emojis…"
            />
            <button type="submit" className="btn-primary">Save brand voice</button>
          </form>
        ) : (
          <p className={styles.hint}>Brand voice can be saved once the database is set up on this server.</p>
        )}
        {voiceSaved && <p className="mt-2 text-sm text-ok">Brand voice saved.</p>}
      </section>
    </div>
  );
}
