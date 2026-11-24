import { dribbbleAuthorizeUrl } from "@/lib/networks/moreApps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("dribbble", (flow) => dribbbleAuthorizeUrl(flow.state));
}
