// Server-only helper: asks Claude for caption ideas, per-network caption variants and campaign
// drafts. The API key comes only from env vars; without ANTHROPIC_API_KEY every call returns an
// "AI is not set up" result instead of throwing.
import { fitCaption, isKnownPlatform, networkGuide } from "@/lib/captionFit";
import type { PlatformId } from "@/lib/platforms";

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

/** Cheap model for short idea lists; quality model for campaigns and per-network rewrites. */
const FAST_MODEL = "claude-haiku-5-5";
const QUALITY_MODEL = "claude-sonnet-5-5";
// Server-side refusal fallback (Anthropic routes a declined request to a fallback model itself).
const FALLBACK_MODELS = new Set(["claude-sonnet-5-5", "claude-opus-5-5"]);

/** The first text block of a Messages API reply (thinking blocks come first on current models). */
export function replyText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const { content, stop_reason } = data as { content?: unknown; stop_reason?: unknown };
  if (stop_reason === "refusal" || !Array.isArray(content)) return null;
  for (const block of content) {
    if (block && typeof block === "object" && (block as { type?: unknown }).type === "text") {
      const t = (block as { text?: unknown }).text;
      if (typeof t === "string") return t;
    }
  }
  return null;
}

/**
 * One Messages API call. Returns the reply text, or null when AI is off, the request fails or the
 * model declines. The key only ever comes from ANTHROPIC_API_KEY; AI_MODEL / AI_QUALITY_MODEL can
 * override the model ids.
 */
export async function callClaude(input: {
  system: string;
  user: string;
  maxTokens: number;
  quality?: boolean;
  timeoutMs?: number;
}): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const model = input.quality
    ? process.env.AI_QUALITY_MODEL || QUALITY_MODEL
    : process.env.AI_MODEL || FAST_MODEL;
  const fallback = FALLBACK_MODELS.has(model);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        ...(fallback ? { "anthropic-beta": "server-side-fallback-2026-07-01" } : {}),
      },
      body: JSON.stringify({
        model,
        max_tokens: input.maxTokens,
        system: input.system,
        messages: [{ role: "user", content: input.user }],
        // Current models think adaptively by default; effort keeps short idea lists quick and cheap.
        output_config: { effort: input.quality ? "medium" : "low" },
        ...(fallback ? { fallbacks: "default" } : {}),
      }),
      signal: AbortSignal.timeout(input.timeoutMs ?? 20000),
    });
    if (!res.ok) return null;
    return replyText(await res.json());
  } catch {
    return null;
  }
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

export type DmIdeasResult = { ok: true; ideas: string[] } | { ok: false; error: string };

const DM_SYSTEM_PROMPT =
  'You write short, friendly Instagram DMs that a business sends automatically to someone who commented a keyword. Reply with ONLY a JSON array of 3 strings. Each string is under 600 characters, starts with a greeting that uses {{username}}, and contains {{link}} exactly once where the link goes (unless told there is no link). Use plain words, at most 2 emojis, no hashtags.';

