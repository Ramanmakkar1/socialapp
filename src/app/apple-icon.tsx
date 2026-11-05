import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Poskoo mark (same as the landing-page logo) on the landing "paper" background.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFCF6",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 40 40" aria-hidden="true">
          <path
            d="M20 3c9.4 0 17 6.7 17 15.4S29.4 34 20 34c-1.6 0-3.1-.2-4.6-.5L8 37.5l1.7-6.6C5.6 28.1 3 23.6 3 18.4 3 9.7 10.6 3 20 3z"
            fill="#FF6A3D"
            stroke="#1E1631"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="14.5" cy="18.5" r="2.4" fill="#1E1631" />
          <circle cx="25.5" cy="18.5" r="2.4" fill="#1E1631" />
          <path d="M16 24c2.4 2 5.6 2 8 0" stroke="#1E1631" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
