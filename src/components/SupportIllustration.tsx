export default function SupportIllustration({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        role="img"
        aria-label="Friendly support person answering questions"
        viewBox="0 0 320 240"
        className="h-auto w-full max-w-full"
      >
        <defs>
          <linearGradient id="support-blob" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--brand)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--brand-2)" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="128" rx="118" ry="88" fill="url(#support-blob)" />
        <path d="m48 52 3-8 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm218 24 3-7 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--brand-2)" />
        <path d="M278 168v8m-4-4h8M42 178v6m-3-3h6" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="88" y="148" width="144" height="12" rx="4" fill="var(--line)" />
        <rect x="96" y="118" width="128" height="72" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <rect x="104" y="126" width="112" height="52" rx="4" fill="var(--surface-2)" />
        <path d="M112 148h40m-40 8h28" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="196" cy="152" r="6" fill="var(--brand)" fillOpacity="0.35" />
        <ellipse cx="160" cy="228" rx="72" ry="6" fill="var(--line)" />
        <rect x="118" y="168" width="28" height="36" rx="10" fill="var(--brand)" fillOpacity="0.85" />
        <circle cx="132" cy="98" r="22" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <circle cx="124" cy="94" r="3" fill="var(--ink)" />
        <circle cx="140" cy="94" r="3" fill="var(--ink)" />
        <path d="M126 104q6 4 12 0" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
        <path d="M108 118h48a8 8 0 0 1 8 8v6H100v-6a8 8 0 0 1 8-8Z" fill="var(--brand-2)" />
        <path d="M228 88h36a12 12 0 0 1 12 12v8l-8-6h-40a12 12 0 0 1-12-12v-2a12 12 0 0 1 12-12Z" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <path d="M236 96h20m-20 8h14" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M248 104h8v8h-8Z" fill="var(--brand-2)" fillOpacity="0.4" />
        <path d="M250 106h4v4h-4Z" fill="var(--brand-2)" />
        <g className="support-float">
          <path d="M52 96h44a14 14 0 0 1 14 14v16a14 14 0 0 1-14 14H66l-10 8v-8H52a14 14 0 0 1-14-14v-16a14 14 0 0 1 14-14Z" fill="var(--brand)" />
          <text x="74" y="118" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="inherit">?</text>
          <path d="M234 52h48a12 12 0 0 1 12 12v14a12 12 0 0 1-12 12h-14l-9 7v-7h-25a12 12 0 0 1-12-12V64a12 12 0 0 1 12-12Z" fill="var(--brand-2)" />
          <path d="m252 68 4 4 8-9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <style>{`
        @keyframes support-float {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .support-float{animation:support-float 3.5s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){.support-float{animation:none}}
      `}</style>
    </div>
  );
}
