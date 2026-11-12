"use client";

// Analytics charts: follower growth (area + line on a zoomed baseline), last-14-days grouped bars,
// and comment timing (heatmap + hour bars) shifted into the viewer's browser time zone.
import { useState, useSyncExternalStore, type PointerEvent } from "react";
import { MessageCircle } from "lucide-react";
import styles from "./charts.module.css";

const noopSubscribe = () => () => {};

/** Browser zone (offset in whole hours + IANA name); null on the server so SSR renders UTC first. */
function useBrowserZone(): { offsetHours: number; name: string } | null {
  const key = useSyncExternalStore(
    noopSubscribe,
    () => {
      const offset = Math.round(-new Date().getTimezoneOffset() / 60);
      let name = "";
      try {
        name = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      } catch {
        name = "";
      }
      return `${offset}|${name}`;
    },
    () => null,
  );
  if (key == null) return null;
  const [offset, name] = key.split("|");
  return { offsetHours: Number(offset), name: name || "your time zone" };
}

function shortDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

const fmt = (n: number) => n.toLocaleString("en-US");

/** Rounds a step to 1/2/5 x 10^n so the axis ticks read cleanly. */
function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

export function GrowthChart({ series }: { series: { day: string; followers: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (series.length === 0) return null;
  const values = series.map((s) => s.followers);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  // Non-zero baseline: zoom to the data range so growth is visible.
  const step = niceStep(Math.max(hi - lo, 4) / 3);
  const yMin = Math.max(0, Math.floor(lo / step) * step - (lo % step === 0 ? step : 0));
  const yMax = Math.ceil(hi / step) * step + (hi % step === 0 ? step : 0);
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) ticks.push(v);
  const n = series.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - ((v - yMin) / (yMax - yMin || 1)) * 100;
  const line = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(s.followers).toFixed(2)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(2)},100 L${x(0).toFixed(2)},100 Z`;
  const labelIdx = n > 2 ? [0, Math.floor((n - 1) / 2), n - 1] : n === 2 ? [0, 1] : [0];

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (n - 1)));
  }

  const active = hover == null ? null : series[hover];
  return (
    <figure className={styles.growth} aria-label={`Followers from ${fmt(series[0].followers)} on ${shortDay(series[0].day)} to ${fmt(series[n - 1].followers)} on ${shortDay(series[n - 1].day)}`}>
      <div className={styles.growthYAxis} aria-hidden="true">
        {[...ticks].reverse().map((t) => (
          <span key={t} style={{ top: `${y(t)}%` }}>{fmt(t)}</span>
        ))}
      </div>
      <div className={styles.growthPlot} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <span key={t} className={styles.gridLine} style={{ top: `${y(t)}%` }} aria-hidden="true" />
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.growthSvg} aria-hidden="true">
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--poskoo-violet)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--poskoo-violet)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#growthFill)" />
          <path d={line} fill="none" stroke="var(--poskoo-violet)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <span className={styles.endDot} style={{ left: `${x(n - 1)}%`, top: `${y(series[n - 1].followers)}%` }} aria-hidden="true" />
        {active && hover != null ? (
          <>
            <span className={styles.crosshair} style={{ left: `${x(hover)}%` }} aria-hidden="true" />
            <span className={styles.hoverDot} style={{ left: `${x(hover)}%`, top: `${y(active.followers)}%` }} aria-hidden="true" />
            <span className={`${styles.tooltip} ${x(hover) > 70 ? styles.tooltipLeft : ""}`} style={{ left: `${x(hover)}%` }} role="status">
              <strong>{fmt(active.followers)}</strong> followers
              <span>{shortDay(active.day)}</span>
            </span>
          </>
        ) : null}
      </div>
      <div className={styles.growthXAxis} aria-hidden="true">
        {labelIdx.map((i) => (
          <span key={i} style={{ left: `${x(i)}%` }} className={i === 0 ? styles.xFirst : i === n - 1 ? styles.xLast : undefined}>
            {shortDay(series[i].day)}
          </span>
        ))}
      </div>
      <table className={styles.srOnly}>
        <caption>Followers per day</caption>
        <tbody>
          {series.map((s) => (
            <tr key={s.day}><th scope="row">{shortDay(s.day)}</th><td>{fmt(s.followers)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function DailyBars({ rows, emptyHref }: { rows: { day: string; dms: number; leads: number }[]; emptyHref?: string }) {
  const max = rows.reduce((m, r) => Math.max(m, r.dms, r.leads), 0);
  if (max === 0) {
    return (
      <div className={styles.chartEmpty}>
        <span className={styles.chartEmptyIcon} aria-hidden="true"><MessageCircle width={18} height={18} /></span>
        <p className={styles.chartEmptyTitle}>No DMs or new contacts in the last 14 days</p>
        <p className={styles.chartEmptyText}>
          Bars appear here once your Auto-DMs start replying to comments.
          {emptyHref ? <> <a href={emptyHref}>Set up an Auto-DM</a></> : null}
        </p>
      </div>
    );
  }
  const tickStep = niceStep(max / 2);
  const top = Math.ceil(max / tickStep) * tickStep;
  return (
    <figure className={styles.daily}>
      <div className={styles.legend}>
        <span><i className={styles.swDms} aria-hidden="true" /> DMs sent</span>
        <span><i className={styles.swLeads} aria-hidden="true" /> New contacts</span>
      </div>
      <div className={styles.dailyPlot}>
        <span className={styles.dailyTop} aria-hidden="true">{fmt(top)}</span>
        <span className={styles.gridLine} style={{ top: 0 }} aria-hidden="true" />
        <span className={styles.gridLine} style={{ top: "50%" }} aria-hidden="true" />
        {rows.map((r) => {
          const tip = `${shortDay(r.day)}: ${fmt(r.dms)} DM${r.dms === 1 ? "" : "s"}, ${fmt(r.leads)} contact${r.leads === 1 ? "" : "s"}`;
          return (
            <div key={r.day} className={styles.group} tabIndex={0} aria-label={tip} data-tip={tip}>
              <span className={`${styles.bar} ${styles.barDms}`} style={{ height: `${(r.dms / top) * 100}%` }} />
              <span className={`${styles.bar} ${styles.barLeads}`} style={{ height: `${(r.leads / top) * 100}%` }} />
            </div>
          );
        })}
      </div>
      <div className={styles.dailyX} aria-hidden="true">
        {rows.map((r, i) => (
          <span key={r.day}>{i === 0 || i === rows.length - 1 || i === Math.floor(rows.length / 2) ? shortDay(r.day) : ""}</span>
        ))}
      </div>
    </figure>
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCK_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

function hourLabel(h: number): string {
  const v = ((h % 24) + 24) % 24;
  if (v === 0) return "12 AM";
  if (v === 12) return "12 PM";
  return v < 12 ? `${v} AM` : `${v - 12} PM`;
}

/**
 * Comment timing from UTC (ISO weekday, hour) counts, shifted to the viewer's zone:
 * a full-width day x 3-hour heatmap, best slot, top hours and a 24-hour bar strip.
 */
export function CommentTimes({ cells, showHourBars = true }: { cells: { dow: number; hour: number; count: number }[]; showHourBars?: boolean }) {
  const zone = useBrowserZone();
  const shift = zone?.offsetHours ?? 0;
  const zoneLabel = zone ? `Times in your time zone (${zone.name})` : "Times in UTC";
  const grid = DAY_LABELS.map(() => BLOCK_LABELS.map(() => 0));
  const hours = Array.from({ length: 24 }, () => 0);
  let total = 0;
  for (const c of cells) {
    if (c.dow < 1 || c.dow > 7 || c.hour < 0 || c.hour > 23) continue;
    const local = ((((c.dow - 1) * 24 + c.hour + shift) % 168) + 168) % 168;
    const day = Math.floor(local / 24);
    const hour = local % 24;
    grid[day][Math.floor(hour / 3)] += c.count;
    hours[hour] += c.count;
    total += c.count;
  }
  if (total === 0) {
    return (
      <div className={styles.chartEmpty}>
        <span className={styles.chartEmptyIcon} aria-hidden="true"><MessageCircle width={18} height={18} /></span>
        <p className={styles.chartEmptyTitle}>No comments yet</p>
        <p className={styles.chartEmptyText}>Once your Auto-DM rules start getting comments, your best posting times show up here.</p>
      </div>
    );
  }
  let best = { day: 0, block: 0, count: -1 };
  let max = 0;
  grid.forEach((row, day) => row.forEach((count, block) => {
    if (count > best.count) best = { day, block, count };
    max = Math.max(max, count);
  }));
  const maxHour = Math.max(...hours);
  const topHours = hours
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count || a.hour - b.hour)
    .slice(0, 3);
  const blockRange = (b: number) => `${BLOCK_LABELS[b]}–${BLOCK_LABELS[(b + 1) % 8]}`;
  return (
    <div className={styles.times}>
      <p className={styles.zone}>{zoneLabel}</p>
      <div className={styles.heat} role="table" aria-label={`Comments by day and time, ${zoneLabel.toLowerCase()}`}>
        <div role="row" className={styles.heatRow}>
          <span role="columnheader" className={styles.heatAxis}><span className={styles.srOnly}>Day</span></span>
          {BLOCK_LABELS.map((l) => (
            <span key={l} role="columnheader" className={styles.heatAxis}>{l}</span>
          ))}
        </div>
        {grid.map((row, day) => (
          <div key={DAY_LABELS[day]} role="row" className={styles.heatRow}>
            <span role="rowheader" className={styles.heatAxis}>{DAY_LABELS[day]}</span>
            {row.map((count, block) => {
              const tip = `${DAY_LABELS[day]} ${blockRange(block)}: ${fmt(count)} comment${count === 1 ? "" : "s"}`;
              const pct = count === 0 ? 0 : 18 + Math.round((82 * count) / max);
              return (
                <span
                  key={block}
                  role="cell"
                  tabIndex={0}
                  aria-label={tip}
                  data-tip={tip}
                  className={styles.heatCell}
                  style={{ background: count === 0 ? "var(--poskoo-band)" : `color-mix(in srgb, var(--poskoo-violet) ${pct}%, var(--poskoo-band))` }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.heatScale} aria-hidden="true">
        <span>Fewer</span><i /><span>More</span>
      </div>
      <p className={styles.bestLine}>
        <strong>Best time to post:</strong> {DAY_LABELS[best.day]} {blockRange(best.block)}
      </p>
      {showHourBars ? (
        <>
          <div className={styles.pills}>
            {topHours.map((h) => (
              <span key={h.hour} className={styles.pill}>
                {hourLabel(h.hour)}–{hourLabel(h.hour + 1)} <span>{fmt(h.count)}</span>
              </span>
            ))}
          </div>
          <div className={styles.hourPlot} role="img" aria-label={`Comments by hour of day, ${zoneLabel.toLowerCase()}`}>
            {hours.map((count, hour) => {
              const tip = `${hourLabel(hour)}: ${fmt(count)} comment${count === 1 ? "" : "s"}`;
              return (
                <div key={hour} className={styles.hourCol} data-tip={tip}>
                  <span className={styles.hourBar} style={{ height: `${maxHour > 0 ? (count / maxHour) * 100 : 0}%` }} />
                </div>
              );
            })}
          </div>
          <div className={styles.hourX} aria-hidden="true">
            <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
