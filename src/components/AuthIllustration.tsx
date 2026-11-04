export default function AuthIllustration({ mode }: { mode: "login" | "signup" }) {
  const gradientId = `auth-post-${mode}`;

  return (
    <aside
      className="rounded-2xl border border-line p-8"
      style={{
        background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 12%, var(--surface)), color-mix(in srgb, var(--brand-2) 10%, var(--surface)))",
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 360 300" className="mx-auto h-auto w-full max-w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--brand)" />
            <stop offset="1" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
        <circle cx="182" cy="148" r="122" fill="var(--surface-2)" />
        <ellipse cx="183" cy="270" rx="110" ry="9" fill="var(--line)" />
        <path d="m51 76 4-11 4 11 11 4-11 4-4 11-4-11-11-4 11-4Zm254 130 4-10 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill="var(--brand-2)" />
        <path d="M291 44v12m-6-6h12M57 217v10m-5-5h10" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
        {/* A post ready to go, framed by a rounded phone. */}
        <rect x="108" y="29" width="146" height="232" rx="24" fill="var(--surface)" stroke="var(--line)" strokeWidth="3" />
        <path d="M163 42h36" stroke="var(--line)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="130" cy="66" r="7" fill="var(--brand-2)" />
        <path d="M145 63h57m-57 8h34" stroke="var(--line)" strokeWidth="4" strokeLinecap="round" />
        <rect x="121" y="87" width="120" height="102" rx="12" fill={`url(#${gradientId})`} />
        <circle cx="211" cy="111" r="12" fill="white" fillOpacity="0.8" />
        <path d="m121 164 35-42 34 36 19-21 32 34v6a12 12 0 0 1-12 12h-96a12 12 0 0 1-12-12Z" fill="white" fillOpacity="0.3" />
        <path d="M128 205h93m-93 10h68" stroke="var(--line)" strokeWidth="5" strokeLinecap="round" />
        <rect x="128" y="231" width="65" height="14" rx="7" fill="var(--surface-2)" />
        <path d="m204 236 4 4 8-9" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* The calendar highlights one scheduled day. */}
        <rect x="29" y="127" width="111" height="104" rx="14" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <path d="M29 141a14 14 0 0 1 14-14h83a14 14 0 0 1 14 14v16H29Z" fill="var(--brand)" />
        <path d="M54 120v15m60-15v15" stroke="var(--brand-2)" strokeWidth="5" strokeLinecap="round" />
        <path d="M48 173h9m18 0h9m18 0h9m-63 18h9m18 0h9m18 0h9m-63 18h9m18 0h9m18 0h9" stroke="var(--line)" strokeWidth="5" strokeLinecap="round" />
        <rect x="69" y="182" width="22" height="20" rx="6" fill="var(--brand-2)" />
        <path d="m75 192 3 3 6-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <g className="auth-float">
          <path d="M246 68h64a16 16 0 0 1 16 16v23a16 16 0 0 1-16 16h-35l-16 13v-13h-13a16 16 0 0 1-16-16V84a16 16 0 0 1 16-16Z" fill="var(--brand)" />
          <text x="278" y="102" textAnchor="middle" fill="white" fontSize="17" fontWeight="700" fontFamily="inherit">LINK</text>
          <path d="M257 161h52a14 14 0 0 1 14 14v17a14 14 0 0 1-14 14h-12v11l-14-11h-26a14 14 0 0 1-14-14v-17a14 14 0 0 1 14-14Z" fill="var(--brand-2)" />
          <text x="283" y="190" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="inherit">DM</text>
        </g>
      </svg>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">
        {mode === "signup" ? "Start posting and replying on autopilot" : "Welcome back to your calendar and inbox"}
      </h2>
      <ul className="mt-5 list-disc space-y-3 pl-5 text-sm text-ink-2 marker:text-brand">
        <li>Schedule posts on a week or month calendar</li>
        <li>Auto-DM people who comment a keyword</li>
        <li>Capture leads from your DMs</li>
      </ul>
      <style>{`
        @keyframes auth-float {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .auth-float{animation:auth-float 4s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){.auth-float{animation:none}}
      `}</style>
    </aside>
  );
}
