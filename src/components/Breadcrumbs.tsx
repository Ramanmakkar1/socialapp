import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import s from "./site.module.css";

export type BreadcrumbItem = { name: string; href: string };

/**
 * Visible breadcrumb trail plus its BreadcrumbList JSON-LD. Server component:
 * the last item is the current page (rendered as text, not a link), earlier
 * items link to their route. Styling comes from the shared site tokens.
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <ol>
          {items.map((c, i) => (
            <li key={c.href + c.name}>
              {i > 0 && <span aria-hidden="true"> / </span>}
              {i === items.length - 1 ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link href={c.href}>{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson(
            breadcrumbJsonLd(
              items.map((c) => ({
                name: c.name,
                url: c.href ? BRAND.canonicalUrl + (c.href === "/" ? "/" : c.href) : "",
              }))
            )
          ),
        }}
      />
    </>
  );
}
