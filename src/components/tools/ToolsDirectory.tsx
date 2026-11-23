"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES, toolArt, toolByHref, type ToolCategory } from "./registry";
import { CategoryIcon, ToolIcon } from "./ToolIcon";
import t from "./tools.module.css";

/** Editorial "start here" picks, matching the hub FAQ's "Which tool should I start with?" answer. */
const PICKS = [
  { href: "/tools/instagram-caption-generator", label: "Writing a post" },
  { href: "/tools/instagram-hashtag-generator", label: "Finding tags" },
  { href: "/tools/instagram-image-size", label: "Preparing media" },
  { href: "/tools/instagram-comment-keyword-tester", label: "Running a DM campaign" },
];

/** Searchable, filterable grid of every free tool, grouped by category. Server-renders the full list. */
export function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ToolCategory | "all">("all");

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      TOOLS.filter(
        (tool) =>
          (cat === "all" || tool.category === cat) &&
          (!q || `${tool.name} ${tool.summary}`.toLowerCase().includes(q))
      ),
    [q, cat]
  );
  const filtered = cat !== "all" || q !== "";
  const picks = PICKS.map((p) => ({ ...p, tool: toolByHref(p.href) })).filter((p) => p.tool !== undefined);

  return (
    <div>
      <div className={t.hubBar} role="search">
        <label className={t.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search free tools</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${TOOLS.length} free tools…`}
            autoComplete="off"
          />
        </label>
        <div className={t.filters} aria-label="Filter by category">
          <button type="button" className={t.filter} aria-pressed={cat === "all"} onClick={() => setCat("all")}>
            All<span>{TOOLS.length}</span>
          </button>
          {TOOL_CATEGORIES.map((c) => (
            <button key={c.id} type="button" className={t.filter} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
              <CategoryIcon category={c.id} size={15} />
              {c.label}
              <span>{TOOLS.filter((tool) => tool.category === c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{visible.length} tools shown</p>
      {filtered && visible.length > 0 && (
        <p className={t.resultLine}>
          Showing <b>{visible.length}</b> of {TOOLS.length} tools
          {q ? <> matching &ldquo;{query.trim()}&rdquo;</> : null}.{" "}
          <button type="button" className={t.textLink} onClick={() => { setQuery(""); setCat("all"); }}>
            Show all
          </button>
        </p>
      )}

      {!filtered && picks.length > 0 && (
        <div className={t.picks}>
          <div className={t.groupHead}>
            <h2>Start here</h2>
            <p>The four tools most posts need, one per job.</p>
          </div>
          <ul className={t.pickGrid}>
            {picks.map(({ href, label, tool }, i) => (
              <li key={href}>
                <Link href={href} className={t.pick}>
                  <span className={`${t.pickArt} ${t[`cat_${tool!.category}`]}`}>
                    <Image src={`/landing/anim/${toolArt(tool!)}.webp`} alt="" width={480} height={480} sizes="160px" loading={i < 2 ? "eager" : "lazy"} />
                  </span>
                  <span className={t.pickNo}>{label}</span>
                  <b>{tool!.name}</b>
                  <small>{tool!.summary}</small>
                  <span className={t.carGo}>Open tool <span aria-hidden="true">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {TOOL_CATEGORIES.map((c) => {
        const list = visible.filter((tool) => tool.category === c.id);
        if (list.length === 0) return null;
        return (
          <div key={c.id} id={c.id} className={t.group}>
            <div className={t.groupHead}>
              <span className={`${t.groupIcon} ${t[`cat_${c.id}`]}`} aria-hidden="true">
                <CategoryIcon category={c.id} />
              </span>
              <h2>{c.label}</h2>
              <span className={t.groupCount}>{list.length} tools</span>
              <p>{c.blurb}</p>
            </div>
            <ul className={t.grid}>
              {list.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className={`${t.card} ${t[`acc_${tool.category}`]}`}>
                    <span className={t.cardTop}>
                      <span className={`${t.cardIcon} ${t[`cat_${tool.category}`]}`}>
                        <ToolIcon name={tool.icon} />
                      </span>
                      <b>{tool.name}</b>
                    </span>
                    <p>{tool.summary}</p>
                    <span className={t.go}>Open tool <span aria-hidden="true">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {visible.length === 0 && (
        <div className={t.empty}>
          <span className={t.emptyIcon} aria-hidden="true"><SearchX size={22} /></span>
          <p>No tool matches &ldquo;{query}&rdquo;.</p>
          <button type="button" className={t.filter} onClick={() => { setQuery(""); setCat("all"); }}>Clear search</button>
        </div>
      )}
    </div>
  );
}
