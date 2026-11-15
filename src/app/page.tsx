import Image from "next/image";
import { preload } from "react-dom";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { canonicalUrl } from "@/lib/canonical";
import { isPathIndexable } from "@/lib/indexability";
import { PLATFORMS_ANSWER } from "@/lib/platform-support";
import { PAGE_DESCRIPTIONS } from "@/lib/public-pages";
import { cancelAnswer, plansFor, plansNote, softwareOffers, type PlanReadiness } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { PlanCta, PlanTag } from "@/components/PlanCta";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import styles from "./landing.module.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LandingDemo } from "./LandingDemo";
import { HeroArt } from "@/components/HeroArt";
import { GoogleButton } from "@/components/GoogleButton";
import { AnimArt, ANIM_LABELS } from "@/components/AnimArt";
import { ArrowRight, AtSign, Facebook, Instagram, Youtube } from "lucide-react";
const title = `Instagram Scheduler & Auto-DM Automation Tool | ${BRAND.name}`;
const description = PAGE_DESCRIPTIONS["/"];
// The trailing slash is load-bearing: new URL("/", base) normalises the root
// path to the bare origin (https://poskoo.com), which Next then renders as the
// canonical href. canonicalUrl() keeps that "/" explicitly and always builds
// from BRAND.url, dropping any query string or fragment.
const canonical = canonicalUrl("/");
export const metadata: Metadata = {
 title: { absolute: title }, description, alternates: { canonical },
 robots: isPathIndexable("/") ? { index: true, follow: true } : { index: false, follow: false },
 openGraph: { title, description, url: canonical, siteName: BRAND.name, images: [{ url: `${BRAND.url}/landing/hero.webp`, width: 1400, height: 933, alt: "Poskoo Instagram scheduling and auto-DM" }] },
 twitter: { card: "summary_large_image", title, description, images: [`${BRAND.url}/landing/hero.webp`] },
};
export const dynamic = "force-static";
// Pricing cards follow the RUNTIME env (src/lib/featureReadiness.ts; the Docker build has no env):
// regenerate in the background at most every 10 minutes.
export const revalidate = 600;
const faqs = [{"q": "What is Poskoo?", "a": "Poskoo is a web app that schedules and auto-publishes your social media posts, and automatically sends an Instagram DM with your link to everyone who comments a keyword. It also captures emails in the DM, gives you a link-in-bio page and shows which posts bring in clicks and leads. It uses each platform's official API, and the Free plan costs $0."}, {"q": "Is it safe for my Instagram account?", "a": "Yes. Poskoo uses Meta's official Instagram API. You log in on Instagram's own screen, we never see your password, and you can disconnect any time."}, {"q": "Which platforms are supported?", "a": PLATFORMS_ANSWER}, {"q": "Do I need a business account?", "a": "For auto-DMs and insights your Instagram needs to be a professional account (Business or Creator). Switching is free in the Instagram app."}, {"q": "Can I cancel any time?", "a": "Yes. Pro and Agency are month to month (or yearly) with no contract. Cancel from Settings > Plan & billing and you keep your plan until the end of the period you paid for."}, {"q": "Is Poskoo free?", "a": "Yes. The Free plan costs $0 and includes 2 social accounts, 10 scheduled posts a month and 500 auto-DMs a month. No card is needed to sign up."}, {"q": "How does comment-to-DM work?", "a": "You pick a post and a keyword. When someone comments that keyword, Poskoo sends them a private Instagram DM with your link, and can ask for their email first so you collect a lead."}, {"q": "Can I schedule Reels and carousels?", "a": "Yes. Paste a public .mp4 link to schedule a Reel, or 2 to 10 image links to schedule a carousel. Poskoo publishes it at the time you pick and shows clear success or failure status."}];
const pageJsonLd = (faqs: { q: string; a: string }[], r: PlanReadiness) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": BRAND.url + "#app",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BRAND.url,
      image: BRAND.url + "/landing/hero.webp",
      description: BRAND.description,
      publisher: { "@id": BRAND.url + "#org" },
      offers: softwareOffers(r),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
});

export default function Home() {
// Paid plans / AI items: "Launching soon" until featureReadiness says they're switched on.
const r = planReadiness();
const plans = plansFor(r);
const faqList = faqs.map((f) => (f.q === "Can I cancel any time?" ? { ...f, a: cancelAnswer(r) } : f));
const jsonLd = pageJsonLd(faqList, r);
// The hero illustration is the first thing painted above the fold: fetch it early
// and at high priority so it, not the lazy art below, is the LCP candidate.
preload("/landing/hero.webp?v=3", { as: "image", fetchPriority: "high" });
return <main className={`${styles.landing} ${instrumentSans.variable} ${instrumentSerif.variable}`}>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
<svg width="0" height="0" style={{"position": "absolute"}} aria-hidden="true"><defs>
  <symbol id="ok" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--green)"/><path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></symbol>
  <symbol id="no" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--red)"/><path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></symbol>
