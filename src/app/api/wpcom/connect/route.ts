import { wpcomAuthorizeUrl } from "@/lib/networks/apps";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("wpcom", (flow) => wpcomAuthorizeUrl(flow.state));
}
