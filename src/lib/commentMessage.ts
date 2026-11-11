const USERNAME_TOKEN = /\{\{username\}\}/g;
const LINK_TOKEN = /\{\{link\}\}/g;

export const COMMENT_USERNAME_FALLBACK = "there";

export type CommentDmMessageInput = {
  dmText: string;
  fromUsername: string | null;
  linkUrl: string | null;
  emailGate: boolean;
  followGate: boolean;
  /** Resolved tracked link for ungated sends; omit when gates withhold the URL. */
  resolvedLink?: string | null;
};

function replaceTokens(
  text: string,
  pattern: RegExp,
  value: string,
): string {
  return text.replace(pattern, () => value);
}

function templateHasLinkToken(dmText: string): boolean {
  return dmText.includes("{{link}}");
}

export function buildCommentDmMessage(input: CommentDmMessageInput): string {
  const username =
    typeof input.fromUsername === "string" && input.fromUsername.trim()
      ? input.fromUsername.trim()
      : COMMENT_USERNAME_FALLBACK;

  let message = replaceTokens(input.dmText, USERNAME_TOKEN, username);

  const gated = input.emailGate || input.followGate;
  const hasLinkToken = templateHasLinkToken(input.dmText);

  if (gated) {
    message = replaceTokens(message, LINK_TOKEN, "");
    if (input.followGate && input.linkUrl) {
      if (input.emailGate) {
        message +=
          "\n\nFollow us, then reply here with your email address and I'll send you the link.";
      } else {
        message +=
          "\n\nFollow us first, then reply 'done' to this message and I'll send you the link.";
      }
    } else if (input.emailGate && input.linkUrl) {
      message +=
        "\n\nReply to this message with your email address and I'll send you the link right away.";
    }
    return message;
  }

  const link = input.resolvedLink ?? input.linkUrl;
  if (link) {
    message = replaceTokens(message, LINK_TOKEN, link);
    if (!hasLinkToken) {
      message += "\n" + link;
    }
  }
  // No link: {{link}} is left in place on purpose. Saving/activating such a rule is refused, and the
  // send worker fails any queued message that still contains it (never sends a broken DM).
  return message;
}