</defs></svg>

<div className="videoHero">
  <HeroArt src="/landing/hero.webp?v=3" />
  <div className="wrap">
    <SiteHeader onHome />
    <header className="hero heroCenter" id="top">
      <Link className="pill glass heroPill" href="#channels"><span>NEW</span><b>LinkedIn, Bluesky and Mastodon are here</b> <i aria-hidden="true">→</i></Link>
      <h1><span className="h1Line">Schedule posts.</span> <span className="h1Line">Auto&#8209;DM every comment.</span> <em className="s mark">Grow on Poskoo.</em></h1>
      <p className="lede">Plan every post on one calendar. Anyone who comments your keyword gets your link by DM, usually within a minute.</p>
      <div className="heroSignup">
        <form className="glassBar glass" action="/signup" method="get">
          <label className="sr-only" htmlFor="hero-email">Email</label>
          <input id="hero-email" name="email" type="email" placeholder="Your email address" autoComplete="email" required />
          <button type="submit">Start free <ArrowRight size={18} aria-hidden="true" /></button>
        </form>
        <div className="heroAlt">
          <GoogleButton className="googleChip" label="Sign up with Google" />
          <span className="heroFine"><svg width="15" height="15" aria-hidden="true"><use href="#ok" /></svg>Free plan, no card</span>
          <span className="heroLogin">Have an account? <Link href="/login">Log in</Link></span>
        </div>
      </div>
    </header>
  </div>
</div>
<div className="wrap">
  <div className="works"><span>Works with</span><b><i style={{"background": "#E1306C"}}></i>Instagram</b><b><i style={{"background": "#1877F2"}}></i>Facebook</b><b><i style={{"background": "var(--ink)"}}></i>Threads</b><b><i style={{"background": "#FF0033"}}></i>YouTube</b><b><i style={{"background": "#0A66C2"}}></i>LinkedIn</b><b><i style={{"background": "#1185FE"}}></i>Bluesky</b><b><i style={{"background": "#6364FF"}}></i>Mastodon</b><span>· Official APIs only</span></div>
</div>

<section className="howSection">
  <div className="wrap">
    <div className="head"><p className="eyebrow">Three steps</p><h2>How Poskoo works in 3 steps</h2></div>
    <div className="howGrid">
      <article className="howStep">
        <div className="howArt"><Image src="/landing/step-connect.webp" width={640} height={627} sizes="(max-width: 960px) 80vw, 320px" loading="lazy" alt="Illustration of connecting a social account on a phone, with Instagram, Facebook and Threads icons and a secure login checkmark" /></div>
        <span className="howNo">Step 1</span>
        <h3>Connect your social media</h3>
        <p>Link Instagram, Facebook and Threads with each app&apos;s own official login. We never see your passwords.</p>
      </article>
      <article className="howStep">
        <div className="howArt"><Image src="/landing/step-schedule.webp" width={640} height={597} sizes="(max-width: 960px) 80vw, 320px" loading="lazy" alt="Illustration of placing photo posts on a wall calendar to schedule them, with an alarm clock" /></div>
        <span className="howNo">Step 2</span>
        <h3>Plan and schedule posts</h3>
        <p>Schedule Reels, carousels and single posts for the time you pick, in your time zone.</p>
      </article>
      <article className="howStep">
        <div className="howArt"><Image src="/landing/step-dm.webp" width={640} height={568} sizes="(max-width: 960px) 80vw, 320px" loading="lazy" alt="Illustration of catching an envelope flying from a phone after a keyword comment, with a LINK speech bubble showing an automatic DM" /></div>
        <span className="howNo">Step 3</span>
        <h3>Auto-DM every keyword comment</h3>
        <p>When someone comments your keyword, Poskoo sends them your link by DM.</p>
      </article>
    </div>
  </div>
</section>

