"use client";

// global-error renders its own <html> when the root layout fails, so it must stay
// dependency-free: inline styles with the Poskoo token values (no imports).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
          fontFamily: "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#fffcf6",
          color: "#1e1631",
        }}
      >
        <div role="alert" style={{ maxWidth: 480, textAlign: "center" }}>
          {/* Inline illustration keeps this file dependency-free when the root layout fails.
              Token values are inlined because globals.css may not load with the root layout. */}
          <style>{`
            .ge-float, .ge-float-slow, .ge-float-fast { transform-box: fill-box; transform-origin: center; }
            @media (prefers-reduced-motion: no-preference) {
              .ge-float { animation: ge-float 5s ease-in-out infinite; }
              .ge-float-slow { animation: ge-float 7s ease-in-out infinite; animation-delay: -2s; }
              .ge-float-fast { animation: ge-float 4s ease-in-out infinite; animation-delay: -1s; }
              @keyframes ge-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-7px); }
              }
            }
          `}</style>
          <svg
            width="220"
            height="150"
            viewBox="0 0 220 150"
            fill="none"
            aria-hidden="true"
            style={{ display: "block", margin: "0 auto 8px", maxWidth: "100%", height: "auto" }}
          >
            <defs>
              <linearGradient id="ge-sky" x1="0" y1="0" x2="220" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#cdbdf6" stopOpacity="0.55" />
                <stop offset="1" stopColor="#f6b6da" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="ge-plane" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#6b4eff" />
                <stop offset="1" stopColor="#ff6a3d" />
              </linearGradient>
            </defs>
            <ellipse cx="110" cy="78" rx="92" ry="64" fill="url(#ge-sky)" />
            <path d="M22 116C48 92 62 126 92 102C122 78 142 72 170 38" stroke="#6b4eff" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" opacity="0.4" />
            <g className="ge-float">
              <path d="M92 58L166 34L130 96L118 72Z" fill="url(#ge-plane)" />
              <path d="M118 72L166 34L130 96L125 78Z" fill="#e5484d" opacity="0.35" />
              <path d="M118 72L125 78L124 88Z" fill="#1e1631" opacity="0.18" />
              <circle cx="126" cy="66" r="2.5" fill="#1e1631" opacity="0.55" />
              <circle cx="134" cy="63" r="2.5" fill="#1e1631" opacity="0.55" />
              <path d="M126 74C128 71 132 71 134 74" stroke="#1e1631" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
              <text x="140" y="56" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="24" fontWeight="700" fill="#6b4eff">?</text>
            </g>
            <g className="ge-float-slow">
              <path d="M52 40L55 48L63 51L55 54L52 62L49 54L41 51L49 48Z" fill="#ddf46b" />
              <path d="M178 92L180 98L186 100L180 102L178 108L176 102L170 100L176 98Z" fill="#ffcf96" />
              <circle cx="70" cy="92" r="4" fill="#1fa971" opacity="0.8" />
              <circle cx="160" cy="66" r="3" fill="#6b4eff" opacity="0.6" />
            </g>
            <g className="ge-float-fast">
              <path d="M34 74L36 78L40 80L36 82L34 86L32 82L28 80L32 78Z" fill="#ff6a3d" />
              <path d="M196 42L198 46L202 48L198 50L196 54L194 50L190 48L194 46Z" fill="#f6b6da" />
              <circle cx="92" cy="30" r="2.5" fill="#6b4eff" opacity="0.55" />
              <circle cx="150" cy="120" r="3" fill="#ddf46b" />
            </g>
          </svg>
          <h1 style={{ margin: "0 0 12px", fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
            Something went <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontWeight: 400 }}>wrong</span>
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: "0.9375rem", lineHeight: 1.6, color: "#5f5873" }}>
            We hit an unexpected error. Try again, or head to one of these pages.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                padding: "0 20px",
                fontSize: "0.9rem",
                fontWeight: 600,
                border: "none",
                borderRadius: 9999,
                background: "#1e1631",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* Root layout may be broken; plain anchors keep this file dependency-free */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 20px",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: 9999,
                border: "1.5px solid #1e1631",
                background: "transparent",
                color: "#1e1631",
                textDecoration: "none",
              }}
            >
              Back to homepage
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/help"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 20px",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: 9999,
                border: "1.5px solid #1e1631",
                background: "transparent",
                color: "#1e1631",
                textDecoration: "none",
              }}
            >
              Visit help
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 20px",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: 9999,
                border: "1.5px solid #1e1631",
                background: "transparent",
                color: "#1e1631",
                textDecoration: "none",
              }}
            >
              See pricing
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 20px",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: 9999,
                border: "1.5px solid #1e1631",
                background: "transparent",
                color: "#1e1631",
                textDecoration: "none",
              }}
            >
              Contact us
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
