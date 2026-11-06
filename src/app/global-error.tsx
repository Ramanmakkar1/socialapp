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
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ margin: "0 0 12px", fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
            Something went <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontWeight: 400 }}>wrong.</span>
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: "0.9375rem", lineHeight: 1.6, color: "#5f5873" }}>
            We hit an unexpected error. Try again, or return to the homepage.
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
            {/* Root layout may be broken; plain anchor keeps this file dependency-free */}
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
          </div>
        </div>
      </body>
    </html>
  );
}
