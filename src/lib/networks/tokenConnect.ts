// Server only: check a token network's credentials once and turn them into a stored account.
// The Connect dialog's generic token form posts here (connectTokenNetworkAction).
import { safeFetch } from "@/lib/netGuard";
import { connectDevto, connectDiscourse, connectGhost, connectHashnode, connectListmonk, connectWordPress } from "@/lib/networks/blogs";
import { connectDiscord, connectMatrix, connectMattermost, connectSlack, connectTelegram } from "@/lib/networks/chat";
import type { Fetch } from "@/lib/networks/common";
import { connectMisskey, connectPeerTube, connectPixelfed } from "@/lib/networks/fediverse";
import { connectNostr } from "@/lib/networks/nostr";
import type { SaveAccountInput } from "@/lib/networks/store";
import { TOKEN_NETWORKS, type TokenNetworkId } from "@/lib/networks/tokenNetworks";

type Connect = (fields: Record<string, string>, fetchImpl?: Fetch) => Promise<SaveAccountInput>;

const CONNECT: Record<TokenNetworkId, Connect> = {
  telegram: connectTelegram,
  discord: connectDiscord,
  slack: connectSlack,
  mattermost: connectMattermost,
  matrix: connectMatrix,
  misskey: connectMisskey,
  pixelfed: connectPixelfed,
  peertube: connectPeerTube,
  devto: connectDevto,
  hashnode: connectHashnode,
  ghost: connectGhost,
  wordpress: connectWordPress,
  discourse: connectDiscourse,
  listmonk: connectListmonk,
  // Nostr talks to relays over WebSocket, not fetch.
  nostr: (fields) => connectNostr(fields),
};

/** The spec's fields from the form (trimmed, capped); a missing required field -> its label. */
export function readTokenFields(network: TokenNetworkId, get: (name: string) => string): { fields: Record<string, string> } | { missing: string } {
  const fields: Record<string, string> = {};
  for (const field of TOKEN_NETWORKS[network].fields) {
    // Passwords keep inner spaces (WordPress application passwords contain spaces; they are optional there).
    const value = get(field.name).trim().slice(0, 2000);
    if (!value && !field.optional) return { missing: field.label };
    fields[field.name] = value;
  }
  return { fields };
}

export function connectTokenNetwork(network: TokenNetworkId, fields: Record<string, string>, fetchImpl: Fetch = safeFetch): Promise<SaveAccountInput> {
  return CONNECT[network](fields, fetchImpl);
}
