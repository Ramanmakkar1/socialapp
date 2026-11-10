import { Suspense } from "react";
import { Settings } from "lucide-react";
import EmptyState from "../EmptyState";
import { BtnA, PageHero } from "@/components/ui/kit";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";
import { isAiConfigured } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { listApiKeys } from "@/lib/apiKeys";
import { isDbConfigured, query } from "@/lib/db";
import { isIgConfigured } from "@/lib/instagram";
import { isMetaLoginConfigured } from "@/lib/metaLogin";
import { isThreadsConfigured } from "@/lib/threadsAuth";
import { isYouTubeConfigured } from "@/lib/youtubeAuth";
import { createApiKeyAction, deleteMyAccountAction, disconnectAccountAction, disconnectYouTubeAction, revokeApiKeyAction, saveAiReplySettings, saveBrandVoice } from "./actions";
import AccountProfile from "./AccountProfile";
import AiReplyPreview from "./AiReplyPreview";
import ChannelSchedules, { type ChannelScheduleInput } from "./ChannelSchedules";
import DeleteAccountForm from "./DeleteAccountForm";
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
  auth_type: string | null;
  page_name: string | null;
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
  ok: { label: "Connected", className: `${ui.pill} ${ui.pillMint}` },
  expiring: { label: "Expires soon", className: `${ui.pill} ${ui.pillPeach}` },
  expired: { label: "Reconnect needed", className: `${ui.pill} ${ui.pillPeach}` },
};

function platformLabel(p: string): string {
  if (p === "threads") return "Threads";
  return p;
}

const BANNERS: Record<string, { tone: "ok" | "warn"; text: string }> = {
  connected: { tone: "ok", text: "Instagram account connected." },
  error: { tone: "warn", text: "We couldn't connect your Instagram account. Please try again." },
  not_configured: { tone: "warn", text: "Instagram connection isn't set up on this server yet." },
  disconnected: { tone: "ok", text: "Instagram account disconnected. Its access token was deleted." },
  disconnect_error: { tone: "warn", text: "We couldn't disconnect that account. Please try again." },
  connected_no_webhooks: { tone: "warn", text: "Instagram account connected, but Facebook did not let us switch on comment and DM alerts for its Page. Posting works; reconnect and allow \"Manage your Page\" so auto-DMs can start." },
  declined: { tone: "warn", text: "You declined the permissions Poskoo needs. Try again and keep all boxes ticked." },
  missing_permissions: { tone: "warn", text: "Some permissions were turned off in the Facebook window (Pages, Instagram messages, comments or publishing). Connect again and keep every option switched on." },
  no_pages: { tone: "warn", text: "You didn't share any Facebook Page with Poskoo. Connect again and select the Page your Instagram professional account is linked to." },
  no_ig_business: { tone: "warn", text: "We couldn't find an Instagram professional account linked to your Facebook Page. Link one in Instagram settings, then reconnect." },
  expired_code: { tone: "warn", text: "Your Facebook login expired before we could finish. Please connect again." },
  state_error: { tone: "warn", text: "The Facebook login link expired or was opened in another browser. Please connect again from this page." },
  pick_expired: { tone: "warn", text: "Choosing an account took too long. Please connect again." },
};

const THREADS_BANNERS: Record<string, { tone: "ok" | "warn"; text: string }> = {
  connected: { tone: "ok", text: "Threads connected. You can now pick Threads when you schedule a post." },
  declined: { tone: "warn", text: "You declined the permissions Poskoo needs for Threads. Try again and keep all boxes ticked." },
  state_error: { tone: "warn", text: "The Threads login link expired or was opened in another browser. Please connect again from this page." },
  error: { tone: "warn", text: "We couldn't connect your Threads account. Please try again." },
  not_configured: { tone: "warn", text: "Threads connection isn't set up on this server yet." },
};

