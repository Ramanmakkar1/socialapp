import Link from "next/link";
import s from "./site.module.css";

type ComparePage = "buffer" | "manychat" | "later" | "sprout" | "hootsuite";

const LINKS: { href: string; label: string; key: ComparePage }[] = [
  { href: "/buffer-alternative", label: "Buffer alternative", key: "buffer" },
  { href: "/manychat-alternative", label: "ManyChat alternative", key: "manychat" },
  { href: "/later-alternative", label: "Later alternative", key: "later" },
  { href: "/sprout-social-alternative", label: "Sprout Social alternative", key: "sprout" },
  { href: "/hootsuite-alternative", label: "Hootsuite alternative", key: "hootsuite" },
];

export function CompareAlternativesNav({ current }: { current: ComparePage }) {
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
