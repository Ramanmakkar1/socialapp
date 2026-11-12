"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GUIDES_BY_DATE, GUIDE_CATEGORIES, categoryLabel, guidePath, readingMinutes, type GuideCategory, type GuideEntry } from "@/content/guides/registry";
import g from "./guides.module.css";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`)
  );

function Meta({ guide }: { guide: GuideEntry }) {
  return (
    <span className={g.meta}>
      <span>{readingMinutes(guide)} min read</span>
      <time dateTime={guide.published}>{formatDate(guide.published)}</time>
    </span>
  );
}

/** Category chips + featured article + grid. Server-renders the full list; chips filter on the client. */
export function GuidesDirectory() {
  const [cat, setCat] = useState<GuideCategory | "all">("all");
  const visible = GUIDES_BY_DATE.filter((x) => cat === "all" || x.category === cat);
  const [featured, ...rest] = visible;

  return (
    <div>
      <div className={g.filters} role="group" aria-label="Filter guides by topic">
        <button type="button" className={g.filter} aria-pressed={cat === "all"} onClick={() => setCat("all")}>
          All<span>{GUIDES_BY_DATE.length}</span>
        </button>
        {GUIDE_CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={g.filter} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
            <span>{GUIDES_BY_DATE.filter((x) => x.category === c.id).length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{visible.length} {visible.length === 1 ? "guide" : "guides"} shown</p>

      {featured ? (
        <Link className={g.featured} href={guidePath(featured.slug)}>
          <div className={g.featuredArt}>
            <Image src={featured.cover.src} width={featured.cover.width} height={featured.cover.height} alt="" priority sizes="(max-width: 820px) 92vw, 560px" />
          </div>
          <div className={g.featuredCopy}>
            <span className={g.chip}>{categoryLabel(featured.category)}</span>
            <h2>{featured.h1}</h2>
            <p>{featured.excerpt}</p>
            <Meta guide={featured} />
            <span className={g.go}>Read the guide <span aria-hidden="true">→</span></span>
          </div>
        </Link>
      ) : (
        <p className={g.empty}>
          No guides in this topic yet. Try <Link href="/tools">the free Instagram tools</Link> or the{" "}
          <Link href="/help">help center</Link> meanwhile.
        </p>
      )}

      <div className={g.gridHead}>
        <h2>{cat === "all" ? "More guides" : `More on ${categoryLabel(cat).toLowerCase()}`}</h2>
      </div>
      <ul className={g.grid}>
        {rest.map((x) => (
          <li key={x.slug}>
            <Link className={g.card} href={guidePath(x.slug)}>
              <div className={g.cardArt}>
                <Image src={x.cover.src} width={x.cover.width} height={x.cover.height} alt="" sizes="(max-width: 640px) 92vw, 360px" />
              </div>
              <span className={g.chip}>{categoryLabel(x.category)}</span>
              <b>{x.h1}</b>
              <p>{x.excerpt}</p>
              <Meta guide={x} />
            </Link>
          </li>
        ))}
        <li>
          <Link className={`${g.card} ${g.cardSoon}`} href="/help">
            <span className={g.chip}>Help center</span>
            <b>Step-by-step help for every network</b>
            <p>Short how-tos for scheduling on Instagram, Facebook, Threads, YouTube, Bluesky and more, plus auto-DM setup and fixes.</p>
            <span className={g.go}>Open the help center <span aria-hidden="true">→</span></span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
