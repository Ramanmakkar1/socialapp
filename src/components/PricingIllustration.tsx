import s from "./site.module.css";

/**
 * Illustrated hero scene for the pricing page: a fanned stack of three rounded
 * pricing cards (Free / Pro / Team), a small calendar tile, a chat bubble with a
 * sparkle, and a floating coin/check badge. Inline SVG only — no external images.
 * The badge floats (see .badgeFloat in site.module.css) under reduced-motion-safe CSS.
 */
export function PricingIllustration() {
  return (
    <svg
      viewBox="0 0 480 320"
      width={480}
      height={320}
      aria-hidden="true"
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pi-bg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--poskoo-paper)" />
          <stop offset="1" stopColor="var(--poskoo-band)" />
        </linearGradient>
        <linearGradient id="pi-chat" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--poskoo-violet)" />
          <stop offset="1" stopColor="var(--poskoo-pink)" />
        </linearGradient>
        <linearGradient id="pi-coin" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--poskoo-lime)" />
          <stop offset="1" stopColor="var(--poskoo-green)" />
        </linearGradient>
        <filter id="pi-blur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id="pi-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1e1631" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Soft paper backdrop. */}
      <rect x="0" y="0" width="480" height="320" rx="28" fill="url(#pi-bg)" />
      <g filter="url(#pi-blur)" opacity="0.5">
        <circle cx="120" cy="252" r="70" fill="var(--poskoo-violet)" opacity="0.18" />
        <circle cx="392" cy="86" r="60" fill="var(--poskoo-coral)" opacity="0.18" />
      </g>

      {/* Fanned stack of three pricing cards. */}
      <g filter="url(#pi-shadow)">
        <g transform="rotate(-5 147 173)">
          <rect x="72" y="88" width="150" height="170" rx="22" fill="var(--poskoo-lilac)" />
          <text x="90" y="118" fontSize="15" fontFamily="inherit" fontWeight="700" fill="var(--poskoo-ink)">Team</text>
          <rect x="90" y="130" width="52" height="9" rx="4.5" fill="var(--poskoo-mint)" />
        </g>
        <rect x="104" y="104" width="150" height="170" rx="22" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" strokeWidth="1.5" />
        <text x="122" y="134" fontSize="15" fontFamily="inherit" fontWeight="700" fill="var(--poskoo-ink)">Pro</text>
        <rect x="122" y="146" width="52" height="9" rx="4.5" fill="var(--poskoo-coral)" />
        <g transform="rotate(4 211 205)">
          <rect x="136" y="120" width="150" height="170" rx="22" fill="#ffffff" stroke="var(--poskoo-violet)" strokeWidth="2" />
          <rect x="136" y="120" width="150" height="26" rx="13" fill="var(--poskoo-violet)" opacity="0.12" />
          <text x="154" y="150" fontSize="15" fontFamily="inherit" fontWeight="700" fill="var(--poskoo-ink)">Free</text>
          <rect x="154" y="162" width="62" height="11" rx="5.5" fill="var(--poskoo-violet)" opacity="0.85" />
          <rect x="154" y="190" width="112" height="8" rx="4" fill="var(--poskoo-line)" />
          <rect x="154" y="208" width="92" height="8" rx="4" fill="var(--poskoo-line)" />
          <rect x="154" y="226" width="102" height="8" rx="4" fill="var(--poskoo-line)" />
          <rect x="154" y="250" width="84" height="24" rx="12" fill="var(--poskoo-violet)" />
        </g>
      </g>

      {/* Small calendar tile. */}
      <g filter="url(#pi-shadow)">
        <rect x="330" y="58" width="112" height="104" rx="18" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" strokeWidth="1.5" />
        <rect x="340" y="68" width="92" height="22" rx="11" fill="var(--poskoo-violet)" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={344 + (i % 4) * 24}
            y={100 + Math.floor(i / 4) * 20}
            width="18"
            height="14"
            rx="4"
            fill={i === 6 ? "var(--poskoo-coral)" : "var(--poskoo-band)"}
          />
        ))}
      </g>

      {/* Chat bubble with a sparkle. */}
      <g filter="url(#pi-shadow)">
        <path d="M340 280l-9 17 24-13Z" fill="var(--poskoo-pink)" />
        <rect x="318" y="196" width="132" height="84" rx="20" fill="url(#pi-chat)" />
        <path d="M384 214l6 14 14 6-14 6-6 14-6-14-14-6 14-6Z" fill="#ffffff" />
        <circle cx="420" cy="222" r="4" fill="#ffffff" opacity="0.85" />
      </g>

      {/* Floating coin/check badge (animated). */}
      <g className={s.badgeFloat}>
        <g filter="url(#pi-shadow)">
          <circle cx="252" cy="52" r="26" fill="url(#pi-coin)" stroke="#ffffff" strokeWidth="3" />
          <circle cx="252" cy="52" r="19" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.55" />
          <path d="M242 52l7 7 14-15" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Playful sparkles. */}
      <g fill="var(--poskoo-violet)">
        <path d="M312 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.7" />
        <path d="M452 150l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--poskoo-coral)" opacity="0.7" />
        <path d="M40 150l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.5" />
      </g>
    </svg>
  );
}

export default PricingIllustration;
