type HelpGuideVariant = "start" | "troubleshoot" | "schedule" | "connect" | "autodm" | "story";

const LABELS: Record<HelpGuideVariant, string> = {
  start: "Help guide checklist with a launch rocket",
  troubleshoot: "Help guide checklist with a wrench and chat bubble",
  schedule: "Help guide checklist with a calendar and clock",
  connect: "Help guide checklist with two linked account circles",
  autodm: "Help guide checklist with a comment turning into a direct message",
  story: "Help guide checklist with a story ring and a reply turning into a direct message",
};

function VariantIcon({ variant }: { variant: HelpGuideVariant }) {
  switch (variant) {
    case "start":
      return (
        <g>
          <path d="M258 44c8 8 12 20 12 30 0 6-2 12-4 16h-16c-2-4-4-10-4-16 0-10 4-22 12-30Z" fill="var(--brand)" />
          <circle cx="258" cy="70" r="5" fill="var(--surface)" />
          <path d="M246 78l-9 13 11-5Z" fill="var(--brand-2)" />
          <path d="M270 78l9 13-11-5Z" fill="var(--brand-2)" />
          <path d="M254 92h8l-4 10Z" fill="var(--brand-2)" />
        </g>
      );
    case "troubleshoot":
      return (
        <g>
          <path d="M236 52h36a10 10 0 0 1 10 10v10a10 10 0 0 1-10 10h-12l-8 6v-6h-16a10 10 0 0 1-10-10V62a10 10 0 0 1 10-10Z" fill="var(--brand)" />
          <circle cx="250" cy="62" r="5" fill="var(--surface)" />
          <path d="m254 66 8 10" stroke="var(--surface)" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "schedule":
      return (
        <g>
          <path d="M244 48v8M264 48v8" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="234" y="52" width="40" height="36" rx="6" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
          <path d="M234 64v-6a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v6Z" fill="var(--brand)" />
          <path d="M242 74h10M242 82h14" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="268" cy="84" r="10" fill="var(--brand-2)" />
          <path d="M268 84v-5m0 5 4 2" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "connect":
      return (
        <g>
          <circle cx="244" cy="70" r="14" fill="none" stroke="var(--brand)" strokeWidth="5" />
          <circle cx="272" cy="70" r="14" fill="none" stroke="var(--brand-2)" strokeWidth="5" />
        </g>
      );
    case "autodm":
      return (
        <g>
          <path d="M228 58h24a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8h-10l-7 6v-6h-7a8 8 0 0 1-8-8v-8a8 8 0 0 1 8-8Z" fill="var(--brand)" />
          <circle cx="237" cy="68" r="2" fill="var(--surface)" />
          <circle cx="245" cy="68" r="2" fill="var(--surface)" />
          <circle cx="253" cy="68" r="2" fill="var(--surface)" />
          <path d="M264 70h8m-3-4 4 4-4 4" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M276 56h20a8 8 0 0 1 8 8v10a8 8 0 0 1-8 8h-8l-6 5v-5h-6a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8Z" fill="var(--brand-2)" />
          <path d="m282 66 4 4 7-8" fill="none" stroke="var(--surface)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "story":
      return (
        <g>
          <circle cx="244" cy="70" r="18" fill="none" stroke="var(--brand)" strokeWidth="3" strokeDasharray="6 4" />
          <circle cx="244" cy="70" r="10" fill="var(--brand-2)" opacity="0.35" />
          <path d="M258 78c7 0 11-4 11-10" fill="none" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M266 50h20a7 7 0 0 1 7 7v8a7 7 0 0 1-7 7h-7l-6 5v-5h-7a7 7 0 0 1-7-7v-8a7 7 0 0 1 7-7Z" fill="var(--brand)" />
          <path d="M270 60h12M270 66h8" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
  }
}

export default function HelpGuideIllustration({
  variant,
  className,
}: {
  variant: HelpGuideVariant;
  className?: string;
}) {
  return (
    <div className={className}>
      <svg
        role="img"
        aria-label={LABELS[variant]}
        viewBox="0 0 320 240"
        className="h-auto w-full max-w-full"
      >
        <defs>
          <linearGradient id="help-blob" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--brand)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--brand-2)" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="128" rx="118" ry="88" fill="url(#help-blob)" />
        <path d="m48 52 3-8 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--brand-2)" />
        <path d="M286 118v8m-4-4h8" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 178v6m-3-3h6" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="88" y="100" width="144" height="96" rx="10" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <path d="M196 100v18l8-6 8 6v-18" fill="var(--brand-2)" />
        <rect x="96" y="108" width="128" height="80" rx="6" fill="var(--surface-2)" />
        <circle cx="112" cy="124" r="6" fill="var(--brand)" />
        <path d="m109 124 2.5 2.5 4-5" fill="none" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M126 124h44" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="112" cy="144" r="6" fill="var(--brand)" />
        <path d="m109 144 2.5 2.5 4-5" fill="none" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M126 144h40" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="112" cy="164" r="6" fill="var(--brand)" />
        <path d="m109 164 2.5 2.5 4-5" fill="none" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M126 164h32" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="160" cy="222" rx="70" ry="6" fill="var(--line)" />
        <VariantIcon variant={variant} />
      </svg>
    </div>
  );
}
