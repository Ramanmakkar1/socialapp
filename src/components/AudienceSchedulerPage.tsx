import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt, type AnimName } from "@/components/AnimArt";
import { StaySection } from "@/components/CompareSections";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

// Layout for the "social media scheduler for <audience>" pages, matching
// /social-media-scheduler-for-small-business. Each page passes its own copy: jobs to be done,
// an example workflow, the features that matter to that audience, an honest limits note and FAQs.

export type AudiencePageContent = {
  path: string;
  crumb: string;
  description: string;
  pill: string;
  h1Lead: string;
  h1Em: string;
  lede: string;
  heroArt: AnimName;
  heroArtLabel: string;
  jobsTitle: string;
  jobsIntro: string;
  jobs: { title: string; text: string }[];
  workflowTitle: string;
  workflow: { title: string; text: string }[];
  featuresEyebrow: string;
  featuresTitle: string;
  featuresEm: string;
  featuresIntro: string;
  features: { name: string; text: string }[];
  featuresArt: AnimName;
  featuresArtLabel: string;
  limitsTitle: string;
  limits: string;
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  ctaTitle: string;
  ctaEm: string;
  ctaText: string;
  featureList: string[];
};

export function AudienceSchedulerPage({ c }: { c: AudiencePageContent }) {
  const appJsonLd = {
    ...toolSoftwareJsonLd({
      name: `${BRAND.name} ${c.crumb.toLowerCase()}`,
      description: c.description,
      url: `${BRAND.canonicalUrl}${c.path}`,
    }),
    featureList: c.featureList,
    offers: softwareOffers(planReadiness()),
  };

  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: c.crumb, path: c.path }]}>
      {[appJsonLd, faqJsonLd(c.faqs)].map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">{c.pill}</span>
          <p className="eyebrow">{c.crumb}</p>
          <h1>
            {c.h1Lead} <em className="s mark">{c.h1Em}</em>
          </h1>
          <p className="lede">{c.lede}</p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <Link className="btn btn-line" href="/pricing">See plans and pricing</Link>
          </div>
          <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name={c.heroArt} label={c.heroArtLabel} /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Jobs to be done</p>
            <h2>{c.jobsTitle}</h2>
            <p>{c.jobsIntro}</p>
          </div>
          <div className="cards">
            {c.jobs.map((job, i) => (
              <article key={job.title} className="pcard">
                <span className="no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{job.title}</h3>
                <p>{job.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Example workflow</p>
            <h2>{c.workflowTitle}</h2>
          </div>
          <ol className={`howGrid ${s.switchGrid}`}>
            {c.workflow.map((step, i) => (
              <li key={step.title} className="howStep">
                <span className="howNo">Step {i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">{c.featuresEyebrow}</p>
              <h2>{c.featuresTitle} <em className="s mark">{c.featuresEm}</em></h2>
              <p>{c.featuresIntro}</p>
              <ul>
                {c.features.map((f) => (
                  <li key={f.name}>
                    <strong>{f.name}:</strong> {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="art"><AnimArt name={c.featuresArt} label={c.featuresArtLabel} /></div>
          </div>
        </div>
      </section>

      <StaySection name={BRAND.name} title={c.limitsTitle}>{c.limits}</StaySection>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>{c.crumb} FAQs</h2>
          </div>
          <div className="faq">
            {c.faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Related:{" "}
            {c.related.map((r, i) => (
              <span key={r.href}>
                {i > 0 ? " · " : null}
                <Link className={s.vlink} href={r.href}>{r.label}</Link>
              </span>
            ))}
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>{c.ctaTitle} <em className="s">{c.ctaEm}</em></h2>
              <p>{c.ctaText}</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <AnimArt name="feat-calendar" label="A friendly calendar illustration shows a week of scheduled social posts" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
