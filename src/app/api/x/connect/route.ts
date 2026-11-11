import { startOAuth } from "@/lib/networks/routes";
import { xAuthorizeUrl } from "@/lib/networks/x";

export async function GET() {
  return startOAuth("x", (flow) => xAuthorizeUrl(flow.state, flow.verifier ?? ""), { pkce: true });
}
