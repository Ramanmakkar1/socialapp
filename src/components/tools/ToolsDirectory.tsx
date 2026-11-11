"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "./registry";
import { ToolIcon } from "./ToolIcon";
import t from "./tools.module.css";

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
              {c.label}
              <span>{TOOLS.filter((tool) => tool.category === c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{visible.length} tools shown</p>

      {TOOL_CATEGORIES.map((c) => {
        const list = visible.filter((tool) => tool.category === c.id);
        if (list.length === 0) return null;
        return (
          <div key={c.id} id={c.id} className={t.group}>
            <div className={t.groupHead}>
              <h2>{c.label}</h2>
              <p>{c.blurb}</p>
            </div>
            <ul className={t.grid}>
              {list.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className={t.card}>
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
        <p className={t.empty}>
          No tool matches &ldquo;{query}&rdquo;.{" "}
          <button type="button" className={t.filter} onClick={() => { setQuery(""); setCat("all"); }}>Clear search</button>
        </p>
      )}
    </div>
  );
}
