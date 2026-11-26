/** Image sizes per platform, shared by the page tables and the interactive finder. */
export type SizeRow = { format: string; size: string; ratio: string; checker?: string };
export type Platform = {
  name: string;
  scheduler: string;
  note: string;
  rows: SizeRow[];
};

export const platforms: Platform[] = [
  {
    name: "Instagram",
    scheduler: "/instagram-scheduler",
    note: "Use portrait for feed reach, square for a simple grid and vertical for Stories and Reels.",
    rows: [
      { format: "Feed portrait", size: "1080×1350", ratio: "4:5" },
      { format: "Feed square", size: "1080×1080", ratio: "1:1" },
      { format: "Feed landscape", size: "1080×566", ratio: "1.91:1" },
      { format: "Story / Reel", size: "1080×1920", ratio: "9:16" },
      { format: "Profile photo", size: "320×320", ratio: "1:1" },
    ],
  },
  {
    name: "Facebook",
    scheduler: "/facebook-scheduler",
    note: "Portrait and square work for feed images; use the wider link-preview size for shared URLs.",
    rows: [
      { format: "Feed portrait", size: "1080×1350", ratio: "4:5" },
      { format: "Feed square", size: "1080×1080", ratio: "1:1" },
      { format: "Link preview", size: "1200×630", ratio: "1.91:1" },
      { format: "Story", size: "1080×1920", ratio: "9:16" },
      { format: "Page cover", size: "851×315", ratio: "2.7:1" },
      { format: "Profile photo", size: "176×176 minimum", ratio: "1:1" },
    ],
  },
  {
    name: "Threads",
    scheduler: "/threads-scheduler",
    note: "A 4:5 portrait is a reliable feed choice, and wider uploads can be up to 1440 pixels wide.",
    rows: [
      { format: "Feed portrait", size: "1080×1350", ratio: "4:5" },
      { format: "Wider feed image", size: "Up to 1440 px wide", ratio: "Varies" },
    ],
  },
  {
    name: "LinkedIn",
    scheduler: "/linkedin-scheduler",
    note: "Use square or portrait for organic feed posts and the dedicated wide sizes for links and banners.",
    rows: [
      { format: "Feed square", size: "1200×1200", ratio: "1:1" },
      { format: "Feed portrait", size: "1080×1350", ratio: "4:5" },
      { format: "Link preview", size: "1200×627", ratio: "1.91:1" },
      { format: "Company cover", size: "1128×191", ratio: "5.91:1" },
      { format: "Personal banner", size: "1584×396", ratio: "4:1" },
    ],
  },
  {
    name: "X",
    scheduler: "/x-scheduler",
    note: "Landscape and portrait both work in the feed; keep the header and profile image simple and centred.",
    rows: [
      { format: "In-feed landscape", size: "1600×900", ratio: "16:9" },
      { format: "In-feed portrait", size: "1080×1350", ratio: "4:5" },
      { format: "Header", size: "1500×500", ratio: "3:1" },
      { format: "Profile photo", size: "400×400", ratio: "1:1" },
    ],
  },
  {
    name: "TikTok",
    scheduler: "/tiktok-scheduler",
    note: "Design video full-screen at 9:16 and keep the profile picture clear inside its circular crop.",
    rows: [
      { format: "Video", size: "1080×1920", ratio: "9:16", checker: "/tools/tiktok-video-size-checker" },
      { format: "Profile photo", size: "200×200", ratio: "1:1" },
    ],
  },
  {
    name: "Pinterest",
    scheduler: "/pinterest-scheduler",
    note: "A vertical 2:3 Pin is the standard format and leaves enough room for a clear title or product image.",
    rows: [{ format: "Standard Pin", size: "1000×1500", ratio: "2:3", checker: "/tools/pinterest-pin-size-checker" }],
  },
  {
    name: "YouTube",
    scheduler: "/youtube-scheduler",
    note: "Thumbnails are landscape, Shorts are vertical and channel art needs its central safe area kept clear.",
    rows: [
      { format: "Video thumbnail", size: "1280×720", ratio: "16:9", checker: "/tools/youtube-thumbnail-size-checker" },
      { format: "Short", size: "1080×1920", ratio: "9:16" },
      { format: "Channel banner", size: "2560×1440 (safe area 1546×423)", ratio: "16:9", checker: "/tools/youtube-banner-size-checker" },
    ],
  },
  {
    name: "Bluesky",
    scheduler: "/bluesky-scheduler",
    note: "Use square or landscape post images, with a wide banner and a square avatar for your profile.",
    rows: [
      { format: "Post square", size: "1000×1000", ratio: "1:1" },
      { format: "Post landscape", size: "16:9 width flexible", ratio: "16:9" },
      { format: "Profile banner", size: "3000×1000", ratio: "3:1" },
      { format: "Avatar", size: "1000×1000", ratio: "1:1" },
    ],
  },
];
