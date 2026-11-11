import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { DM_TEMPLATES } from "@/lib/dmTemplates";
import TemplateCard from "../templates/TemplateCard";
import { FEATURED_SLUGS } from "../templates/categories";
import card from "../templates/templateCard.module.css";
import styles from "./auto-dm.module.css";

export default function TemplatePicker({ activeTitle, onReopen }: { activeTitle?: string; onReopen?: () => void }) {
  const items = FEATURED_SLUGS.flatMap((slug) => DM_TEMPLATES.filter((t) => t.slug === slug));

  return (
    <section aria-labelledby="dm-template-picker" className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="dm-template-picker" className={styles.sectionTitle}>Start from a template</h2>
        <Link href="/app/templates" className={styles.headLink}>All templates <ArrowRight width={14} height={14} aria-hidden="true" /></Link>
      </div>
      <p className={styles.mutedNote}>
        <Info width={14} height={14} aria-hidden="true" />
        A template only fills in a draft. Nothing is sent until you finish the setup, add your link and save the automation.
      </p>
      <ul className={card.grid} style={{ marginTop: 14 }}>
        {items.map((t) => (
          <li key={t.slug}>
            <TemplateCard
              template={t}
              href={`/app/auto-dm?template=${t.slug}`}
              // The same template is already loaded: the URL won't change, so reopen its draft directly.
              onClick={t.title === activeTitle ? onReopen : undefined}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
