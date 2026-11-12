"use client";

import { usePathname } from "next/navigation";
import CookieNotice from "./CookieNotice";

/** True for routes where the cookie notice must not show: the app, admin, bio pages and product pages. */
export function hideCookieNotice(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    /^\/(app|admin)(\/|$)/.test(pathname) ||
    /^\/(@|%40)/i.test(pathname) ||
    pathname.startsWith("/p/")
  );
}

export default function CookieNoticeGate() {
  const pathname = usePathname();
  return hideCookieNotice(pathname) ? null : <CookieNotice />;
}