export function parseDmIdeas(text: string, requireLink: boolean): string[] {
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
  const ideas: string[] = [];
  for (const item of parsed) {
    if (ideas.length >= 3) break;
    if (typeof item !== "string") continue;
    const s = item.trim();
    if (s === "" || s.length > 1000) continue;
    if (requireLink && !s.includes("{{link}}")) continue;
    ideas.push(s);
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

  const text = await callClaude({ system: SYSTEM_PROMPT, user: lines.join("\n\n"), maxTokens: 800 });
  if (text === null) return { ok: false, error: "AI request failed. Try again." };

  const ideas = parseIdeas(text);
  if (ideas.length === 0) return { ok: false, error: "AI gave no usable ideas. Try again." };
  return { ok: true, ideas };
}

export async function generateDmIdeas(input: {
  goal: string;
  keyword?: string;
  hasLink: boolean;
  emailGate?: boolean;
  tone?: string;
  brandVoice?: string;
}): Promise<DmIdeasResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not set up yet." };

  const lines = [`What the DM is for: ${input.goal}`];
  if (input.keyword) lines.push(`Keyword they commented: ${input.keyword}`);
  lines.push(
    input.hasLink
      ? "There is a link: include {{link}} once."
      : "There is no link: do not use {{link}}.",
  );
  if (input.emailGate)
    lines.push(
      "The link is sent only after they reply with their email, so this first message should ask for their email.",
    );
  if (input.tone) lines.push(`Tone: ${input.tone}`);
  if (input.brandVoice) lines.push(`Brand voice (follow this style): ${input.brandVoice}`);

  const text = await callClaude({ system: DM_SYSTEM_PROMPT, user: lines.join("\n\n"), maxTokens: 700 });
  if (text === null) return { ok: false, error: "AI request failed. Try again." };

  const ideas = parseDmIdeas(text, input.hasLink && !input.emailGate);
  if (ideas.length === 0) return { ok: false, error: "AI gave no usable ideas. Try again." };
  return { ok: true, ideas };
}

// ---- Per-network caption variants ("Tailor per network") ------------------------------------------

export type VariantsResult =
  | { ok: true; variants: Partial<Record<PlatformId, string>> }
  | { ok: false; error: string };

const VARIANTS_SYSTEM_PROMPT =
  "You adapt one social media caption for several networks. Keep the facts, offer, links and @mentions of the original; never invent prices, dates or claims. Respect each network's hard character limit and conventions. Reply with ONLY a JSON object whose keys are the network ids you were given and whose values are the caption strings.";

