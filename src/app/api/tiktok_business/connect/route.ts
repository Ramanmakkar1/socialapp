import { tiktokBusinessAuthorizeUrl } from "@/lib/networks/moreApps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("tiktok_business", (flow) => tiktokBusinessAuthorizeUrl(flow.state));
}
