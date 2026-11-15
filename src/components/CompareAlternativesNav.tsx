import Link from "next/link";
import s from "./site.module.css";

type ComparePage = "buffer" | "manychat" | "later" | "metricool" | "planoly" | "sprout" | "hootsuite" | "meta" | "publer" | "agorapulse" | "zoho" | "loomly" | "socialbee" | "sendible" | "linktree";

const LINKS: { href: string; label: string; key: ComparePage }[] = [
  { href: "/buffer-alternative", label: "Buffer alternative", key: "buffer" },
  { href: "/publer-alternative", label: "Publer alternative", key: "publer" },
  { href: "/loomly-alternative", label: "Loomly alternative", key: "loomly" },
  { href: "/socialbee-alternative", label: "SocialBee alternative", key: "socialbee" },
  { href: "/sendible-alternative", label: "Sendible alternative", key: "sendible" },
  { href: "/agorapulse-alternative", label: "Agorapulse alternative", key: "agorapulse" },
  { href: "/zoho-social-alternative", label: "Zoho Social alternative", key: "zoho" },
  { href: "/manychat-alternative", label: "ManyChat alternative", key: "manychat" },
  { href: "/later-alternative", label: "Later alternative", key: "later" },
  { href: "/planoly-alternative", label: "Planoly alternative", key: "planoly" },
  { href: "/sprout-social-alternative", label: "Sprout Social alternative", key: "sprout" },
  { href: "/metricool-alternative", label: "Metricool alternative", key: "metricool" },
  { href: "/hootsuite-alternative", label: "Hootsuite alternative", key: "hootsuite" },
  { href: "/meta-business-suite-alternative", label: "Meta Business Suite alternative", key: "meta" },
  { href: "/linktree-alternative", label: "Linktree alternative", key: "linktree" },
];

export function CompareAlternativesNav({ current }: { current?: ComparePage }) {
  return (
    <nav aria-label="Compare alternatives" className={s.chipRow}>
      <p>Compare</p>
      <div>
        {LINKS.map((l) =>
          l.key === current ? (
            <span key={l.key} className={`${s.chip} ${s.chipActive}`} aria-current="page">
              {l.label}
            </span>
          ) : (
            <Link key={l.key} href={l.href} className={s.chip}>
              {l.label}
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}
