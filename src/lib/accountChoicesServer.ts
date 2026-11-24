// Server only: load the composer's per-network account choices (src/lib/accountChoices.ts).
import { query } from "@/lib/db";
import { buildAccountChoices, type AccountChoices, type SocialAccountChoiceRow, type YouTubeChoiceRow } from "@/lib/accountChoices";

export async function loadAccountChoices(userId: string): Promise<AccountChoices> {
  const [social, youtube] = await Promise.all([
    query<SocialAccountChoiceRow>(
      "select id, platform, username, page_name, auth_type, page_id from socialapp.social_accounts where user_id=$1 and status='active' order by created_at",
      [userId],
    ),
    query<YouTubeChoiceRow>("select id, title from socialapp.youtube_channels where user_id=$1 and status='active' order by updated_at desc", [userId]),
  ]);
  return buildAccountChoices(social, youtube);
}
