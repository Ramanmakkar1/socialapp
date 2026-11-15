import { plurkRequestToken } from "@/lib/networks/apps";
import { settingsResultUrl, startOAuth } from "@/lib/networks/routes";

// OAuth 1.0a: get a request token first; its secret rides in the encrypted flow cookie.
export async function GET() {
  return startOAuth("plurk", async (flow) => {
    try {
      const rt = await plurkRequestToken(flow.state);
      flow.extra = { ...flow.extra, requestToken: rt.token, requestSecret: rt.secret };
      return rt.authorizeUrl;
    } catch {
      return settingsResultUrl("plurk", "error").toString();
    }
  });
}
