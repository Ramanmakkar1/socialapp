import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import DmLinkGenerator from "./DmLinkGenerator";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-dm-link-generator";
const description =
  "Free Instagram DM link generator: turn @username into an ig.me link that opens a DM with your account. Copy for bio, Stories and email.";

export const metadata: Metadata = {
  title: { absolute: "Instagram DM Link Generator: Free ig.me Link Maker" },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "What is an ig.me/m link?",
    a: "It is Instagram’s short link format that opens the Instagram app (or website) straight to a new direct message with the username in the URL. Example: https://ig.me/m/yourname sends people to a DM thread with @yourname.",
  },
  {
    q: "How is this different from linking to my Instagram profile?",
    a: "A profile link (instagram.com/yourname) shows your grid and bio. An ig.me/m link skips straight to messaging, which is better when you want leads, support questions or giveaway entries in DMs.",
  },
  {
    q: "Can I use the same link in my bio, Stories and on my website?",
    a: "Yes. The ig.me URL works anywhere you can paste a link: Instagram bio, Story Link sticker, email signature, QR codes and HTML buttons on your site.",
  },
  {
    q: "Does this tool need my Instagram password or Meta login?",
    a: "No. This page only formats a public username into the correct ig.me URL in your browser. It does not connect to Instagram or store your handle.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram DM Link Generator", description, url: `${BRAND.url}${PATH}` });
const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "DM link generator", url: `${BRAND.url}${PATH}` },
]);

const codeStyle = { background: "var(--poskoo-band)", borderRadius: 8, padding: "2px 6px", fontSize: ".92em" } as const;

export default function InstagramDmLinkGeneratorPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram DM link <em className="s mark">generator</em>
        </h1>
        <p className="lede">
          Turn your @username into an ig.me link that opens a direct message with your account. Copy it for your bio,
          Story sticker, email or website button.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-dm.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A relaxed creator on a beanbag while DMs fly out of his phone to followers"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <DmLinkGenerator />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-bio-generator">
          Bio generator
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
      </p>

      {/* What is an ig.me link / where to use it */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What is an ig.me link?</h2>
            <p>
              An ig.me/m URL is Instagram’s official short link for direct messages. When someone taps it on a phone with
              Instagram installed, they land in a new DM conversation with the username you chose—no need to search your
              profile or tap Message manually.
            </p>
            <p>
              The format is always <code style={codeStyle}>https://ig.me/m/username</code>.
              Use the generator above with your public @handle; we do not log in to Meta or verify the account exists.
            </p>
            <h2>Where to use it (bio, Stories, emails, QR codes, website buttons)</h2>
            <ul>
              <li>
                <strong>Bio:</strong> paste the ig.me link or the ready-made bio line so
                followers can DM you in one tap.
              </li>
              <li>
                <strong>Stories:</strong> add a Link sticker (if you have access) and paste
                the same URL.
              </li>
              <li>
                <strong>Email &amp; newsletters:</strong> use the HTML snippet for a
                “Message on Instagram” button.
              </li>
              <li>
                <strong>Website links you share in DMs:</strong> tag them with the{" "}
                <Link className={s.vlink} href="/tools/instagram-utm-builder">
                  Instagram UTM builder
                </Link>{" "}
                so your site analytics shows which bio, Story or auto-DM link sent the visit.
              </li>
              <li>
                <strong>QR codes:</strong> encode the ig.me URL so print materials or events
                open DMs on scan.
              </li>
              <li>
                <strong>Website:</strong> drop the link on a contact page, link-in-bio
                tool or checkout thank-you page.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band" style={{ gridTemplateColumns: "1fr" }}>
            <div className="copy">
              <p className="eyebrow">Next step</p>
              <h2>Want DMs to answer themselves?</h2>
              <p>
                A click-to-DM link starts the conversation. {BRAND.name} can reply when someone comments a keyword, send welcome
                messages and capture leads—with scheduling and Instagram auto-DM in one place.
              </p>
              <div className="ctas" style={{ justifyContent: "flex-start" }}>
                <Link className="btn btn-line" href="/instagram-auto-dm">
                  How Instagram auto DM works
                </Link>
                <Link className="btn btn-dark" href="/signup">
                  Start free <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram DM link FAQ</h2>
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
              <h2>Schedule posts and auto-DM everyone who comments</h2>
              <p>{BRAND.tagline}</p>
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
            <Link className={s.vlink} href="/instagram-auto-dm">
              How Instagram auto DM works
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
