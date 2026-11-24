import Link from "next/link";
import { LayoutTemplate } from "lucide-react";

import { isDbConfigured, query } from "@/lib/db";
import { DM_TEMPLATES } from "@/lib/dmTemplates";
import { TEMPLATES_LIST_SQL, type PostTemplate } from "@/lib/templates";
import PostTemplates from "./PostTemplates";
import TemplatesGallery from "./TemplatesGallery";
import styles from "./templates.module.css";
import { requireWorkspaceUser } from "@/lib/workspace";

export const metadata = { title: "Templates" };

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireWorkspaceUser();
  const { tab } = await searchParams;
  const posts = tab === "posts";
  let postTemplates: PostTemplate[] = [];
  let postsFailed = false;
  if (isDbConfigured()) {
    try {
      postTemplates = await query<PostTemplate>(TEMPLATES_LIST_SQL, [user.id]);
    } catch {
      postsFailed = true;
    }
  }
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.headIcon} aria-hidden="true"><LayoutTemplate width={20} height={20} /></span>
        <div className={styles.headText}>
          <h1 className={styles.h1}>{posts ? "Post templates" : "Auto-DM templates"}</h1>
          <p className={styles.sub}>
            {posts
              ? "Reusable captions you saved from the post composer."
              : "Start from a proven auto-DM flow. Pick one, add your link and go live when you are ready."}
          </p>
        </div>
        <nav className={styles.switch} aria-label="Template type">
          <Link href="/app/templates" aria-current={!posts ? "page" : undefined} className={`${styles.switchLink} ${!posts ? styles.switchActive : ""}`}>Auto-DM</Link>
          <Link href="/app/templates?tab=posts" aria-current={posts ? "page" : undefined} className={`${styles.switchLink} ${posts ? styles.switchActive : ""}`}>
            Posts <span className={styles.chipCount}>{postTemplates.length}</span>
          </Link>
        </nav>
      </header>
      {posts ? <PostTemplates templates={postTemplates} loadFailed={postsFailed} /> : <TemplatesGallery templates={DM_TEMPLATES} />}
    </div>
  );
}
