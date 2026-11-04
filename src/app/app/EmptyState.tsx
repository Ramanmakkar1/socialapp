import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
      <div className="relative mx-auto h-[110px] w-40" aria-hidden="true">
        <svg width="160" height="110" viewBox="0 0 160 110" aria-hidden="true">
          <path d="M22 35C28 9 70 4 100 14S151 43 141 72 91 105 53 96 13 67 22 35Z" fill="var(--color-brand)" opacity="0.12" />
          <g fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="1.5">
            <rect x="33" y="29" width="65" height="58" rx="10" transform="rotate(-12 65 58)" />
            <rect x="64" y="25" width="65" height="58" rx="10" transform="rotate(10 96 54)" />
            <rect x="49" y="30" width="62" height="60" rx="10" />
          </g>
          <g className="empty-state-bubble">
            <path d="M119 16H139A7 7 0 0 1 146 23V34A7 7 0 0 1 139 41H130L121 47V41H119A7 7 0 0 1 112 34V23A7 7 0 0 1 119 16Z" fill="var(--color-brand)" />
            <path d="M121 26H137M121 32H131" stroke="var(--color-surface)" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g fill="var(--color-brand)">
            <path d="M25 18L28 25 35 28 28 31 25 38 22 31 15 28 22 25Z" />
            <path d="M133 76L135 81 140 83 135 85 133 90 131 85 126 83 131 81Z" />
          </g>
        </svg>
        <Icon className="absolute left-1/2 top-[60px] h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-brand" />
      </div>
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">{text}</p>
      {children && <div className="mt-4">{children}</div>}
      <style>{`
        .empty-state-bubble { animation: empty-state-float 4s ease-in-out infinite; }
        @keyframes empty-state-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .empty-state-bubble { animation: none; }
        }
      `}</style>
    </div>
  );
}
