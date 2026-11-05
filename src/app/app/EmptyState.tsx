import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-6 text-center sm:p-10">
      <div className="relative mx-auto aspect-[160/110] w-full max-w-[160px]" aria-hidden="true">
        <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden="true">
          <path d="M22 35C28 9 70 4 100 14S151 43 141 72 91 105 53 96 13 67 22 35Z" fill="var(--brand)" opacity="0.12" />
          <g fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5">
            <circle cx="26" cy="52" r="9" />
            <path d="M14 78c2-10 10-16 24-16s22 6 24 16v4H14v-4Z" strokeLinejoin="round" />
            <path d="M38 58l8 6" strokeLinecap="round" />
          </g>
          <g>
            <rect x="52" y="28" width="68" height="58" rx="10" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <rect x="58" y="34" width="56" height="8" rx="4" fill="var(--surface-2)" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={58 + (i % 3) * 19} y={46 + Math.floor(i / 3) * 16} width="15" height="12" rx="3" fill={i === 4 ? "var(--brand)" : "var(--surface-2)"} opacity={i === 4 ? 0.55 : 1} />
            ))}
          </g>
          <g className="hero-float">
            <path d="M118 12H138A7 7 0 0 1 145 19V30A7 7 0 0 1 138 37H129L120 43V37H118A7 7 0 0 1 111 30V19A7 7 0 0 1 118 12Z" fill="var(--brand)" />
            <path d="M120 22H136M120 28H130" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="hero-float hero-float-delay">
            <path d="M8 18H24A5 5 0 0 1 29 23V30A5 5 0 0 1 24 35H19L14 39V35H8A5 5 0 0 1 3 30V23A5 5 0 0 1 8 18Z" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <path d="M10 26h14M10 30h9" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          </g>
          <g fill="var(--brand)">
            <path d="M142 78l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" opacity="0.7" />
            <path d="M148 92l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" opacity="0.45" />
          </g>
        </svg>
        <Icon className="absolute left-1/2 top-[58%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-brand sm:h-8 sm:w-8" />
      </div>
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
