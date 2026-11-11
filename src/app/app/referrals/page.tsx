import { Gift } from "lucide-react";
import EmptyState from "../EmptyState";
import LocalTime from "@/components/LocalTime";
import CopyField from "@/components/commerce/CopyField";
import { Stat } from "@/components/commerce/DeliveryFields";
import styles from "@/components/commerce/commerce.module.css";
import { PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { PLAN_LIMITS, planForUser } from "@/lib/planLimits";
import { REFERRAL_BONUS_DMS, REF_WINDOW_DAYS, maskEmail, referralStats } from "@/lib/referrals";

export const metadata = {
  title: "Refer and earn",
  description: "Invite creators to Poskoo and earn bonus automated DMs every month.",
};

export default async function ReferralsPage() {
  const user = await requireUser();
  let stats: Awaited<ReturnType<typeof referralStats>> | null = null;
  if (isDbConfigured()) {
    try {
      stats = await referralStats(user.id);
    } catch (err) {
      console.error("referral stats failed for user", user.id, err instanceof Error ? err.message : err);
    }
  }
  const base = PLAN_LIMITS[planForUser()].autoDmsPerMonth;
  const bonus = REFERRAL_BONUS_DMS.toLocaleString("en-US");
  return (
    <>
      <PageHero
        eyebrow="Refer and earn"
        title="Invite creators, get"
        accent="more DMs"
        lede={`Every creator who joins with your link and connects an account adds ${bonus} automated DMs to your monthly limit, every month.`}
        art="/landing/card-dm.webp"
      />
      {!stats ? (
        <p role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-6`}>Your referral link could not be loaded. Reload to try again.</p>
      ) : (
        <>
          <section className={styles.section} aria-labelledby="link-heading">
            <h2 id="link-heading" className={styles.sectionTitle}>Your link</h2>
            <CopyField id="referral-link" label="Share this link" value={`${BRAND.url}/r/${stats.code}`} />
            <p className={`${ui.hint} mt-2`}>Code <strong>{stats.code}</strong> also works as {BRAND.url.replace(/^https?:\/\//, "")}/?ref={stats.code}</p>
          </section>
          <div className={styles.stats}>
            <Stat label="Link clicks" value={stats.clicks} />
            <Stat label="Sign-ups" value={stats.signups} />
            <Stat label="Qualified" value={stats.qualified} />
            <Stat label="Bonus DMs / month" value={stats.bonus.toLocaleString("en-US")} />
          </div>
          <p className={`${ui.hint} mt-2`}>
            Your monthly automated-DM limit: {(base + stats.bonus).toLocaleString("en-US")} ({base.toLocaleString("en-US")} plan + {stats.bonus.toLocaleString("en-US")} bonus).
          </p>
        </>
      )}
      <section className={styles.section} aria-labelledby="how-heading">
        <h2 id="how-heading" className={styles.sectionTitle}>How it works</h2>
        <ol className={styles.steps}>
          <li className={`${ui.card} ${styles.stepItem}`}>
            <span className={styles.stepNum} aria-hidden="true">1</span>
            <p className={styles.stepTitle}>Share your link</p>
            <p className={styles.stepText}>Post it in your bio, stories or community. Visits are remembered for {REF_WINDOW_DAYS} days; the first link someone used counts.</p>
          </li>
          <li className={`${ui.card} ${styles.stepItem}`}>
            <span className={styles.stepNum} aria-hidden="true">2</span>
            <p className={styles.stepTitle}>They sign up and connect</p>
            <p className={styles.stepText}>A referral qualifies when the new creator connects a social account. Your own accounts and repeat sign-ups don&apos;t count.</p>
          </li>
          <li className={`${ui.card} ${styles.stepItem}`}>
            <span className={styles.stepNum} aria-hidden="true">3</span>
            <p className={styles.stepTitle}>You get +{bonus} DMs</p>
            <p className={styles.stepText}>Each qualified referral adds {bonus} automated DMs to your limit every month, automatically.</p>
          </li>
        </ol>
      </section>
      {stats ? (
        <section className={styles.section} aria-labelledby="list-heading">
          <h2 id="list-heading" className={styles.sectionTitle}>Your referrals</h2>
          {stats.list.length === 0 ? (
            <EmptyState icon={Gift} title="No referrals yet" text="Share your link: creators who join with it appear here." art="/landing/card-dm.webp" />
          ) : (
            <div className={ui.tableWrap}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th scope="col" className={ui.th}>Creator</th>
                    <th scope="col" className={ui.th}>Joined</th>
                    <th scope="col" className={ui.th}>Status</th>
                    <th scope="col" className={`${ui.th} ${styles.num}`}>Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.list.map((r) => (
                    <tr key={r.id} className={ui.tr}>
                      <td className={ui.td}>{maskEmail(r.email)}</td>
                      <td className={ui.td}><LocalTime value={r.created_at} style="medium" fallback="-" /></td>
                      <td className={ui.td}>
                        <span className={`${ui.pill} ${r.qualified_at ? ui.pillMint : ""}`}>{r.qualified_at ? "Qualified" : "Signed up"}</span>
                      </td>
                      <td className={`${ui.td} ${styles.num}`}>{r.qualified_at ? `+${r.bonus_dms.toLocaleString("en-US")} / mo` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
