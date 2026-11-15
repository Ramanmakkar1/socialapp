"use server";

// Admin-only server actions for Admin → Settings → AI. Every action calls requireAdmin() (404 for
// everyone else) and writes an admin_audit row with only the key's last 4 characters.
import { revalidatePath } from "next/cache";
import { adminAudit, requireAdmin } from "@/lib/admin";
import {
  anthropicKeyStatus,
  removeStoredAnthropicKey,
  resolveAnthropicKey,
  saveStoredAnthropicKey,
  testAnthropicKey,
  validateAnthropicKey,
} from "@/lib/aiKey";

export type AiKeyActionState = { ok: boolean; message: string } | null;

// Static marketing pages that show AI as "launching soon" (they also revalidate every 10 minutes).
const AI_STATUS_PATHS = ["/", "/pricing", "/features", "/developers", "/instagram-scheduler/pricing", "/influence-alternative", "/llms.txt"];

function refreshAiPages() {
  for (const path of AI_STATUS_PATHS) revalidatePath(path);
  revalidatePath("/admin/settings");
}

export async function saveAnthropicKeyAction(_prev: AiKeyActionState, formData: FormData): Promise<AiKeyActionState> {
  const admin = await requireAdmin();
  const status = await anthropicKeyStatus();
  if (!status.canStore) return { ok: false, message: status.cannotStoreReason ?? "A key can't be stored on this server." };
  const parsed = validateAnthropicKey(formData.get("api_key"));
  if (!parsed.ok) return { ok: false, message: parsed.error };
  // Test first: a key Anthropic rejects outright is never stored (it would switch AI "on" for nothing).
  // Other failures (credit balance, rate limit, outage) still save, with the reason shown.
  const test = await testAnthropicKey(parsed.key);
  if (!test.ok && test.status === 401) return { ok: false, message: `Not saved: ${test.error}` };
  try {
    await saveStoredAnthropicKey(parsed.key, admin.email);
  } catch (err) {
    const missingTable = err instanceof Error && /app_settings/.test(err.message) && /does not exist/.test(err.message);
    console.error("saving the Anthropic API key failed:", missingTable ? "app_settings table missing" : err instanceof Error ? err.name : "error");
    return {
      ok: false,
      message: missingTable
        ? "The settings table doesn't exist yet. Run the database migrations (npm run db:migrate, 050_app_settings.sql) and try again."
        : "Couldn't save the key. Please try again.",
    };
  }
  await adminAudit(admin, "ai_key.save", { details: { hint: parsed.key.slice(-4) } });
  refreshAiPages();
  const envNote = status.source === "env" ? " Note: ANTHROPIC_API_KEY is set on the server and is used instead until it's removed." : "";
  return test.ok
    ? { ok: true, message: `Saved. Test call to ${test.model} worked: AI is on for everyone.${envNote}` }
    : { ok: false, message: `Saved, but the test call failed: ${test.error}${envNote}` };
}

export async function removeAnthropicKeyAction(): Promise<AiKeyActionState> {
  const admin = await requireAdmin();
  let removed = false;
  try {
    removed = await removeStoredAnthropicKey();
  } catch {
    return { ok: false, message: "Couldn't remove the key. Please try again." };
  }
  if (removed) await adminAudit(admin, "ai_key.remove");
  refreshAiPages();
  const status = await anthropicKeyStatus();
  return {
    ok: true,
    message: removed
      ? status.source === "env"
        ? "Stored key removed. AI stays on because ANTHROPIC_API_KEY is set on the server."
        : "Stored key removed. AI is off until a key is added again."
      : "There was no stored key to remove.",
  };
}

export async function testAnthropicKeyAction(): Promise<AiKeyActionState> {
  const admin = await requireAdmin();
  const key = await resolveAnthropicKey();
  if (!key) return { ok: false, message: "No API key yet. Paste one above and save it first." };
  const result = await testAnthropicKey(key);
  await adminAudit(admin, "ai_key.test", { details: { ok: result.ok, hint: key.slice(-4) } });
  return result.ok ? { ok: true, message: `Connection OK: ${result.model} answered.` } : { ok: false, message: result.error };
}
