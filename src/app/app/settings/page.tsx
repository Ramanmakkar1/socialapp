import { Suspense } from "react";
import { Settings } from "lucide-react";
import EmptyState from "../EmptyState";
import { BtnA, PageHero } from "@/components/ui/kit";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { isDbConfigured, query } from "@/lib/db";
import { isIgConfigured } from "@/lib/instagram";
import { isMetaLoginConfigured } from "@/lib/metaLogin";
import { deleteMyAccountAction, disconnectAccountAction, saveBrandVoice } from "./actions";
import AccountProfile from "./AccountProfile";
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

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ig?: string | string[]; voice?: string | string[]; account?: string | string[] }> }) {
  const user = await requireUser();
  const { ig, voice: voiceParam, account: accountParam } = await searchParams;
  const voiceSaved = voiceParam === "saved";
  const voiceFailed = voiceParam === "error";
  const account = typeof accountParam === "string" ? accountParam : null;
  const banner = typeof ig === "string" && Object.hasOwn(BANNERS, ig) ? BANNERS[ig] : null;
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
  // Instagram login needs the Meta app keys on the server; until then show a clear "not yet" state.
  const connectReady = isMetaLoginConfigured() || isIgConfigured();
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
      <section className={styles.section} aria-labelledby="accounts-heading">
        <div className={styles.sectionHeader}>
          <h2 id="accounts-heading" className={styles.sectionTitle}>Connected accounts</h2>
          {accounts.length > 0 && connectReady ? <BtnA href="/api/instagram/connect" size="sm">Connect Instagram</BtnA> : null}
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
                    <span className={`${ui.pill} ${styles.platform}`}>{a.platform}</span>
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
