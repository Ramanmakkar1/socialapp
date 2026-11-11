import { startOAuth } from "@/lib/networks/routes";
import { tiktokAuthorizeUrl } from "@/lib/networks/tiktok";

export async function GET() {
  return startOAuth("tiktok", (flow) => tiktokAuthorizeUrl(flow.state));
}
