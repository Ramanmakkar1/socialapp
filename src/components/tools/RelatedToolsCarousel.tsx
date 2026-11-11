"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryLabel, toolArt, type ToolEntry } from "./registry";
import t from "./tools.module.css";

/**
 * Horizontally scrolling row of related-tool cards: CSS scroll-snap, swipe on touch,
 * prev/next buttons (disabled at the ends) and dots. No carousel library.
 */
export function RelatedToolsCarousel({ tools }: { tools: ToolEntry[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 16 : el.clientWidth;
    setActive(Math.min(tools.length - 1, Math.round(el.scrollLeft / step)));
  }, [tools.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollToIndex = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className={t.carousel}>
      <div className={`${t.carViewport} ${atStart ? "" : t.fadeL} ${atEnd ? "" : t.fadeR}`}>
        <ul ref={track} className={t.carTrack} aria-label="Related free tools">
          {tools.map((tool) => (
            <li key={tool.href} className={t.carItem}>
              <Link href={tool.href} className={t.carCard}>
                <span className={`${t.carArt} ${t[`cat_${tool.category}`]}`}>
                  <Image src={`/landing/anim/${toolArt(tool)}.webp`} alt="" width={480} height={480} sizes="200px" loading="lazy" />
                </span>
                <span className={t.carChip}>{categoryLabel(tool.category)}</span>
                <b>{tool.name}</b>
                <small>{tool.summary}</small>
                <span className={t.carGo}>Open tool <span aria-hidden="true">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={t.carControls}>
        <div className={t.carDots} aria-hidden="true">
          {tools.map((tool, i) => (
            <button key={tool.href} type="button" tabIndex={-1} className={i === active ? t.dotOn : t.dot} onClick={() => scrollToIndex(i)} />
          ))}
        </div>
        <div className={t.carArrows}>
          <button type="button" className={t.carBtn} onClick={() => page(-1)} disabled={atStart} aria-label="Previous tools">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" className={t.carBtn} onClick={() => page(1)} disabled={atEnd} aria-label="Next tools">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
