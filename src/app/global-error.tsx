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
          {/* Inline illustration keeps this file dependency-free when the root layout fails. */}
          <svg
            width="220"
            height="150"
            viewBox="0 0 220 150"
            fill="none"
            aria-hidden="true"
            style={{ display: "block", margin: "0 auto 8px", maxWidth: "100%", height: "auto" }}
          >
            <ellipse cx="110" cy="78" rx="92" ry="64" fill="#cdbdf6" fillOpacity="0.45" />
            <path d="M22 116C48 92 62 126 92 102C122 78 142 72 170 38" stroke="#6b4eff" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" opacity="0.4" />
            <path d="M92 58L166 34L130 96L118 72Z" fill="#6b4eff" />
            <path d="M118 72L166 34L130 96L125 78Z" fill="#ff6a3d" opacity="0.35" />
            <text x="136" y="56" textAnchor="middle" fontFamily="Georgia, serif" fontSize="24" fontWeight="700" fill="#6b4eff">?</text>
            <path d="M52 40L55 48L63 51L55 54L52 62L49 54L41 51L49 48Z" fill="#ddf46b" />
            <path d="M178 92L180 98L186 100L180 102L178 108L176 102L170 100L176 98Z" fill="#f6b6da" />
            <circle cx="70" cy="92" r="4" fill="#1fa971" opacity="0.8" />
            <circle cx="160" cy="66" r="3" fill="#6b4eff" opacity="0.6" />
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
