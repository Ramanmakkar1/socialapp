import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { ldJson } from "@/lib/tool-schema";

const pageTitle = `Delete Your ${BRAND.name} Account Data and Disconnect Instagram`;
const pageDescription =
  "Learn how to disconnect Instagram or Facebook from Poskoo and request deletion of all stored account data, including posts and messages.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: pageTitle,
      url: `${BRAND.url}/data-deletion`,
      description: pageDescription,
      isPartOf: { "@id": `${BRAND.url}#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BRAND.url}/` },
        { "@type": "ListItem", position: 2, name: "Data deletion", item: `${BRAND.url}/data-deletion` },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: { absolute: `Delete Your ${BRAND.name} Account Data and Disconnect Instagram` },
  description: "Learn how to disconnect Instagram or Facebook from Poskoo and request deletion of all stored account data, including posts and messages.",
  alternates: { canonical: "/data-deletion" },
};
export default function Page() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/">Home</Link> / Data deletion
      </nav>
      <header className="hero">
        <p className="eyebrow">Legal</p>
        <h1>Delete your data</h1>
      </header>
      <section style={{ paddingTop: 20 }}>
        <div className={s.prose}>
          <ol style={{ listStyle: "decimal" }}>
            <li>In {BRAND.name}, open Settings → Connected accounts and click Disconnect, or</li>
            <li>Remove {BRAND.name} from your Instagram settings (Settings → Website permissions → Apps and websites). Instagram tells us automatically and we delete your connected-account data. You get a confirmation code you can check on the <Link href="/data-deletion/status">deletion status page</Link>, or</li>
            <li>Email {BRAND.supportEmail} from your account email asking us to delete everything.</li>
          </ol>
          <p>We delete your connected-account tokens, posts, messages and contacts within 30 days of the request.</p>
        </div>
      </section>
    </PublicShell>
  );
}
