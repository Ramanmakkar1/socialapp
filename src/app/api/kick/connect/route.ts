import { kickAuthorizeUrl } from "@/lib/networks/moreApps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("kick", (flow) => kickAuthorizeUrl(flow.state, flow.verifier ?? ""), { pkce: true });
}
