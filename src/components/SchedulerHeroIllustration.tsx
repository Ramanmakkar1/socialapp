export function SchedulerHeroIllustration() {
  return (
    <div className="relative mx-auto mt-12 w-full max-w-3xl" aria-hidden="true">
      <svg viewBox="0 0 720 420" className="h-auto w-full" role="presentation">
        <defs>
          <linearGradient id="scheduler-photo" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--brand)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--surface-2)" />
          </linearGradient>
          <filter id="scheduler-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>
        <g filter="url(#scheduler-blur)" opacity="0.12" fill="var(--brand)">
          <circle cx="175" cy="200" r="85" />
          <circle cx="555" cy="240" r="80" />
        </g>

        {/* Calendar: seven columns, three weeks. */}
        <rect x="40" y="88" width="470" height="260" rx="24" fill="var(--surface)" stroke="var(--line)" />
        <text x="62" y="121" fontSize="14" fontFamily="inherit" fontWeight="600" fill="var(--ink)">Your content calendar</text>
        <rect x="60" y="136" width="406" height="30" rx="10" fill="var(--surface-2)" />
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
          <text key={day} x={89 + i * 58} y="155" textAnchor="middle" fontSize="12" fontFamily="inherit" fill="var(--ink-2)">{day}</text>
        ))}
        {Array.from({ length: 21 }, (_, i) => (
          <g key={i}>
            <rect x={60 + (i % 7) * 58} y={174 + Math.floor(i / 7) * 52} width="54" height="48" rx="8" fill="var(--surface-2)" />
            <text x={68 + (i % 7) * 58} y={190 + Math.floor(i / 7) * 52} fontSize="12" fontFamily="inherit" fill="var(--ink-2)">{i + 1}</text>
          </g>
        ))}
        <g fill="var(--brand)">
          <rect x="66" y="199" width="42" height="10" rx="5" opacity="0.4" />
          <rect x="182" y="251" width="42" height="10" rx="5" opacity="0.6" />
          <rect x="356" y="199" width="42" height="10" rx="5" opacity="0.4" />
          <rect x="414" y="303" width="42" height="10" rx="5" opacity="0.6" />
          <rect x="234" y="226" width="54" height="48" rx="8" />
        </g>
        <text x="242" y="242" fontSize="12" fontFamily="inherit" fill="var(--surface)">11</text>
        <g fill="none" stroke="var(--surface)" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="267" cy="255" r="8" />
          <path d="M267 250v5l3 2" />
        </g>

        {/* Keep rotation separate from the animated translation. */}
        <g className="hero-float">
          <g transform="rotate(6 560 220)">
            <rect x="482" y="74" width="170" height="284" rx="26" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
            <rect x="539" y="84" width="56" height="5" rx="2.5" fill="var(--line)" />
            <circle cx="505" cy="108" r="6" fill="var(--brand)" />
            <text x="518" y="112" fontSize="12" fontFamily="inherit" fill="var(--ink)">Your next post</text>
            <rect x="494" y="126" width="146" height="146" rx="12" fill="url(#scheduler-photo)" />
            <circle cx="598" cy="162" r="17" fill="var(--surface)" opacity="0.7" />
            <path d="M494 251l43-58 35 37 25-22 43 43v9a12 12 0 0 1-12 12H506a12 12 0 0 1-12-12Z" fill="var(--brand)" opacity="0.4" />
            <g fill="none" stroke="var(--ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M506 288c-8-8-13 2 0 10 13-8 8-18 0-10Z" />
              <path d="M530 285a7 7 0 0 1 0 14h-6l-3 3v-10a7 7 0 0 1 9-7Z" />
            </g>
            <rect x="496" y="313" width="116" height="5" rx="2.5" fill="var(--ink-2)" opacity="0.6" />
            <rect x="496" y="325" width="85" height="5" rx="2.5" fill="var(--line)" />
            <rect x="542" y="344" width="50" height="4" rx="2" fill="var(--line)" />
          </g>
        </g>

        <g className="hero-float hero-float-delay">
          <rect x="82" y="36" width="196" height="38" rx="19" fill="var(--surface)" stroke="var(--line)" />
          <g fill="none" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="103" cy="55" r="7" />
            <path d="M103 51v4l3 2" />
          </g>
          <text x="118" y="60" fontSize="12" fontFamily="inherit" fill="var(--ink)">Scheduled · 9:00 AM</text>
        </g>
        <g className="hero-float">
          <rect x="302" y="357" width="144" height="38" rx="19" fill="var(--surface)" stroke="var(--line)" />
          <circle cx="322" cy="376" r="5" fill="var(--ok)" />
          <text x="336" y="381" fontSize="12" fontFamily="inherit" fill="var(--ink)">Published ✓</text>
        </g>
        <g className="hero-float hero-float-delay">
          <rect x="508" y="378" width="160" height="34" rx="17" fill="var(--surface)" stroke="var(--line)" />
          <path d="M525 389h12v9h-7l-5 4Z" fill="var(--brand)" />
          <text x="546" y="400" fontSize="12" fontFamily="inherit" fill="var(--ink)">New DM sent</text>
        </g>
        <g fill="var(--brand)">
          <path d="M331 43l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />
          <path d="M681 174l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.6" />
          <path d="M63 367l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

export default SchedulerHeroIllustration;
