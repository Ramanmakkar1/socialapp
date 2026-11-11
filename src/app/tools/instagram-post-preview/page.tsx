import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import PostPreviewTool from "./PostPreviewTool";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-post-preview";
const description =
  "Preview your Instagram post with a local photo, display handle and caption. Compare square and portrait crops, check line breaks and copy your caption.";
export const metadata: Metadata = {
  title: { absolute: `Instagram Post Preview: Free Feed Mockup Tool | ${BRAND.name}` },
  description,
  alternates: { canonical: `${BRAND.url}${PATH}` },
};

const steps = [
  { title: "1. Choose a photo", text: "Pick a local image and enter your display handle. No Instagram login needed." },
  { title: "2. Shape your story", text: "Write your caption with emoji and line breaks. Expand it to review the full text." },
  { title: "3. Check the frame", text: "Compare square and portrait crops, copy your caption, then paste it into your next post or the Instagram scheduler." },
];
const faqs = [
  { q: "Are my images private?", a: "Yes. Images stay in this browser tab through local object URLs. This tool never uploads them or fetches your profile. Images and captions are not saved; refreshing clears the preview." },
  { q: "How accurate is the Instagram preview?", a: "This is a feed mockup, not an official Instagram renderer. Centered cropping and caption truncation are approximations; fonts, spacing and the fold can vary by device and app version. Check the final post in Instagram." },
  { q: "Can I schedule or publish from this tool?", a: "This free tool only previews a single image and copies captions. It does not publish, schedule or carry your draft into signup. Copy your caption before leaving, then explore the scheduler or create an account separately." },
];
const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Post Preview", description, url: `${BRAND.url}${PATH}` });

export default function InstagramPostPreviewPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/tools">Free Instagram tools</Link> / Post preview
      </nav>
      <header className="hero">
        <span className="pill">Free tool · no signup needed</span>
        <h1>
          Instagram <em className="s mark">post preview</em>
        </h1>
        <p className="lede">Find your frame. Refine your first line. See how your photo and caption work together before you post.</p>
        <div className="hero-art"><AnimArt name="visual" label="A creator measures a photo frame with a ruler next to phone screens of different shapes" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <PostPreviewTool />
      </div>
      <p
        className="small"
        style={{ textAlign: "center", marginTop: 20, display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center" }}
      >
        <Link className={s.vlink} href="/tools/instagram-caption-counter">Instagram caption counter</Link>
        <Link className={s.vlink} href="/tools/instagram-image-size">Instagram image size tool</Link>
        <Link className={s.vlink} href="/instagram-scheduler">Explore the Instagram scheduler</Link>
      </p>

      {/* Steps */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Three steps</p>
            <h2>From idea to feed in three steps</h2>
          </div>
          <div className="cards">
            {steps.map((st, i) => (
              <article key={st.title} className="pcard">
                <span className="no">Step {i + 1}</span>
                <h3>{st.title.replace(/^\d+\.\s*/, "")}</h3>
                <p>{st.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Before you post</h2>
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
              <h2>Give your next post a head start</h2>
              <p>Copy your caption, keep your original image handy and explore {BRAND.name} for your next step.</p>
              <Link className="btn" href="/signup">
                Create your account <span aria-hidden="true">→</span>
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
        </div>
      </section>
    </PublicShell>
  );
}
