// Single list of every free tool: the /tools hub grid, related-tool chips and the template's
// breadcrumbs all read from here, so a new tool is added once.

export type ToolCategory = "create" | "media" | "plan" | "dm";

export type ToolPlatform =
  | "instagram" | "tiktok" | "x" | "youtube" | "linkedin" | "facebook" | "threads" | "pinterest" | "other";

export const TOOL_PLATFORMS: { id: ToolPlatform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "x", label: "X (Twitter)" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "threads", label: "Threads" },
  { id: "pinterest", label: "Pinterest" },
  { id: "other", label: "Other & multi-platform" },
];

/** Lucide icon names used by the hub cards (mapped to components in ToolIcon.tsx). */
export type ToolIconName =
  | "sparkles" | "hash" | "type" | "pilcrow" | "align" | "layers" | "lightbulb" | "megaphone" | "user" | "at"
  | "eye" | "message" | "image" | "gallery" | "scissors" | "square-stack" | "frame" | "smartphone" | "circle"
  | "clapperboard" | "palette" | "calendar" | "chart" | "check" | "globe" | "gauge" | "percent" | "key"
  | "workflow" | "calculator" | "link" | "gift" | "tag" | "list";

export type ToolEntry = {
  href: string;
  /** Short name used on cards, chips and breadcrumbs. */
  name: string;
  /** One-line summary for the hub card. */
  summary: string;
  category: ToolCategory;
  icon: ToolIconName;
};

export const TOOL_CATEGORIES: { id: ToolCategory; label: string; blurb: string }[] = [
  { id: "create", label: "Write & format", blurb: "Captions, hashtags, hooks, bios and fonts." },
  { id: "media", label: "Images & video", blurb: "Sizes, crops, carousels, Stories and covers." },
  { id: "plan", label: "Plan & measure", blurb: "Calendars, checklists, time zones and metrics." },
  { id: "dm", label: "Comments & DMs", blurb: "Keywords, DM flows, links and giveaways." },
];

