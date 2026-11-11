import { gbpAuthorizeUrl } from "@/lib/networks/gbp";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("gbp", (flow) => gbpAuthorizeUrl(flow.state, flow.verifier ?? ""), { pkce: true });
}
