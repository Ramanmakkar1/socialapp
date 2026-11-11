import { pinterestAuthorizeUrl } from "@/lib/networks/pinterest";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("pinterest", (flow) => pinterestAuthorizeUrl(flow.state));
}
