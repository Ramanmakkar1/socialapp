import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ldJson } from "@/lib/tool-schema";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "About Poskoo: Social Media Scheduler by Town Media Labs" },
  description:
    "Learn who runs Poskoo, what our social media scheduler and Instagram comment-to-DM automation do, and how we handle your Meta data safely and privately.",
  alternates: { canonical: "/about" },
});

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `About ${BRAND.name}`,
  url: `${BRAND.url}/about`,
  mainEntity: {
    "@type": "Organization",
    name: BRAND.company,
    brand: {
      "@type": "Brand",
      name: BRAND.name,
    },
    url: BRAND.url,
    email: BRAND.supportEmail,
    sameAs: BRAND.social,
  },
};

export default function AboutPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "About", path: "/about" }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(aboutJsonLd) }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Built by {BRAND.company}</span>
          <h1>About Poskoo</h1>
          <p className="lede">
            {BRAND.name} is a social media scheduler with Instagram comment-to-DM automation, built and run by{" "}
            {BRAND.company}.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/contact">
              Contact us <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-line" href="/privacy#instagram">
              How we handle your data
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <AnimArt name="features" label="A creator points at an open toolbox of calendar, chat, mail, chart and link tools" />
        </div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="copy">
            <h2>What Poskoo does</h2>
            <p>
              {BRAND.description} Plan posts on a calendar, publish them automatically, and reply to every Instagram
              comment with a direct message that can capture a lead.
            </p>

            <h2>Who runs Poskoo</h2>
            <p>
              Poskoo is built and run by {BRAND.company}. The same team designs the product, supports customers and
              handles the data behind your account.
            </p>

            <h2>How we handle Instagram and Meta data</h2>
            <p>
              We connect to Instagram through the official Instagram login only — we never ask for your password. Access
              tokens are encrypted with AES-256-GCM, your data is never sold, and it is deleted within 30 days on
              request. Read the details in our{" "}
              <Link className={s.vlink} href="/privacy#instagram">
                Instagram data section of the Privacy Policy
              </Link>{" "}
              and the{" "}
              <Link className={s.vlink} href="/data-deletion">
                data deletion instructions
              </Link>
              .
            </p>

            <h2>Contact</h2>
            <p>
              Questions, feedback or a data request? Email{" "}
              <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>
                {BRAND.supportEmail}
              </a>{" "}
              or use our{" "}
              <Link className={s.vlink} href="/contact">
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