const YOUTUBE_BANNERS: Record<string, { tone: "ok" | "warn"; text: string }> = {
  connected: { tone: "ok", text: "YouTube channel connected. You can now pick YouTube when you schedule a video." },
  declined: { tone: "warn", text: "You declined the permissions Poskoo needs for YouTube. Try again and choose “Allow”." },
  state_error: { tone: "warn", text: "The YouTube link expired or was opened in another browser. Please connect again from this page." },
  no_refresh_token: { tone: "warn", text: "YouTube didn't grant upload access. Connect again and choose “Allow” so Poskoo can upload your videos." },
  channel_not_found: { tone: "warn", text: "We couldn't find your YouTube channel. Please connect again." },
  disconnected: { tone: "ok", text: "YouTube channel disconnected. New videos will no longer upload to it." },
  disconnect_error: { tone: "warn", text: "We couldn't disconnect your YouTube channel. Please try again." },
  not_configured: { tone: "warn", text: "YouTube connection isn't set up on this server yet." },
  needs_reconnect: { tone: "warn", text: "YouTube needs you to reconnect so videos keep uploading. Connect again and choose “Allow”." },
  error: { tone: "warn", text: "We couldn't connect your YouTube channel. Please try again." },
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ig?: string | string[]; voice?: string | string[]; account?: string | string[]; threads?: string | string[]; ai_reply?: string | string[]; schedule?: string | string[]; yt?: string | string[]; api_key?: string | string[]; key?: string | string[] }> }) {
  const user = await requireUser();
  const { ig, voice: voiceParam, account: accountParam, threads: threadsParam, ai_reply: aiReplyParam, schedule: scheduleParam, yt: ytParam, api_key: apiKeyParam, key: keyParam } = await searchParams;
  const apiKey = typeof apiKeyParam === "string" ? apiKeyParam : null;
  const newKey = typeof keyParam === "string" && keyParam.startsWith("poskoo_") ? keyParam : null;
  const voiceSaved = voiceParam === "saved";
  const voiceFailed = voiceParam === "error";
  const aiReplySaved = aiReplyParam === "saved";
  const aiReplyFailed = aiReplyParam === "error";
  const scheduleSaved = scheduleParam === "saved";
  const scheduleFailed = scheduleParam === "error";
  const account = typeof accountParam === "string" ? accountParam : null;
  const banner = typeof ig === "string" && Object.hasOwn(BANNERS, ig) ? BANNERS[ig] : null;
  const threadsBanner = typeof threadsParam === "string" && Object.hasOwn(THREADS_BANNERS, threadsParam) ? THREADS_BANNERS[threadsParam] : null;
  const youtubeBanner = typeof ytParam === "string" && Object.hasOwn(YOUTUBE_BANNERS, ytParam) ? YOUTUBE_BANNERS[ytParam] : null;
  const accounts = isDbConfigured()
    ? await query<Account>(
        "select id, external_id, access_token_enc, platform, username, status, token_expires_at, auth_type, page_name from socialapp.social_accounts where user_id=$1 order by created_at",
        [user.id]
      )
    : [];
  const voiceRows = isDbConfigured()
    ? await query<{ brand_voice: string | null }>("select brand_voice from socialapp.users where id=$1", [user.id])
    : [];
  const voice = voiceRows[0]?.brand_voice ?? null;
  const aiAccounts = isDbConfigured()
    ? await query<{ id: string; username: string | null; ai_reply_enabled: boolean; ai_reply_instructions: string | null; ai_booking_link: string | null }>(
        "select id, username, ai_reply_enabled, ai_reply_instructions, ai_booking_link from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active' order by created_at",
        [user.id]
      )
    : [];
  const aiConfigured = isAiConfigured();
  // Instagram login needs the Meta app keys on the server; until then show a clear "not yet" state.
  const connectReady = isMetaLoginConfigured() || isIgConfigured();
  // Per-channel posting schedules, only for channels the user has connected.
  const connectedPlatforms = [...new Set(accounts.filter((a) => a.status === "active").map((a) => a.platform))];
  const channelSchedules: ChannelScheduleInput[] = [];
  if (isDbConfigured()) {
    try {
      const schedRows = await query<{ platform: string; timezone: string; days: number[]; times: string[] }>(
        "select platform, timezone, days, times from socialapp.posting_schedules where user_id=$1",
        [user.id],
      );
      for (const row of schedRows) {
        if (connectedPlatforms.includes(row.platform)) {
          channelSchedules.push({ platform: row.platform, timezone: row.timezone, days: row.days ?? [], times: row.times ?? [] });
        }
      }
    } catch {
      // posting_schedules not present yet (migration pending): treat as no schedules set.
    }
  }
  channelSchedules.sort((a, b) => a.platform.localeCompare(b.platform));
  const youtubeChannel = isDbConfigured()
    ? (
        await query<{ id: string; channel_id: string; title: string; avatar_url: string | null; status: string }>(
          "select id, channel_id, title, avatar_url, status from socialapp.youtube_channels where user_id=$1 order by updated_at desc limit 1",
          [user.id],
        )
      )[0] ?? null
    : null;
  const apiKeys = isDbConfigured() ? await listApiKeys(user.id) : [];
  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Your workspace"
        title="Settings"
        lede="Manage your connected accounts and brand voice."
        art="/landing/card-schedule.webp"
        artAlt=""
      />
      {banner && (
        <p role="status" className={`${ui.notice} ${banner.tone === "warn" ? ui.noticeWarn : ""}`}>{banner.text}</p>
      )}
      {threadsBanner && (
        <p role="status" className={`${ui.notice} ${threadsBanner.tone === "warn" ? ui.noticeWarn : ""}`}>{threadsBanner.text}</p>
      )}
      {youtubeBanner && (
        <p role="status" className={`${ui.notice} ${youtubeBanner.tone === "warn" ? ui.noticeWarn : ""}`}>{youtubeBanner.text}</p>
      )}
      <section className={styles.section} aria-labelledby="accounts-heading">
        <div className={styles.sectionHeader}>
          <h2 id="accounts-heading" className={styles.sectionTitle}>Connected accounts</h2>
          {accounts.length > 0 && connectReady ? <BtnA href="/api/instagram/connect" size="sm">Connect Instagram</BtnA> : null}
          {isThreadsConfigured() ? <BtnA href="/api/threads/connect" size="sm">Connect Threads</BtnA> : null}
          {isYouTubeConfigured() ? <BtnA href="/api/youtube/connect" size="sm">Connect YouTube</BtnA> : null}
        </div>
        <p className={ui.hint}>
          Instagram professional account linked to a Facebook Page required.{" "}
          <a href="/help/getting-started" className={ui.link}>See the setup steps</a>
        </p>
        {!connectReady && (
          <p role="status" className={`${ui.notice} ${ui.noticeWarn}`}>
            Connecting Instagram is not switched on yet. You can already write posts, save drafts and set up auto-DM rules; they start working once your account is connected.
          </p>
        )}
        {accounts.length === 0 && !connectReady ? null : accounts.length === 0 ? (
          <EmptyState
            icon={Settings}
            title="No connected accounts"
            text="Connect your Instagram professional account to schedule posts and auto-DM commenters."
            art="/illustrations/connect-account.webp"
            artWidth={1536}
            artHeight={1024}
          >
            <BtnA href="/api/instagram/connect">Connect Instagram</BtnA>
          </EmptyState>
        ) : (
          <ul className={styles.accountList}>
            {accounts.map((a, i) => {
              const state = tokenState(a);
              const pill = TOKEN_PILL[state];
              return (
                <li key={`${a.platform}-${a.username ?? i}`} className={styles.accountCard}>
                  <div className={styles.accountIdentity}>
                    {a.platform === "instagram" && a.status === "active" && a.access_token_enc ? (
                      <Suspense fallback={<span className={styles.username}>@{a.username ?? "unknown"}</span>}>
                        <AccountProfile account={a} fallbackUsername={a.username} />
                      </Suspense>
                    ) : (
                      <span className={styles.username}>@{a.username ?? "unknown"}</span>
                    )}
                    <span className={`${ui.pill} ${styles.platform}`}>{platformLabel(a.platform)}</span>
                  </div>
                  <div className={styles.accountActions}>
                    <span className={pill.className}>{pill.label}</span>
                    {state === "ok" && a.page_name && <span className={ui.hint}>Via Facebook Page {a.page_name}</span>}
                    {state === "ok" && a.token_expires_at && (
                      <span className={ui.hint}>Token valid until {new Date(a.token_expires_at).toLocaleDateString()}</span>
                    )}
                    {(state === "expiring" || state === "expired") && (
                      <>
                        <p className={`${ui.hint} ${styles.accountNote}`}>
                          {a.status === "disconnected"
                            ? "Disconnected. Connect again to schedule posts and send auto-DMs."
                            : state === "expired"
                              ? "Instagram access expired or was removed. Reconnect so posts publish and auto-DMs keep sending."
                              : "Instagram needs you to reconnect so auto-DMs keep sending."}
                        </p>
                        <BtnA href="/api/instagram/connect" size="sm">Reconnect</BtnA>
                      </>
                    )}
                    {a.status !== "disconnected" && (
                      <form action={disconnectAccountAction}>
                        <input type="hidden" name="account_id" value={a.id} />
                        <SubmitButton label="Disconnect" pendingLabel="Disconnecting…" variant="ghost" size="sm" />
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className={styles.section} aria-labelledby="youtube-heading">
        <div className={styles.sectionHeader}>
          <h2 id="youtube-heading" className={styles.sectionTitle}>YouTube</h2>
          {isYouTubeConfigured() && !youtubeChannel ? <BtnA href="/api/youtube/connect" size="sm">Connect YouTube</BtnA> : null}
        </div>
        {youtubeChannel ? (
          <ul className={styles.accountList}>
            <li className={styles.accountCard}>
              <div className={styles.accountIdentity}>
                {youtubeChannel.avatar_url ? (
                  // YouTube CDN URLs expire, so a plain <img> (no Next image cache) is used on purpose.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={youtubeChannel.avatar_url} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full border border-[var(--poskoo-line)] object-cover" />
                ) : null}
                <span className={styles.username}>{youtubeChannel.title || "YouTube channel"}</span>
                <span className={`${ui.pill} ${styles.platform}`}>YouTube</span>
              </div>
              <div className={styles.accountActions}>
                {youtubeChannel.status === "active" ? (
                  <>
                    <span className={`${ui.pill} ${ui.pillMint}`}>Connected</span>
                    <p className={`${ui.hint} ${styles.accountNote}`}>Videos you schedule upload to this channel at the set time.</p>
                    <form action={disconnectYouTubeAction}>
                      <SubmitButton label="Disconnect" pendingLabel="Disconnecting…" variant="ghost" size="sm" />
                    </form>
                  </>
                ) : (
                  <>
                    <span className={`${ui.pill} ${ui.pillPeach}`}>Reconnect needed</span>
                    <p className={`${ui.hint} ${styles.accountNote}`}>This channel stopped working. Connect again so scheduled videos keep uploading.</p>
                    <BtnA href="/api/youtube/connect" size="sm">Reconnect</BtnA>
                  </>
                )}
              </div>
            </li>
          </ul>
        ) : (
          <p className={ui.hint}>
            Connect a YouTube channel to schedule video uploads. Poskoo asks for permission to upload videos and read your channel details; you can revoke access any time in your Google account settings.
          </p>
        )}
      </section>
      <section className={`${styles.section} ${styles.voice}`} aria-labelledby="voice-heading">
        <h2 id="voice-heading" className={styles.sectionTitle}>Brand voice</h2>
        <p className={ui.hint}>
          Tell the AI how your posts should sound, e.g. &apos;Friendly and short, a bit funny, no slang, we are a yoga studio in Toronto&apos;. Used by Write with AI.
        </p>
        {isDbConfigured() ? (
          <form action={saveBrandVoice} className={styles.voiceForm}>
            <label htmlFor="brand-voice" className={ui.label}>Your brand voice</label>
            <textarea
              id="brand-voice"
              name="brand_voice"
              maxLength={500}
              rows={4}
              defaultValue={voice ?? ""}
              className={`${ui.input} ${styles.textarea}`}
              placeholder="Friendly, short sentences, 1-2 emojis…"
            />
            <div>
              <SubmitButton label="Save brand voice" />
            </div>
          </form>
        ) : (
          <p className={ui.hint}>Brand voice can be saved once the database is set up on this server.</p>
        )}
        {voiceSaved && <p role="status" className={ui.notice}>Brand voice saved.</p>}
        {voiceFailed && <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>We couldn&apos;t save your brand voice. Please try again.</p>}
      </section>
      <section className={styles.section} aria-labelledby="ai-reply-heading">
        <h2 id="ai-reply-heading" className={styles.sectionTitle}>AI DM replies</h2>
        {aiAccounts.length === 0 ? (
          <p className={ui.hint}>
            Connect an Instagram account first, then switch on AI replies.{" "}
            <BtnA href="/api/instagram/connect" size="sm">Connect Instagram</BtnA>
          </p>
        ) : (
          <ul className={styles.accountList}>
            {aiAccounts.map((a) => (
              <li key={a.id} className={styles.accountCard}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", minWidth: 0 }}>
                  <span className={styles.username}>@{a.username ?? "unknown"}</span>
                  <form action={saveAiReplySettings}>
                    <input type="hidden" name="account_id" value={a.id} />
                    <label htmlFor={`ai-reply-${a.id}`} className={ui.checkRow}>
                      <input
                        id={`ai-reply-${a.id}`}
                        type="checkbox"
                        name="ai_reply_enabled"
                        value="on"
                        defaultChecked={a.ai_reply_enabled}
                        disabled={!aiConfigured}
                      />
                      Reply to new DMs with AI
                    </label>
                    <label htmlFor={`ai-instructions-${a.id}`} className={ui.label}>What should the AI know? (services, hours, tone)</label>
                    <textarea
                      id={`ai-instructions-${a.id}`}
                      name="ai_reply_instructions"
                      maxLength={1500}
                      rows={4}
                      defaultValue={a.ai_reply_instructions ?? ""}
                      className={`${ui.input} ${styles.textarea}`}
                      placeholder="We are a yoga studio in Toronto, open 9-6, friendly and short…"
                    />
                    <label htmlFor={`ai-booking-${a.id}`} className={ui.label}>Booking link (optional)</label>
                    <input
                      id={`ai-booking-${a.id}`}
                      name="ai_booking_link"
                      type="url"
                      defaultValue={a.ai_booking_link ?? ""}
                      className={ui.input}
                      placeholder="https://cal.com/you"
                    />
                    {!aiConfigured && <p className={ui.hint}>AI is not set up on this server yet.</p>}
                    <p className={ui.hint}>AI answers people who message you, asks for their name and email, and shares your booking link. It never replies more than 5 times a day to one person and only within Instagram&apos;s 24-hour window. If you reply to someone yourself from the Inbox, the AI stays quiet with that person for 12 hours.</p>
                    <div>
                      <SubmitButton label="Save AI reply settings" />
                    </div>
                  </form>
                  <AiReplyPreview instructions={a.ai_reply_instructions} bookingLink={a.ai_booking_link} />
                </div>
              </li>
            ))}
          </ul>
        )}
        {aiReplySaved && <p role="status" className={ui.notice}>AI reply settings saved.</p>}
        {aiReplyFailed && <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>We couldn&apos;t save your AI reply settings. Please try again.</p>}
      </section>
      <section className={styles.section} aria-labelledby="channels-heading">
        <h2 id="channels-heading" className={styles.sectionTitle}>Channels</h2>
        <p className={ui.hint}>
          Pick the days and times each channel should publish. The composer&apos;s “Add to queue” and “Next available” use these slots.
        </p>
        {isDbConfigured() ? (
          <ChannelSchedules channels={channelSchedules} />
        ) : (
          <p className={ui.hint}>Channel schedules can be saved once the database is set up on this server.</p>
        )}
        {scheduleSaved && <p role="status" className={ui.notice}>Posting schedule saved.</p>}
        {scheduleFailed && <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>We couldn&apos;t save your posting schedule. Please try again.</p>}
      </section>
      <section className={styles.section} aria-labelledby="api-keys-heading">
        <div className={styles.sectionHeader}>
          <h2 id="api-keys-heading" className={styles.sectionTitle}>API keys</h2>
          <BtnA href="/developers" size="sm">Developer guide</BtnA>
        </div>
        <p className={ui.hint}>
          Connect Claude, ChatGPT or another AI assistant to Poskoo through the MCP server at{" "}
          <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{BRAND.url}/api/mcp</code>.
          Create a key, copy it once, and share it with your assistant.
        </p>
        {apiKey === "created" && newKey && (
          <p role="status" className={ui.notice}>
            Your new API key — copy it now, it is shown only once:{" "}
            <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "2px 6px" }}>{newKey}</code>
          </p>
        )}
        {apiKey === "revoked" && <p role="status" className={ui.notice}>API key revoked. It stops working right away.</p>}
        {apiKey === "error" && <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>We couldn&apos;t save your API key. Please try again.</p>}
        {isDbConfigured() ? (
          <form action={createApiKeyAction} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
            <input name="key_name" maxLength={60} defaultValue="" className={ui.input} placeholder="Name this key, e.g. Claude" aria-label="API key name" style={{ maxWidth: 280 }} />
            <SubmitButton label="Create API key" pendingLabel="Creating…" />
          </form>
        ) : (
          <p className={ui.hint}>API keys are available once the database is set up on this server.</p>
        )}
        {apiKeys.length > 0 && (
          <ul className={styles.accountList}>
            {apiKeys.map((k) => (
              <li key={k.id} className={styles.accountCard}>
                <div className={styles.accountIdentity}>
                  <span className={styles.username}>{k.name}</span>
                  <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{k.key_prefix}…</code>
                  <span className={k.revoked_at ? `${ui.pill} ${ui.pillPeach}` : `${ui.pill} ${ui.pillMint}`}>{k.revoked_at ? "Revoked" : "Active"}</span>
                </div>
                <div className={styles.accountActions}>
                  <span className={ui.hint}>Created {new Date(k.created_at).toLocaleDateString()}</span>
                  {k.last_used_at && <span className={ui.hint}>Last used {new Date(k.last_used_at).toLocaleDateString()}</span>}
                  {!k.revoked_at && (
                    <form action={revokeApiKeyAction}>
                      <input type="hidden" name="key_id" value={k.id} />
                      <SubmitButton label="Revoke" pendingLabel="Revoking…" variant="ghost" size="sm" />
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={styles.section} aria-labelledby="danger-heading">
        <h2 id="danger-heading" className={styles.sectionTitle}>Delete account</h2>
        {isDbConfigured() ? (
          <DeleteAccountForm action={deleteMyAccountAction} />
        ) : (
          <p className={ui.hint}>
            You can delete your account yourself once the database is set up on this server. Until then, email {BRAND.supportEmail} from your account email.
          </p>
        )}
        {account === "confirm_needed" && (
          <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>Type DELETE in capitals to confirm.</p>
        )}
        {account === "delete_error" && (
          <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>We couldn&apos;t delete your account. Please try again or email support.</p>
        )}
        {account === "reviewer_locked" && (
          <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>The demo review account can&apos;t be deleted.</p>
        )}
      </section>
    </div>
  );
}
