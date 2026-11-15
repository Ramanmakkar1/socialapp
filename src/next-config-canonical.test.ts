import assert from "node:assert/strict";
import { test } from "node:test";
import config from "../next.config.ts";

const CANONICAL_LINK = '<https://poskoo.com/>; rel="canonical"';

test("root response sends the production canonical Link header", async () => {
  const headers = await config.headers!();
  const root = headers.find((entry) => entry.source === "/");

  assert.ok(root, "expected a header rule for source '/'");
  const link = root.headers.find((header) => header.key.toLowerCase() === "link");
  assert.ok(link, "expected the root rule to send a Link header");
  assert.equal(link.value, CANONICAL_LINK);
});
