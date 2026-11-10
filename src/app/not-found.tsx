import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PublicShell>
      <header className="hero">
        <style>{`
          .nf-art { display: block; width: 100%; max-width: 240px; height: auto; margin: 0 auto 18px; }
          .nf-float, .nf-float-slow, .nf-float-fast { transform-box: fill-box; transform-origin: center; }
          .nf-float { animation: nf-float 5s ease-in-out infinite; }
          .nf-float-slow { animation: nf-float 7s ease-in-out infinite; animation-delay: -2s; }
          .nf-float-fast { animation: nf-float 4s ease-in-out infinite; animation-delay: -1s; }
          @keyframes nf-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .nf-float, .nf-float-slow, .nf-float-fast { animation: none; }
          }
        `}</style>
        <svg
          className="nf-art"
          width="240"
          height="200"
          viewBox="0 0 240 200"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nf-sky" x1="0" y1="0" x2="240" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--poskoo-lilac)" stopOpacity="0.6" />
              <stop offset="1" stopColor="var(--poskoo-pink)" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="nf-screen" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="var(--poskoo-card)" />
              <stop offset="1" stopColor="var(--poskoo-band)" />
            </linearGradient>
          </defs>

          <ellipse cx="120" cy="104" rx="104" ry="88" fill="url(#nf-sky)" />

          <path
            d="M26 152C58 122 78 172 118 142C158 112 186 104 214 58"
            stroke="var(--poskoo-violet)"
            strokeWidth="2.5"
            strokeDasharray="6 7"
            strokeLinecap="round"
            opacity="0.5"
          />

          <g className="nf-float">
            <rect x="80" y="54" width="80" height="116" rx="18" fill="var(--poskoo-card)" stroke="var(--poskoo-violet)" strokeWidth="3" />
            <rect x="88" y="66" width="64" height="92" rx="10" fill="url(#nf-screen)" />
            <rect x="108" y="58" width="24" height="4" rx="2" fill="var(--poskoo-line)" />

            <rect x="96" y="78" width="40" height="24" rx="8" fill="var(--poskoo-violet)" />
            <path d="M104 101L104 109L112 101Z" fill="var(--poskoo-violet)" />
            <rect x="102" y="85" width="24" height="3" rx="1.5" fill="var(--poskoo-card)" opacity="0.9" />
            <rect x="102" y="92" width="16" height="3" rx="1.5" fill="var(--poskoo-card)" opacity="0.7" />

            <rect x="104" y="112" width="40" height="20" rx="8" fill="var(--poskoo-mint)" />
            <path d="M136 131L136 138L128 131Z" fill="var(--poskoo-mint)" />
            <rect x="110" y="118" width="22" height="3" rx="1.5" fill="var(--poskoo-ink)" opacity="0.55" />
            <rect x="110" y="124" width="14" height="3" rx="1.5" fill="var(--poskoo-ink)" opacity="0.35" />
          </g>

          <g className="nf-float-slow">
            <path d="M168 46L208 28L190 68L183 51Z" fill="var(--poskoo-coral)" />
            <path d="M183 51L208 28L190 68L186 55Z" fill="var(--poskoo-red)" opacity="0.55" />
            <path d="M150 62C158 56 164 52 170 48" stroke="var(--poskoo-coral)" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" opacity="0.7" />
          </g>

          <g className="nf-float-fast">
            <path d="M52 58L55 66L63 69L55 72L52 80L49 72L41 69L49 66Z" fill="var(--poskoo-lime)" />
            <path d="M198 116L200 121L205 123L200 125L198 130L196 125L191 123L196 121Z" fill="var(--poskoo-peach)" />
            <circle cx="64" cy="120" r="4" fill="var(--poskoo-green)" opacity="0.8" />
            <circle cx="186" cy="86" r="3" fill="var(--poskoo-violet)" opacity="0.6" />
          </g>
        </svg>
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
        <div className="hero-art" style={{ maxWidth: 620 }}>
          <Image
            sizes="(max-width: 660px) 100vw, 620px"
            src="/illustrations/not-found.webp"
            width={1536}
            height={1024}
            alt="A puzzled hiker checks a map while a dog sniffs out the path with a magnifying glass."
          />
        </div>
      </header>
    </PublicShell>
  );
}
