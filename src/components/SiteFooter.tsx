import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PoskooMark from "./PoskooMark";

// The one site footer, used by the landing page and every public page (via
// PublicShell). Must be rendered inside a .landing wrapper
// so the landing.module.css global classes (footer.rich, .fh, …) apply.
type FooterLink = { href: string; label: string };

function FooterColumn({ title, links, extra }: { title: string; links: FooterLink[]; extra?: { title: string; links: FooterLink[] } }) {
  return (
    <div className="fcol">
      <nav aria-label={title}>
        <p className="fh">{title}</p>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      {extra && (
        <nav aria-label={extra.title} className="fgroup">
          <p className="fh">{extra.title}</p>
          <ul>
            {extra.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

const TOOLS: FooterLink[] = [
  { href: "/tools/instagram-hashtag-generator", label: "Instagram hashtag generator" },
  { href: "/tools/instagram-caption-counter", label: "Instagram caption counter" },
  { href: "/tools/x-character-counter", label: "X character counter" },
  { href: "/tools/linkedin-character-counter", label: "LinkedIn character counter" },
  { href: "/tools/threads-character-counter", label: "Threads character counter" },
  { href: "/tools/bluesky-character-counter", label: "Bluesky character counter" },
  { href: "/tools/mastodon-character-counter", label: "Mastodon character counter" },
  { href: "/tools/tiktok-caption-counter", label: "TikTok caption counter" },
  { href: "/tools/youtube-title-counter", label: "YouTube title counter" },
  { href: "/tools/facebook-character-counter", label: "Facebook character counter" },
  { href: "/tools/pinterest-character-counter", label: "Pinterest character counter" },
  { href: "/tools/instagram-font-generator", label: "Instagram font generator" },
  { href: "/tools/instagram-bio-generator", label: "Instagram bio generator" },
  { href: "/tools/instagram-username-generator", label: "Instagram username generator" },
  { href: "/tools/instagram-caption-generator", label: "Instagram caption generator" },
  { href: "/tools/instagram-image-size", label: "Instagram image sizes" },
  { href: "/tools/social-media-image-sizes", label: "Social media image sizes" },
  { href: "/tools/instagram-engagement-rate-calculator", label: "Instagram engagement calculator" },
  { href: "/tools/best-time-to-post-on-social-media", label: "Best time to post" },
  { href: "/tools/instagram-line-break-generator", label: "Instagram line breaks" },
  { href: "/tools/instagram-comment-keyword-tester", label: "Comment keyword tester" },
  { href: "/tools/instagram-comment-picker", label: "Instagram comment picker" },
  { href: "/tools/instagram-dm-link-generator", label: "Instagram DM link generator" },
  { href: "/tools/instagram-post-preview", label: "Instagram post preview" },
  { href: "/tools/instagram-safe-zone-checker", label: "Instagram safe zone checker" },
  { href: "/tools/instagram-highlight-cover-maker", label: "Instagram highlight covers" },
  { href: "/tools/instagram-reel-cover-maker", label: "Instagram Reel cover maker" },
  { href: "/tools/instagram-story-maker", label: "Instagram story maker" },
  { href: "/tools/instagram-post-ideas-generator", label: "Instagram post ideas" },
  { href: "/tools/instagram-hook-generator", label: "Instagram hook generator" },
  { href: "/tools/instagram-utm-builder", label: "Instagram UTM builder" },
];

export function SiteFooter() {
  return (
    <footer className="rich">
      <div className="fbrand">
        <Link className="logo" href="/">
          <PoskooMark size={30} />
          poskoo<b>.</b>
        </Link>
        <p>Schedule Instagram posts and auto-DM every comment, on the official Meta API.</p>
        <Image className="fart" src="/landing/feat-dm.webp" width={640} height={602} sizes="200px" loading="lazy" alt="" />
        <ul className="fchannels" aria-label="Works with">
          <li><i style={{ background: "#E1306C" }} aria-hidden="true" />Instagram</li>
          <li><i style={{ background: "#1877F2" }} aria-hidden="true" />Facebook</li>
          <li><i style={{ background: "var(--ink)" }} aria-hidden="true" />Threads</li>
          <li><i style={{ background: "#FF0033" }} aria-hidden="true" />YouTube</li>
          <li><i style={{ background: "#0A66C2" }} aria-hidden="true" />LinkedIn</li>
          <li><i style={{ background: "#1185FE" }} aria-hidden="true" />Bluesky</li>
          <li><i style={{ background: "#6364FF" }} aria-hidden="true" />Mastodon</li>
        </ul>
        <div className="fctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/login">Log in</Link>
        </div>
        <p className="fhelp">Questions? <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a></p>
      </div>
      <FooterColumn
        title="Product"
        links={[
          { href: "/features", label: "All features" },
          { href: "/instagram-auto-dm", label: "Instagram auto DM" },
          { href: "/instagram-dm-automation", label: "Instagram DM automation" },
          { href: "/instagram-auto-dm/templates", label: "Auto-DM templates" },
          { href: "/instagram-link-in-bio", label: "Instagram link in bio" },
          { href: "/instagram-content-planner", label: "Instagram content planner" },
          { href: "/tools", label: "Free social media tools" },
          { href: "/pricing", label: "Pricing" },
        ]}
        extra={{ title: "Company", links: [
            { href: "/guides", label: "Guides" },
            { href: "/help", label: "Help center" },
            { href: "/developers", label: "Developers (MCP)" },
            { href: "/contact", label: "Contact" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/data-deletion", label: "Data deletion" },
          ] }}
      />
      <FooterColumn
        title="Schedulers"
        links={[
          { href: "/social-media-scheduler", label: "Social media scheduler" },
          { href: "/instagram-scheduler", label: "Instagram scheduler" },
          { href: "/facebook-scheduler", label: "Facebook scheduler" },
          { href: "/threads-scheduler", label: "Threads scheduler" },
          { href: "/tiktok-scheduler", label: "TikTok scheduler" },
          { href: "/linkedin-scheduler", label: "LinkedIn scheduler" },
          { href: "/pinterest-scheduler", label: "Pinterest scheduler" },
          { href: "/youtube-scheduler", label: "YouTube scheduler" },
          { href: "/x-scheduler", label: "X (Twitter) scheduler" },
          { href: "/bluesky-scheduler", label: "Bluesky scheduler" },
          { href: "/mastodon-scheduler", label: "Mastodon scheduler" },
          { href: "/google-business-profile-scheduler", label: "Google Business Profile scheduler" },
          { href: "/social-media-scheduler-comparison", label: "Compare schedulers" },
        ]}
      />
      <FooterColumn title="Free tools" links={TOOLS.slice(0, 10)} />
      <FooterColumn title="More free tools" links={[...TOOLS.slice(10), { href: "/tools", label: "All free tools →" }]} />
      <FooterColumn
        title="Compare"
        links={[
          { href: "/buffer-alternative", label: "Buffer alternative" },
          { href: "/publer-alternative", label: "Publer alternative" },
          { href: "/agorapulse-alternative", label: "Agorapulse alternative" },
          { href: "/zoho-social-alternative", label: "Zoho Social alternative" },
          { href: "/loomly-alternative", label: "Loomly alternative" },
          { href: "/socialbee-alternative", label: "SocialBee alternative" },
          { href: "/sendible-alternative", label: "Sendible alternative" },
          { href: "/later-alternative", label: "Later alternative" },
          { href: "/planoly-alternative", label: "Planoly alternative" },
          { href: "/sprout-social-alternative", label: "Sprout Social alternative" },
          { href: "/metricool-alternative", label: "Metricool alternative" },
          { href: "/manychat-alternative", label: "ManyChat alternative" },
          { href: "/linktree-alternative", label: "Linktree alternative" },
          { href: "/hootsuite-alternative", label: "Hootsuite alternative" },
          { href: "/meta-business-suite-alternative", label: "Meta Business Suite alternative" },
        ]}
      />
      <div className="legal">
        <span>© 2026 {BRAND.name} · {BRAND.company}</span>
        <span className="legalLinks">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/data-deletion">Data deletion</Link>
          <span>Built on the official Meta API</span>
        </span>
      </div>
    </footer>
  );
}
