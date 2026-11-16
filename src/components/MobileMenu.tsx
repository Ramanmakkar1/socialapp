"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasLoginHint } from "./AuthNav";

// Mobile/tablet menu for SiteHeader (shown below 960px). A native modal
// <dialog>: showModal() makes the rest of the page inert (focus stays inside)
// and Escape closes it for free.
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value
    setLoggedIn(hasLoginHint(document.cookie));
  }, []);
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close after navigating (hash links on the landing don't change the path, so
  // links also close on click below).
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        className="menuBtn"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <dialog
        ref={ref}
        className="menuSheet"
        aria-label="Menu"
        onClick={(e) => {
          // Click on the backdrop (the dialog box itself, outside the panel) closes.
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="menuPanel">
          <div className="menuHead">
            <span className="menuTitle">Menu</span>
            <button type="button" className="menuClose" aria-label="Close menu" onClick={close}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile">
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menuCtas">
            {loggedIn ? (
              <Link className="btn btn-dark" href="/app" onClick={close}>
                Open dashboard <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <>
                <Link className="btn btn-line" href="/login" onClick={close}>
                  Log in
                </Link>
                <Link className="btn btn-dark" href="/signup" onClick={close}>
                  Start free <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
