import { NextResponse } from "next/server";

import { NetworkAuthError } from "@/lib/networks/common";
import { mastodonAuthorizeUrl, normalizeInstance } from "@/lib/networks/mastodon";
import { getOrRegisterMastodonApp } from "@/lib/networks/mastodonApps";
import { settingsResultUrl, startOAuth } from "@/lib/networks/routes";
import { requireWorkspaceUser } from "@/lib/workspace";

// GET /api/mastodon/connect?instance=mastodon.social (the Connect dialog's one-field form).
export async function GET(request: Request) {
  await requireWorkspaceUser("admin");
  const instance = normalizeInstance(new URL(request.url).searchParams.get("instance") ?? "");
  if (!instance) return NextResponse.redirect(settingsResultUrl("mastodon", "bad_instance"));
  try {
    const app = await getOrRegisterMastodonApp(instance);
    return await startOAuth("mastodon", (flow) => mastodonAuthorizeUrl(instance, app.clientId, flow.state, flow.verifier ?? ""), {
      pkce: true,
      extra: { instance },
    });
  } catch (err) {
    const code = err instanceof NetworkAuthError && err.reason === "instance_unreachable" ? "instance_unreachable" : "error";
    console.error("mastodon connect failed", code);
    return NextResponse.redirect(settingsResultUrl("mastodon", code));
  }
}
