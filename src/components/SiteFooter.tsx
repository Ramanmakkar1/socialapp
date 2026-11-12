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
  { href: "/tools/instagram-hashtag-generator", label: "Hashtag generator" },
  { href: "/tools/instagram-caption-counter", label: "Caption counter" },
  { href: "/tools/x-character-counter", label: "X character counter" },
  { href: "/tools/instagram-font-generator", label: "Font generator" },
  { href: "/tools/instagram-bio-generator", label: "Bio generator" },
  { href: "/tools/instagram-username-generator", label: "Username generator" },
  { href: "/tools/instagram-caption-generator", label: "Caption generator" },
  { href: "/tools/instagram-image-size", label: "Image size guide" },
  { href: "/tools/instagram-engagement-rate-calculator", label: "Engagement rate calculator" },
  { href: "/tools/instagram-line-break-generator", label: "Line break generator" },
  { href: "/tools/instagram-comment-keyword-tester", label: "Comment keyword tester" },
  { href: "/tools/instagram-comment-picker", label: "Comment picker" },
  { href: "/tools/instagram-dm-link-generator", label: "DM link generator" },
  { href: "/tools/instagram-post-preview", label: "Post preview" },
  { href: "/tools/instagram-safe-zone-checker", label: "Safe zone checker" },
  { href: "/tools/instagram-highlight-cover-maker", label: "Highlight cover maker" },
  { href: "/tools/instagram-reel-cover-maker", label: "Reel cover maker" },
  { href: "/tools/instagram-story-maker", label: "Story maker" },
  { href: "/tools/instagram-post-ideas-generator", label: "Post ideas" },
  { href: "/tools/instagram-hook-generator", label: "Hook generator" },
  { href: "/tools/instagram-utm-builder", label: "UTM builder" },
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
          { href: "/instagram-scheduler", label: "Instagram scheduler" },
          { href: "/instagram-auto-dm", label: "Instagram auto DM" },
          { href: "/instagram-auto-dm/templates", label: "Auto-DM templates" },
          { href: "/pricing", label: "Pricing" },
        ]}
        extra={{ title: "Company", links: [
            { href: "/help", label: "Help center" },
            { href: "/contact", label: "Contact" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/data-deletion", label: "Data deletion" },
          ] }}
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
          { href: "/later-alternative", label: "Later alternative" },
          { href: "/planoly-alternative", label: "Planoly alternative" },
          { href: "/sprout-social-alternative", label: "Sprout Social alternative" },
          { href: "/metricool-alternative", label: "Metricool alternative" },
          { href: "/manychat-alternative", label: "ManyChat alternative" },
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
