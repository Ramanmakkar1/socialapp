import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PoskooMark from "./PoskooMark";

// The one site footer, used by the landing page and every public page (via
// PublicShell). Must be rendered inside a .landing wrapper
// so the landing.module.css global classes (footer.rich, .fh, …) apply.
function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
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
  );
}

export function SiteFooter() {
  return (
    <footer className="rich">
      <div className="fbrand">
        <Link className="logo" href="/">
          <PoskooMark size={30} />
          poskoo<b>.</b>
        </Link>
        <p>Schedule Instagram posts and auto-DM every comment, on the official Meta API.</p>
      </div>
      <FooterColumn
        title="Product"
        links={[
          { href: "/instagram-scheduler", label: "Instagram scheduler" },
          { href: "/instagram-auto-dm", label: "Instagram auto DM" },
          { href: "/instagram-auto-dm/templates", label: "Auto-DM templates" },
          { href: "/pricing", label: "Pricing" },
        ]}
      />
      <FooterColumn
        title="Free tools"
        links={[
          { href: "/tools/instagram-hashtag-generator", label: "Hashtag generator" },
          { href: "/tools/instagram-caption-counter", label: "Caption counter" },
          { href: "/tools/instagram-font-generator", label: "Font generator" },
          { href: "/tools/instagram-bio-generator", label: "Bio generator" },
          { href: "/tools/instagram-caption-generator", label: "Caption generator" },
          { href: "/tools/instagram-grid-maker", label: "Grid maker" },
          { href: "/tools/instagram-image-size", label: "Image size guide" },
          { href: "/tools/instagram-engagement-rate-calculator", label: "Engagement rate calculator" },
          { href: "/tools/instagram-line-break-generator", label: "Line break generator" },
          { href: "/tools/instagram-comment-keyword-tester", label: "Comment keyword tester" },
          { href: "/tools/instagram-comment-picker", label: "Comment picker" },
          { href: "/tools/instagram-dm-link-generator", label: "DM link generator" },
          { href: "/tools/instagram-post-preview", label: "Post preview" },
          { href: "/tools/instagram-safe-zone-checker", label: "Safe zone checker" },
          { href: "/tools/instagram-utm-builder", label: "UTM builder" },
          { href: "/tools", label: "All free tools" },
        ]}
      />
      <FooterColumn
        title="Compare"
        links={[
          { href: "/buffer-alternative", label: "Buffer alternative" },
          { href: "/later-alternative", label: "Later alternative" },
          { href: "/planoly-alternative", label: "Planoly alternative" },
          { href: "/sprout-social-alternative", label: "Sprout Social alternative" },
          { href: "/metricool-alternative", label: "Metricool alternative" },
          { href: "/manychat-alternative", label: "ManyChat alternative" },
          { href: "/hootsuite-alternative", label: "Hootsuite alternative" },
        ]}
      />
      <FooterColumn
        title="Company"
        links={[
          { href: "/help", label: "Help center" },
          { href: "/contact", label: "Contact" },
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
          { href: "/data-deletion", label: "Data deletion" },
        ]}
      />
      <div className="legal">
        <span>
          © 2026 {BRAND.name} · {BRAND.company} ·{" "}
        </span>
        <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
      </div>
    </footer>
  );
}
