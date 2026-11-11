// Simple line marks for networks lucide has no icon for. Built with createLucideIcon so they are
// drop-in replacements wherever a lucide icon is used (same props, same `typeof Instagram` type).
import { createLucideIcon, Linkedin, Store } from "lucide-react";

export const TikTokIcon = createLucideIcon("tiktok", [
  ["path", { d: "M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5", key: "tk1" }],
  ["path", { d: "M14 3c.4 2.6 2.3 4.5 5 4.8", key: "tk2" }],
]);

export const BlueskyIcon = createLucideIcon("bluesky", [
  [
    "path",
    {
      d: "M12 10.5C10.6 7.7 7 3.8 4.7 4.6 3.2 5.1 3.8 9 4.6 10.3c.9 1.5 2.8 1.8 4.6 1.5-2.7.8-3.7 2.3-1.9 4.1 2.6 2.4 3.7-.9 4.7-3.5 1 2.6 2.1 5.9 4.7 3.5 1.8-1.8.8-3.3-1.9-4.1 1.8.3 3.7 0 4.6-1.5.8-1.3 1.4-5.2-.1-5.7-2.3-.8-5.9 3.1-7.3 5.9z",
      key: "bs",
    },
  ],
]);

export const MastodonIcon = createLucideIcon("mastodon", [
  ["path", { d: "M20 12.5V8.2C20 4.6 17.6 3 12 3S4 4.6 4 8.2v5.1C4 18 6.6 21 12.5 21c1.6 0 3-.3 4-.7v-2.1c-1.2.4-2.5.6-3.8.5-2.3-.1-3.6-.8-3.8-2.6 1.2.3 2.6.4 4 .4 4 0 7.1-1.4 7.1-4z", key: "m1" }],
  ["path", { d: "M8 13V9.5a1.75 1.75 0 0 1 3.5 0V12m0-2.5a1.75 1.75 0 0 1 3.5 0V13", key: "m2" }],
]);

export const PinterestIcon = createLucideIcon("pinterest", [
  ["circle", { cx: "12", cy: "12", r: "9", key: "p1" }],
  ["path", { d: "M10.5 21l1.8-7.4M9.4 14.6c-.7-.7-1-1.6-1-2.6 0-2.6 2-4.5 4.4-4.5 2.3 0 3.8 1.6 3.8 3.7 0 2.4-1.2 4.4-3 4.4-1 0-1.6-.8-1.4-1.7l.7-2.8", key: "p2" }],
]);

export const XIcon = createLucideIcon("x-logo", [
  ["path", { d: "M4 4h4.5L20 20h-4.5z", key: "x1" }],
  ["path", { d: "M4 20l6.8-7.2M20 4l-6.6 7", key: "x2" }],
]);

export const LinkedInIcon = Linkedin;

/** Google Business Profile: a storefront (no Google logo). */
export const GbpIcon = Store;

/** Icons and brand colours for the networks added 2026-11-11. */
export const NEW_NETWORK_ICON = {
  tiktok: TikTokIcon,
  bluesky: BlueskyIcon,
  mastodon: MastodonIcon,
  linkedin: LinkedInIcon,
  pinterest: PinterestIcon,
  x: XIcon,
  gbp: GbpIcon,
};

export const NEW_NETWORK_COLOR = {
  tiktok: "#111111",
  bluesky: "#1185fe",
  mastodon: "#6364ff",
  linkedin: "#0a66c2",
  pinterest: "#e60023",
  x: "#000000",
  gbp: "#4285f4",
};
