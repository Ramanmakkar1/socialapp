import Link from "next/link";
import { BRAND } from "@/lib/brand";

const linkClass =
  "flex min-h-10 items-center text-sm text-muted transition hover:text-ink";

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-ink">{title}</p>
      <ul className="mt-3 space-y-0">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={linkClass}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-12 text-sm">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <FooterColumn
            title="Product"
            links={[
              { href: "/instagram-scheduler", label: "Instagram scheduler" },
              { href: "/instagram-auto-dm", label: "Instagram auto DM" },
              { href: "/instagram-auto-dm/templates", label: "DM templates" },
            ]}
          />
          <FooterColumn
            title="Free tools"
            links={[
              { href: "/tools/instagram-hashtag-generator", label: "Hashtag generator" },
              { href: "/tools/instagram-caption-counter", label: "Caption counter" },
              { href: "/tools/instagram-font-generator", label: "Font generator" },
              { href: "/tools/instagram-image-size", label: "Image size guide" },
              { href: "/tools/instagram-post-preview", label: "Post preview" },
              { href: "/tools/instagram-dm-link-generator", label: "DM link generator" },
              { href: "/tools/instagram-utm-builder", label: "UTM link builder" },
              { href: "/tools", label: "All free tools" },
            ]}
          />
          <FooterColumn
            title="Compare"
            links={[
              { href: "/buffer-alternative", label: "Buffer alternative" },
              { href: "/later-alternative", label: "Later alternative" },
              { href: "/manychat-alternative", label: "ManyChat alternative" },
              { href: "/hootsuite-alternative", label: "Hootsuite alternative" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { href: "/help", label: "Help" },
              { href: "/contact", label: "Contact" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/data-deletion", label: "Data deletion" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 {BRAND.name} · {BRAND.company}
          </p>
          <a href={`mailto:${BRAND.supportEmail}`} className={`${linkClass} sm:min-h-0 sm:py-0`}>
            {BRAND.supportEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
