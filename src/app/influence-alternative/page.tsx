import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getPlatformCopy, listText, LIVE_PLATFORMS_TEXT } from "@/lib/platform-support";
import { ASSISTANT_TOOLS } from "@/lib/aiAssistantGuides";
import { PLANS } from "@/lib/plans";
import { featureReadiness, planReadiness } from "@/lib/featureReadiness";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { faqJsonLd, ldJson } from "@/lib/tool-schema";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import { StaySection, SwitchSteps } from "@/components/CompareSections";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/influence-alternative";
const title = `Influence.so Alternative with a Free Plan | ${BRAND.name}`;
const description =
  "Compare Poskoo and influence.so: a free-forever plan, Instagram comment-to-DM and lead capture, unlimited posts on Pro, and where influence.so leads.";

// The "AI writing help" row follows the runtime AI key (env or stored in Admin → Settings):
// regenerate in the background at most every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
});

/** Competitor facts were read from influence.so's public site on this date. */
const CHECKED_ON = "15 November 2026";
const THEIR_PRICING = "https://influence.so/#plan-comparison";

const plan = (name: string) => PLANS.find((p) => p.name === name)!;
const free = plan("Free");
const pro = plan("Pro");
const agency = plan("Agency");

const { paidPlans } = planReadiness();
const cardPayments = featureReadiness("card_payments", process.env).ready;
const paidNote = paidPlans ? "" : " (launching soon)";
const platforms = getPlatformCopy();

const whyLook = [
  { no: "01 / Free plan", title: "Start without a trial clock", text: `influence.so starts with a 7-day trial. ${BRAND.name} has a Free plan with ${free.items[0].text.toLowerCase()}, ${free.items[1].text.replace(" / month", " a month")} and ${free.items[2].text.replace(" / month", " a month")}, with no end date.` },
  {
    no: "02 / Unlimited posts",
    title: "Unlimited posts at a lower price",
    text: paidPlans
      ? `On influence.so, unlimited posts come with its Pro plan. ${BRAND.name} Pro is ${pro.price} a month (${pro.yearly}) with unlimited scheduling for ${pro.items[0].text.toLowerCase()}.`
      : `On influence.so, unlimited posts come with its Pro plan. ${BRAND.name} Pro, launching soon, is priced at ${pro.price} a month (${pro.yearly}) with unlimited scheduling for ${pro.items[0].text.toLowerCase()}. Until then the Free plan covers ${free.items[1].text.replace(" / month", " a month")}.`,
  },
  { no: "03 / Conversations", title: "Turn comments into DMs and leads", text: `${BRAND.name} sends an Instagram DM to everyone who comments a keyword, can ask for an email first, and exports the leads. We did not find these features on influence.so.` },
];

const AI_ROW = "AI writing help";
const compare: [string, string, string][] = [
  ["Free plan", `Yes: ${free.items[0].text}, ${free.items[1].text}`, "No free plan; 7-day trial"],
  ["Unlimited posts", `Pro, ${pro.price}/month${paidNote}`, "Pro plan (about CA$98/month)"],
  ["Networks you can publish to", `${platforms.liveCountText} today${platforms.awaiting.length ? `; ${listText(platforms.awaiting)} awaiting platform approval` : ""}`, "Says 32 destinations"],
  ["Instagram comment-to-DM automation", "Yes", "Not listed"],
  ["Email capture in the DM, lead CSV export", "Yes", "Not listed"],
  ["Sell a digital product from a DM", cardPayments ? "Yes (card checkout, or Direct UPI in India)" : "Direct UPI in India today; card checkout launching soon", "Not listed"],
  ["Link-in-bio page", "Yes", "Not listed"],
  ["Instagram Stories scheduling", "Yes", "Not listed"],
  [AI_ROW, "Built, launching soon", "Yes, AI credits on every plan"],
  ["Campaigns with a version per channel", "No", "Yes"],
  ["Hosted MCP server for AI assistants", `Yes (${ASSISTANT_TOOLS.length} tools, API key)`, "Yes"],
  ["Short links", "Tracked links in DMs", "Branded links and QR codes"],
  ["Interface languages", "English", "27 languages"],
  ["Client portal, multi-stage approvals", "No", "No (per their FAQ)"],
];

