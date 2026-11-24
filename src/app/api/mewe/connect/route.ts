import { meweAuthorizeUrl } from "@/lib/networks/moreApps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("mewe", (flow) => meweAuthorizeUrl(flow.state));
}
