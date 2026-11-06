import Link from "next/link";
import PoskooMark from "./PoskooMark";

// The one site header, used by the landing page and every public page (via
// PublicShell). Must be rendered inside a .landing wrapper (landing.module.css)
// so the global classes (.top, .logo, .links, .navr, .btn, .mobile-nav) apply.
// On the landing itself the section links are plain hashes (#how); elsewhere they
// point back to the landing (/#how).
const SECTIONS = [
  { hash: "#how", label: "How it works" },
  { hash: "#channels", label: "Channels" },
  { hash: "#pricing", label: "Pricing" },
  { hash: "#faq", label: "FAQ" },
];

export function SiteHeader({ onHome = false }: { onHome?: boolean }) {
  const links = SECTIONS.map((l) => ({ href: onHome ? l.hash : `/${l.hash}`, label: l.label }));
  return (
    <>
      <nav className="top" aria-label="Main">
        <Link className="logo" href="/">
          <PoskooMark size={34} />
          poskoo<b>.</b>
        </Link>
        <div className="links">
          {links.map((l) => (
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
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/login">Log in</Link>
      </nav>
    </>
  );
}
