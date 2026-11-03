import type { LucideIcon } from "lucide-react";

export default function EmptyState({ icon: Icon, title, text, phase }: { icon: LucideIcon; title: string; text: string; phase: number }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-brand" />
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">{text}</p>
      <span className="mt-4 inline-block rounded-full border border-line px-2 text-xs text-muted">Coming in Phase {phase}</span>
    </div>
  );
}
