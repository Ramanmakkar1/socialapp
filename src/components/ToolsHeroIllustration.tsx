export default function ToolsHeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Illustration of free Instagram tools: caption counter, hashtag chips and an image crop frame"
      className="h-auto w-full max-w-full"
      fontFamily="inherit"
    >
      <defs>
        <linearGradient id="tools-hero-blob" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--brand)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--brand-2)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="tools-hero-post" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
      <path d="M72 94C111 29 202 16 265 37c68 23 146 15 164 91 19 81-33 169-109 188-77 19-114 1-177-9C64 295 23 175 72 94Z" fill="url(#tools-hero-blob)" />
      <ellipse cx="244" cy="329" rx="132" ry="10" fill="var(--line)" fillOpacity="0.6" />

      {/* A feed post inside a phone. */}
      <rect x="151" y="31" width="178" height="288" rx="28" fill="var(--surface)" stroke="var(--line)" strokeWidth="3" />
      <path d="M220 45h40" stroke="var(--line)" strokeWidth="5" strokeLinecap="round" />
      <rect x="164" y="61" width="152" height="234" rx="14" fill="var(--surface-2)" />
      <circle cx="182" cy="79" r="8" fill="var(--brand-2)" />
      <path d="M199 76h58m-58 8h35m39-4h15" stroke="var(--line)" strokeWidth="4" strokeLinecap="round" />
      <rect x="172" y="98" width="136" height="143" rx="10" fill="url(#tools-hero-post)" />
      <circle cx="274" cy="126" r="14" fill="white" fillOpacity="0.8" />
      <path d="m172 203 40-53 42 46 23-27 31 38v24a10 10 0 0 1-10 10H182a10 10 0 0 1-10-10Z" fill="white" fillOpacity="0.3" />
      <path d="M182 254c-9-8-15 3 0 11 15-8 9-19 0-11Zm22-2h12v10h-7l-5 4Z" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M176 278h103m-103 8h73" stroke="var(--line)" strokeWidth="4" strokeLinecap="round" />
      <path d="M224 307h32" stroke="var(--line)" strokeWidth="4" strokeLinecap="round" />

      {/* Caption length and progress. */}
      <g className="tools-float" style={{ animationDelay: "-1s" }}>
        <rect x="26" y="104" width="196" height="64" rx="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <text x="42" y="130" fill="var(--ink)" fontSize="13" fontWeight="600">caption 1,240 / 2,200</text>
        <rect x="42" y="143" width="164" height="6" rx="3" fill="var(--surface-2)" />
        <rect x="42" y="143" width="92" height="6" rx="3" fill="var(--brand)" />
      </g>

      {/* A portrait crop with a true 4:5 aspect ratio. */}
      <g className="tools-float" style={{ animationDelay: "-2.5s" }}>
        <rect x="300" y="157" width="144" height="155" rx="18" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <rect x="324" y="170" width="96" height="120" rx="8" fill="var(--surface-2)" stroke="var(--brand)" strokeWidth="2" strokeDasharray="6 5" />
        <path d="M356 170v120m32-120v120m-64-80h96m-96 40h96" stroke="var(--line)" />
        <rect x="350" y="219" width="44" height="24" rx="12" fill="var(--surface)" />
        <text x="372" y="236" textAnchor="middle" fill="var(--brand)" fontSize="14" fontWeight="700">4:5</text>
      </g>

      {/* Three hashtag chips, kept together in a row. */}
      <g className="tools-float" style={{ animationDelay: "-4s" }}>
        <rect x="35" y="254" width="48" height="34" rx="17" fill="var(--brand)" />
        <rect x="89" y="254" width="48" height="34" rx="17" fill="var(--brand-2)" />
        <rect x="143" y="254" width="48" height="34" rx="17" fill="var(--brand)" />
        <g fill="white" fontSize="22" fontWeight="700" textAnchor="middle">
          <text x="59" y="278">#</text>
          <text x="113" y="278">#</text>
          <text x="167" y="278">#</text>
        </g>
      </g>
      <path d="m104 53 4 11 11 4-11 4-4 11-4-11-11-4 11-4Zm271 38 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" fill="var(--brand-2)" />
      <path d="M62 205v12m-6-6h12M355 42v12m-6-6h12" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
      <style>{`
        @keyframes tools-float {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .tools-float{animation:tools-float 5s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){.tools-float{animation:none}}
      `}</style>
    </svg>
  );
}
