import { requireAdmin } from "@/lib/admin";
import { anthropicKeyStatus } from "@/lib/aiKey";
import { featureReadiness } from "@/lib/featureReadiness";
import { runtimeEnv } from "@/lib/featureReadinessNow";
import Panel from "../ui/Panel";
import StatusPill from "../ui/StatusPill";
import AiKeyForm from "./AiKeyForm";
import styles from "../admin.module.css";

export const metadata = { title: "Admin settings", robots: { index: false, follow: false } };

function when(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC" : "unknown time";
}

// Admin → Settings. "AI": the Anthropic API key for every AI feature (src/lib/aiKey.ts).
export default async function AdminSettingsPage() {
  await requireAdmin();
  const status = await anthropicKeyStatus();
  const env = await runtimeEnv();
  const ai = featureReadiness("ai", env);
  const replies = featureReadiness("ai_replies", env);
  const model = process.env.AI_MODEL || "claude-haiku-5-5";
  const qualityModel = process.env.AI_QUALITY_MODEL || "claude-sonnet-5-5";

  return (
    <>
      <h1 style={{ margin: 0, fontSize: 26 }}>Settings</h1>
      <section id="ai" style={{ scrollMarginTop: 80 }}>
        <Panel
          title="AI"
          subtitle="Anthropic API key for caption ideas, DM ideas, campaigns, per-network rewrites and AI DM replies"
          actions={<StatusPill tone={ai.ready ? "ok" : "warn"}>{ai.ready ? "AI on" : "AI off"}</StatusPill>}
        >
          <div className={styles.settingsStack}>
            <p className={styles.settingsText}>
              {status.source === "env" ? (
                <>
                  Using the <code>ANTHROPIC_API_KEY</code> environment variable (ending <strong>…{status.hint}</strong>). It wins over a key saved here.
                  {status.stored && <> A stored key ending …{status.stored.hint} is kept as the fallback.</>}
                </>
              ) : status.stored ? (
                <>
                  Using the stored key ending <strong>…{status.stored.hint}</strong>, saved by {status.stored.updatedBy ?? "an admin"} on {when(status.stored.updatedAt)}. It is
                  encrypted in the database with <code>TOKEN_ENCRYPTION_KEY</code>.
                </>
              ) : (
                <>No API key yet, so every AI button in the dashboard says “AI isn’t switched on yet”. Create a key at console.anthropic.com → API keys and paste it here.</>
              )}
            </p>
            {status.cannotStoreReason && <p className={styles.settingsMsgErr}>{status.cannotStoreReason}</p>}
            <AiKeyForm hasStored={status.stored !== null} hasKey={status.source !== "none"} canStore={status.canStore} />
            <ul className={styles.settingsList}>
              <li>Saving tests the key with one tiny request to {model}. A key Anthropic rejects is not saved.</li>
              <li>The dashboard sees a new or removed key within a minute; public pages (pricing “launching soon”, features, /developers) refresh on their next visit, and at the latest within 10 minutes.</li>
              <li>Models: {model} for quick ideas, {qualityModel} for campaigns and per-network rewrites (override with <code>AI_MODEL</code> / <code>AI_QUALITY_MODEL</code>). The monthly AI quota per user still applies.</li>
              <li>
                AI DM replies: <strong>{replies.ready ? "on" : ai.ready ? "on hold" : "off"}</strong>.{" "}
                {replies.ready
                  ? "Users can switch them on per Instagram account in Settings."
                  : "They answer DMs without a human, so they have their own switch: set AI_REPLIES_ENABLED=1 in the server environment and restart when you’re ready. Until then users see “coming soon” and nothing is sent."}
              </li>
            </ul>
          </div>
        </Panel>
      </section>
    </>
  );
}