<section id="how"><div className="wrap">
  <div className="head"><p className="eyebrow">Three jobs, one app</p><h2>Everything between <em className="s">posting</em> and <em className="s">getting paid</em></h2></div>
  <div className="cards">
    <article className="pcard"><AnimArt name="card-schedule" label="A creator pins post cards onto a weekly calendar next to a smiling alarm clock" /><span className="no">01 / Schedule</span><h3>Plan a month in one sitting.</h3><p>Drag posts onto the calendar and they go live at the time you choose.</p><Link className="go" href="/instagram-scheduler">See the calendar <span aria-hidden="true">→</span></Link></article>
    <article className="pcard"><AnimArt name="card-dm" label="A relaxed creator on a beanbag while DMs fly out of his phone to followers" /><span className="no">02 / Auto-DM</span><h3>Every comment gets your link.</h3><p>Pick a word like LINK or PRICE. Anyone who comments it gets a DM, usually within a minute, day or night.</p><Link className="go" href="/instagram-auto-dm">Watch it work <span aria-hidden="true">→</span></Link></article>
    <article className="pcard"><AnimArt name="card-leads" label="Two friends high-five next to a board of contacts with check marks and a rising chart" /><span className="no">03 / Grow</span><h3>Turn followers into leads.</h3><p>Collect emails right in the DM, then see which posts bring them in.</p><Link className="go" href="/instagram-auto-dm/templates">Start collecting <span aria-hidden="true">→</span></Link></article>
  </div>
</div></section>

<section style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="split">
    <div className="art"><AnimArt name="problem" label="A tired creator at night buried under phones and chat-bubble notifications" /></div>
    <div className="copy">
      <p className="eyebrow">Sound familiar?</p>
      <h2>Replying by hand doesn&apos;t scale</h2>
      <p>Every good post brings the same flood of &quot;where can I get this?&quot; messages. Answering them one by one eats your evenings and loses you sales.</p>
      <div className="pains">
        <div className="pain"><b>Same link, all day</b><span>You paste one link into DMs dozens of times.</span></div>
        <div className="pain"><b>Slow replies</b><span>By the time you answer, they&apos;ve scrolled on.</span></div>
        <div className="pain"><b>Lost leads</b><span>No emails saved, no idea which post worked.</span></div>
      </div>
    </div>
  </div>
  <div className="vs">
    <div><h3>Without Poskoo</h3><ul>
      <li><svg width="18" height="18"><use href="#no"/></svg>Hours a day on copy-paste replies</li>
      <li><svg width="18" height="18"><use href="#no"/></svg>Messages missed while you sleep or film</li>
      <li><svg width="18" height="18"><use href="#no"/></svg>Posting by hand on every app, one by one</li>
      <li><svg width="18" height="18"><use href="#no"/></svg>No email list from your comments</li>
      <li><svg width="18" height="18"><use href="#no"/></svg>Paying for four or five separate tools</li></ul></div>
    <div className="with"><h3>With Poskoo</h3><ul>
      <li><svg width="18" height="18"><use href="#ok"/></svg>Every keyword comment gets a DM, usually within a minute</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>Works 24/7 on posts, Reels and carousels</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>Schedule a month of Instagram posts in one sitting</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>Emails saved as leads</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>One plan for scheduling, DMs, links and analytics</li></ul></div>
  </div>
</div></section>

<section id="demo" style={{"paddingTop": "20px"}}><div className="wrap">
  <LandingDemo />
</div></section>

<section id="channels" style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="split rev">
    <div className="copy">
      <p className="eyebrow">Multi-channel scheduling</p>
      <h2>Write once. <em className="s">Post everywhere</em></h2>
      <p>Schedule Instagram, Facebook Pages, Threads and YouTube posts from one calendar, each with its own caption.</p>
      <ul className="channels">
        <li><span className="chIcon" style={{ background: "#E1306C" }}><Instagram size={20} aria-hidden="true" /></span><span className="chText"><b>Instagram</b><span>Feed posts, carousels, Reels and Stories</span></span><span className="chLive">Live</span></li>
        <li><span className="chIcon" style={{ background: "#1877F2" }}><Facebook size={20} aria-hidden="true" /></span><span className="chText"><b>Facebook</b><span>Posts to your Facebook Pages</span></span><span className="chLive">Live</span></li>
        <li><span className="chIcon" style={{ background: "var(--ink)" }}><AtSign size={20} aria-hidden="true" /></span><span className="chText"><b>Threads</b><span>Posts to your Threads profile</span></span><span className="chLive">Live</span></li>
        <li><span className="chIcon" style={{ background: "#FF0000" }}><Youtube size={20} aria-hidden="true" /></span><span className="chText"><b>YouTube</b><span>Videos and Shorts to your channel</span></span><span className="chLive">Live</span></li>
      </ul>
      <p className="chLinks"><Link className="go" href="/threads-scheduler">See the Threads scheduler <span aria-hidden="true">→</span></Link><Link className="go" href="/social-media-scheduler-comparison">Compare social media schedulers <span aria-hidden="true">→</span></Link></p>
    </div>
    <div className="art"><AnimArt name="multichannel" label="A creator at a laptop sends one post that splits to several phones and screens" /></div>
  </div>
</div></section>

