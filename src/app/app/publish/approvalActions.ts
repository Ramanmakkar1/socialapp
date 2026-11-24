"use server";

// Approve / reject / withdraw a post waiting for approval (team workspaces, migration 054).
// Every action re-reads the workspace context: role checks live in src/lib/team.ts.
import { revalidatePath } from "next/cache";
import { isDbConfigured } from "@/lib/db";
import { approvePost, rejectPost, withdrawApproval } from "@/lib/team";
import { requireWorkspace } from "@/lib/workspace";

type Result = { ok: true } | { ok: false; error: string; code?: "time_passed" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function done(): Result {
  revalidatePath("/app/publish");
  revalidatePath("/app");
  return { ok: true };
}

/** `newTimeIso` is only needed when the requested time has passed. */
export async function approvePostAction(id: string, newTimeIso?: string | null): Promise<Result> {
  if (typeof id !== "string" || !UUID_RE.test(id)) return { ok: false, error: "Invalid post." };
  if (!isDbConfigured()) return { ok: false, error: "Database not configured" };
  const ctx = await requireWorkspace();
  let when: Date | null = null;
  if (newTimeIso) {
    when = new Date(newTimeIso);
    if (Number.isNaN(when.getTime())) return { ok: false, error: "Pick a valid time." };
  }
  try {
    const r = await approvePost(ctx, id, when);
    return r.ok ? done() : r;
  } catch (err) {
    console.error("approvePost failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not approve the post." };
  }
}

export async function rejectPostAction(id: string, note?: string | null): Promise<Result> {
  if (typeof id !== "string" || !UUID_RE.test(id)) return { ok: false, error: "Invalid post." };
  if (!isDbConfigured()) return { ok: false, error: "Database not configured" };
  const ctx = await requireWorkspace();
  try {
    const r = await rejectPost(ctx, id, typeof note === "string" ? note : null);
    return r.ok ? done() : r;
  } catch (err) {
    console.error("rejectPost failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not send the post back." };
  }
}

export async function withdrawApprovalAction(id: string): Promise<Result> {
  if (typeof id !== "string" || !UUID_RE.test(id)) return { ok: false, error: "Invalid post." };
  if (!isDbConfigured()) return { ok: false, error: "Database not configured" };
  const ctx = await requireWorkspace();
  try {
    const r = await withdrawApproval(ctx, id);
    return r.ok ? done() : r;
  } catch (err) {
    console.error("withdrawApproval failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not withdraw the request." };
  }
}
