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
          </div>
        </div>
        <div className="hero-art"><PageArt /></div>
      </header>
    </PublicShell>
  );
}
