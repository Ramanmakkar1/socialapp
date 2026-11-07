import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PLANS, PLANS_NOTE, SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

const PATH = "/pricing";
const title = `${BRAND.name} Pricing: Free Instagram Scheduler & Auto-DM Plans`;
const description = `Compare ${BRAND.name} plans: start free with Instagram scheduling and 500 auto-DMs a month, then upgrade to Pro or Agency when you grow. No credit card needed.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const free = PLANS[0];
const freeLimits = free.items.filter((i) => !i.soon).map((i) => i.text).join(", ");

const faqs = [
  {
    q: "Is there a free plan?",
    a: `Yes. The ${free.name} plan is ${free.price} ${free.per} and includes ${freeLimits}. Every account starts on it.`,
  },
  {
    q: "Do I need a credit card?",
    a: "No. You can sign up and use the Free plan without entering any card details.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Paid plans will be month to month with no contract, and you can cancel from settings. Today every account is on the Free plan, so there is nothing to cancel.",
  },
  {
    q: "Which platforms are included?",
    a: "Instagram, Facebook Pages and Threads scheduling work today, plus Instagram auto-DMs.",
  },
];

const includes = [
  "Built on the official Meta API, so you never share your password",
  "Instagram scheduling calendar",
  "Comment keyword auto-DMs",
  "Lead capture from your DMs",
  "Facebook Pages and Threads scheduling",
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: SOFTWARE_APPLICATION_OFFERS,
  publisher: { "@type": "Organization", name: BRAND.company },
};
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BRAND.url}/` },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${BRAND.url}${PATH}` },
  ],
};
const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

// The landing's green check (its #ok symbol only exists on the home page, so inline it here).
function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" style={{ flex: "none", marginTop: 4 }}>
      <circle cx="9" cy="9" r="9" fill="var(--green)" />
      <path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <PublicShell>
      {[faqJsonLd, appJsonLd, breadcrumbJsonLd].map((data) => <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(data) }} />)}
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/">Home</Link> / Pricing
      </nav>
      <header className="hero">
        <span className="pill">Free plan · no credit card · official Meta API</span>
        <h1>
          Simple pricing for <em className="s mark">Instagram scheduling</em> and auto-DMs
        </h1>
        <p className="lede">Start free today and upgrade only when you need more accounts, posts or DMs.</p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/instagram-scheduler">See the scheduler</Link>
        </div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="plans">
            {PLANS.map((p) => (
              <div key={p.name} className={p.popular ? "plan pop" : "plan"}>
                {p.popular ? <span className="tag">Most popular</span> : null}
                <h3>{p.name}</h3>
                <div className="price">{p.price} <small>{p.per}</small></div>
                <ul>
                  {p.items.map((item) => (
                    <li key={item.text}>
                      <Check />
                      {item.text}
                      {item.soon ? <small className="soon"> · coming soon</small> : null}
                    </li>
                  ))}
                </ul>
                <Link className={p.popular ? "btn btn-dark" : "btn btn-line"} href={p.ctaHref}>{p.cta}</Link>
              </div>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>{PLANS_NOTE}</p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Every plan</p>
              <h2>What you get, <em className="s">whatever you pay.</em></h2>
              <div className="pains">
                {includes.map((t) => (
                  <div key={t} className="pain"><b>Included</b><span>{t}</span></div>
                ))}
              </div>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/onesub.webp"
                width={1400}
                height={933}
                loading="lazy"
                alt="A happy creator in an armchair holds one membership card while app cards and bills fly away"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Pricing questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Start free, grow when you are ready</h2>
              <p>Schedule your Instagram posts and turn comments into leads with {BRAND.name}.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
