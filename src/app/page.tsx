import Image from "next/image";
import { preload } from "react-dom";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { PAGE_DESCRIPTIONS } from "@/lib/public-pages";
import { PLANS, PLANS_NOTE, SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import styles from "./landing.module.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LandingDemo } from "./LandingDemo";
import { HeroVideo } from "@/components/HeroVideo";
import { HeroFloaters } from "@/components/HeroFloaters";
import { AnimArt } from "@/components/AnimArt";
import { ArrowRight, AtSign, Facebook, Instagram, Youtube } from "lucide-react";
const title = `Instagram Post Scheduler & Auto-DM Automation | ${BRAND.name}`;
const description = PAGE_DESCRIPTIONS["/"];
const canonical = new URL("/", BRAND.url).toString();
export const metadata: Metadata = {
 title: { absolute: title }, description, alternates: { canonical },
 openGraph: { title, description, url: canonical, siteName: BRAND.name, images: [{ url: `${BRAND.url}/landing/hero.webp`, width: 1400, height: 933, alt: "Poskoo Instagram scheduling and auto-DM" }] },
 twitter: { card: "summary_large_image", title, description, images: [`${BRAND.url}/landing/hero.webp`] },
};
export const dynamic = "force-static";
const faqs = [{"q": "Is it safe for my Instagram account?", "a": "Yes. Poskoo uses Meta's official Instagram API. You log in on Instagram's own screen, we never see your password, and you can disconnect any time."}, {"q": "Which platforms are supported?", "a": "Instagram, Facebook Pages, Threads and YouTube scheduling work today, plus Instagram auto-DMs. Other networks are on the roadmap, with no date yet."}, {"q": "Do I need a business account?", "a": "For auto-DMs and insights your Instagram needs to be a professional account (Business or Creator). Switching is free in the Instagram app."}, {"q": "Can I cancel any time?", "a": "Yes. Paid plans will be month to month with no contract, and you can cancel from settings. Today every account is on the Free plan, so there is nothing to cancel."}, {"q": "Is Poskoo free?", "a": "Yes. The Free plan costs $0 and includes 2 social accounts, 10 scheduled posts a month and 500 auto-DMs a month. No card is needed to sign up."}, {"q": "How does comment-to-DM work?", "a": "You pick a post and a keyword. When someone comments that keyword, Poskoo sends them a private Instagram DM with your link, and can ask for their email first so you collect a lead."}, {"q": "Can I schedule Reels and carousels?", "a": "Yes. Paste a public .mp4 link to schedule a Reel, or 2 to 10 image links to schedule a carousel. Poskoo publishes it at the time you pick and shows clear success or failure status."}];
const jsonLd = {
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
      offers: SOFTWARE_APPLICATION_OFFERS,
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
};

export default function Home() {
// The hero poster is the first thing painted above the fold (the video fades in over it):
// fetch it early and at high priority so it, not the lazy art below, is the LCP candidate.
preload("/landing/hero-poster.webp", { as: "image", fetchPriority: "high" });
return <main className={`${styles.landing} ${instrumentSans.variable} ${instrumentSerif.variable}`}>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
<svg width="0" height="0" style={{"position": "absolute"}} aria-hidden="true"><defs>
  <symbol id="ok" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--green)"/><path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></symbol>
  <symbol id="no" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--red)"/><path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></symbol>
</defs></svg>

<div className="videoHero">
  <HeroVideo src="/landing/hero-loop.mp4" poster="/landing/hero-poster.webp" />
  <HeroFloaters />
  <div className="wrap">
    <SiteHeader onHome />
    <header className="hero heroCenter" id="top">
      <Link className="pill glass" href="#channels"><span>NEW</span>Schedule on Instagram, Facebook, Threads and YouTube, and auto-DM on Instagram <span aria-hidden="true" style={{"background": "none", "color": "inherit", "padding": "0"}}>→</span></Link>
      <h1>Schedule posts. Auto-DM every comment. <em className="s mark">Grow on Poskoo.</em></h1>
      <p className="lede">Poskoo plans your posts on one calendar, then sends your link to everyone who comments, usually within a minute. One app, one plan, no copy-paste.</p>
      <div className="heroSignup">
        <form className="glassBar glass" action="/signup" method="get">
          <label className="sr-only" htmlFor="hero-email">Email</label>
          <input id="hero-email" name="email" type="email" placeholder="Enter your email..." autoComplete="email" required />
          <button type="submit">Get started free <ArrowRight size={18} aria-hidden="true" /></button>
        </form>
        <p className="heroOr"><span>or</span></p>
        {/* Plain <a>: the OAuth start is a route handler redirect, never prefetched. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth redirect, must not be client-routed */}
        <a className="googleBtn glass" href="/api/auth/google/start">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
          Continue with Google
        </a>
        <p className="heroFine"><svg width="16" height="16" aria-hidden="true"><use href="#ok" /></svg>No credit card required. <b>It&apos;s free!</b> <span className="sep" aria-hidden="true">·</span> Have an account? <Link href="/login">Log in</Link></p>
      </div>
    </header>
  </div>
