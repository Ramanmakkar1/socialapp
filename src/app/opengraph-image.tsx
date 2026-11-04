import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name}: social media scheduler and Instagram auto-DM`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          color: "white",
          background:
            "radial-gradient(ellipse at 82% 8%, rgba(255,79,163,0.42), transparent 42%), radial-gradient(ellipse at 14% 88%, rgba(109,74,255,0.55), transparent 45%), #0d0d14",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 34 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              background: "linear-gradient(135deg, #6d4aff, #ff4fa3)",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                fill="white"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -3 }}>{BRAND.name}</div>
        </div>
        <div style={{ display: "flex", maxWidth: 1000, fontSize: 40, lineHeight: 1.25, color: "#e8e5f2" }}>
          {BRAND.tagline}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 48 }}>
          {[
            { label: "Instagram", color: "#b54cff" },
            { label: "Facebook", color: "#5578ff" },
            { label: "Threads", color: "#ff4fa3" },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                padding: "12px 22px",
                background: "rgba(255,255,255,0.08)",
                color,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
