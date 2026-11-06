export type MessageEvent = {
  accountExternalId: string;
  senderId: string;
  text: string;
  mid: string | null;
  /** True when the message is a reply to one of the account's stories (message.reply_to.story). */
  storyReply?: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function extractMessageEvents(body: unknown): MessageEvent[] {
  const out: MessageEvent[] = [];
  try {
    if (!isRecord(body) || !Array.isArray(body.entry)) {
      return out;
    }
    for (const entry of body.entry) {
      if (!isRecord(entry) || entry.id === undefined || entry.id === null) {
        continue;
      }
      if (!Array.isArray(entry.messaging)) {
        continue;
      }
      const accountExternalId = String(entry.id);
      for (const item of entry.messaging) {
        if (!isRecord(item)) {
          continue;
        }
        const message = item.message;
        if (!isRecord(message)) {
          continue;
        }
        if (message.is_echo === true) {
          continue;
        }
        if (typeof message.text !== "string" || !message.text) {
          continue;
        }
        const sender = item.sender;
        if (!isRecord(sender) || sender.id === undefined || sender.id === null) {
          continue;
        }
        const senderId = String(sender.id);
        if (senderId === accountExternalId) {
          continue;
        }
        let mid: string | null = null;
        if (message.mid != null) {
          mid = String(message.mid);
        }
        const replyTo = message.reply_to;
        const storyReply = isRecord(replyTo) && isRecord(replyTo.story);
        out.push({
          accountExternalId,
          senderId,
          text: message.text,
          mid,
          ...(storyReply ? { storyReply: true } : {}),
        });
      }
    }
  } catch {
    // never throw on malformed webhook payloads
  }
  return out;
}

export function extractEmail(text: string): string | null {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (!match) {
    return null;
  }
  return match[0].toLowerCase().replace(/\.+$/, "");
}

export function extractPhone(text: string): string | null {
  const match = text.match(/\+?\d[\d\s().-]{7,}\d/);
  if (!match) {
    return null;
  }
  const normalized = match[0].replace(/[^\d+]/g, "");
  const digitsOnly = normalized.replace(/\D/g, "");
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return null;
  }
  if (normalized.startsWith("+")) {
    return "+" + digitsOnly;
  }
  return digitsOnly;
}
