import Link from "next/link";
import { Magnet, Plus } from "lucide-react";
import EmptyState from "../EmptyState";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import styles from "@/components/commerce/commerce.module.css";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listLeadMagnets, type LeadMagnetRow } from "@/lib/leadMagnets";

export const metadata = {
  title: "Lead magnets",
  description: "Free resources your auto-DMs hand out in exchange for an email.",
};

export default async function LeadMagnetsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const user = await requireUser();
  const { deleted } = await searchParams;
  let magnets: LeadMagnetRow[] = [];
  let failed = false;
  if (isDbConfigured()) {
    try {
      magnets = await listLeadMagnets(user.id);
    } catch (err) {
      console.error("lead magnets load failed for user", user.id, err instanceof Error ? err.message : err);
      failed = true;
    }
  }
  const totals = magnets.reduce((t, m) => ({ deliveries: t.deliveries + m.deliveries, leads: t.leads + m.leads }), { deliveries: 0, leads: 0 });
  return (
    <>
      <PageHero icon={<Magnet width={20} height={20} />}
        eyebrow="New · Grow your list"
        title="Lead"
        accent="magnets"
        lede="Give a free guide, checklist or template to everyone who comments your keyword. Poskoo asks for their email in the DM, sends the file and tags the lead."
        action={magnets.length > 0 ? <BtnLink href="/app/lead-magnets/new"><Plus aria-hidden="true" size={18} /> Create lead magnet</BtnLink> : undefined}
      />
      {deleted ? <p role="status" className={`${ui.notice} mt-6`}>Lead magnet deleted.</p> : null}
      {failed ? (
        <p role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>Lead magnets could not be loaded. Reload to try again.</p>
      ) : magnets.length === 0 ? (
        <EmptyState
          icon={Magnet}
          title="No lead magnets yet"
          text="Create a free resource, attach it to an auto-DM rule with an email gate, and every new lead gets it automatically."
          art="/illustrations/empty-leads.webp"
          artWidth={1536}
          artHeight={1024}
        >
          <BtnLink href="/app/lead-magnets/new"><Plus aria-hidden="true" size={18} /> Create lead magnet</BtnLink>
        </EmptyState>
      ) : (
        <>
          <div className={styles.stats}>
            <div className={`${ui.card} ${styles.stat}`}><p className={styles.statLabel}>Lead magnets</p><p className={styles.statValue}>{magnets.length}</p></div>
            <div className={`${ui.card} ${styles.stat}`}><p className={styles.statLabel}>Deliveries</p><p className={styles.statValue}>{totals.deliveries}</p></div>
            <div className={`${ui.card} ${styles.stat}`}><p className={styles.statLabel}>Leads with email</p><p className={styles.statValue}>{totals.leads}</p></div>
          </div>
          <div className={`${ui.tableWrap} mt-6`}>
            <table className={`${ui.table} ${styles.wideOnly}`}>
              <thead>
                <tr>
                  <th scope="col" className={ui.th}>Lead magnet</th>
                  <th scope="col" className={ui.th}>Rules</th>
                  <th scope="col" className={`${ui.th} ${styles.num}`}>Deliveries</th>
                  <th scope="col" className={`${ui.th} ${styles.num}`}>Leads</th>
                  <th scope="col" className={`${ui.th} ${styles.num}`}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {magnets.map((m) => (
                  <tr key={m.id} className={ui.tr}>
                    <td className={ui.td}>
                      <Link href={`/app/lead-magnets/${m.id}`} className={styles.titleCell}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- creator-supplied external cover URL */}
                        {m.cover_url ? <img src={m.cover_url} alt="" className={styles.thumb} /> : <span className={styles.thumb} aria-hidden="true" />}
                        <span>
                          <span className={styles.titleText}>{m.title}</span>
                          <span className={styles.subText}>{m.delivery_type === "file" ? "File download" : "Link"}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={ui.td}>{m.rules === 0 ? <span className={ui.hint}>Not attached</span> : `${m.rules} ${m.rules === 1 ? "rule" : "rules"}`}</td>
                    <td className={`${ui.td} ${styles.num}`}>{m.deliveries}</td>
                    <td className={`${ui.td} ${styles.num}`}>{m.leads}</td>
                    <td className={`${ui.td} ${styles.num}`}>{m.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className={`${styles.cards} p-3`}>
              {magnets.map((m) => (
                <li key={m.id} className={`${ui.card} ${styles.cardItem}`}>
                  <Link href={`/app/lead-magnets/${m.id}`} className={styles.titleText}>{m.title}</Link>
                  <dl className={styles.cardDl}>
                    <dt>Rules</dt><dd>{m.rules}</dd>
                    <dt>Deliveries</dt><dd>{m.deliveries}</dd>
                    <dt>Leads</dt><dd>{m.leads}</dd>
                    <dt>Clicks</dt><dd>{m.clicks}</dd>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
