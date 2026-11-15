import assert from "node:assert/strict";
import { test } from "node:test";
import { MCP_TOOLS } from "@/lib/mcp";
import { ASSISTANT_GUIDES, ASSISTANT_ORDER, ASSISTANT_TOOLS } from "@/lib/aiAssistantGuides";

// The "schedule posts with <assistant>" pages must only promise tools the MCP server really has.
test("assistant pages list exactly the MCP tools the server exposes", () => {
  assert.deepEqual(
    ASSISTANT_TOOLS.map((t) => t.name).sort(),
    MCP_TOOLS.map((t) => t.name).sort(),
  );
});

test("every example prompt names a real MCP tool", () => {
  const names = new Set(MCP_TOOLS.map((t) => t.name));
  for (const slug of ASSISTANT_ORDER) {
    for (const p of ASSISTANT_GUIDES[slug].prompts) assert.ok(names.has(p.tool), `${slug}: unknown tool ${p.tool}`);
  }
});

test("assistant pages only claim the channels create_post accepts", () => {
  const createPost = MCP_TOOLS.find((t) => t.name === "create_post");
  const channel = (createPost?.inputSchema.properties as Record<string, { enum?: string[] }>).channel;
  assert.deepEqual(channel.enum, ["instagram", "facebook", "threads", "youtube"], "update the copy in aiAssistantGuides.ts when MCP channels change");
});

test("assistant page titles and descriptions fit search snippets and are unique", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const slug of ASSISTANT_ORDER) {
    const g = ASSISTANT_GUIDES[slug];
    assert.equal(g.path, `/schedule-posts-with-${slug}`);
    assert.ok(g.title.length <= 60, `${slug} title is ${g.title.length} chars`);
    assert.ok(g.description.length <= 155, `${slug} description is ${g.description.length} chars`);
    assert.ok(!titles.has(g.title) && !descriptions.has(g.description), `${slug} repeats a title or description`);
    titles.add(g.title);
    descriptions.add(g.description);
  }
});
