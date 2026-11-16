// OWNER-APPROVED FOOTER DESIGN (restored 2026-11-15 from 20425b5). Keep the columns as
// they are and roughly equal; do NOT add links, columns or layout changes without the
// owner's approval. Link new pages from hubs (/tools, /social-media-scheduler-comparison), not here.
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

// Ten links per column so every column is the same height (owner request 2026-11-15).
const FREE_TOOLS: FooterLink[] = [
  { href: "/tools/instagram-hashtag-generator", label: "Hashtag generator" },
  { href: "/tools/instagram-caption-generator", label: "Caption generator" },
  { href: "/tools/instagram-bio-generator", label: "Bio generator" },
  { href: "/tools/instagram-font-generator", label: "Font generator" },
  { href: "/tools/instagram-caption-counter", label: "Caption counter" },
  { href: "/tools/instagram-image-size", label: "Image size guide" },
  { href: "/tools/instagram-engagement-rate-calculator", label: "Engagement calculator" },
  { href: "/tools/instagram-line-break-generator", label: "Line break generator" },
  { href: "/tools/instagram-post-preview", label: "Post preview" },
  { href: "/tools/instagram-username-generator", label: "Username generator" },
];
const MORE_TOOLS: FooterLink[] = [
  { href: "/tools/instagram-comment-picker", label: "Comment picker" },
  { href: "/tools/instagram-comment-keyword-tester", label: "Keyword tester" },
  { href: "/tools/instagram-dm-link-generator", label: "DM link generator" },
  { href: "/tools/instagram-safe-zone-checker", label: "Safe zone checker" },
  { href: "/tools/instagram-reel-cover-maker", label: "Reel cover maker" },
  { href: "/tools/instagram-highlight-cover-maker", label: "Highlight covers" },
  { href: "/tools/instagram-hook-generator", label: "Hook generator" },
  { href: "/tools/instagram-post-ideas-generator", label: "Post ideas" },
  { href: "/tools/x-character-counter", label: "X character counter" },
  { href: "/tools", label: "All free tools →" },
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
          { href: "/features", label: "Features" },
          { href: "/instagram-scheduler", label: "Instagram scheduler" },
          { href: "/instagram-auto-dm", label: "Instagram auto DM" },
          { href: "/instagram-auto-dm/templates", label: "Auto-DM templates" },
          { href: "/instagram-link-in-bio", label: "Link in bio" },
          { href: "/pricing", label: "Pricing" },
          { href: "/developers", label: "API and MCP" },
          { href: "/guides", label: "Guides" },
          { href: "/help", label: "Help center" },
          { href: "/contact", label: "Contact" },
        ]}
      />
      <FooterColumn
        title="Schedulers"
        links={[
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
        ]}
      />
      <FooterColumn title="Free tools" links={FREE_TOOLS} />
      <FooterColumn title="More free tools" links={MORE_TOOLS} />
      <FooterColumn
        title="Compare"
        links={[
          { href: "/buffer-alternative", label: "Buffer alternative" },
          { href: "/publer-alternative", label: "Publer alternative" },
          { href: "/later-alternative", label: "Later alternative" },
          { href: "/planoly-alternative", label: "Planoly alternative" },
          { href: "/sprout-social-alternative", label: "Sprout Social alternative" },
          { href: "/metricool-alternative", label: "Metricool alternative" },
          { href: "/manychat-alternative", label: "ManyChat alternative" },
          { href: "/hootsuite-alternative", label: "Hootsuite alternative" },
          { href: "/meta-business-suite-alternative", label: "Meta Business Suite alt." },
          { href: "/social-media-scheduler-comparison", label: "Compare schedulers" },
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
