import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DM_TEMPLATES, toRule } from './dmTemplates';
import { matchRule, validateRule } from './rules';

test('there are 10 to 12 templates', () => {
  assert.ok(DM_TEMPLATES.length >= 10 && DM_TEMPLATES.length <= 12);
});

test('slugs are unique', () => {
  const slugs = DM_TEMPLATES.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('every template builds a valid inactive rule once the owner adds their link', () => {
  for (const t of DM_TEMPLATES) {
    const rule = toRule(t);
    // Templates ship without a destination; the rule form asks for one (required for gated rules).
    assert.deepEqual(validateRule({ ...rule, linkUrl: 'https://example.com/offer' }), [], t.slug);
    assert.equal(rule.active, false, t.slug);
    assert.ok(t.dmMessage.length < 1000, t.slug);
    assert.equal(rule.replyPublicly, Boolean(t.publicReply), t.slug);
  }
});

test('only {{username}} and {{link}} placeholders are used', () => {
  for (const t of DM_TEMPLATES) {
    const placeholders = t.dmMessage.match(/\{\{[^}]*\}\}/g) ?? [];
    for (const p of placeholders) assert.ok(p === '{{username}}' || p === '{{link}}', `${t.slug}: ${p}`);
  }
});

test('an active rule matches each of its own keywords', () => {
  for (const t of DM_TEMPLATES) {
    const rule = { ...toRule(t), active: true };
    const trigger = rule.triggers[0];
    for (const keyword of t.keywords) {
      assert.equal(matchRule(rule, { text: `${keyword.toLowerCase()} please!`, trigger }).matched, true, `${t.slug}: ${keyword}`);
    }
  }
});

test('story template uses story_reply trigger and no public reply', () => {
  const rule = toRule(DM_TEMPLATES.find((t) => t.slug === 'story-freebie')!);
  assert.deepEqual(rule.triggers, ['story_reply']);
  assert.equal(rule.replyPublicly, false);
  assert.deepEqual(rule.publicReplies, []);
});
