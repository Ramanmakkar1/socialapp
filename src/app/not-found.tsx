import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <PublicShell>
      <header className="hero">
        <style>{`
          .nf-art { display: block; width: 100%; max-width: 360px; height: auto; margin: 0 auto 8px; }
          .nf-float, .nf-float-slow, .nf-float-fast { transform-box: fill-box; transform-origin: center; }
          @media (prefers-reduced-motion: no-preference) {
            .nf-float { animation: nf-float 5s ease-in-out infinite; }
            .nf-float-slow { animation: nf-float 7s ease-in-out infinite; animation-delay: -2s; }
            .nf-float-fast { animation: nf-float 4s ease-in-out infinite; animation-delay: -1s; }
            @keyframes nf-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-7px); }
            }
          }
        `}</style>
        <svg
          className="nf-art"
          width="360"
          height="260"
          viewBox="0 0 360 260"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nf-sky" x1="0" y1="0" x2="360" y2="260" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--poskoo-lilac)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--poskoo-pink)" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="nf-plane" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="var(--poskoo-violet)" />
              <stop offset="1" stopColor="var(--poskoo-coral)" />
            </linearGradient>
          </defs>

          <ellipse cx="180" cy="132" rx="150" ry="112" fill="url(#nf-sky)" />

          <path
            d="M34 196C74 160 96 214 142 178C188 142 220 132 262 74"
            stroke="var(--poskoo-violet)"
            strokeWidth="3"
            strokeDasharray="7 9"
            strokeLinecap="round"
            opacity="0.45"
          />

          <g className="nf-float">
            <path d="M150 96L262 58L206 150L188 112Z" fill="url(#nf-plane)" />
            <path d="M188 112L262 58L206 150L198 120Z" fill="var(--poskoo-red)" opacity="0.35" />
            <path d="M188 112L198 120L196 140Z" fill="var(--poskoo-ink)" opacity="0.18" />
            <circle cx="176" cy="104" r="4" fill="var(--poskoo-ink)" opacity="0.55" />
            <circle cx="190" cy="100" r="4" fill="var(--poskoo-ink)" opacity="0.55" />
            <path d="M176 116C180 111 186 111 190 116" stroke="var(--poskoo-ink)" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          </g>

          <g className="nf-float-slow">
            <path d="M84 62L88 72L98 76L88 80L84 90L80 80L70 76L80 72Z" fill="var(--poskoo-lime)" />
            <path d="M286 150L289 157L296 160L289 163L286 170L283 163L276 160L283 157Z" fill="var(--poskoo-peach)" />
            <circle cx="112" cy="150" r="5" fill="var(--poskoo-green)" opacity="0.8" />
            <circle cx="270" cy="104" r="4" fill="var(--poskoo-violet)" opacity="0.6" />
          </g>

          <g className="nf-float-fast">
            <path d="M60 120L63 128L71 131L63 134L60 142L57 134L49 131L57 128Z" fill="var(--poskoo-coral)" />
            <path d="M300 60L302 66L308 68L302 70L300 76L298 70L292 68L298 66Z" fill="var(--poskoo-pink)" />
            <circle cx="140" cy="52" r="3.5" fill="var(--poskoo-violet)" opacity="0.55" />
            <circle cx="240" cy="196" r="4" fill="var(--poskoo-lime)" />
          </g>
        </svg>
        <span className="pill"><span>404</span>Page not found</span>
        <h1>This page wandered off</h1>
        <p className="lede">The link may be old, but everything else is right where you left it.</p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/">Back to home</Link>
          <Link className="btn btn-line" href="/signup">Start free</Link>
        </div>
      </header>
    </PublicShell>
  );
}