export const TOOLS: ToolEntry[] = [
  // Write & format
  { href: "/tools/instagram-caption-generator", name: "Caption generator", summary: "Caption drafts with a hook, clean line breaks and a comment CTA for any niche.", category: "create", icon: "sparkles" },
  { href: "/tools/instagram-caption-counter", name: "Caption counter", summary: "Count characters and hashtags as you type against Instagram's caption limits.", category: "create", icon: "type" },
  { href: "/tools/x-character-counter", name: "X character counter", summary: "Count characters the way X does: links as 23, emoji as 2, against the 280 limit.", category: "create", icon: "type" },
  { href: "/tools/instagram-caption-formatter", name: "Caption formatter", summary: "Keep blank lines and spacing in a caption, with live counts and copy.", category: "create", icon: "align" },
  { href: "/tools/instagram-line-break-generator", name: "Line break generator", summary: "Stop paragraphs collapsing into one block of text in your captions.", category: "create", icon: "pilcrow" },
  { href: "/tools/instagram-font-generator", name: "Font generator", summary: "Copy Unicode font styles for your Instagram bio and captions.", category: "create", icon: "type" },
  { href: "/tools/tiktok-font-generator", name: "TikTok font generator", summary: "Copy-and-paste Unicode fonts for your TikTok bio, name and captions, checked against the 80-character bio limit.", category: "create", icon: "type" },
  { href: "/tools/x-font-generator", name: "X font generator", summary: "Copy bold, italic and fancy Unicode text for X posts and your bio.", category: "create", icon: "type" },
  { href: "/tools/instagram-hashtag-generator", name: "Hashtag generator", summary: "Hand-curated hashtag sets for 15 niches, mixed broad to specific, up to 30 tags.", category: "create", icon: "hash" },
  { href: "/tools/instagram-hashtag-strategy", name: "Hashtag strategy worksheet", summary: "Group tags into broad, niche and branded sets and save them in your browser.", category: "create", icon: "layers" },
  { href: "/tools/instagram-hook-generator", name: "Hook generator", summary: "Ready-to-copy Reel hooks for any topic across eight hook styles.", category: "create", icon: "megaphone" },
  { href: "/tools/tiktok-hook-generator", name: "TikTok hook generator", summary: "Scroll-stopping first lines for your TikTok videos, grouped by hook style.", category: "create", icon: "megaphone" },
  { href: "/tools/tiktok-video-ideas-generator", name: "TikTok video ideas generator", summary: "Six TikTok video ideas for your niche, each with a hook and caption starter.", category: "create", icon: "lightbulb" },
  { href: "/tools/instagram-post-ideas-generator", name: "Post ideas generator", summary: "Six post ideas for your niche: Reels, carousels and Stories with caption starters.", category: "create", icon: "lightbulb" },
  { href: "/tools/instagram-bio-generator", name: "Bio generator", summary: "Instagram bio ideas for your niche with emojis, line breaks and a call to action.", category: "create", icon: "user" },
  { href: "/tools/tiktok-bio-generator", name: "TikTok bio generator", summary: "Short TikTok bio ideas for your niche that fit the 80-character limit.", category: "create", icon: "user" },
  { href: "/tools/x-bio-generator", name: "X (Twitter) bio generator", summary: "X bio ideas for your niche that fit the 160-character limit.", category: "create", icon: "user" },
  { href: "/tools/threads-bio-generator", name: "Threads bio generator", summary: "Threads bio ideas for your niche that fit the 150-character limit.", category: "create", icon: "user" },
  { href: "/tools/facebook-bio-generator", name: "Facebook bio generator", summary: "Short Facebook bio ideas that fit the 101-character Intro limit.", category: "create", icon: "user" },
  { href: "/tools/instagram-username-generator", name: "Username generator", summary: "Up to 30 username ideas from your name and niche that follow Instagram's rules.", category: "create", icon: "at" },
  { href: "/tools/tiktok-username-generator", name: "TikTok username generator", summary: "Handle ideas from your name and niche that fit TikTok's 24-character rule.", category: "create", icon: "at" },
  { href: "/tools/youtube-handle-generator", name: "YouTube handle generator", summary: "@handle and channel name ideas that fit YouTube's 3-30 character rule.", category: "create", icon: "at" },
  { href: "/tools/linkedin-text-formatter", name: "LinkedIn Text Formatter", summary: "Copy bold, italic and bulleted Unicode text for LinkedIn posts and profiles.", category: "create", icon: "type" },
  { href: "/tools/linkedin-character-counter", name: "LinkedIn character counter", summary: "Check LinkedIn post, comment, headline and About limits, with a live See more preview.", category: "create", icon: "type" },
  { href: "/tools/linkedin-headline-generator", name: "LinkedIn headline generator", summary: "Build profile headlines from your role, audience, result and skills, checked against the 220-character limit.", category: "create", icon: "type" },
  { href: "/tools/linkedin-summary-generator", name: "LinkedIn summary generator", summary: "About section drafts from your role, audience and results, checked against the 2,600-character limit.", category: "create", icon: "type" },
  { href: "/tools/linkedin-post-generator", name: "LinkedIn post generator", summary: "Six LinkedIn post drafts with a scroll-stopping hook and call to action for any topic.", category: "create", icon: "sparkles" },
  { href: "/tools/linkedin-hook-generator", name: "LinkedIn hook generator", summary: "First lines that land before LinkedIn's see more cutoff, for any topic and niche.", category: "create", icon: "sparkles" },
  { href: "/tools/threads-character-counter", name: "Threads character counter", summary: "Check the 500-character post and 150-character bio limits, with hashtag and 5-link checks.", category: "create", icon: "type" },
  { href: "/tools/tiktok-caption-counter", name: "TikTok caption counter", summary: "Check the 4,000-character caption limit, unique hashtags and mentions, and the preview before more.", category: "create", icon: "type" },
  { href: "/tools/tiktok-hashtag-generator", name: "TikTok hashtag generator", summary: "Niche hashtag sets for TikTok videos: mix broad and specific tags, add a keyword, copy 3 to 15 at once.", category: "create", icon: "hash" },
  { href: "/tools/linkedin-hashtag-generator", name: "LinkedIn hashtag generator", summary: "3 to 5 relevant hashtags for LinkedIn posts: pick an industry, mix broad and specific tags, copy in one click.", category: "create", icon: "hash" },
  { href: "/tools/tiktok-caption-generator", name: "TikTok caption generator", summary: "Six TikTok caption drafts with a short hook and call to action for any topic.", category: "create", icon: "sparkles" },
  { href: "/tools/youtube-title-counter", name: "YouTube title counter", summary: "Check YouTube titles, descriptions and tags, with search previews and invalid-character warnings.", category: "create", icon: "type" },
  { href: "/tools/youtube-title-generator", name: "YouTube title generator", summary: "Title ideas from your topic in six styles, checked against the 100-character limit and the 70-character search cut-off.", category: "create", icon: "type" },
  { href: "/tools/youtube-tag-generator", name: "YouTube tag generator", summary: "Tags from your topic, counted against the 500-character limit, ready to copy.", category: "create", icon: "hash" },
  { href: "/tools/youtube-hashtag-generator", name: "YouTube hashtag generator", summary: "3 to 15 hashtags for YouTube videos and Shorts: pick a niche, mix broad and specific tags, copy in one click.", category: "create", icon: "hash" },
  { href: "/tools/youtube-description-generator", name: "YouTube description generator", summary: "Hook, summary, chapters, links and hashtags in one description under 5,000 characters.", category: "create", icon: "type" },
  { href: "/tools/facebook-character-counter", name: "Facebook character counter", summary: "Check Facebook post, comment, ad and Page bio limits, with a live See more preview.", category: "create", icon: "type" },
  { href: "/tools/facebook-hashtag-generator", name: "Facebook hashtag generator", summary: "1 to 5 relevant hashtags for Facebook posts and Reels, copied in one click.", category: "create", icon: "hash" },
  { href: "/tools/facebook-caption-generator", name: "Facebook caption generator", summary: "Six Facebook post caption drafts with a hook and call to action for any topic.", category: "create", icon: "sparkles" },
  { href: "/tools/x-hashtag-generator", name: "X hashtag generator", summary: "1 to 3 relevant hashtags for X (Twitter) posts that fit the 280-character limit.", category: "create", icon: "hash" },
  { href: "/tools/x-thread-maker", name: "X thread maker", summary: "Split long text into numbered X posts of up to 280 characters at sentence breaks, then copy each post.", category: "create", icon: "type" },
  { href: "/tools/threads-thread-maker", name: "Threads thread maker", summary: "Split long text into numbered Threads posts of up to 500 characters at sentence breaks, then copy each post.", category: "create", icon: "type" },
  { href: "/tools/pinterest-hashtag-generator", name: "Pinterest hashtag generator", summary: "2 to 5 niche hashtags for your Pin descriptions.", category: "create", icon: "hash" },
  { href: "/tools/bluesky-character-counter", name: "Bluesky character counter", summary: "Check the 300-grapheme post limit, with live remaining counts and emoji-aware totals.", category: "create", icon: "type" },
  { href: "/tools/mastodon-character-counter", name: "Mastodon character counter", summary: "Check the 500-character default or your server's limit, with links counted as 23 and mentions by username.", category: "create", icon: "type" },
  { href: "/tools/pinterest-character-counter", name: "Pinterest character counter", summary: "Check Pin title (100), description (500) and alt text limits, with a feed preview.", category: "create", icon: "type" },
  { href: "/tools/pinterest-description-generator", name: "Pinterest description generator", summary: "Six keyword-rich Pin descriptions for any topic, kept under Pinterest's 500-character limit.", category: "create", icon: "sparkles" },
  // Images & video
  { href: "/tools/instagram-post-preview", name: "Post preview", summary: "Preview a photo and caption in a feed mockup with square and portrait crops.", category: "media", icon: "eye" },
  { href: "/tools/threads-post-preview", name: "Threads post preview", summary: "Write a Threads post, count against 500 characters and preview it on mobile.", category: "media", icon: "message" },
  { href: "/tools/linkedin-post-preview", name: "LinkedIn post preview", summary: "Preview a LinkedIn post on desktop and mobile, with the see more cut-off and 3,000-character count.", category: "media", icon: "message" },
  { href: "/tools/x-post-preview", name: "X post preview", summary: "Preview an X post on desktop and mobile, with X-accurate counting: links as 23 against the 280 limit.", category: "media", icon: "message" },
  { href: "/tools/facebook-post-preview", name: "Facebook post preview", summary: "Preview a Facebook post on desktop and mobile, with the See more cut-off and 63,206-character count.", category: "media", icon: "message" },
  { href: "/tools/instagram-image-size", name: "Image size guide", summary: "Every Instagram size in pixels, plus a crop preview and exact-size JPG download.", category: "media", icon: "image" },
  { href: "/tools/social-media-image-sizes", name: "Social media image sizes", summary: "Every 2026 image and video size for 9 platforms in one cheat sheet.", category: "media", icon: "image" },
  { href: "/tools/instagram-carousel-size-checker", name: "Carousel size checker", summary: "Check each slide's dimensions, ratio and file size before you schedule.", category: "media", icon: "square-stack" },
  { href: "/tools/instagram-carousel-splitter", name: "Carousel splitter", summary: "Split one wide image into equal carousel slides and download the PNGs.", category: "media", icon: "scissors" },
  { href: "/tools/instagram-grid-maker", name: "Grid maker", summary: "Split one photo into 3, 6, 9 or 12 profile-grid tiles, numbered in posting order.", category: "media", icon: "scissors" },
  { href: "/tools/instagram-carousel-maker", name: "Carousel maker", summary: "Design text-and-colour carousel slides and download 1080×1350 PNGs.", category: "media", icon: "gallery" },
  { href: "/tools/instagram-safe-zone-checker", name: "Safe zone checker", summary: "See what Reels and Story buttons and captions cover on your 9:16 frame.", category: "media", icon: "frame" },
  { href: "/tools/instagram-story-size-checker", name: "Story size checker", summary: "Check a Story image's size and ratio in a 9:16 frame against 1080×1920.", category: "media", icon: "smartphone" },
  { href: "/tools/tiktok-video-size-checker", name: "TikTok video size checker", summary: "Check a TikTok video's pixels, 9:16 ratio and length against 1080×1920.", category: "media", icon: "smartphone" },
  { href: "/tools/youtube-shorts-size-checker", name: "YouTube Shorts size checker", summary: "Check a Short's pixels, 9:16 ratio and 3-minute length against 1080×1920.", category: "media", icon: "smartphone" },
  { href: "/tools/youtube-thumbnail-size-checker", name: "YouTube thumbnail size checker", summary: "Test a thumbnail against YouTube's 1280×720, 16:9 and 2 MB rules in your browser.", category: "media", icon: "smartphone" },
  { href: "/tools/youtube-banner-size-checker", name: "YouTube banner size checker", summary: "Test channel art against YouTube's 2560×1440, 6 MB and safe-area rules.", category: "media", icon: "smartphone" },
  { href: "/tools/linkedin-banner-size-checker", name: "LinkedIn banner size checker", summary: "Test a profile banner against LinkedIn's 1584×396, 4:1 and 8 MB rules.", category: "media", icon: "smartphone" },
  { href: "/tools/linkedin-profile-picture-size-checker", name: "LinkedIn profile picture size checker", summary: "Check a profile photo is square, at least 400×400, under 8 MB and safe in the circle.", category: "media", icon: "circle" },
  { href: "/tools/linkedin-post-image-size-checker", name: "LinkedIn post image size checker", summary: "Test a post image against LinkedIn's 1200×627, 1.91:1 and 5 MB rules.", category: "media", icon: "smartphone" },
  { href: "/tools/youtube-profile-picture-size-checker", name: "YouTube profile picture size checker", summary: "Check a channel photo is square, at least 800×800, under 4 MB and safe in the circle.", category: "media", icon: "circle" },
  { href: "/tools/tiktok-profile-picture-size-checker", name: "TikTok profile picture size checker", summary: "Check a profile photo is square, at least 200×200 and safe inside the circle crop.", category: "media", icon: "circle" },
  { href: "/tools/facebook-cover-photo-size-checker", name: "Facebook cover photo size checker", summary: "See how a cover crops at 820×312 on desktop and 640×360 on phones.", category: "media", icon: "smartphone" },
  { href: "/tools/x-header-size-checker", name: "X header size checker", summary: "Test a header against X's 1500×500, 3:1 and 5 MB rules.", category: "media", icon: "smartphone" },
  { href: "/tools/tiktok-photo-size-checker", name: "TikTok photo size checker", summary: "Test a photo post or slideshow image in the 1080×1920 (9:16) frame.", category: "media", icon: "smartphone" },
  { href: "/tools/instagram-profile-picture-size-checker", name: "Instagram profile picture size checker", summary: "Check a profile photo is square, at least 320×320 and safe inside the circle crop.", category: "media", icon: "circle" },
  { href: "/tools/instagram-highlight-cover-maker", name: "Highlight cover maker", summary: "Matching highlight covers with icons and brand colours, downloaded as PNGs.", category: "media", icon: "circle" },
  { href: "/tools/instagram-reel-cover-maker", name: "Reel cover maker", summary: "1080×1920 Reel covers with a title that stays inside the grid crop.", category: "media", icon: "clapperboard" },
  { href: "/tools/instagram-story-maker", name: "Story maker", summary: "Design a 1080×1920 Story with a photo, text and gradient, then download it.", category: "media", icon: "palette" },
  // Plan & measure
  { href: "/tools/social-media-content-calendar", name: "Content calendar template", summary: "Plan a week of posts by day, platform and format, then download a CSV.", category: "plan", icon: "calendar" },
  { href: "/tools/social-media-analytics-report", name: "Analytics report template", summary: "Compare two periods of reach, engagement and clicks and export a CSV.", category: "plan", icon: "chart" },
  { href: "/tools/instagram-scheduling-checklist", name: "Scheduling checklist", summary: "Tick off captions, media, time zone and account checks before you schedule.", category: "plan", icon: "check" },
  { href: "/tools/instagram-time-zone-converter", name: "Time zone converter", summary: "Convert a posting time between time zones with daylight saving handled.", category: "plan", icon: "globe" },
  { href: "/tools/best-time-to-post-on-social-media", name: "Best time to post (all platforms)", summary: "Best posting windows for Instagram, TikTok, LinkedIn, Facebook, X, Pinterest, Threads and YouTube in one table.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-instagram", name: "Best time to post finder", summary: "Get three starting post times per day for your audience type and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-facebook", name: "Best time to post on Facebook", summary: "Three starting Facebook Page post times per day for your audience and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-x", name: "Best time to post on X", summary: "Get starting X (Twitter) posting windows for your audience and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-linkedin", name: "Best time to post on LinkedIn", summary: "Three starting LinkedIn post times per day for your B2B audience and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-tiktok", name: "Best time to post on TikTok", summary: "Get starting TikTok posting windows for your audience and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-threads", name: "Best time to post on Threads", summary: "Get starting Threads posting windows for your audience and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-youtube", name: "Best time to post on YouTube", summary: "Get starting YouTube upload windows for your audience and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/best-time-to-post-on-pinterest", name: "Best time to post on Pinterest", summary: "Get starting Pinterest posting windows for your niche and time zone.", category: "plan", icon: "calendar" },
  { href: "/tools/instagram-posting-frequency-calculator", name: "Posting frequency calculator", summary: "Turn your weekly time budget into a realistic posting range and plan.", category: "plan", icon: "gauge" },
  { href: "/tools/instagram-engagement-rate-calculator", name: "Engagement rate calculator", summary: "Engagement rate by followers or by reach from likes, comments, saves and shares.", category: "plan", icon: "percent" },
  { href: "/tools/tiktok-engagement-rate-calculator", name: "TikTok engagement rate calculator", summary: "Engagement rate by views or followers from likes, comments, shares and favorites.", category: "plan", icon: "percent" },
  { href: "/tools/tiktok-safe-zone-checker", name: "TikTok safe zone checker", summary: "Load a video frame to see what TikTok's caption, sound label and buttons cover, then download a 1080×1920 template.", category: "plan", icon: "frame" },
  { href: "/tools/youtube-shorts-safe-zone-checker", name: "YouTube Shorts safe zone checker", summary: "Load a Short frame to see what the title, channel name and buttons cover, then download a 1080×1920 template.", category: "plan", icon: "frame" },
  { href: "/tools/linkedin-engagement-rate-calculator", name: "LinkedIn engagement rate calculator", summary: "Engagement rate by impressions or followers from reactions, comments and reposts.", category: "plan", icon: "percent" },
  { href: "/tools/youtube-engagement-rate-calculator", name: "YouTube engagement rate calculator", summary: "Engagement rate by views or subscribers from likes, comments and shares.", category: "plan", icon: "percent" },
  { href: "/tools/x-engagement-rate-calculator", name: "X engagement rate calculator", summary: "Engagement rate by impressions or followers from likes, replies, reposts and bookmarks.", category: "plan", icon: "percent" },
  // Comments & DMs
  { href: "/tools/instagram-comment-keyword-tester", name: "Comment keyword tester", summary: "Test which comments trigger a keyword with contains or exact matching.", category: "dm", icon: "key" },
  { href: "/tools/instagram-comment-to-dm-preview", name: "Comment-to-DM preview", summary: "Preview a keyword, sample comment and DM reply as a full flow.", category: "dm", icon: "workflow" },
  { href: "/tools/instagram-comment-to-dm-calculator", name: "Comment-to-DM calculator", summary: "Estimate comments, DMs and link clicks from views and your rates.", category: "dm", icon: "calculator" },
  { href: "/tools/instagram-dm-link-generator", name: "DM link generator", summary: "Make an ig.me link that opens a DM with your account.", category: "dm", icon: "link" },
  { href: "/tools/instagram-comment-picker", name: "Comment picker", summary: "Paste giveaway comments, filter them and pick a random winner locally.", category: "dm", icon: "gift" },
  { href: "/tools/instagram-utm-builder", name: "UTM builder", summary: "Tag bio, Story and DM links with UTM fields for your analytics.", category: "dm", icon: "tag" },
];

