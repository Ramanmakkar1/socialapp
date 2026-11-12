import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import s from "@/components/site.module.css";

export const metadata: Metadata = {
  title: { absolute: `Contact ${BRAND.name} Support: Help With Scheduling and Auto-DMs` },
  description: `Questions about scheduling posts, Instagram auto-DM rules or your ${BRAND.name} account? Email the support team or browse step-by-step help guides.`,
  alternates: { canonical: "/contact" },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: `Contact ${BRAND.name} support`,
  url: `${BRAND.url}/contact`,
  mainEntity: {
    "@type": "Organization",
    name: BRAND.company,
    url: BRAND.url,
    email: BRAND.supportEmail,
  },
};

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Contact", url: `${BRAND.url}/contact` },
]);

export default function ContactPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(contactJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">We reply within one business day</span>
          <h1>
            Contact <em className="s">support</em>
          </h1>
          <p className="lede">
            Need a hand with scheduling, Instagram auto-DM or your account? Choose the support option that fits.
          </p>
          <div className="ctas">
            <a className="btn btn-dark" href={`mailto:${BRAND.supportEmail}`}>
              Email us <span aria-hidden="true">→</span>
            </a>
            <Link className="btn btn-line" href="/help">
              Help center
            </Link>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="help" label="A creator reads on a giant open book under a lightbulb and a signpost" /></div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Support options</p>
              <h2>Need a hand?</h2>
              <div className="pains">
                <div className="pain">
                  <b>Email us</b>
                  <span>
                    <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>
                      {BRAND.supportEmail}
                    </a>{" "}
                    · We reply within one business day
                  </span>
                </div>
                <div className="pain">
                  <b>Help center</b>
                  <span>
                    Browse{" "}
                    <Link className={s.vlink} href="/help">
                      step-by-step help guides
                    </Link>{" "}
                    or follow the{" "}
                    <Link className={s.vlink} href="/help/getting-started">
                      getting started guide
                    </Link>
                    .
                  </span>
                </div>
                <div className="pain">
                  <b>Auto-DM not working?</b>
                  <span>
                    <Link className={s.vlink} href="/help/instagram-auto-dm-not-working">
                      Troubleshoot Instagram auto-DMs
                    </Link>{" "}
                    with our step-by-step checklist.
                  </span>
                </div>
                <div className="pain" id="password-reset">
                  <b>Forgot your password?</b>
                  <span>
                    Email us from the address you signed up with and we will help you get back into your account.{" "}
                    <a
                      className={s.vlink}
                      href={`mailto:${BRAND.supportEmail}?subject=${encodeURIComponent("Password reset")}`}
                    >
                      Email support
                    </a>
                  </span>
                </div>
              </div>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-dm.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A relaxed creator on a beanbag while DMs fly out of his phone to followers"
              />
            </div>
          </div>
        </div>
      </section>

      <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
        For details about how {BRAND.company} handles your information, see our{" "}
        <Link className={s.vlink} href="/privacy">
          Privacy Policy
        </Link>
        ,{" "}
        <Link className={s.vlink} href="/terms">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className={s.vlink} href="/data-deletion">
          data deletion instructions
        </Link>
        .
      </p>
    </PublicShell>
  );
}
