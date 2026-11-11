import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DM_TEMPLATES } from '@/lib/dmTemplates';
import { CATEGORIES, categoriesFor, visibleIn } from './categories';

test('the gallery tabs are All, Featured, Lead magnets, Selling products, Events and calls, Content and downloads', () => {
  assert.deepEqual(
    CATEGORIES.map((c) => c.label),
    ['All', 'Featured', 'Lead magnets', 'Selling products', 'Events and calls', 'Content and downloads'],
  );
});

test('every template appears in the All tab and in at least one goal tab', () => {
  for (const t of DM_TEMPLATES) {
    assert.ok(visibleIn(t, 'all'), `${t.slug} missing from All`);
    const goalTabs = CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'popular');
    assert.ok(goalTabs.some((c) => visibleIn(t, c.id)), `${t.slug} has no goal tab`);
  }
});

test('unknown slugs have no categories', () => {
  assert.deepEqual(categoriesFor('does-not-exist'), []);
});
