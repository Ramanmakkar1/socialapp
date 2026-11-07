// Server-only helper: AI replies to Instagram DMs. The API key comes only from env vars.

export type AiReplySettings = {
  enabled: boolean;
  instructions: string | null;
  bookingLink: string | null;
  brandVoice: string | null;
};

export type ChatTurn = { direction: "in" | "out"; text: string };

// Per-contact cap on AI-sent DM replies within a rolling 24 h window.
export const MAX_AI_REPLIES_PER_DAY = 5;

// Instagram allows a DM reply only within 24 h of the person's last message.
// (Inlined from sendPolicy.DM_WINDOW_MS: inbox.ts re-exports it but also imports the DB.)
const DM_WINDOW_MS = 24 * 60 * 60 * 1000;

export function shouldAiReply(input: {
  settings: AiReplySettings;
  text: string;
  lastInboundAt: Date | null;
  aiRepliesLast24h: number;
  hasPendingGate: boolean;
  now?: number;
}): boolean {
  const { settings, text, lastInboundAt, aiRepliesLast24h, hasPendingGate } = input;
  if (!settings.enabled) return false;
  if (text.trim() === "") return false;
  if (hasPendingGate) return false;
  if (aiRepliesLast24h >= MAX_AI_REPLIES_PER_DAY) return false;
  if (!lastInboundAt) return false;
  const now = input.now ?? Date.now();
  const t = lastInboundAt.getTime();
  return Number.isFinite(t) && now - t >= -60_000 && now - t < DM_WINDOW_MS;
}

const AI_REPLY_SYSTEM_PROMPT =
  "You reply to Instagram DMs for a small business. Keep each reply short (under 400 characters), friendly and in plain text with no markdown. When the person shows interest, politely ask for their name and email (or phone). If a booking link is set, share it exactly once when they want to book. Never invent prices, facts or promises. If you are unsure, say a team member will follow up.";

export function buildAiReplyPrompt(
  settings: AiReplySettings,
  history: ChatTurn[],
  known?: { email?: string | null; phone?: string | null }
): { system: string; messages: { role: "user" | "assistant"; content: string }[] } {
  let contactCollected: string | null = null;
  const hasEmail = Boolean(known?.email);
  const hasPhone = Boolean(known?.phone);
  if (hasEmail && hasPhone) {
    contactCollected = "Contact details already collected: email and phone on file. Do not ask for them again.";
  } else if (hasEmail) {
    contactCollected = "Contact details already collected: email on file. Do not ask for them again.";
  } else if (hasPhone) {
    contactCollected = "Contact details already collected: phone on file. Do not ask for them again.";
  }

  const system = [
    AI_REPLY_SYSTEM_PROMPT,
    settings.instructions ? `Business instructions: ${settings.instructions}` : null,
    settings.bookingLink ? `Booking link: ${settings.bookingLink}` : null,
    settings.brandVoice ? `Brand voice: ${settings.brandVoice}` : null,
    contactCollected,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const merged: { role: "user" | "assistant"; content: string }[] = [];
  for (const turn of history.slice(-10)) {
    const role = turn.direction === "in" ? "user" : "assistant";
    const last = merged[merged.length - 1];
    if (last && last.role === role) last.content += `\n${turn.text}`;
    else merged.push({ role, content: turn.text });
  }
  while (merged.length > 0 && merged[0].role === "assistant") merged.shift();
  return { system, messages: merged };
}

export function parseAiReply(text: string): string | null {
  let s = text.trim();
  while (
    s.length >= 2 &&
    ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (s === "") return null;
  if (s.length > 1000) {
    const cut = s.lastIndexOf(" ", 999);
    s = cut > 0 ? s.slice(0, cut) : s.slice(0, 1000);
  }
  return s;
}

export type AiDmReplyResult = { ok: true; reply: string } | { ok: false; error: string };

export async function generateAiDmReply(
  settings: AiReplySettings,
  history: ChatTurn[],
  opts: { timeoutMs?: number; known?: { email?: string | null; phone?: string | null } } = {}
): Promise<AiDmReplyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not set up yet." };

  const { system, messages } = buildAiReplyPrompt(settings, history, opts.known);
  if (messages.length === 0) return { ok: false, error: "Nothing to reply to yet." };

  let text: string;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-haiku-5-5",
        max_tokens: 500,
        system,
        messages,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 20000),
    });
    if (!res.ok) return { ok: false, error: "AI request failed. Try again." };
    const data = (await res.json()) as { content?: { type?: string; text?: unknown }[] };
    const first = data.content?.[0]?.text;
    text = typeof first === "string" ? first : "";
  } catch {
    return { ok: false, error: "AI request failed. Try again." };
  }

  const reply = parseAiReply(text);
  if (reply === null) return { ok: false, error: "AI gave no usable reply. Try again." };
  return { ok: true, reply };
}
