import Link from "next/link";

type RelatedLink = {
  href: string;
  title: string;
  description: string;
};

export default function RelatedLinks({ links }: { links: RelatedLink[] }) {
  return (
    <nav className="mt-10 border-t border-[var(--poskoo-line)] pt-8" aria-labelledby="related-links-title">
      <h2 id="related-links-title" className="!text-xl font-bold tracking-tight !text-[var(--poskoo-ink)]">
        Related links
      </h2>
      <ul className="!mt-4 grid !list-none !gap-4 !p-0 md:grid-cols-3">
        {links.slice(0, 4).map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex h-full min-h-11 flex-col rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-5 !text-[var(--poskoo-ink)] !no-underline shadow-[var(--poskoo-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--poskoo-ink)] motion-reduce:transition-none motion-reduce:hover:transform-none"
            >
              <span className="font-bold">{link.title}</span>
              <span className="mt-2 text-sm leading-6 text-[var(--poskoo-muted)]">{link.description}</span>
              <span className="mt-4 text-sm font-semibold text-[var(--poskoo-violet)]">
                Explore <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
