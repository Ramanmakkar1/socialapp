import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import StorySizeChecker from "./StorySizeChecker";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-story-size-checker";
const title = "Instagram Story Size Checker: Is It 1080 × 1920? | Poskoo";
const description =
  "Check your Instagram Story image in seconds: see its exact dimensions and aspect ratio, preview it in a 9:16 frame and learn if it matches 1080 × 1920.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const steps = [
  {
    title: "Load your Story image",
    text: "Choose a JPG, PNG or WebP file from your device. It is read locally in your browser and never uploaded.",
  },
  {
    title: "Read the dimensions and ratio",
    text: "The checker shows the exact pixel width and height, the aspect ratio and the file size, then previews the image inside a 9:16 frame.",
  },
  {
    title: "Fix the size before you post",
    text: "If the image is not 1080 × 1920, re-export or crop it to that size so Instagram does not crop faces or add bars.",
  },
];

const faqs = [
  {
    q: "What is the correct Instagram Story size?",
    a: "The recommended Instagram Story size is 1080 × 1920 pixels, which is a 9:16 aspect ratio. That fills a phone screen without cropping or empty bars. Instagram accepts other sizes, but it scales them to fit the 9:16 frame.",
  },
  {
    q: "Does my Story image have to be exactly 1080 × 1920?",
    a: "No, but it is the safest choice. Any image with a 9:16 shape fills the frame, and Instagram scales it to 1080 × 1920. Images smaller than 1080 × 1920 can look soft, and images with a different shape get cropped or padded.",
  },
  {
    q: "Why does my Story look cropped?",
    a: "Instagram Stories use a 9:16 frame. If your image is square, 4:5 or 16:9, Instagram crops the edges or adds bars to fit. Keep important text and faces away from the edges, or re-export the image at 1080 × 1920.",
  },
  {
    q: "Is my image uploaded or stored?",
    a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no Instagram login is needed.",
  },
  {
    q: "What file type and size should I use?",
    a: "JPG, PNG and WebP all work for Instagram Stories. This checker accepts images up to 20 MB. For fast loading, export a JPG or WebP at 1080 × 1920 and keep the file well under Instagram's upload limit.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Story Size Checker",
  description,
  url: `${BRAND.url}${PATH}`,
  category: "MultimediaApplication",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "Story size checker", url: `${BRAND.url}${PATH}` },
]);

export default function InstagramStorySizeCheckerPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/tools">Free Instagram tools</Link> / Story size checker
      </nav>
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram <em className="s mark">Story size checker</em>
        </h1>
        <p className="lede">
          The recommended Instagram Story size is 1080 × 1920 pixels (9:16). Load your image to see its exact dimensions
          and aspect ratio, preview it in a 9:16 frame, and find out in seconds whether it matches — or what to fix.
        </p>
        <div className="hero-art"><AnimArt name="visual" label="A creator measures a photo frame with a ruler next to phone screens of different shapes" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <StorySizeChecker />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        Ready to design? Build a Story in the{" "}
        <Link className={s.vlink} href="/tools/instagram-story-maker">
          Instagram Story maker
        </Link>{" "}
        or plan the publish time with the{" "}
        <Link className={s.vlink} href="/instagram-scheduler">
          Instagram scheduler
        </Link>
        .
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Three steps</p>
            <h2>How the Story size checker works</h2>
          </div>
          <div className="cards">
            {steps.map((st, i) => (
              <article key={st.title} className="pcard">
                <span className="no">Step {i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Instagram Story sizes at a glance</h2>
            <p>
              A Story fills the whole phone screen, so the frame is tall and narrow. Use 1080 × 1920 pixels for the
              sharpest result, and keep the 9:16 shape if you export at a different resolution.
            </p>
            <ul>
              <li>
                <strong>Recommended:</strong> 1080 × 1920 px, 9:16 aspect ratio.
              </li>
              <li>
                <strong>Minimum width:</strong> 1080 px, so the Story stays sharp on modern phones.
              </li>
              <li>
                <strong>File types:</strong> JPG, PNG or WebP.
              </li>
              <li>
                <strong>Safe area:</strong> keep text and faces away from the top and bottom edges where the profile bar
                and reply field sit.
              </li>
            </ul>
            <p>
              Designing from scratch? The{" "}
              <Link className={s.vlink} href="/tools/instagram-story-maker">
                Instagram Story maker
              </Link>{" "}
              exports a 1080 × 1920 PNG, and the{" "}
              <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
                safe zone checker
              </Link>{" "}
              shows what the Story interface covers.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram Story size FAQ</h2>
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
              <h2>Schedule your Stories and Reels in one place</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/instagram-scheduler">
                Explore the Instagram scheduler <span aria-hidden="true">→</span>
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