const pricing: { tool: string; plan: string; price: string; includes: string }[] = [
  { tool: BRAND.name, plan: "Free", price: "$0 forever", includes: free.items.slice(0, 3).map((i) => i.text).join(", ") },
  { tool: BRAND.name, plan: "Pro", price: `${pro.price}/month or ${pro.yearly}${paidNote}`, includes: pro.items.slice(0, 3).map((i) => i.text).join(", ") },
  { tool: BRAND.name, plan: "Agency", price: `${agency.price}/month or ${agency.yearly}${paidNote}`, includes: agency.items.slice(0, 3).map((i) => i.text).join(", ") },
  { tool: "influence.so", plan: "Starter", price: "US$19/month", includes: "50 publications / month, 1,500 AI credits / month" },
  { tool: "influence.so", plan: "Growth", price: "US$39/month", includes: "150 publications / month" },
  { tool: "influence.so", plan: "Pro", price: "About CA$98/month", includes: "Unlimited posts" },
];

const switchSteps = [
  { title: "1. Start on Free", text: `Sign up without a card and connect up to 2 accounts. Instagram and Facebook connect through Meta's official login; ${BRAND.name} never asks for your password.` },
  { title: "2. Rebuild your queue", text: "Copy the next week or two of captions from influence.so into the calendar. There is no importer yet, so most people bring over only upcoming posts." },
  { title: "3. Add DM rules to lead posts", text: "On posts that ask for a comment, attach a keyword and the DM to send. Add an email gate if you want the lead before the link." },
];

const faqs = [
  { q: `Is ${BRAND.name} a good influence.so alternative?`, a: `It is if you want a free plan, unlimited posts at ${pro.price} a month${paidPlans ? "" : " once Pro launches"}, or Instagram comment-to-DM with lead capture. If you need many more networks, campaigns with a version per channel, or a non-English interface, influence.so is the stronger fit today.` },
  { q: "Does influence.so have a free plan?", a: `Not when we checked on ${CHECKED_ON}. It offered a 7-day trial. Its Starter plan was US$19 a month with 50 publications and 1,500 AI credits. Check its pricing page for current prices.` },
  { q: "Which tool supports more social networks?", a: `influence.so says it publishes to 32 destinations. ${platforms.answer}` },
  { q: "Can both tools be used from ChatGPT or Claude?", a: `Yes. Both offer a hosted MCP server. ${BRAND.name}'s has ${ASSISTANT_TOOLS.length} tools, from listing channels and creating or editing posts to Auto-DM rules and an analytics summary, and works with an API key on every plan, including Free.` },
  { q: "Does influence.so do Instagram comment-to-DM?", a: `We did not find comment-to-DM, lead capture, selling in DMs, link-in-bio or Instagram Stories on influence.so when we checked. ${BRAND.name} includes all of them.` },
  { q: "Are there independent reviews of influence.so?", a: `We could not find independent reviews when we checked on ${CHECKED_ON}. Try both on a free plan or trial with your own content before you decide.` },
];

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <span className={s.yes}>Yes</span>;
  if (v === "No" || v === "Not listed") return <span style={{ color: "var(--poskoo-muted)" }}>{v}</span>;
  return <span>{v}</span>;
}

