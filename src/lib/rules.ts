export type DmRule = {
  id: string;
  name: string;
  keywords: string[];
  matchMode: 'any' | 'exact' | 'contains';
  triggers: ('comment' | 'story_reply' | 'dm')[];
  replyPublicly: boolean;
  publicReplies: string[];
  dmMessage: string;
  linkUrl?: string;
  linkLabel?: string;
  askEmail: boolean;
  requireFollow: boolean;
  active: boolean;
};

const EDGE_NON_WORD = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

export function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase().trim().replace(EDGE_NON_WORD, '').trim();
}

function hasWholeWord(text: string, keyword: string): boolean {
  let offset = 0;
  while (offset <= text.length - keyword.length) {
    const index = text.indexOf(keyword, offset);
    if (index < 0) return false;
    const before = index === 0 ? '' : Array.from(text.slice(0, index)).at(-1) ?? '';
    const after = Array.from(text.slice(index + keyword.length))[0] ?? '';
    if ((!before || !/[\p{L}\p{N}_]/u.test(before)) && (!after || !/[\p{L}\p{N}_]/u.test(after))) return true;
    offset = index + 1;
  }
  return false;
}

export function matchRule(rule: DmRule, input: { text: string; trigger: DmRule['triggers'][number] }): { matched: boolean; keyword?: string } {
  if (!rule.active || !rule.triggers.includes(input.trigger)) return { matched: false };
  if (rule.matchMode === 'any') return { matched: true };
  const text = normalize(input.text);
  for (const rawKeyword of rule.keywords) {
    const keyword = normalize(rawKeyword);
    if (!keyword) continue;
    const matched = rule.matchMode === 'exact' ? text === keyword : hasWholeWord(text, keyword);
    if (matched) return { matched: true, keyword };
  }
  return { matched: false };
}

export function renderDm(rule: DmRule, input: { username: string }): string {
  return rule.dmMessage.replace(/\{\{username\}\}/g, input.username).replace(/\{\{link\}\}/g, rule.linkUrl ?? '');
}

export function validateRule(rule: DmRule): string[] {
  const errors: string[] = [];
  if (rule.matchMode !== 'any' && !rule.keywords.some((keyword) => normalize(keyword))) errors.push('Add at least one keyword, or choose “Any comment”.');
  if (!rule.dmMessage.trim()) errors.push('DM message is required.');
  if (rule.dmMessage.length > 1000) errors.push('DM message must be 1000 characters or fewer.');
  if ((rule.askEmail || rule.requireFollow) && !rule.linkUrl?.trim()) {
    errors.push('Link URL is required when asking for email or requiring a follow.');
  }
  if (rule.linkUrl && !rule.linkUrl.startsWith('https://')) errors.push('Link URL must start with https://.');
  return errors;
}
