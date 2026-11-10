"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  href?: string;
  type?: "button" | "submit";
  size?: "md" | "sm";
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
};

const VARIANT: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: styles.btnPrimary,
  secondary: "",
  danger: styles.btnDanger,
};

// Primary (coral) / secondary (line border) / danger (red) button. Renders a Link when href is set.
export default function Button({
  children,
  variant = "secondary",
  href,
  type = "button",
  size = "md",
  disabled,
  onClick,
  title,
}: ButtonProps) {
  const cls = [styles.btn, VARIANT[variant], size === "sm" ? styles.btnSm : ""].filter(Boolean).join(" ");
  if (href) {
    return (
      <Link href={href} className={cls} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick} title={title}>
      {children}
    </button>
  );
}
