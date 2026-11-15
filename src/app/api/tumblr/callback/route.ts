import { TUMBLR_SCOPES, exchangeTumblrCode, tumblrPrimaryBlog } from "@/lib/networks/apps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "tumblr", async (code) => {
    const tokens = await exchangeTumblrCode(code);
    const blog = await tumblrPrimaryBlog(tokens.accessToken);
    return {
      externalId: blog.uuid,
      username: blog.name,
      tokens,
      scopes: TUMBLR_SCOPES,
      meta: { blog: blog.name, title: blog.title, url: blog.url },
    };
  });
}
