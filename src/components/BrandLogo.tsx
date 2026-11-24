// Real brand marks (Simple Icons, CC0) for the "Works with" strip and anywhere a network's actual logo
// is wanted. Server-safe: only the path strings of the brands used are bundled.
import {
  siBluesky, siDiscord, siFacebook, siFarcaster, siInstagram, siMastodon, siPinterest, siTelegram,
  siThreads, siTiktok, siTumblr, siX, siYoutube,
} from "simple-icons";

// LinkedIn's mark is not in Simple Icons (removed at LinkedIn's request); this is its standard "in" glyph.
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

type Mark = { path: string; color: string; gradient?: boolean };
const MARKS: Record<string, Mark> = {
  instagram: { path: siInstagram.path, color: "#E4405F", gradient: true },
  facebook: { path: siFacebook.path, color: `#${siFacebook.hex}` },
  threads: { path: siThreads.path, color: "#111111" },
  youtube: { path: siYoutube.path, color: `#${siYoutube.hex}` },
  linkedin: { path: LINKEDIN_PATH, color: "#0A66C2" },
  linkedin_pages: { path: LINKEDIN_PATH, color: "#0A66C2" },
  bluesky: { path: siBluesky.path, color: `#${siBluesky.hex}` },
  mastodon: { path: siMastodon.path, color: `#${siMastodon.hex}` },
  tiktok: { path: siTiktok.path, color: "#111111" },
  x: { path: siX.path, color: "#111111" },
  pinterest: { path: siPinterest.path, color: `#${siPinterest.hex}` },
  tumblr: { path: siTumblr.path, color: `#${siTumblr.hex}` },
  farcaster: { path: siFarcaster.path, color: `#${siFarcaster.hex}` },
  telegram: { path: siTelegram.path, color: `#${siTelegram.hex}` },
  discord: { path: siDiscord.path, color: `#${siDiscord.hex}` },
};

export function hasBrandLogo(id: string): boolean {
  return id in MARKS;
}

export function BrandLogo({ id, size = 18, className }: { id: string; size?: number; className?: string }) {
  const m = MARKS[id];
  if (!m) return null;
  const gid = `bl-${id}`;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
      {m.gradient && (
        <defs>
          <radialGradient id={gid} cx="30%" cy="107%" r="150%">
            <stop offset="0" stopColor="#fdf497" />
            <stop offset=".05" stopColor="#fdf497" />
            <stop offset=".45" stopColor="#fd5949" />
            <stop offset=".6" stopColor="#d6249f" />
            <stop offset=".9" stopColor="#285AEB" />
          </radialGradient>
        </defs>
      )}
      <path d={m.path} fill={m.gradient ? `url(#${gid})` : m.color} />
    </svg>
  );
}
