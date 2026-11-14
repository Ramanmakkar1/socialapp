import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { PageArt } from "@/components/PageArt";
import s from "@/components/site.module.css";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}>
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill"><span>404</span>Page not found</span>
          <h1>This page took a wrong turn</h1>
          <p className="lede">The link may be old or mistyped. Here is where you can go next.</p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/">Back to home</Link>
            <Link className="btn btn-line" href="/pricing">See pricing</Link>
            <Link className="btn btn-line" href="/help">Visit help</Link>
            <Link className="btn btn-line" href="/contact">Contact us</Link>
          </div>
        </div>
        <div className="hero-art"><PageArt /></div>
      </header>
      <section aria-labelledby="nf-popular">
        <h2 id="nf-popular">Popular pages</h2>
        <ul className={s.nfGrid}>
          <li>
            <Link className={s.nfCard} href="/instagram-scheduler">
              <b>Instagram scheduler</b>
              <span>Plan and publish Instagram posts on a calendar.</span>
            </Link>
          </li>
          <li>
            <Link className={s.nfCard} href="/instagram-auto-dm">
              <b>Instagram comment-to-DM automation</b>
              <span>Turn comments into automatic DMs with keyword rules.</span>
            </Link>
          </li>
          <li>
            <Link className={s.nfCard} href="/tools">
              <b>Free social media tools</b>
              <span>Captions, hashtags, size checkers and more, no signup.</span>
            </Link>
          </li>
          <li>
            <Link className={s.nfCard} href="/help">
              <b>Help center</b>
              <span>Answers to common questions about Poskoo.</span>
            </Link>
          </li>
          <li>
            <Link className={s.nfCard} href="/features">
              <b>All features</b>
              <span>See everything you can schedule and automate.</span>
            </Link>
          </li>
          <li>
            <Link className={s.nfCard} href="/signup">
              <b>Create a free account</b>
              <span>Start scheduling and automating in a few minutes.</span>
            </Link>
          </li>
        </ul>
      </section>
    </PublicShell>
  );
}
