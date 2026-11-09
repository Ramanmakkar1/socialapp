import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CampaignCalculator from "./CampaignCalculator";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-comment-to-dm-calculator";
const description =
  "Estimate Instagram comment-to-DM campaign results from views, comment rate, DM delivery and link clicks. Free, browser-based and no signup needed.";

export const metadata: Metadata = {
  title: { absolute: "Instagram Comment-to-DM Campaign Calculator | Poskoo" },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "How does the comment-to-DM calculator work?",
    a: "It multiplies your post views by your comment rate to estimate comments, multiplies those comments by the DM delivery rate to estimate delivered DMs, then multiplies delivered DMs by the link-click rate to estimate clicks. Every formula is shown under the results.",
  },
  {
    q: "Are the results guaranteed?",
    a: "No. The numbers are estimates based on the rates you enter. Actual comments, DM delivery and clicks depend on your audience, offer, keyword, timing and Instagram's messaging rules.",
  },
  {
    q: "What comment rate should I use?",
    a: "Use a rate you have seen on your own recent posts. Check views and comments in Instagram Insights, divide comments by views, and multiply by 100. If you are planning a first campaign, run a small test and update the calculator with what you learn.",
  },
  {
    q: "Why is the DM delivery rate less than 100%?",
    a: "Not every matching comment becomes a delivered DM. A comment may not match your keyword, the person may have messaging restrictions, or a delivery rule may pause the send. The delivery rate lets you account for that gap instead of assuming every comment becomes a DM.",
  },
  {
    q: "Does this tool send DMs or connect to Instagram?",
    a: "No. The calculator runs entirely in your browser and only does arithmetic from the numbers you type. Nothing is uploaded, saved or sent to Instagram.",
  },
  {
    q: "How do I run a comment-to-DM campaign in Poskoo?",
    a: `Connect Instagram with Meta's official login, create a rule with your keyword and DM message, and attach it to a post. When someone comments the keyword, ${BRAND.name} sends your DM if the rule is active and delivery rules allow it.`,
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Comment-to-DM Campaign Calculator",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramCommentToDmCalculatorPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram comment-to-DM <em className="s mark">campaign calculator</em>
        </h1>
        <p className="lede">
          Estimate how many comments, DMs and link clicks a comment-keyword campaign could produce from your views and
          conversion rates. Adjust any number to see the estimate change.
        </p>
        <div className="hero-art" style={{ maxWidth: 640 }}>
          <Image
            sizes="(max-width: 960px) 100vw, 640px"
            src="/landing/card-dm.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A relaxed creator on a beanbag while DMs fly out of their phone to followers"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <CampaignCalculator />
      </div>

      {/* Assumptions */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>How the estimate works</h2>
            <p>
              The calculator uses four inputs and three simple multiplications. It does not look at your Instagram
              account, so the quality of the estimate depends on how close your rates are to real campaign behaviour.
            </p>
            <ul>
              <li>
                <strong>Views</strong> are the total views on the post, reel or Story where you ask people to comment.
              </li>
              <li>
                <strong>Comment rate</strong> is applied to views, not followers or reach. It is the share of viewers
                who leave your keyword comment.
              </li>
              <li>
                <strong>DM delivery rate</strong> discounts comments that never become a delivered DM because the
                keyword did not match, the person could not be messaged, or a delivery rule paused the send.
              </li>
              <li>
                <strong>Link-click rate</strong> is the share of delivered DMs where someone opens the link in the
                message.
              </li>
              <li>Results are rounded to the nearest whole comment, DM or click.</li>
            </ul>
            <p>
              These outputs are estimates only, not promises or forecasts. Use your own past campaign data where you
              have it, and treat a first campaign as a test you can measure and improve.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Comment-to-DM calculator questions</h2>
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

      {/* CTA */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Turn comment keywords into DMs automatically</h2>
              <p>See the flow demo, then start free and connect Instagram with Meta&apos;s official login.</p>
              <div className="ctas">
                <Link className="btn" href="/signup">
                  Start free <span aria-hidden="true">→</span>
                </Link>
                <Link className="btn btn-line" href="/instagram-auto-dm#how">
                  Watch the flow demo
                </Link>
              </div>
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
            <Link className={s.vlink} href="/instagram-auto-dm">
              How Instagram auto DM works
            </Link>
            {" · "}
            <Link className={s.vlink} href="/tools/instagram-comment-keyword-tester">
              Comment keyword tester
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
