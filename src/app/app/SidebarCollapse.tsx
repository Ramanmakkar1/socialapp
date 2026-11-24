"use client";

import { useEffect, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import styles from "./shell.module.css";

const KEY = "poskoo.sidebar.collapsed";

// Desktop only: shrinks the sidebar to an icon rail (labels hidden by CSS) and remembers it per browser.
// The state lives on the <aside> as data-collapsed so the server-rendered sidebar needs no client state.
export default function SidebarCollapse() {
  const ref = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = window.localStorage.getItem(KEY) === "1";
    } catch {
      saved = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved choice is only readable after hydration
    if (saved) setCollapsed(true);
  }, []);

  useEffect(() => {
    const aside = ref.current?.closest("aside");
    if (!aside) return;
    if (collapsed) aside.setAttribute("data-collapsed", "true");
    else aside.removeAttribute("data-collapsed");
  }, [collapsed]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  }

  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <button
      ref={ref}
      type="button"
      className={styles.collapseBtn}
      onClick={toggle}
      aria-pressed={collapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <Icon width={17} height={17} aria-hidden="true" />
    </button>
  );
}