<section id="features" style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="head"><p className="eyebrow">What you get</p><h2>One app for the whole <em className="s">post-to-lead</em> loop</h2></div>
  <div className="bento">
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-calendar" label={ANIM_LABELS["feat-calendar"]} /></div>
      <h3>Calendar</h3>
      <p>Plan a week of Instagram, Facebook and Threads posts on one calendar.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-dm" label={ANIM_LABELS["feat-dm"]} /></div>
      <h3>Comment to DM</h3>
      <p>When someone comments your keyword, Poskoo sends them your link by Instagram DM.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-ai" label={ANIM_LABELS["feat-ai"]} /></div>
      <h3>AI captions</h3>
      <p>Draft captions in your brand voice with AI, then edit and schedule.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-leads" label={ANIM_LABELS["feat-leads"]} /></div>
      <h3>Lead capture</h3>
      <p>Ask for an email in the DM and save every new lead in one place.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-linkbio" label={ANIM_LABELS["feat-linkbio"]} /></div>
      <h3>Link in bio</h3>
      <p>One page for every link in your Instagram bio, with click tracking and four themes.</p>
      <Link className="bentoLink" href="/instagram-link-in-bio">Build your Instagram link-in-bio page <span aria-hidden="true">→</span></Link>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="analytics" label={ANIM_LABELS["analytics"]} /></div>
      <h3>Analytics</h3>
      <p>See reach, comments, DMs, link clicks and leads for every post, so you know what works.</p>
    </article>
  </div>
</div></section>

<section style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="split subSplit">
    <div className="art"><Image sizes="(max-width: 960px) 100vw, (min-width: 1800px) 43vw, 570px" src="/landing/onesub.webp" width={1400} height={933} loading="lazy" decoding="async" alt="A happy creator in an armchair holds one membership card while app cards and bills fly away" /></div>
    <div className="copy">
      <p className="eyebrow">One subscription</p>
      <h2>Stop paying <em className="s">here and there</em></h2>
      <p>Most creators pay for a stack of apps. Poskoo puts it all in one plan, with one login and one bill.</p>
      <div className="replace">
        <div className="old"><span>Content scheduler</span><span>Comment-to-DM tool</span><span>Link in bio app</span><span>AI caption writer</span><span>Analytics tool</span></div>
        <span className="to" aria-hidden="true">→</span>
        <div className="new"><b>Poskoo</b><small>Everything included, from $0</small></div>
      </div>
    </div>
  </div>
</div></section>

<section id="pricing"><div className="wrap">
  <div className="head"><p className="eyebrow">Pricing</p><h2>Simple plans. <em className="s">Start free</em></h2></div>
  <div className="plans">
    {plans.map((p) => (
      <div key={p.name} className={p.popular ? "plan pop" : "plan"}>
        <PlanTag plan={p} />
        <h3>{p.name}</h3>
        <div className="price">{p.price} <small>{p.per}</small></div>
        {p.yearly && <p className="priceYearly">or {p.yearlyHref ? <a href={p.yearlyHref}>{p.yearly}</a> : p.yearly}</p>}
        <ul>
          {p.items.map((item) => (
            <li key={item.text}>
              <svg width="16" height="16"><use href="#ok"/></svg>
              <span>{item.text}{item.soon ? <small className="soon"> · launching soon</small> : null}</span>
            </li>
          ))}
        </ul>
        <PlanCta plan={p} />
      </div>
    ))}
  </div>
  <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>{plansNote(r)}</p>
</div></section>

<section id="faq" style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="head"><p className="eyebrow">Questions</p><h2>Good to know</h2></div>
  <div className="faq">
    {faqList.map((f, i) => (
      <details key={f.q} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>
    ))}
  </div>
</div></section>

<div className="wrap">
  <div className="cta">
    <div className="ctaCopy">
      <p className="ctaEyebrow">Ready when you are</p>
      <h2>Your next post could fill your inbox <em className="s">with leads</em></h2>
      <p>Start free. Connect your social accounts in one tap, pick a keyword, and let Poskoo send the link while you get on with your day.</p>
      <form className="glassBar ctaBar" action="/signup" method="get">
        <label className="sr-only" htmlFor="cta-email">Email</label>
        <input id="cta-email" name="email" type="email" placeholder="Enter your email..." autoComplete="email" required />
        <button type="submit">Get started free <ArrowRight size={18} aria-hidden="true" /></button>
      </form>
      <ul className="ctaChecks">
        <li><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>Free plan</li>
        <li><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>No credit card</li>
        <li><svg width="18" height="18" aria-hidden="true"><use href="#ok" /></svg>Official Meta API</li>
      </ul>
      <p className="ctaLogin">Already have an account? <Link href="/login">Log in</Link></p>
    </div>
    <AnimArt name="card-leads" label="Two friends high-five next to a board of new leads" />
  </div>
  <SiteFooter />
</div>
</main>; }
