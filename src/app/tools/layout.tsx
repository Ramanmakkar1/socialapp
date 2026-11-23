import type { ReactNode } from "react";

/**
 * Shared layout for the free tools section.
 *
 * This layout intentionally sets no `robots` metadata: tool pages inherit the
 * root layout's robots setting (src/app/layout.tsx) instead of being forced to
 * noindex here.
 */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
