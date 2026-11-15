import { exchangeWpcomCode, wpcomSiteName } from "@/lib/networks/apps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "wpcom", async (code) => {
    const { tokens, blogId, blogUrl } = await exchangeWpcomCode(code);
    const name = await wpcomSiteName(blogId, tokens.accessToken);
    return {
      externalId: blogId,
      username: name || blogUrl.replace(/^https?:\/\//, "") || `Site ${blogId}`,
      tokens,
      scopes: ["global_single_site"],
      meta: { blogId, blogUrl },
    };
  });
}
