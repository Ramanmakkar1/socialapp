// Single source of truth for the platforms the shared hashtag generator supports.
// Kept in a plain module so both the client generator and server page can read it.
export const PLATFORM = {
  instagram: { min: 5, max: 30, start: 15, note: "Instagram allows up to 30 per post." },
  tiktok: { min: 3, max: 15, start: 5, note: "TikTok has no fixed hashtag cap; captions allow 4,000 characters. 3 to 5 relevant tags is a good start." },
  linkedin: { min: 1, max: 5, start: 3, note: "LinkedIn has no hard cap, but 3 to 5 relevant hashtags per post works best; more can look spammy." },
  youtube: { min: 1, max: 15, start: 3, note: "YouTube shows the first 3 hashtags from your description above or below the title. Use 3 to 5 that fit the video. A video with more than 60 hashtags has all its hashtags ignored." },
  facebook: { min: 1, max: 5, start: 3, note: "Facebook has no hashtag cap, but 1 to 3 relevant hashtags per post works best. Long hashtag blocks can look spammy." },
  x: { min: 1, max: 3, start: 2, note: "X counts every hashtag toward the 280-character limit. 1 to 2 relevant hashtags per post works best; more can look spammy." },
  pinterest: { min: 1, max: 10, start: 5, note: "Pinterest descriptions allow 500 characters. Hashtags are optional on Pinterest; 2 to 5 specific tags at the end of the description help people find your Pin through search, and keywords in the title and description matter more." },
} as const;

export type HashtagPlatform = keyof typeof PLATFORM;

export const HASHTAG_PLATFORMS = Object.keys(PLATFORM) as HashtagPlatform[];
