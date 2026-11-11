import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import AuthIllustration from "@/components/AuthIllustration";
import PoskooMark from "@/components/PoskooMark";
import landing from "@/app/landing.module.css";
import a from "./auth.module.css";

// Same token bridge as AuthForm (the generic ui.module.css names -> Poskoo palette).
const tokenBridge = {
  "--line": "var(--poskoo-line)",
  "--surface": "var(--poskoo-card)",
  "--surface-2": "var(--poskoo-band)",
  "--ink-2": "#3d3450",
  "--brand": "var(--poskoo-violet)",
  "--brand-2": "var(--poskoo-coral)",
  "--ok": "var(--poskoo-green)",
  "--warn": "var(--poskoo-coral)",
} as CSSProperties;

/** The /login look (paper, white form card, tilted art panel) for the e-mail flows. */
export default function AuthFrame({
  title,
  lede,
  children,
  footer,
  art = "login",
}: {
  title: ReactNode;
  lede: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  art?: "login" | "signup";
}) {
  return (
    <main className={`${landing.landing} ${instrumentSans.variable} ${instrumentSerif.variable} ${a.page}`} style={tokenBridge}>
      <div className={`wrap ${a.grid}`}>
        <div className={a.card}>
          <Link className="logo" href="/">
            <PoskooMark size={34} />
            poskoo<b>.</b>
          </Link>
          <h1 className={a.title}>{title}</h1>
          <p className={a.lede}>{lede}</p>
          {children}
          {footer && <p className={a.switch}>{footer}</p>}
        </div>
        <div className={a.side}>
          <AuthIllustration mode={art} />
        </div>
      </div>
    </main>
  );
}
