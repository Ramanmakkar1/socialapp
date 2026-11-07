export default function CompareHeroIllustration({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        role="img"
        aria-label="A small scheduler-only card on the left, with a sparkle trail leading to a larger Poskoo card that schedules a post, auto-DMs a keyword commenter and captures a new lead"
        viewBox="0 0 480 300"
        className="h-auto w-full max-w-full"
      >
        <defs>
          <linearGradient id="cmp-card" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--brand)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--brand-2)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="cmp-post" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--brand)" stopOpacity="0.32" />
            <stop offset="1" stopColor="var(--brand-2)" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* Left: faded "scheduler only" card with a calendar grid */}
        <g opacity="0.55">
          <rect x="28" y="96" width="120" height="108" rx="14" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
          <rect x="40" y="108" width="52" height="8" rx="4" fill="var(--line)" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={40 + (i % 4) * 26} y={128 + Math.floor(i / 4) * 24} width="20" height="18" rx="4" fill="var(--surface-2)" />
          ))}
          <rect x="66" y="152" width="20" height="18" rx="4" fill="var(--brand)" opacity="0.4" />
          <text x="88" y="196" textAnchor="middle" fontSize="11" fontFamily="inherit" fill="var(--ink-2)">Scheduler only</text>
        </g>

        {/* Sparkle trail / arrow from the small card to the big one */}
        <path d="M158 150c22-14 40-14 60 0" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeDasharray="1 8" strokeLinecap="round" />
        <path d="M216 150l8-5-3 8 3 8-8-5Z" fill="var(--brand)" />
        <g fill="var(--brand-2)">
          <path d="M180 120l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.7" />
          <path d="M200 182l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" opacity="0.5" />
        </g>

        {/* Right: bigger, brighter Poskoo card */}
        <rect x="232" y="56" width="220" height="192" rx="18" fill="url(#cmp-card)" stroke="var(--brand)" strokeWidth="2" />
        <circle cx="250" cy="76" r="5" fill="var(--brand)" />
        <rect x="262" y="72" width="70" height="8" rx="4" fill="var(--ink-2)" opacity="0.7" />
        {/* scheduled post */}
        <rect x="248" y="90" width="188" height="86" rx="10" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
        <rect x="258" y="100" width="66" height="66" rx="8" fill="url(#cmp-post)" />
        <circle cx="300" cy="124" r="9" fill="var(--surface)" opacity="0.7" />
        <path d="M258 156l20-22 16 17 12-10 20 20v6a8 8 0 0 1-8 8h-52a8 8 0 0 1-8-8Z" fill="var(--brand)" opacity="0.35" />
        <rect x="334" y="104" width="88" height="8" rx="4" fill="var(--ink-2)" opacity="0.7" />
        <rect x="334" y="120" width="70" height="7" rx="3.5" fill="var(--line)" />
        <rect x="334" y="134" width="80" height="7" rx="3.5" fill="var(--line)" />
        <rect x="334" y="148" width="52" height="7" rx="3.5" fill="var(--line)" />
        {/* comment bubble with the keyword */}
        <path d="M246 186h74a10 10 0 0 1 10 10v14a10 10 0 0 1-10 10h-40l-9 7v-7h-25a10 10 0 0 1-10-10v-14a10 10 0 0 1 10-10Z" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
        <rect x="254" y="196" width="46" height="14" rx="7" fill="var(--brand-2)" />
        <text x="277" y="206" textAnchor="middle" fontSize="10" fontFamily="inherit" fontWeight="700" fill="var(--surface)">LINK</text>
        {/* auto-DM chat bubble (floating chip 1) */}
        <g className="cmp-float">
          <path d="M336 182h88a11 11 0 0 1 11 11v16a11 11 0 0 1-11 11h-34l-9 7v-7h-45a11 11 0 0 1-11-11v-16a11 11 0 0 1 11-11Z" fill="var(--brand-2)" />
          <rect x="348" y="192" width="60" height="7" rx="3.5" fill="var(--surface)" opacity="0.9" />
          <rect x="348" y="204" width="44" height="6" rx="3" fill="var(--surface)" opacity="0.7" />
        </g>
        {/* New lead chip (floating chip 2) */}
        <g className="cmp-float cmp-float-delay">
          <rect x="352" y="238" width="96" height="30" rx="15" fill="var(--brand)" />
          <circle cx="370" cy="253" r="5" fill="var(--surface)" />
          <text x="382" y="257" fontSize="12" fontFamily="inherit" fontWeight="700" fill="var(--surface)">New lead</text>
        </g>

        {/* sparkles + floating chat dots */}
        <g fill="var(--brand)">
          <path d="M452 60l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.7" />
          <path d="M236 36l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" opacity="0.5" />
        </g>
        <g fill="var(--brand-2)">
          <circle cx="460" cy="120" r="4" opacity="0.6" />
          <circle cx="448" cy="150" r="3" opacity="0.5" />
          <circle cx="228" cy="262" r="3" opacity="0.5" />
        </g>
      </svg>
      <style>{`
        @media (prefers-reduced-motion: no-preference){
          @keyframes cmp-float {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
          .cmp-float{animation:cmp-float 3.5s ease-in-out infinite}
          .cmp-float-delay{animation-delay:1.2s}
        }
      `}</style>
    </div>
  );
}
