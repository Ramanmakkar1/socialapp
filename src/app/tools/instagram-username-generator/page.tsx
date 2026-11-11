import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import UsernameTool from "./UsernameTool";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-username-generator";
const description =
  "Free Instagram username generator. Turn your name and niche into up to 30 clean, creative or brand handle ideas that follow Instagram's rules.";
export const metadata: Metadata = {
  title: { absolute: "Instagram Username Generator: Free Name Ideas to Copy" },
  description,
  alternates: { canonical: PATH },
};
const steps = [
  "Type your name or brand and the niche you post about. You can leave the name empty to get niche-only ideas.",
  "Pick a style: clean for a personal account, creative for a playful handle, or business for a brand.",
  "Copy a username you like, then check it in the Instagram app under Edit profile > Username.",
];
const faqs = [
  {
    q: "What characters can an Instagram username use?",
    a: "Instagram usernames can be up to 30 characters and use letters, numbers, periods and underscores. Every idea here also avoids a period at the start or end and two periods in a row.",
  },
  {
    q: "Does this tool check if a username is available?",
    a: "No. The generator runs in your browser and never contacts Instagram. Type the name into Edit profile > Username in the Instagram app to see if it is free.",
  },
  {
    q: "How do I change my Instagram username?",
    a: "Open your profile in the Instagram app, tap Edit profile, then tap Username. Enter the new name and save it if Instagram shows that it is available.",
  },
  {
    q: "What makes a good Instagram username?",
    a: "Keep it short, easy to say and easy to spell. Use the same name you use on other platforms, add your niche only if it helps people find you, and avoid long strings of numbers.",
  },
];
const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Username Generator", description, url: `${BRAND.url}${PATH}` });

export default function InstagramUsernameGeneratorPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free / runs in your browser / nothing is uploaded</span>
        <h1>
          Instagram username <em className="s mark">generator</em>
        </h1>
        <p className="lede">
          Turn your name and niche into Instagram name ideas with periods, underscores and short add-ons. Copy one
          with a tap.
        </p>
        <div className="hero-art"><AnimArt name="writing" label="A creator writes with a giant pencil on a phone-shaped card full of lines and emoji" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <UsernameTool />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-bio-generator">
          Bio generator
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-font-generator">
          Font generator
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to use this tool</h2>
            </div>
            <div className="pains">
              {steps.map((step, i) => (
                <div key={step} className="pain">
                  <b>Step {i + 1}</b>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram username FAQ</h2>
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
        </div>
      </section>
    </PublicShell>
  );
}
