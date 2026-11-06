import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="mt-6 rounded-[var(--poskoo-radius-card)] border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-6 text-center shadow-[var(--poskoo-shadow-card)] transition-transform sm:p-10 motion-safe:hover:-translate-y-0.5">
      <div className="relative mx-auto w-full max-w-[220px]">
        <Image
          src="/landing/card-leads.webp"
          alt=""
          width={1024}
          height={1024}
          sizes="220px"
          className="h-auto w-full object-contain"
        />
        <span
          aria-hidden="true"
          className="absolute -left-2 -top-2 flex h-10 w-10 items-center justify-center rounded-[var(--poskoo-radius-pill)] border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] shadow-[var(--poskoo-shadow-card)]"
        >
          <Icon className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />
        </span>
      </div>
      <h2 className="mt-4 font-semibold text-[var(--poskoo-ink)]">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--poskoo-muted)]">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
