import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { PLANS, PLANS_NOTE } from "@/lib/plans";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import styles from "./landing.module.css";
const title = `Instagram Post Scheduler & Auto-DM Automation | ${BRAND.name}`;
const description = "Schedule Instagram posts, auto-DM keyword comments and capture leads with Poskoo. Start free using the official Meta API. No credit card needed.";
export const metadata: Metadata = {
 title: { absolute: title }, description, alternates: { canonical: "/" },
 openGraph: { title, description, url: "/", siteName: BRAND.name, images: [{ url: "/landing/hero.webp", width: 1400, height: 933, alt: "Poskoo Instagram scheduling and auto-DM" }] },
 twitter: { card: "summary_large_image", title, description, images: ["/landing/hero.webp"] },
};
const faqs = [{"q": "Is it safe for my Instagram account?", "a": "Yes. Poskoo uses Meta's official Instagram API. You log in on Instagram's own screen, we never see your password, and you can disconnect any time."}, {"q": "Which platforms are supported?", "a": "Instagram scheduling and auto-DMs work today. Facebook Pages and Threads are coming soon."}, {"q": "Do I need a business account?", "a": "For auto-DMs and insights your Instagram needs to be a professional account (Business or Creator). Switching is free in the Instagram app."}, {"q": "Can I cancel any time?", "a": "Yes. Paid plans will be month to month with no contract, and you can cancel from settings. Today every account is on the Free plan, so there is nothing to cancel."}];
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": BRAND.url + "#org",
      name: BRAND.company,
      url: BRAND.url,
      email: BRAND.supportEmail,
    },
    {
      "@type": "SoftwareApplication",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BRAND.url,
      description: BRAND.description,
      publisher: { "@id": BRAND.url + "#org" },
      offers: PLANS.map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: p.price.replace("$", ""),
        priceCurrency: "USD",
      })),
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

export default function Home() { return <main className={`${styles.landing} ${instrumentSans.variable} ${instrumentSerif.variable}`}>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
<svg width="0" height="0" style={{"position": "absolute"}} aria-hidden="true"><defs>
  <symbol id="ok" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--green)"/><path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></symbol>
  <symbol id="no" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--red)"/><path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></symbol>
  <symbol id="mark" viewBox="0 0 40 40"><path d="M20 3c9.4 0 17 6.7 17 15.4S29.4 34 20 34c-1.6 0-3.1-.2-4.6-.5L8 37.5l1.7-6.6C5.6 28.1 3 23.6 3 18.4 3 9.7 10.6 3 20 3z" fill="var(--coral)" stroke="var(--ink)" strokeWidth="2.4"/><circle cx="14.5" cy="18.5" r="2.4" fill="var(--ink)"/><circle cx="25.5" cy="18.5" r="2.4" fill="var(--ink)"/><path d="M16 24c2.4 2 5.6 2 8 0" stroke="var(--ink)" strokeWidth="2.2" fill="none" strokeLinecap="round"/></symbol>
</defs></svg>

<div className="wrap">
  <nav className="top" aria-label="Main">
    <Link className="logo" href="/"><svg width="34" height="34" aria-hidden="true"><use href="#mark"/></svg>poskoo<b>.</b></Link>
    <div className="links"><Link href="#how">How it works</Link><Link href="#channels">Channels</Link><Link href="#pricing">Pricing</Link><Link href="#faq">FAQ</Link></div>
    <div className="navr"><Link className="login" href="/login">Log in</Link><Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link></div>
  </nav><nav className="mobile-nav" aria-label="Mobile navigation"><Link href="#how">How it works</Link><Link href="#channels">Channels</Link><Link href="#pricing">Pricing</Link><Link href="#faq">FAQ</Link><Link href="/login">Log in</Link></nav>

  <header className="hero" id="top">
    <Link className="pill" href="#channels"><span>NEW</span>Schedule and auto-DM on Instagram. Facebook and Threads coming soon <span aria-hidden="true" style={{"background": "none", "color": "inherit", "padding": "0"}}>→</span></Link>
    <p className="eyebrow">For creators who&apos;d rather create</p>
    <h1>Schedule posts. Auto-DM every comment. <em className="s mark">Grow on autopilot.</em></h1>
    <p className="lede">Poskoo plans your posts on one calendar, then sends your link to everyone who comments, within seconds. One app, one plan, no copy-paste.</p>
    <div className="ctas"><Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link><Link className="btn btn-line" href="#how">See how it works</Link></div>
    <p className="small">Free plan. No credit card.</p>
    <div className="hero-art"><Image sizes="(max-width: 1140px) 100vw, 1060px" src="/landing/hero.webp" priority width={1400} height={933} alt="A big phone shows a post; a comment saying GUIDE pops out and a paper plane carries a DM with a link. A creator sits on a calendar block and a friend waves with a coffee, with a happy dog and plants below." /></div>
  </header>
  <div className="works"><span>Works with</span><b><i style={{"background": "#E1306C"}}></i>Instagram</b><b><i style={{"background": "#1877F2"}}></i>Facebook <small>Coming soon</small></b><b><i style={{"background": "var(--ink)"}}></i>Threads <small>Coming soon</small></b><span>· Built on the official Meta API</span></div>
