import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Instagram } from "lucide-react";
import { BtnLink, PageHero } from "@/components/ui/kit";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";
import { requireUser } from "@/lib/auth";
import { PICK_COOKIE, decodePick } from "@/lib/metaAccounts";
import { fetchPagesWithInstagram, type MetaPageWithInstagram } from "@/lib/metaLogin";
import { connectPickedAccountAction } from "./actions";
import styles from "../../app-page.module.css";

export const metadata = { title: "Choose an Instagram account" };

// Shown after Facebook login when more than one Page has an Instagram professional account.
export default async function ChooseInstagramPage() {
  const user = await requireUser();
  const store = await cookies();
  const pick = decodePick(store.get(PICK_COOKIE)?.value, user.id);
  if (!pick) redirect("/app/settings?ig=pick_expired");
  let pages: MetaPageWithInstagram[] = [];
  let failed = false;
  try {
    pages = await fetchPagesWithInstagram(pick.userToken);
  } catch {
    failed = true;
  }
  return (
    <div className={styles.page}>
      <PageHero
        title="Choose an Instagram account"
        lede="Your Facebook login gives access to more than one Instagram professional account. Pick the one Poskoo should post and auto-DM for. You can connect another one later."
        icon={<Instagram width={20} height={20} />}
      />
      <section className={styles.section} aria-labelledby="pick-heading">
        <h2 id="pick-heading" className={styles.sectionTitle}>Instagram accounts</h2>
        {failed || pages.length === 0 ? (
          <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>
            We couldn&apos;t load your Instagram accounts. Please connect again.
          </p>
        ) : (
          <ul className={styles.accountList}>
            {pages.map((p) => (
              <li key={p.igUserId} className={styles.accountCard}>
                <div className={styles.accountIdentity}>
                  {p.igPicture ? (
                    // Instagram CDN URLs expire, so a plain <img> (no Next image cache) is used on purpose.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.igPicture} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full border border-[var(--poskoo-line)] object-cover" />
                  ) : null}
                  <div>
                    <p className={styles.username}>@{p.igUsername || "unknown"}</p>
                    <p className={ui.hint}>Facebook Page: {p.pageName}</p>
                  </div>
                </div>
                <div className={styles.accountActions}>
                  <form action={connectPickedAccountAction}>
                    <input type="hidden" name="ig_user_id" value={p.igUserId} />
                    <SubmitButton label="Connect this account" pendingLabel="Connecting…" size="sm" />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div>
          <BtnLink href="/app/settings" variant="ghost" size="sm">Cancel</BtnLink>
        </div>
      </section>
    </div>
  );
}
