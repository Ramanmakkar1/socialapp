import { linkedinAuthorizeUrl } from "@/lib/networks/linkedin";
import { startOAuth } from "@/lib/networks/routes";

export async function GET() {
  return startOAuth("linkedin", (flow) => linkedinAuthorizeUrl(flow.state));
}