</div>

<section id="how"><div className="wrap">
  <div className="head"><p className="eyebrow">Three jobs, one app</p><h2>Everything between <em className="s">posting</em> and <em className="s">getting paid.</em></h2></div>
  <div className="cards">
    <article className="pcard"><Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-schedule.webp" width={900} height={900} loading="lazy" alt="A creator pins post cards onto a weekly calendar next to a smiling alarm clock" /><span className="no">01 / Schedule</span><h3>Plan a month in one sitting.</h3><p>Drag posts onto the calendar and they go live at the time you choose.</p><Link className="go" href="/instagram-scheduler">See the calendar <span aria-hidden="true">→</span></Link></article>
    <article className="pcard"><Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-dm.webp" width={900} height={900} loading="lazy" alt="A relaxed creator on a beanbag while DMs fly out of his phone to followers" /><span className="no">02 / Auto-DM</span><h3>Every comment gets your link.</h3><p>Pick a word like LINK or PRICE. Anyone who comments it gets a DM in seconds, day or night.</p><Link className="go" href="/instagram-auto-dm">Watch it work <span aria-hidden="true">→</span></Link></article>
    <article className="pcard"><Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of contacts with check marks and a rising chart" /><span className="no">03 / Grow</span><h3>Turn followers into leads.</h3><p>Collect emails and phone numbers right in the DM, then see which posts bring them in.</p><Link className="go" href="/instagram-auto-dm/templates">Start collecting <span aria-hidden="true">→</span></Link></article>
  </div>
</div></section>

<section style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="split">
    <div className="art"><Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/problem.webp" width={900} height={900} loading="lazy" alt="A tired creator at night buried under phones and chat-bubble notifications" /></div>
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
      <li><svg width="18" height="18"><use href="#ok"/></svg>Every comment gets a DM within seconds</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>Works 24/7 on posts, Reels and carousels</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>Schedule a month of Instagram posts in one sitting</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>Emails and phone numbers saved as leads</li>
      <li><svg width="18" height="18"><use href="#ok"/></svg>One plan for scheduling, DMs, links and analytics</li></ul></div>
  </div>
</div></section>

<section id="demo" style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="band">
    <div className="copy">
      <p className="eyebrow">How a comment becomes a lead</p>
      <h2>They comment <em className="s mark">LINK.</em> Poskoo does the rest.</h2>
      <p>Choose the keyword, write the message once, and decide what to ask before sending the link.</p>
      <div className="chips"><span className="chip">Keyword triggers</span><span className="chip">Follow-to-unlock</span><span className="chip">Email capture</span><span className="chip">Public reply</span><span className="chip">AI answers</span></div>
    </div>
    <div className="demo" aria-label="Example: a comment, the automatic DM, and the saved lead">
      <div className="ui c1"><div className="who"><span className="av" style={{"background": "var(--peach)"}}></span>riya.makes <span className="t">2m</span></div><p style={{"marginTop": "6px"}}>LINK please! 😍</p></div>
      <svg className="arrow-doodle" viewBox="0 0 70 60" aria-hidden="true"><path d="M8 8c10 30 30 40 52 42" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeDasharray="5 6" strokeLinecap="round"/><path d="M50 42l11 8-13 3" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <div className="ui c2"><div className="who" style={{"color": "#fff"}}>poskoo DM <span className="t" style={{"color": "rgba(255,255,255,.75)"}}>now</span></div><p style={{"marginTop": "6px"}}>Hey Riya! Here&apos;s the guide you asked for. Want my weekly tips too?</p><span className="linkbtn">Open the guide</span></div>
      <div className="ui c3"><div className="ok"><svg width="18" height="18"><use href="#ok"/></svg>New lead saved</div><p className="t" style={{"marginTop": "4px"}}>riya@studio.co · from your Reel</p></div>
    </div>
  </div>
