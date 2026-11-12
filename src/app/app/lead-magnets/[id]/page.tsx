import { Magnet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import LocalTime from "@/components/LocalTime";
import { Stat } from "@/components/commerce/DeliveryFields";
import styles from "@/components/commerce/commerce.module.css";
import SubmitButton from "@/components/ui/SubmitButton";
import { PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { requireUser } from "@/lib/auth";
import { getLeadMagnet, listRuleOptions, recentDeliveries } from "@/lib/leadMagnets";
import { deleteLeadMagnetAction } from "../actions";
import LeadMagnetForm from "../LeadMagnetForm";
import { rulePicks } from "../rulePicks";

export const metadata = { title: "Lead magnet" };

export default async function LeadMagnetPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const magnet = await getLeadMagnet(user.id, id);
  if (!magnet) notFound();
  const [rules, deliveries] = await Promise.all([listRuleOptions(user.id), recentDeliveries(user.id, magnet.id)]);
  return (
    <>
      <PageHero icon={<Magnet width={20} height={20} />} eyebrow="Lead magnet" title={magnet.title} lede={<Link href="/app/lead-magnets" className={ui.link}>All lead magnets</Link>} />
      {saved ? <p role="status" className={`${ui.notice} mt-6`}>Saved.</p> : null}
      {error ? <p role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>Could not delete it. Please try again.</p> : null}
      <div className={styles.stats}>
        <Stat label="Deliveries" value={magnet.deliveries} />
        <Stat label="Leads with email" value={magnet.leads} />
        <Stat label="Link clicks" value={magnet.clicks} />
        <Stat label="Auto-DM rules" value={magnet.rules} />
      </div>
      {magnet.rules === 0 ? (
        <p className={`${ui.notice} ${ui.noticeWarn} mt-4`}>Not attached to any auto-DM rule yet: tick a rule below so leads receive it.</p>
      ) : null}

      <section className={styles.section} aria-labelledby="deliveries-heading">
        <h2 id="deliveries-heading" className={styles.sectionTitle}>Latest leads</h2>
        {deliveries.length === 0 ? (
          <p className={ui.hint}>Nobody has received it yet. Leads appear here once a rule delivers it.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th scope="col" className={ui.th}>Lead</th>
                  <th scope="col" className={ui.th}>Email</th>
                  <th scope="col" className={`${ui.th} ${styles.wideOnly}`}>Rule</th>
                  <th scope="col" className={ui.th}>Sent</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className={ui.tr}>
                    <td className={ui.td}>{d.username ? `@${d.username}` : "—"}</td>
                    <td className={ui.td}>{d.email || "—"}</td>
                    <td className={`${ui.td} ${styles.wideOnly}`}>{d.rule_name || "—"}</td>
                    <td className={ui.td}><LocalTime value={d.created_at} style="medium" fallback="-" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="edit-heading">
        <h2 id="edit-heading" className={styles.sectionTitle}>Edit</h2>
        <LeadMagnetForm
          id={magnet.id}
          defaults={magnet}
          rules={rulePicks(rules, { magnetId: magnet.id })}
          selectedRules={magnet.rule_ids}
        />
      </section>

      <section className={styles.section} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.sectionTitle}>Delete</h2>
        <p className={ui.hint}>Rules keep their current link; delivery history is removed.</p>
        <form action={deleteLeadMagnetAction}>
          <input type="hidden" name="id" value={magnet.id} />
          <SubmitButton label="Delete lead magnet" pendingLabel="Deleting…" variant="line" size="sm" />
        </form>
      </section>
    </>
  );
}
