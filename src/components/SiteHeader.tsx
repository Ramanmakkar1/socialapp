import Link from "next/link";
import PoskooMark from "./PoskooMark";

// Landing-style header. Must be rendered inside PublicShell (the .landing wrapper)
// so the landing.module.css global classes (.top, .logo, .links, .btn…) apply.
const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#channels", label: "Channels" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <>
      <nav className="top" aria-label="Main">
        <Link className="logo" href="/">
          <PoskooMark size={34} />
          poskoo<b>.</b>
        </Link>
        <div className="links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="navr">
          <Link className="login" href="/login">
            Log in
          </Link>
          <Link className="btn btn-dark" href="/signup">
            Start free <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/login">Log in</Link>
      </nav>
    </>
  );
}
