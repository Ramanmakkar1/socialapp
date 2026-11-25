import { Images } from "lucide-react";

import { isDbConfigured } from "@/lib/db";
import { libraryQuotaBytes, libraryUsage, listAssets, viewOf, type MediaAssetView } from "@/lib/mediaLibrary";
import { PLAN_MEDIA_LIMITS } from "@/lib/mediaLimits";
import { planForUser } from "@/lib/planLimits";
import { requireWorkspace, roleAtLeast } from "@/lib/workspace";
import MediaLibrary from "./MediaLibrary";
import styles from "./media.module.css";

export const metadata = { title: "Media library" };
export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const ctx = await requireWorkspace();
  const ownerId = ctx.ownerId;
  const plan = await planForUser(ownerId);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  let items: MediaAssetView[] = [];
  let usage = 0;
  let loadFailed = false;
  if (isDbConfigured()) {
    try {
      const [assets, used] = await Promise.all([listAssets(ownerId, { limit: 120 }), libraryUsage(ownerId).catch(() => 0)]);
      items = assets.map((a) => viewOf(a, base));
      usage = used;
    } catch {
      loadFailed = true;
    }
  }
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.headIcon} aria-hidden="true"><Images width={20} height={20} /></span>
        <div className={styles.headText}>
          <h1 className={styles.h1}>Media library</h1>
          <p className={styles.sub}>Every image and video you upload, ready to reuse in any post. Files stay here after they are published.</p>
        </div>
      </header>
      <MediaLibrary
        initialItems={items}
        usage={usage}
        quota={libraryQuotaBytes(plan)}
        plan={plan}
        imageMax={PLAN_MEDIA_LIMITS[plan].imageBytes}
        videoMax={PLAN_MEDIA_LIMITS[plan].videoBytes}
        canDeleteAll={roleAtLeast(ctx.role, "admin")}
        userId={ctx.user.id}
        loadFailed={loadFailed}
      />
    </div>
  );
}
