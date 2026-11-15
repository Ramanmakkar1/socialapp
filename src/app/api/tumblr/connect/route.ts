import { tumblrAuthorizeUrl } from "@/lib/networks/apps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("tumblr", (flow) => tumblrAuthorizeUrl(flow.state));
}
