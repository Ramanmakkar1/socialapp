import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PublicShell>
      <header className="hero">
        <span className="pill"><span>404</span>This page wandered off</span>
        <p className="eyebrow">Page not found</p>
        <h1>
          The link may be outdated, <em className="s">or this page moved.</em>
        </h1>
        <p className="lede">Let&apos;s get you back on track with Poskoo.</p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/">Go to homepage</Link>
          <Link className="btn btn-line" href="/help">Visit help</Link>
          <Link className="btn btn-line" href="/contact">Contact support</Link>
        </div>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 960px) 100vw, 520px"
            src="/landing/problem.webp"
            width={900}
            height={900}
            alt="A tired creator at night buried under phones and chat-bubble notifications"
          />
        </div>
      </header>
    </PublicShell>
  );
}
