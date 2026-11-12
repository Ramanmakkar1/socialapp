// Pure (client-safe): what the Connect dialog says about channels that are built but not switched
// on yet (server keys missing, or the platform hasn't approved Poskoo's app). One small map, driven
// by env flags, so flipping a channel on later is a config change:
//   - a channel is "ready" once its server keys are configured (LinkedIn Pages also needs
//     LINKEDIN_PAGES_ENABLED=1),
//   - CHANNEL_STATUS_<ID>=ready|awaiting|soon overrides the wording (ready still needs the keys).

export type ComingChannel = "tiktok" | "pinterest" | "x" | "gbp" | "linkedin_pages";
export const COMING_CHANNELS: ComingChannel[] = ["tiktok", "pinterest", "x", "gbp", "linkedin_pages"];

export type ChannelState = "ready" | "awaiting" | "soon";

export type ChannelStatus = {
  state: ChannelState;
  /** Short text for the pill on the card ("" when ready). */
  pill: string;
  /** Panel heading and explanation shown when the card is clicked. */
  title: string;
  body: string;
};

type Config = { name: string; reviewer: string; whenOff: Exclude<ChannelState, "ready">; why: string };

export const CHANNEL_STATUS_CONFIG: Record<ComingChannel, Config> = {
  tiktok: {
    name: "TikTok",
    reviewer: "TikTok",
    whenOff: "awaiting",
    why: "TikTok reviews every app that publishes for creators (Content Posting API audit). Poskoo's TikTok publishing is built and waiting for that review.",
  },
  pinterest: {
    name: "Pinterest",
    reviewer: "Pinterest",
    whenOff: "awaiting",
    why: "Pinterest has to grant Poskoo standard API access before it can create Pins on your boards. Pin publishing is built and waiting for that approval.",
  },
  x: {
    name: "X (Twitter)",
    reviewer: "X",
    whenOff: "soon",
    why: "Posting to X needs a paid X API plan for Poskoo. Publishing is built; we're switching it on soon.",
  },
  gbp: {
    name: "Google Business Profile",
    reviewer: "Google",
    whenOff: "awaiting",
    why: "Google grants Business Profile API access app by app. Poskoo has applied; posting to your locations is built and waiting for Google's approval.",
  },
  linkedin_pages: {
    name: "LinkedIn Pages",
    reviewer: "LinkedIn",
    whenOff: "awaiting",
    why: "Posting to company Pages needs LinkedIn's Community Management API, which LinkedIn approves separately. Posting to your personal LinkedIn profile works today.",
  },
};

function asState(v: string | undefined): ChannelState | null {
  const s = (v ?? "").trim().toLowerCase();
  return s === "ready" || s === "awaiting" || s === "soon" ? s : null;
}

export function envKey(id: ComingChannel): string {
  return `CHANNEL_STATUS_${id.toUpperCase()}`;
}

/** Status of one channel from "are its keys configured" plus an optional env override. */
export function channelStatus(id: ComingChannel, configured: boolean, override?: string): ChannelStatus {
  const c = CHANNEL_STATUS_CONFIG[id];
  let state = asState(override) ?? (configured ? "ready" : c.whenOff);
  if (state === "ready" && !configured) state = c.whenOff;
  if (state === "ready") return { state, pill: "", title: c.name, body: "" };
  if (state === "awaiting") {
    return { state, pill: `Awaiting ${c.reviewer} approval`, title: `${c.name} is waiting for ${c.reviewer}'s approval`, body: c.why };
  }
  return { state, pill: "Coming soon", title: `${c.name} is coming soon`, body: c.why };
}

/** Every coming channel's status (server side: pass process.env and which keys are configured). */
export function channelStatuses(configured: Record<ComingChannel, boolean>, env: Record<string, string | undefined>): Record<ComingChannel, ChannelStatus> {
  const out = {} as Record<ComingChannel, ChannelStatus>;
  for (const id of COMING_CHANNELS) out[id] = channelStatus(id, configured[id], env[envKey(id)]);
  return out;
}

/** Generic "not switched on" status for channels outside the map (Threads / YouTube / Instagram keys missing). */
export function unavailableStatus(name: string): ChannelStatus {
  return {
    state: "soon",
    pill: "Coming soon",
    title: `${name} isn't switched on yet`,
    body: `Connecting ${name} isn't switched on on this server yet. Tap “Notify me” and we'll let you know when it is.`,
  };
}

/** Channel requests and "notify me" entries: tidy the free-text inputs (null = invalid). */
export function cleanChannelRequest(channel: string, note: string): { channel: string; note: string | null } | null {
  const c = channel.replace(/\s+/g, " ").trim().slice(0, 80);
  if (c.length < 2) return null;
  const n = note.replace(/\r\n/g, "\n").trim().slice(0, 500);
  return { channel: c, note: n || null };
}
