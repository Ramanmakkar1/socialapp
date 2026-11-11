import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import FlowPreview from "./FlowPreview";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-comment-to-dm-preview";
const description =
  "Preview an Instagram comment-to-DM flow with your keyword, comments and DM text. Compare contains and exact matching locally with no Meta connection.";

export const metadata: Metadata = {
  title: { absolute: "Instagram Comment-to-DM Preview: Test Keyword Flows" },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "What does this Instagram comment-to-DM preview do?",
    a: "It shows how a sample post comment, keyword match and outgoing DM fit together. You can edit the keyword, comment, match type and message, and the local preview updates immediately in your browser.",
  },
  {
    q: "What is the difference between contains and exact matching?",
    a: "Contains matching finds your keyword as a whole word or phrase inside a longer comment. Exact matching requires the entire comment to equal the keyword after case, punctuation, leading mentions and spacing are normalized. The examples above show both outcomes.",
  },
  {
    q: "Does this preview connect to Instagram or send real DMs?",
    a: "No. This is a local preview, not a live Meta connection. It does not read your posts, contact Instagram, save your entries or send comments or DMs. A live Poskoo rule uses a connected professional Instagram account and the official Meta API.",
  },
  {
    q: "How does the optional email-capture step work?",
    a: "Switch it on to preview a sample email prompt, a submitted sample email and a follow-up DM. Use sample data only: the field is never submitted, transmitted or stored, and no real personal information is collected.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Comment-to-DM Flow Preview",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramCommentToDmPreviewPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Comment-to-DM preview", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />

      <header className="hero">
        <span className="pill">Free · local preview · no Instagram login</span>
        <h1>
          Instagram comment-to-DM <em className="s mark">flow preview</em>
        </h1>
        <p className="lede">
          See how a keyword comment becomes an Instagram DM before you set up a rule. This is a simulated, local preview:
          edit the keyword, sample comment, match type, DM text and optional email-capture step, and the flow updates in
          your browser without contacting Instagram or saving anything.
        </p>
        <div className="hero-art"><AnimArt name="card-dm" label="A relaxed creator on a beanbag while DMs fly out of his phone to followers" /></div>
      </header>

      <div style={{ marginTop: 28 }}>
        <FlowPreview />
      </div>

      <p
        className="small"
        style={{ textAlign: "center", marginTop: 20, display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center" }}
      >
        <Link className={s.vlink} href="/instagram-auto-dm">
          Run this flow live with Instagram auto-DM
        </Link>
        <Link className={s.vlink} href="/instagram-dm-automation">
          Explore Instagram DM automation
        </Link>
        <Link className={s.vlink} href="/signup">
          Start free with {BRAND.name}
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">From preview to automation</p>
            <h2>Ready to answer real comments?</h2>
            <p>
              A live rule watches for keyword comments on the Instagram posts you choose. When a comment matches,
              {" "}{BRAND.name} sends your DM through the official Meta API, subject to the rule and delivery settings.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Choose</span>
              <h3>Pick a post and keyword</h3>
              <p>Use a short, memorable word in your caption, then choose contains or exact matching for your rule.</p>
            </article>
            <article className="pcard">
              <span className="no">02 / Write</span>
              <h3>Add the message once</h3>
              <p>Write the DM you want followers to receive, with the guide, product or booking link they requested.</p>
            </article>
            <article className="pcard">
              <span className="no">03 / Connect</span>
              <h3>Turn on the real automation</h3>
              <p>
                Connect a professional Instagram account through Meta, then create your rule in {BRAND.name}.
              </p>
              <Link className="go" href="/instagram-dm-automation">
                See Instagram DM automation <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Comment-to-DM preview questions</h2>
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
              <h2>Turn your next post&apos;s comments into conversations</h2>
              <p>Move from this local example to a real rule with Instagram connected through the official Meta API.</p>
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
              alt="Two friends celebrating beside a board of saved leads and a rising chart"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
