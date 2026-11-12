import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PLANS, plansNote, softwareOffers, type Plan, type PlanReadiness } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/instagram-scheduler/pricing";
// The upgrade FAQ follows the RUNTIME env (src/lib/featureReadiness.ts); regenerate every 10 minutes.
export const revalidate = 600;
const title = "Instagram Scheduler Pricing: Plans & Limits | Poskoo";
const description =
  "What each Poskoo Instagram scheduler plan includes: social accounts, monthly posts, auto-DM limits and email capture. Start free; Pro and Agency add more.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

function itemFor(plan: Plan, matches: string[]) {
  return plan.items.find((item) => matches.some((match) => item.text.toLowerCase().includes(match.toLowerCase())));
}

function limitFor(plan: Plan, matches: string[]) {
  const item = itemFor(plan, matches);
  if (!item) return "—";
  return item.soon ? `${item.text} (coming soon)` : item.text;
}

const allRows: { label: string; value: (plan: Plan) => string }[] = [
  { label: "Price", value: (plan) => `${plan.price} ${plan.per}${plan.yearly ? ` (${plan.yearly})` : ""}` },
  { label: "Social accounts", value: (plan) => limitFor(plan, ["social accounts"]) },
  { label: "Scheduled posts", value: (plan) => limitFor(plan, ["scheduled posts", "unlimited scheduling"]) },
  { label: "Instagram auto-DMs per month", value: (plan) => limitFor(plan, ["auto-DMs"]) },
  { label: "AI caption and DM ideas", value: (plan) => limitFor(plan, ["AI caption"]) },
  { label: "Email capture in DMs", value: (plan) => limitFor(plan, ["Email capture"]) },
  { label: "Click and lead analytics", value: (plan) => limitFor(plan, ["Click + lead"]) },
  { label: "Link in bio page", value: (plan) => limitFor(plan, ["Link in bio"]) },
  { label: "Priority support", value: (plan) => limitFor(plan, ["Priority support"]) },
];
// A row that no plan lists says nothing, so it is not shown.
const rows = allRows.filter((row) => PLANS.some((plan) => row.value(plan) !== "—"));

const free = PLANS.find((plan) => plan.name === "Free") ?? PLANS[0];
const pro = PLANS.find((plan) => plan.name === "Pro") ?? PLANS[1];
const agency = PLANS.find((plan) => plan.name === "Agency") ?? PLANS[2];

const freeAccounts = limitFor(free, ["social accounts"]);
const freePosts = limitFor(free, ["scheduled posts"]);
const freeDms = limitFor(free, ["auto-DMs"]);
const proPrice = `${pro.price} ${pro.per}`;
const proAccounts = limitFor(pro, ["social accounts"]);
const proDms = limitFor(pro, ["auto-DMs"]);
const agencyAccounts = limitFor(agency, ["social accounts"]);
const agencyDms = limitFor(agency, ["auto-DMs"]);

const pageFaqs = (r: PlanReadiness) => [
  {
    q: "How much does the Poskoo Instagram scheduler cost?",
    a: `The Free plan is ${free.price} ${free.per} and includes ${freeAccounts}, ${freePosts} and ${freeDms}. Pro is ${proPrice} (or ${pro.yearly}) with ${proAccounts}, unlimited scheduling and ${proDms}, and Agency is ${agency.price} ${agency.per} (or ${agency.yearly}) with ${agencyAccounts} and ${agencyDms}.`,
  },
  {
    q: "Is there a free Instagram scheduler plan?",
    a: `Yes. Every account starts on the ${free.name} plan at ${free.price} ${free.per}, with ${freeAccounts}, ${freePosts} and ${freeDms}. You do not need a credit card to start.`,
  },
  {
    q: "How many Instagram auto-DMs are included?",
    a: `The Free plan includes ${freeDms}. Pro includes ${proDms}, and Agency includes ${agencyDms}.`,
  },
  {
    q: "Can I upgrade to Pro or Agency today?",
    a: r.paidPlans
      ? `Yes. Press "Choose Pro" or "Choose Agency" on the pricing page, or open Settings > Plan & billing after you log in. You pay by card through Stripe. ${plansNote(r)}`
      : `Not yet. ${plansNote(r)}`,
  },
  {
    q: "Does the pricing table include competitor plan limits?",
    a: "No. This table compares Poskoo plans only, because competitor prices and limits change and we only publish comparison facts we can verify. Use each competitor's own pricing page for their current limits.",
  },
];

const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
});

const appJsonLd = (r: PlanReadiness) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: softwareOffers(r),
  publisher: { "@type": "Organization", name: BRAND.company },
});

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramSchedulerPricingPage() {
  const r = planReadiness();
  const faqs = pageFaqs(r);
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Instagram scheduler", path: "/instagram-scheduler" },
        { name: "Pricing and plan limits", path: PATH },
      ]}
    >
      {[faqJsonLd(faqs), appJsonLd(r)].map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(data) }} />
      ))}

      <header className="hero">
        <span className="pill">Free plan · no credit card · official Meta API</span>
        <p className="eyebrow">Instagram scheduler pricing</p>
        <h1>
          Instagram scheduler pricing: what each <em className="s">Poskoo plan includes</em>
        </h1>
        <p className="lede">
          Poskoo&apos;s Instagram scheduler starts on the Free plan at {free.price} {free.per}. The Free plan includes {freeAccounts},{" "}
          {freePosts} and {freeDms}. Pro ({proPrice}) adds {proAccounts}, unlimited scheduling and {proDms}.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">
            Start free <span aria-hidden="true">→</span>
          </Link>
          <a className="btn btn-line" href="#plans">
            Compare plan limits
          </a>
        </div>
        <div className="hero-art"><AnimArt name="pricing" label="A happy creator in an armchair holds one membership card while app cards and bills fly away" /></div>
      </header>

      <section id="plans" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Plan comparison</p>
            <h2>Compare Poskoo Instagram scheduler <em className="s">plan limits</em></h2>
            <p>A dash means that feature is not listed in the current plan details for that plan.</p>
          </div>
          <div className={s.tableWrap} style={{ maxWidth: 980, marginInline: "auto" }}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  {PLANS.map((plan) => (
                    <th key={plan.name} scope="col" className={`${s.th} ${plan.name === "Pro" ? s.oursCol : ""}`}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className={s.tr}>
                    <td className={s.td} style={{ fontWeight: 600 }}>{row.label}</td>
                    {PLANS.map((plan) => (
                      <td
                        key={plan.name}
                        className={`${s.td} ${plan.name === "Pro" ? s.oursCol : ""}`}
                        style={plan.name === "Pro" ? { fontWeight: 600 } : undefined}
                      >
                        {row.value(plan)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
            This table compares Poskoo plans only, using the plan details published on this site. We do not list
            competitor plan limits here because competitor prices and limits change, and we only publish comparison
            facts we can verify. Check each competitor&apos;s own pricing page for their current limits.
          </p>
          <p className="small" style={{ textAlign: "center", marginTop: 8 }}>{plansNote(r)}</p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram scheduler pricing questions</h2>
          </div>
          <div className="faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Start free and see your <em className="s">plan limits</em></h2>
              <p>No credit card needed. Schedule your first Instagram post and auto-DM today.</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends high-five next to a board of new leads"
            />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler features</Link>
            {" · "}
            <Link className={s.vlink} href="/pricing">All Poskoo pricing</Link>
            {" · "}
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto DM</Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
