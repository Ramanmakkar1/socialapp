import { twitchAuthorizeUrl } from "@/lib/networks/apps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("twitch", (flow) => twitchAuthorizeUrl(flow.state));
}
