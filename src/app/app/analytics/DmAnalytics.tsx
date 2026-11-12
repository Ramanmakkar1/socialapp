// Server component: DM analytics tabs (Performance / Activity log / Audience), built only from
// rows the app stores (dm_queue, short_links + link_clicks, contacts, comment webhook events).
import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw, Users } from "lucide-react";
import { BtnLink } from "@/components/ui/kit";
import EmptyState from "../EmptyState";
import LocalTime from "@/components/LocalTime";
import { isDbConfigured, query } from "@/lib/db";
import { loadInbox } from "@/lib/inbox";
import { HOURLY_LIMIT_PER_ACCOUNT } from "@/lib/sendPolicy";
import type { Period } from "@/lib/analytics";
import type { RuleStats } from "@/lib/stats";
import { ctrPercent } from "@/lib/ctr";
import styles from "./analytics.module.css";

type DayCount = { day: string; n: number; u?: number };

/** CTR from unique clicks, capped at 100% (one person opening a link twice is one click-through). */
function ctr(uniqueClicks: number, sent: number): string {
  const p = ctrPercent(uniqueClicks, sent);
  return p === null ? "—" : `${p}%`;
}

function pct(part: number, whole: number): string {
  if (whole <= 0) return "—";
  return `${((part / whole) * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

function lastDays(days: number, endDay?: string): string[] {
  const out: string[] = [];
  const today = endDay ? new Date(`${endDay}T00:00:00Z`) : new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function dayLabel(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

function Spark({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 0);
  return (
    <span className={styles.spark} role="img" aria-label={`${label}, last 7 days: ${values.join(", ")}`}>
      {values.map((v, i) => (
        <span key={i} style={{ height: `${max > 0 ? Math.max(8, (v / max) * 100) : 8}%` }} className={v === 0 ? styles.sparkZero : undefined} />
      ))}
    </span>
  );
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function DmPerformance({ userId, period, rules, sort }: { userId: string; period: Period; rules: RuleStats[]; sort: string }) {
  const { from, to } = period.range;
  if (!isDbConfigured()) return null;
  const [dmDays, clickDays, leadRows] = await Promise.all([
    safe(() => query<DayCount>(
      `select to_char((sent_at at time zone 'UTC')::date, 'YYYY-MM-DD') as day, count(*)::int as n from socialapp.dm_queue
        where user_id=$1 and status='sent' and sent_at >= $2 and sent_at < $3 group by 1`, [userId, from, to]), []),
    safe(() => query<DayCount>(
      `select to_char((c.clicked_at at time zone 'UTC')::date, 'YYYY-MM-DD') as day, count(*)::int as n,
        count(distinct coalesce(c.visitor_hash, c.id::text))::int as u from socialapp.link_clicks c
        join socialapp.short_links s on s.code = c.code where s.user_id=$1 and c.clicked_at >= $2 and c.clicked_at < $3 group by 1`, [userId, from, to]), []),
    safe(() => query<{ total: number; with_email: number }>(
      `select count(*)::int as total, count(email)::int as with_email from socialapp.contacts where user_id=$1 and created_at >= $2 and created_at < $3`, [userId, from, to]), []),
  ]);
  const dmBy = new Map(dmDays.map((r) => [r.day, r.n]));
  const clickBy = new Map(clickDays.map((r) => [r.day, r.n]));
  const week = lastDays(7, period.lastDay);
  const dmSpark = week.map((d) => dmBy.get(d) ?? 0);
  const clickSpark = week.map((d) => clickBy.get(d) ?? 0);
  const uniqueBy = new Map(clickDays.map((r) => [r.day, r.u ?? r.n]));
  const ctrSpark = week.map((d, i) => ctrPercent(uniqueBy.get(d) ?? 0, dmSpark[i]) ?? 0);
  const dms = dmDays.reduce((s, r) => s + r.n, 0);
  const clicks = clickDays.reduce((s, r) => s + r.n, 0);
  const uniqueClicks = clickDays.reduce((s, r) => s + (r.u ?? r.n), 0);
  const leads = leadRows[0]?.total ?? 0;
  const withEmail = leadRows[0]?.with_email ?? 0;
  const topDm = [...dmDays].sort((a, b) => b.n - a.n)[0];
  const topClick = [...clickDays].sort((a, b) => b.n - a.n)[0];
  const ranked = rules.filter((r) => r.dmsSent > 0).sort((a, b) => (ctrPercent(b.uniqueClicks, b.dmsSent) ?? 0) - (ctrPercent(a.uniqueClicks, a.dmsSent) ?? 0));
  const best = ranked[0];

  const sorted = [...rules].sort((a, b) => {
    if (sort === "clicks") return b.clicks - a.clicks;
    if (sort === "ctr") return (ctrPercent(b.uniqueClicks, b.dmsSent) ?? -1) - (ctrPercent(a.uniqueClicks, a.dmsSent) ?? -1);
    if (sort === "leads") return b.leads - a.leads;
    return b.dmsSent - a.dmsSent;
  });

  return (
    <>
      <section aria-labelledby="dm-highlights" className={styles.block}>
        <h2 id="dm-highlights" className={styles.blockTitle}>Highlights</h2>
        <div className={styles.highlightGrid}>
          <article className={styles.highlight}>
            <span className={styles.limePill}>Best Auto-DM</span>
            {best ? (
              <>
                <h3 className={styles.hlTitle}>{best.name}</h3>
                <p className={styles.hlMeta}>{ctr(best.uniqueClicks, best.dmsSent)} CTR · {best.dmsSent.toLocaleString("en-US")} DMs · {best.clicks.toLocaleString("en-US")} clicks</p>
                <Link href="/app/auto-dm" className={styles.hlLink}>View Auto-DM <ArrowRight width={14} height={14} aria-hidden="true" /></Link>
              </>
            ) : (
              <p className={styles.hlMeta}>No Auto-DM has sent a DM yet.</p>
            )}
          </article>
          <article className={styles.highlight}>
            <span className={styles.limePill}>Top day for DMs</span>
            <h3 className={styles.hlTitle}>{topDm ? dayLabel(topDm.day) : "—"}</h3>
            <p className={styles.hlMeta}>{topDm ? `${topDm.n.toLocaleString("en-US")} DMs sent` : `No DMs for ${period.phrase}`}</p>
          </article>
          <article className={styles.highlight}>
            <span className={styles.limePill}>Top day for clicks</span>
            <h3 className={styles.hlTitle}>{topClick ? dayLabel(topClick.day) : "—"}</h3>
            <p className={styles.hlMeta}>{topClick ? `${topClick.n.toLocaleString("en-US")} link clicks` : `No link clicks for ${period.phrase}`}</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="dm-metrics" className={styles.block}>
        <h2 id="dm-metrics" className={styles.blockTitle}>Key metrics <span className={styles.blockSub}>{period.phrase} · bars show {period.key === "last_month" ? "its last 7 days" : "the last 7 days"} (UTC)</span></h2>
        <div className={styles.kpiGrid}>
          <div className={styles.kpi}><p className={styles.kpiLabel}>DMs sent</p><p className={styles.kpiValue}>{dms.toLocaleString("en-US")}</p><Spark values={dmSpark} label="DMs sent" /></div>
          <div className={styles.kpi}><p className={styles.kpiLabel}>Link clicks</p><p className={styles.kpiValue}>{clicks.toLocaleString("en-US")}</p><Spark values={clickSpark} label="Link clicks" /></div>
          <div className={styles.kpi}><p className={styles.kpiLabel}>Click-through rate</p><p className={styles.kpiValue}>{ctr(uniqueClicks, dms)}</p><Spark values={ctrSpark} label="Click-through rate percent" /></div>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>Leads captured</p>
            <p className={styles.kpiValue}>{leads.toLocaleString("en-US")}</p>
            <p className={styles.kpiFoot}>{dms > 0 ? `${pct(withEmail, dms)} of DMs collected an email` : "—"}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="dm-rules" className={styles.block}>
        <div className={styles.blockHead}>
          <h2 id="dm-rules" className={styles.blockTitle}>Auto-DM performance <span className={styles.blockSub}>all time</span></h2>
          <form className={styles.sortForm}>
            <input type="hidden" name="tab" value="dms" />
            <input type="hidden" name="range" value={period.key} />
            <label htmlFor="rule-sort" className={styles.srOnly}>Sort Auto-DMs</label>
            <select id="rule-sort" name="sort" defaultValue={sort} className={styles.select}>
              <option value="dms">Most DMs</option>
              <option value="clicks">Most clicks</option>
              <option value="ctr">Best CTR</option>
              <option value="leads">Most leads</option>
            </select>
            <button type="submit" className={styles.ghostBtn}>Sort</button>
          </form>
        </div>
        {sorted.length === 0 ? (
          <p className={styles.emptyCopy}>No Auto-DMs yet. <Link href="/app/auto-dm" className={styles.inlineLink}>Create one</Link> to see its results here.</p>
        ) : (
          <ul className={styles.ruleList}>
            {sorted.map((r) => (
              <li key={r.id} className={styles.ruleRow}>
                <div className="min-w-0">
                  <p className={styles.ruleName}>{r.name} <span className={`${styles.status} ${r.status === "active" ? styles.activeStatus : ""}`}>{r.status === "active" ? "Live" : "Paused"}</span></p>
                  <p className={styles.ruleMeta}>{r.dmsFailed > 0 ? `${r.dmsFailed} failed DMs` : "No failed DMs"}</p>
                </div>
                <dl className={styles.ruleNums}>
                  <div><dt>DMs</dt><dd>{r.dmsSent.toLocaleString("en-US")}</dd></div>
                  <div><dt>Clicks</dt><dd>{r.clicks.toLocaleString("en-US")}</dd></div>
                  <div><dt>CTR</dt><dd>{ctr(r.uniqueClicks, r.dmsSent)}</dd></div>
                  <div><dt>Leads</dt><dd>{r.leads.toLocaleString("en-US")}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

type ActivityRow = {
  id: string;
  status: string;
  last_error: string | null;
  created_at: Date;
  sent_at: Date | null;
  comment_id: string | null;
  recipient: string;
  username: string | null;
  rule_name: string | null;
  public_reply: string | null;
};

const STATUS_LABEL: Record<string, string> = { sent: "Sent", skipped: "Skipped", failed: "Failed", pending: "Queued" };

export async function DmActivity({ userId }: { userId: string }) {
  if (!isDbConfigured()) return null;
  const rows = await safe(() => query<ActivityRow>(
    `select q.id, q.status, q.last_error, q.created_at, q.sent_at, q.comment_id, q.recipient_external_id as recipient,
            c.username, r.name as rule_name, r.public_reply
       from socialapp.dm_queue q
       left join socialapp.dm_rules r on r.id = q.rule_id
       left join lateral (select username from socialapp.contacts c where c.user_id = q.user_id and c.external_id = q.recipient_external_id limit 1) c on true
      where q.user_id = $1
      order by q.created_at desc
      limit 50`, [userId]), []);
  const inbox = await safe(() => loadInbox(userId), { accounts: [], comments: [], threads: [] });
  const commentText = new Map(inbox.comments.map((c) => [c.commentId, { text: c.text, from: c.fromUsername }]));

  return (
    <>
      <aside className={styles.callout} aria-labelledby="dm-trouble">
        <h2 id="dm-trouble" className={styles.calloutTitle}><AlertTriangle width={16} height={16} aria-hidden="true" /> Troubleshooting failed DMs</h2>
        <ul>
          <li><b>Not following:</b> rules with a follow gate send a “follow first” message instead of the link until the person follows you.</li>
          <li><b>Hourly limit:</b> Poskoo sends at most {HOURLY_LIMIT_PER_ACCOUNT} automated DMs per hour per account (Instagram’s cap is about 200); the rest wait and go out later.</li>
          <li><b>Window expired:</b> Instagram allows a DM reply only within 24 hours of the person’s last message, and one private reply to a comment within 7 days.</li>
          <li><b>Monthly limit:</b> automated DMs pause when the plan’s monthly allowance is used up and restart on the 1st (UTC).</li>
        </ul>
      </aside>
      <section aria-labelledby="dm-activity" className={styles.block}>
        <div className={styles.blockHead}>
          <h2 id="dm-activity" className={styles.blockTitle}>Recent Auto-DM activity</h2>
          <Link href="/app/analytics?tab=activity" className={styles.ghostBtn}><RefreshCw width={14} height={14} aria-hidden="true" /> Refresh</Link>
        </div>
        {rows.length === 0 ? (
          <p className={styles.emptyCopy}>No Auto-DM activity yet. DMs your rules send show up here.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">User &amp; comment</th>
                  <th scope="col">Auto-DM</th>
                  <th scope="col">Public reply</th>
                  <th scope="col">DM status</th>
                  <th scope="col">Date &amp; time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const comment = r.comment_id ? commentText.get(r.comment_id) : undefined;
                  const who = r.username ?? comment?.from ?? null;
                  return (
                    <tr key={r.id}>
                      <td>
                        <p className={styles.cellMain}>{who ? `@${who}` : "Instagram user"}</p>
                        <p className={styles.cellSub}>{comment?.text ?? "—"}</p>
                      </td>
                      <td>{r.rule_name ?? "—"}</td>
                      <td>{r.public_reply ? <span className={styles.cellSub}>{r.public_reply.slice(0, 60)}</span> : "—"}</td>
                      <td>
                        <span
                          className={`${styles.dmPill} ${styles[`dm_${r.status}`] ?? ""}`}
                          tabIndex={r.last_error ? 0 : undefined}
                          title={r.last_error ?? undefined}
                          aria-label={r.last_error ? `${STATUS_LABEL[r.status] ?? r.status}: ${r.last_error}` : undefined}
                        >
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                        {r.last_error && r.status !== "sent" && <p className={styles.cellErr}>{r.last_error.slice(0, 90)}</p>}
                      </td>
                      <td className="tabular-nums"><LocalTime value={r.sent_at ?? r.created_at} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export async function DmAudience({ userId }: { userId: string }) {
  const inbox = await safe(() => loadInbox(userId), { accounts: [], comments: [], threads: [] });
  const byUser = new Map<string, number>();
  for (const c of inbox.comments) {
    const key = c.fromUsername ?? c.fromId;
    byUser.set(key, (byUser.get(key) ?? 0) + 1);
  }
  const total = inbox.comments.length;
  const unique = byUser.size;
  const top = [...byUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (total === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No audience data yet"
        text="When people comment on your Instagram posts, your most active commenters and comment totals for the last 30 days show up here."
        art="/illustrations/analytics.webp"
        artWidth={1536}
        artHeight={1024}
      >
        <BtnLink href="/app/auto-dm" size="sm">Set up an Auto-DM</BtnLink>
        <BtnLink href="/app/calendar?compose=1" size="sm" variant="line">Schedule a post</BtnLink>
      </EmptyState>
    );
  }
  return (
    <>
      <section aria-labelledby="aud-kpis" className={styles.block}>
        <h2 id="aud-kpis" className={styles.blockTitle}>Comments <span className={styles.blockSub}>last 30 days, from your Instagram webhooks</span></h2>
        <div className={styles.kpiGrid}>
          <div className={styles.kpi}><p className={styles.kpiLabel}>Total comments</p><p className={styles.kpiValue}>{total.toLocaleString("en-US")}</p></div>
          <div className={styles.kpi}><p className={styles.kpiLabel}>Unique commenters</p><p className={styles.kpiValue}>{unique.toLocaleString("en-US")}</p></div>
          <div className={styles.kpi}><p className={styles.kpiLabel}>Avg comments per user</p><p className={styles.kpiValue}>{unique > 0 ? (total / unique).toLocaleString("en-US", { maximumFractionDigits: 1 }) : "—"}</p></div>
        </div>
      </section>
      <section aria-labelledby="aud-top" className={styles.block}>
        <h2 id="aud-top" className={styles.blockTitle}>Top commenters</h2>
        {top.length === 0 ? (
          <p className={styles.emptyCopy}>No comments in the last 30 days yet.</p>
        ) : (
          <ol className={styles.rankList}>
            {top.map(([name, n], i) => (
              <li key={name} className={styles.rankRow}>
                <span className={styles.rankNum}>{i + 1}</span>
                <span className={styles.rankAvatar} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
                <span className={styles.rankName}>@{name}</span>
                <span className={styles.rankCount}>{n} {n === 1 ? "comment" : "comments"}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
