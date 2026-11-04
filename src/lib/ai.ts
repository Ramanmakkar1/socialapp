// Server-only helper: asks Claude for caption ideas. The API key comes only from env vars.

export type CaptionIdea = { caption: string; hashtags: string[] };

export type CaptionIdeasResult =
  | { ok: true; ideas: CaptionIdea[] }
  | { ok: false; error: string };

const SYSTEM_PROMPT =
  'You write Instagram captions for small businesses. Reply with ONLY a JSON array of 3 objects: {"caption": string (under 2000 characters, no hashtags inside), "hashtags": string[] (5-10 tags, each starting with #, no spaces)}.';

const HASHTAG_RE = /^#[\p{L}\p{N}_]+$/u;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function parseIdeas(text: string): CaptionIdea[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end <= start) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const ideas: CaptionIdea[] = [];
  for (const item of parsed) {
    if (ideas.length >= 3) break;
    if (!item || typeof item !== "object") continue;
    const { caption, hashtags } = item as { caption?: unknown; hashtags?: unknown };
    if (typeof caption !== "string" || caption.trim() === "") continue;
    const tags = Array.isArray(hashtags)
      ? hashtags
          .filter((t): t is string => typeof t === "string" && HASHTAG_RE.test(t))
          .slice(0, 10)
      : [];
    ideas.push({ caption: caption.trim(), hashtags: tags });
  }
  return ideas;
}

export async function generateCaptionIdeas(input: {
  topic: string;
  draft?: string;
  tone?: string;
  brandVoice?: string;
}): Promise<CaptionIdeasResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not set up yet." };

  const lines = [`Topic: ${input.topic}`];
  if (input.draft) lines.push(`Current draft:\n${input.draft}`);
  if (input.tone) lines.push(`Tone: ${input.tone}`);
  if (input.brandVoice) lines.push(`Brand voice (follow this style): ${input.brandVoice}`);

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
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: lines.join("\n\n") }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return { ok: false, error: "AI request failed. Try again." };
    const data = (await res.json()) as { content?: { type?: string; text?: unknown }[] };
    const first = data.content?.[0]?.text;
    text = typeof first === "string" ? first : "";
  } catch {
    return { ok: false, error: "AI request failed. Try again." };
  }

  const ideas = parseIdeas(text);
  if (ideas.length === 0) return { ok: false, error: "AI gave no usable ideas. Try again." };
  return { ok: true, ideas };
}