export default async function InfluenceAlternative() {
  const ai = await isFeatureReadyNow("ai");
  const compareRows = compare.map((row): [string, string, string] => (row[0] === AI_ROW && ai ? [row[0], "AI caption and DM message ideas, campaigns from a brief", row[2]] : row));
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Social media scheduler comparison", path: "/social-media-scheduler-comparison" }, { name: "Influence.so alternative", path: PATH }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Free plan · no credit card · official APIs</span>
          <h1>
            Influence.so alternative with a <em className="s">free plan</em> and auto-DM
          </h1>
          <p className="lede">
            influence.so is an AI-first scheduler. {BRAND.name} schedules posts to {LIVE_PLATFORMS_TEXT}, and adds Instagram
            comment-to-DM, lead capture, Stories and a link-in-bio page, starting on a $0 plan. Here is where each tool is stronger.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Why switch</p>
            <h2>Why people look for an influence.so alternative</h2>
          </div>
          <div className="cards">
            {whyLook.map((c) => (
              <article key={c.title} className="pcard">
                <span className="no">{c.no}</span>
                <h3>{c.title.replace(/-/g, "‑")}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="compare" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Comparison</p>
            <h2>{BRAND.name} vs influence.so</h2>
            <p>
              influence.so details come from its public website on {CHECKED_ON}. “Not listed” means we did not find the feature
              there, not that it can never exist.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={`${s.table} ${s.stack}`}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>influence.so</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([label, ours, theirs]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td data-label={BRAND.name} className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700, textAlign: "center" }}><Cell v={ours} /></td>
                    <td data-label="influence.so" className={s.td} style={{ textAlign: "center" }}><Cell v={theirs} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CompareNote />
        </div>
      </section>

      <section id="pricing" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Pricing</p>
            <h2>Plans and prices side by side</h2>
            <p>
              {BRAND.name} prices are in US dollars, from the <Link className={s.vlink} href="/pricing">{BRAND.name} pricing page</Link>.
              influence.so prices were read on {CHECKED_ON}; its site shows prices in your local currency, so the Pro price is the
              Canadian-dollar figure we saw. Check{" "}
              <a className={s.vlink} href={THEIR_PRICING} rel="nofollow noopener noreferrer" target="_blank">influence.so&apos;s pricing</a>{" "}
              for current prices.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={`${s.table} ${s.stack}`}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Tool</th>
                  <th scope="col" className={s.th}>Plan</th>
                  <th scope="col" className={s.th}>Price</th>
                  <th scope="col" className={s.th}>Includes</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row) => (
                  <tr key={`${row.tool}-${row.plan}`} className={s.tr}>
                    <td className={`${s.td}${row.tool === BRAND.name ? ` ${s.oursCol}` : ""}`} style={{ fontWeight: 700 }}>{row.tool}</td>
                    <td data-label="Plan" className={s.td}>{row.plan}</td>
                    <td data-label="Price" className={s.td}>{row.price}</td>
                    <td data-label="Includes" className={s.td}>{row.includes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <StaySection name="influence.so" title="Where influence.so is stronger today">
        Stay on influence.so if you publish to networks {BRAND.name} does not support yet (it says it reaches 32 destinations),
        if you plan campaigns with a separate version for each channel, if you rely on its AI credits for drafting, or if your team
        needs an interface in one of its 27 languages. Branded links and QR codes are built in there too. {BRAND.name} is the better
        fit when Instagram conversations matter: comment-to-DM, email capture, Stories and a link-in-bio page on a free plan.
      </StaySection>

      <SwitchSteps steps={switchSteps} />

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>influence.so alternative questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
            Using an AI assistant? See how to{" "}
            <Link className={s.vlink} href="/schedule-posts-with-chatgpt">schedule posts with ChatGPT</Link> or{" "}
            <Link className={s.vlink} href="/schedule-posts-with-claude">with Claude</Link>, read about{" "}
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto-DM</Link>, or see the{" "}
            <Link className={s.vlink} href="/free-social-media-scheduler">free social media scheduler</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Schedule free. <em className="s">Auto-DM every commenter</em></h2>
              <p>Start on the Free plan. No credit card, no trial clock.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/social-media-scheduler-comparison">See every comparison</Link>
          </p>
          <CompareAlternativesNav current="influence" />
        </div>
      </section>
    </PublicShell>
  );
}
