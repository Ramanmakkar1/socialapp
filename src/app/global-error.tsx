"use client";

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
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: "#f8f9fb",
          color: "#1a1d26",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ margin: "0 0 24px", fontSize: "0.9375rem", lineHeight: 1.6, color: "#5c6370" }}>
            We hit an unexpected error. Try again, or return to the homepage.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                padding: "0 20px",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                borderRadius: 9999,
                background: "#6366f1",
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
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: 9999,
                border: "1px solid #d4d8e0",
                background: "#fff",
                color: "#1a1d26",
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