</div>
<div className="wrap">
  <div className="works"><span>Works with</span><b><i style={{"background": "#E1306C"}}></i>Instagram</b><b><i style={{"background": "#1877F2"}}></i>Facebook</b><b><i style={{"background": "var(--ink)"}}></i>Threads</b><span>· Built on the official Meta API</span></div>
</div>

<section className="howSection">
  <div className="wrap">
    <div className="head"><p className="eyebrow">Three steps</p><h2>How Poskoo works in 3 steps</h2></div>
    <div className="howGrid">
      <article className="howStep">
        <div className="howArt"><Image src="/landing/step-connect.webp" width={640} height={627} sizes="(max-width: 960px) 80vw, 320px" loading="lazy" alt="" /></div>
        <span className="howNo">Step 1</span>
        <h3>Connect your social media</h3>
        <p>Link Instagram, Facebook and Threads with each app&apos;s own official login. We never see your passwords.</p>
      </article>
      <article className="howStep">
        <div className="howArt"><Image src="/landing/step-schedule.webp" width={640} height={597} sizes="(max-width: 960px) 80vw, 320px" loading="lazy" alt="" /></div>
        <span className="howNo">Step 2</span>
        <h3>Plan and schedule posts</h3>
        <p>Schedule Reels, carousels and single posts for the time you pick, in your time zone.</p>
      </article>
      <article className="howStep">
        <div className="howArt"><Image src="/landing/step-dm.webp" width={640} height={568} sizes="(max-width: 960px) 80vw, 320px" loading="lazy" alt="" /></div>
        <span className="howNo">Step 3</span>
        <h3>Auto-DM every keyword comment</h3>
        <p>When someone comments your keyword, Poskoo sends them your link by DM.</p>
      </article>
    </div>
  </div>
</section>

<section id="how"><div className="wrap">
  <div className="head"><p className="eyebrow">Three jobs, one app</p><h2>Everything between <em className="s">posting</em> and <em className="s">getting paid.</em></h2></div>
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
      <h2>Replying by hand doesn&apos;t scale.</h2>
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
      <h2>Write once. <em className="s">Post everywhere.</em></h2>
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
  <div className="head"><p className="eyebrow">What you get</p><h2>One app for the whole <em className="s">post-to-lead</em> loop.</h2></div>
  <div className="bento">
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-calendar" /></div>
      <h3>Calendar</h3>
      <p>Plan a week of Instagram, Facebook and Threads posts on one calendar.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-dm" /></div>
      <h3>Comment to DM</h3>
      <p>When someone comments your keyword, Poskoo sends them your link by Instagram DM.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-ai" /></div>
      <h3>AI captions</h3>
      <p>Draft captions in your brand voice with AI, then edit and schedule.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-leads" /></div>
      <h3>Lead capture</h3>
      <p>Ask for an email in the DM and save every new lead in one place.</p>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="feat-linkbio" /></div>
      <h3>Link in bio</h3>
      <p>One page for every link in your Instagram bio, with click tracking and four themes.</p>
      <Link className="bentoLink" href="/instagram-link-in-bio">Build your Instagram link-in-bio page <span aria-hidden="true">→</span></Link>
    </article>
    <article className="bentoCard">
      <div className="bentoArt"><AnimArt name="analytics" /></div>
      <h3>Analytics</h3>
      <p>See reach, comments, DMs, link clicks and leads for every post, so you know what works.</p>
    </article>
  </div>
</div></section>

<section style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="split">
    <div className="art"><Image sizes="(max-width: 960px) 100vw, (min-width: 1800px) 43vw, 570px" src="/landing/onesub.webp" width={1400} height={933} loading="lazy" decoding="async" alt="A happy creator in an armchair holds one membership card while app cards and bills fly away" /></div>
    <div className="copy">
      <p className="eyebrow">One subscription</p>
      <h2>Stop paying <em className="s">here and there.</em></h2>
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
  <div className="head"><p className="eyebrow">Pricing</p><h2>Simple plans. <em className="s">Start free.</em></h2></div>
  <div className="plans">
    {PLANS.map((p) => (
      <div key={p.name} className={p.popular ? "plan pop" : "plan"}>
        {p.popular ? <span className="tag">Most popular</span> : null}
        <h3>{p.name}</h3>
        <div className="price">{p.price} <small>{p.per}</small></div>
        <ul>
          {p.items.map((item) => (
            <li key={item.text}>
              <svg width="16" height="16"><use href="#ok"/></svg>
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
</div></section>

<section id="faq" style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="head"><p className="eyebrow">Questions</p><h2>Good to know</h2></div>
  <div className="faq">
    {faqs.map((f, i) => (
      <details key={f.q} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>
    ))}
  </div>
</div></section>

<div className="wrap">
  <div className="cta">
    <div className="ctaCopy">
      <p className="ctaEyebrow">Ready when you are</p>
      <h2>Your next post could fill your inbox <em className="s">with leads.</em></h2>
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