export const toolByHref = (href: string) => TOOLS.find((t) => t.href === href);

/** Doodle art for a tool's family (AnimArt name; its still poster is /landing/anim/<name>.webp). */
export type ToolArt = "writing" | "visual" | "hashtag" | "analytics" | "card-dm" | "card-schedule";

const SCHEDULE_TOOLS = new Set([
  "/tools/social-media-content-calendar",
  "/tools/instagram-scheduling-checklist",
  "/tools/instagram-time-zone-converter",
  "/tools/best-time-to-post-on-instagram",
  "/tools/best-time-to-post-on-tiktok",
  "/tools/best-time-to-post-on-facebook",
  "/tools/best-time-to-post-on-x",
  "/tools/best-time-to-post-on-linkedin",
  "/tools/best-time-to-post-on-threads",
  "/tools/best-time-to-post-on-youtube",
  "/tools/best-time-to-post-on-pinterest",
]);
const ANALYTICS_TOOLS = new Set(["/tools/instagram-utm-builder", "/tools/instagram-comment-to-dm-calculator"]);

export function toolArt(tool: ToolEntry): ToolArt {
  if (tool.href.includes("hashtag")) return "hashtag";
  if (SCHEDULE_TOOLS.has(tool.href)) return "card-schedule";
  if (ANALYTICS_TOOLS.has(tool.href)) return "analytics";
  return ({ create: "writing", media: "visual", plan: "analytics", dm: "card-dm" } as const)[tool.category];
}

export const categoryLabel = (c: ToolCategory) => TOOL_CATEGORIES.find((x) => x.id === c)?.label ?? c;

const PLATFORM_IDS: ToolPlatform[] = TOOL_PLATFORMS.map((p) => p.id).filter((id): id is Exclude<ToolPlatform, "other"> => id !== "other");

/** The platform a tool targets, read from its slug segments (e.g. "x-bio-generator", "best-time-to-post-on-x"). */
export function toolPlatform(tool: ToolEntry): ToolPlatform {
  const slug = tool.href.replace(/^.*\/tools\//, "");
  for (const segment of slug.split("-")) {
    const match = PLATFORM_IDS.find((id) => id === segment);
    if (match) return match;
  }
  return "other";
}
