import { vkAuthorizeUrl } from "@/lib/networks/moreApps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("vk", (flow) => vkAuthorizeUrl(flow.state, flow.verifier ?? ""), { pkce: true });
}