function sliceJson(text: string, open: "{" | "["): unknown {
  const close = open === "{" ? "}" : "]";
  const start = text.indexOf(open);
  const end = text.lastIndexOf(close);
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Parses the variants reply: only the requested networks, non-empty strings, each fitted to the
 * network's limits (fitCaption) so the result always passes the composer's checks.
 */
export function parseVariants(
  text: string,
  platforms: PlatformId[],
  maxOverrides: Partial<Record<string, number>> = {},
): Partial<Record<PlatformId, string>> {
  const parsed = sliceJson(text, "{");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: Partial<Record<PlatformId, string>> = {};
  for (const platform of platforms) {
    const value = (parsed as Record<string, unknown>)[platform];
    if (typeof value !== "string" || value.trim() === "") continue;
    out[platform] = fitCaption(platform, value, maxOverrides[platform]);
  }
  return out;
}

export async function generateNetworkVariants(input: {
  caption: string;
  platforms: PlatformId[];
  brandVoice?: string;
  maxOverrides?: Partial<Record<string, number>>;
}): Promise<VariantsResult> {
  if (!isAiConfigured()) return { ok: false, error: "AI is not set up yet." };
  const platforms = input.platforms.filter(isKnownPlatform);
  if (platforms.length === 0) return { ok: false, error: "Select at least one network." };
  const lines = [
    "Networks:",
    ...platforms.map((p) => networkGuide(p, input.maxOverrides?.[p])),
    `Original caption:\n${input.caption}`,
  ];
  if (input.brandVoice) lines.push(`Brand voice (follow this style): ${input.brandVoice}`);
  const text = await callClaude({
    system: VARIANTS_SYSTEM_PROMPT,
    user: lines.join("\n\n"),
    maxTokens: 8000,
    quality: true,
    timeoutMs: 60000,
  });
  if (text === null) return { ok: false, error: "AI request failed. Try again." };
  const variants = parseVariants(text, platforms, input.maxOverrides);
  if (Object.keys(variants).length === 0) return { ok: false, error: "AI gave no usable captions. Try again." };
  return { ok: true, variants };
}

// ---- Campaign from a brief -------------------------------------------------------------------------

export type CampaignPostDraft = {
  angle: string;
  caption: string;
  /** Per-network rewrites, already fitted to each network's limits. */
  variants: Partial<Record<PlatformId, string>>;
  ytTitle?: string;
};

export type CampaignDraftsResult =
  | { ok: true; name: string; posts: CampaignPostDraft[] }
  | { ok: false; error: string };

const CAMPAIGN_SYSTEM_PROMPT =
  'You plan short social media campaigns for small businesses and creators. Given a brief, write a sequence of distinct posts that build toward the goal (for example: teaser, value, social proof, offer, reminder, last chance), each with its own angle. Never invent prices, discounts, dates, testimonials or claims that are not in the brief. Reply with ONLY a JSON object: {"name": string (a 2-5 word campaign name), "posts": [{"angle": string (a few words), "caption": string (the main caption, hashtags included at the end), "variants": {network id: caption rewritten for that network}, "youtubeTitle": string (under 100 characters, only when youtube is a network)}]}. Include a variant for every network whose limit or style differs from the main caption.';

export function parseCampaignDrafts(
  text: string,
  platforms: PlatformId[],
  count: number,
  maxOverrides: Partial<Record<string, number>> = {},
): { name: string; posts: CampaignPostDraft[] } {
  const parsed = sliceJson(text, "{");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { name: "", posts: [] };
  const { name, posts } = parsed as { name?: unknown; posts?: unknown };
  const out: CampaignPostDraft[] = [];
  if (Array.isArray(posts)) {
    for (const item of posts) {
      if (out.length >= count) break;
      if (!item || typeof item !== "object") continue;
      const { angle, caption, variants, youtubeTitle } = item as Record<string, unknown>;
      if (typeof caption !== "string" || caption.trim() === "") continue;
      const fitted: Partial<Record<PlatformId, string>> = {};
      if (variants && typeof variants === "object" && !Array.isArray(variants)) {
        for (const platform of platforms) {
          const v = (variants as Record<string, unknown>)[platform];
          if (typeof v === "string" && v.trim() !== "") fitted[platform] = fitCaption(platform, v, maxOverrides[platform]);
        }
      }
      const yt = typeof youtubeTitle === "string" ? youtubeTitle.trim().slice(0, 100) : "";
      out.push({
        angle: typeof angle === "string" ? angle.trim().slice(0, 80) : "",
        caption: caption.trim().slice(0, 5000),
        variants: fitted,
        ...(yt ? { ytTitle: yt } : {}),
      });
    }
  }
  return { name: typeof name === "string" ? name.trim().slice(0, 40) : "", posts: out };
}

export async function generateCampaignDrafts(input: {
  brief: string;
  platforms: PlatformId[];
  count: number;
  tone?: string;
  brandVoice?: string;
  maxOverrides?: Partial<Record<string, number>>;
}): Promise<CampaignDraftsResult> {
  if (!isAiConfigured()) return { ok: false, error: "AI is not set up yet." };
  const platforms = input.platforms.filter(isKnownPlatform);
  const lines = [
    `Brief:\n${input.brief}`,
    `Number of posts: ${input.count}`,
    "Networks:",
    ...platforms.map((p) => networkGuide(p, input.maxOverrides?.[p])),
  ];
  if (input.tone) lines.push(`Tone: ${input.tone}`);
  if (input.brandVoice) lines.push(`Brand voice (follow this style): ${input.brandVoice}`);
  const text = await callClaude({
    system: CAMPAIGN_SYSTEM_PROMPT,
    user: lines.join("\n\n"),
    maxTokens: 16000,
    quality: true,
    timeoutMs: 120000,
  });
  if (text === null) return { ok: false, error: "AI request failed. Try again." };
  const { name, posts } = parseCampaignDrafts(text, platforms, input.count, input.maxOverrides);
  if (posts.length === 0) return { ok: false, error: "AI gave no usable posts. Try again." };
  return { ok: true, name, posts };
}
