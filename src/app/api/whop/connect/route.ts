import { whopAuthorizeUrl } from "@/lib/networks/moreApps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("whop", (flow) => whopAuthorizeUrl(flow.state, flow.verifier ?? ""), { pkce: true });
}
