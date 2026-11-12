import { ExternalLink, Link2 } from "lucide-react";
import { BtnA, PageHero } from "@/components/ui/kit";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { getBioPage } from "@/lib/bioPage";
import { isDbConfigured } from "@/lib/db";
import BioEditor from "./BioEditor";
import styles from "./bio.module.css";

export const metadata = { title: "Link in bio" };

export default async function BioPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const page = isDbConfigured() ? await getBioPage(user.id) : null;
  const publicUrl = page ? `${BRAND.url}/@${page.handle}` : null;
  const totalClicks = page?.links.reduce((sum, link) => sum + link.clicks, 0) ?? 0;

  return (
    <div className={styles.page}>
      <PageHero icon={<Link2 width={20} height={20} />}
        eyebrow="Link in bio"
        title="Link in bio"
        lede="Build a mobile-first page at poskoo.com/@yourname. Add your links, pick a colour theme and see which links people click."
        action={
          publicUrl ? (
            <BtnA href={publicUrl} target="_blank" rel="noreferrer" variant="line" size="sm">
              View live page <ExternalLink width={15} height={15} aria-hidden="true" />
            </BtnA>
          ) : undefined
        }
      />

      {params.saved ? <p className={styles.bannerOk} role="status">Your page is saved. Open the live page to check it on your phone.</p> : null}
      {params.error ? <p className={styles.bannerWarn} role="alert">{params.error === "not_configured" ? "Saving is not set up on this server yet." : params.error}</p> : null}

      {page ? (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{page.links.length}</span>
            <span className={styles.muted}>links</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalClicks.toLocaleString("en-US")}</span>
            <span className={styles.muted}>tracked clicks</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{page.published ? "Live" : "Hidden"}</span>
            <span className={styles.muted}>page status</span>
          </div>
        </div>
      ) : null}

      <BioEditor page={page} />

      {!page ? (
        <p className={styles.hint}>
          <Link2 width={16} height={16} aria-hidden="true" /> Your page is not created yet. Fill in the form and save to claim your handle.
        </p>
      ) : null}
    </div>
  );
}
