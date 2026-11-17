import Link from "next/link";
import s from "./site.module.css";

type ComparePage = "buffer" | "manychat" | "later" | "metricool" | "planoly" | "sprout" | "hootsuite" | "meta" | "publer" | "agorapulse" | "zoho" | "loomly" | "tailwind" | "socialbee" | "sendible" | "vistasocial" | "linktree" | "influence";

const LINKS: { href: string; label: string; key: ComparePage }[] = [
  { href: "/buffer-alternative", label: "Buffer alternative", key: "buffer" },
  { href: "/publer-alternative", label: "Publer alternative", key: "publer" },
  { href: "/loomly-alternative", label: "Loomly alternative", key: "loomly" },
  { href: "/tailwind-alternative", label: "Tailwind alternative", key: "tailwind" },
  { href: "/socialbee-alternative", label: "SocialBee alternative", key: "socialbee" },
  { href: "/sendible-alternative", label: "Sendible alternative", key: "sendible" },
  { href: "/vista-social-alternative", label: "Vista Social alternative", key: "vistasocial" },
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
  { href: "/influence-alternative", label: "Influence.so alternative", key: "influence" },
];

const WORKFLOW_LINKS: { href: string; label: string }[] = [
  { href: "/social-media-scheduler-comparison", label: "Compare social media schedulers" },
  { href: "/instagram-auto-dm", label: "Instagram auto-DM automation" },
  { href: "/instagram-scheduler", label: "Schedule Instagram posts" },
  { href: "/pricing", label: "See pricing" },
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
      <p>Choose by workflow</p>
      <div>
        {WORKFLOW_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={s.chip}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
