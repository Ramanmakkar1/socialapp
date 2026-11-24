import { redditAuthorizeUrl } from "@/lib/networks/moreApps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("reddit", (flow) => redditAuthorizeUrl(flow.state));
}