</div></section>

<section id="channels" style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="split rev">
    <div className="copy">
      <p className="eyebrow">Multi-channel scheduling</p>
      <h2>Write once. <em className="s">Post everywhere.</em></h2>
      <p>Schedule Instagram posts from one calendar today. Facebook Pages and Threads scheduling are coming soon.</p>
      <div className="pains">
        <div className="pain"><b>Instagram</b><span>Feed posts, carousels, Reels and Stories</span></div>
        <div className="pain"><b>Facebook</b><span>Coming soon</span></div>
        <div className="pain"><b>Threads</b><span>Coming soon</span></div>
      </div>
    </div>
    <div className="art"><Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/multichannel.webp" width={1400} height={933} loading="lazy" alt="A creator at a laptop sends one post that splits to several phones and screens" /></div>
  </div>
</div></section>

<section style={{"paddingTop": "20px"}}><div className="wrap">
  <div className="split">
    <div className="art"><Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/onesub.webp" width={1400} height={933} loading="lazy" alt="A happy creator in an armchair holds one membership card while app cards and bills fly away" /></div>
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
    <details open><summary>Is it safe for my Instagram account?</summary><p>Yes. Poskoo uses Meta&apos;s official Instagram API. You log in on Instagram&apos;s own screen, we never see your password, and you can disconnect any time.</p></details>
    <details><summary>Which platforms are supported?</summary><p>Instagram scheduling and auto-DMs work today. Facebook Pages and Threads are coming soon.</p></details>
    <details><summary>Do I need a business account?</summary><p>For auto-DMs and insights your Instagram needs to be a professional account (Business or Creator). Switching is free in the Instagram app.</p></details>
    <details><summary>Can I cancel any time?</summary><p>Yes. Paid plans will be month to month with no contract, and you can cancel from settings. Today every account is on the Free plan, so there is nothing to cancel.</p></details>
  </div>
</div></section>

<div className="wrap">
  <div className="cta">
    <div><h2>Your next post could fill your inbox <em className="s">with leads.</em></h2><p>Start free. Connect your account in one tap.</p><Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link></div>
    <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
  </div>
  <footer className="rich">
    <div className="fbrand">
      <Link className="logo" href="/"><svg width="30" height="30" aria-hidden="true"><use href="#mark"/></svg>poskoo<b>.</b></Link>
      <p>Schedule Instagram posts and auto-DM every comment, on the official Meta API.</p>
    </div>
    <nav aria-label="Product">
      <p className="fh">Product</p>
      <ul>
        <li><Link href="/instagram-scheduler">Instagram scheduler</Link></li>
        <li><Link href="/instagram-auto-dm">Instagram auto DM</Link></li>
        <li><Link href="/instagram-auto-dm/templates">Auto-DM templates</Link></li>
        <li><Link href="/pricing">Pricing</Link></li>
      </ul>
    </nav>
    <nav aria-label="Free tools">
      <p className="fh">Free tools</p>
      <ul>
        <li><Link href="/tools/instagram-hashtag-generator">Hashtag generator</Link></li>
        <li><Link href="/tools/instagram-caption-counter">Caption counter</Link></li>
        <li><Link href="/tools/instagram-font-generator">Font generator</Link></li>
        <li><Link href="/tools/instagram-bio-generator">Bio generator</Link></li>
        <li><Link href="/tools/instagram-image-size">Image size guide</Link></li>
        <li><Link href="/tools">All free tools</Link></li>
      </ul>
    </nav>
    <nav aria-label="Compare">
      <p className="fh">Compare</p>
      <ul>
        <li><Link href="/buffer-alternative">Buffer alternative</Link></li>
        <li><Link href="/later-alternative">Later alternative</Link></li>
        <li><Link href="/manychat-alternative">ManyChat alternative</Link></li>
      </ul>
    </nav>
    <nav aria-label="Company">
      <p className="fh">Company</p>
      <ul>
        <li><Link href="/help">Help center</Link></li>
        <li><Link href="/contact">Contact</Link></li>
        <li><Link href="/privacy">Privacy</Link></li>
        <li><Link href="/terms">Terms</Link></li>
        <li><Link href="/data-deletion">Data deletion</Link></li>
      </ul>
    </nav>
    <div className="legal"><span>© 2026 Poskoo · Town Media Labs</span></div>
  </footer>
</div>
</main>; }
