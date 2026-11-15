// Server-only: feature readiness at REQUEST time, including settings stored in the database
// (today: the Anthropic API key an admin saved in /admin/settings, src/lib/aiKey.ts).
// featureReadiness.ts stays pure; these helpers only build the env object it reads.
// During `next build` (no DB) this is plain process.env, so static pages fail closed and pick up
// a stored key when they revalidate.
import { hasStoredAnthropicKey } from "@/lib/aiKey";
import { featureReadiness, planReadiness, type Env, type FeatureId } from "@/lib/featureReadiness";

/** process.env plus ANTHROPIC_API_KEY_STORED=1 when no env key is set but an admin saved one. */
export async function runtimeEnv(): Promise<Env> {
  if (process.env.ANTHROPIC_API_KEY?.trim()) return process.env;
  if (!(await hasStoredAnthropicKey())) return process.env;
  return { ...process.env, ANTHROPIC_API_KEY_STORED: "1" };
}

export async function isFeatureReadyNow(id: FeatureId): Promise<boolean> {
  return featureReadiness(id, await runtimeEnv()).ready;
}

export async function planReadinessNow(): Promise<{ paidPlans: boolean; ai: boolean }> {
  return planReadiness(await runtimeEnv());
}
