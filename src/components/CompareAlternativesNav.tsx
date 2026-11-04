import Link from "next/link";

type ComparePage = "buffer" | "manychat" | "later";

const LINKS: { href: string; label: string; key: ComparePage }[] = [
  { href: "/buffer-alternative", label: "Buffer alternative", key: "buffer" },
  { href: "/manychat-alternative", label: "ManyChat alternative", key: "manychat" },
  { href: "/later-alternative", label: "Later alternative", key: "later" },
];

export function CompareAlternativesNav({ current }: { current: ComparePage }) {
  return (
    <nav aria-label="Compare alternatives" className="mx-auto mt-10 max-w-5xl text-center text-sm">
      <p className="text-muted">Compare</p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {LINKS.map((l, i) => (
          <span key={l.key} className="inline-flex items-center gap-2">
            {i > 0 && <span className="text-muted" aria-hidden>·</span>}
            {l.key === current ? (
              <span className="font-medium text-ink">{l.label}</span>
            ) : (
              <Link href={l.href} className="font-medium text-brand hover:underline">{l.label}</Link>
            )}
          </span>
        ))}
      </p>
    </nav>
  );
}
