import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = withSocial({
  title: { absolute: `Terms of Service: Rules for Using the ${BRAND.name} Scheduler` },
  description: "Review the rules for using Poskoo to schedule posts and send auto-DMs, retain ownership of your content, and cancel your account at any time.",
  alternates: { canonical: "/terms" },
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": BRAND.canonicalUrl + "/terms#webpage",
      url: BRAND.canonicalUrl + "/terms",
      name: "Terms of service",
      inLanguage: "en",
      isPartOf: { "@id": BRAND.canonicalUrl + "#website" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BRAND.canonicalUrl + "/" },
        { "@type": "ListItem", position: 2, name: "Terms", item: BRAND.canonicalUrl + "/terms" },
      ],
    },
  ],
};

export default function Page() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/">Home</Link> / Terms
      </nav>
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Legal</p>
          <h1>Terms of service</h1>
        </div>
        <div className="hero-art"><AnimArt name="legal" label="A calm creator holds a shield with a check mark next to a padlock, a key and a neat document" /></div>
      </header>
      <section style={{ paddingTop: 20 }}>
        <div className={s.prose}>
          <p>By using {BRAND.name} you agree to follow the rules of every platform you connect (Instagram, Facebook, Threads and others) and to only send messages people have asked for, for example by commenting a keyword.</p>
          <h2>Instagram and Meta</h2>
          <p>When you connect Instagram, you allow {BRAND.name} to read your profile, posts, comments, messages and insights and to publish posts and send replies on your behalf, only for the features you turn on. Auto-DMs only go to people who commented or messaged you, inside the time window Instagram allows. You must follow Meta&apos;s Platform Terms and Instagram&apos;s Community Guidelines. See our <Link href="/privacy#instagram">privacy policy</Link> for how we store this data, and the <Link href="/data-deletion">data deletion page</Link> to disconnect and delete it.</p>
          <p>You keep ownership of your content. You can cancel at any time. We may suspend accounts that send spam or break platform rules.</p>
          <p>Contact: {BRAND.supportEmail}</p>
        </div>
      </section>
    </PublicShell>
  );
}
