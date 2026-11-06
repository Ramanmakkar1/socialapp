"use client";

import { useFormStatus } from "react-dom";
import { Btn } from "./kit";

/** Kit pill submit button that disables itself and shows a pending label while its form submits. */
export default function SubmitButton({
  label,
  pendingLabel = "Saving…",
  variant = "dark",
  size = "md",
}: {
  label: string;
  pendingLabel?: string;
  variant?: "dark" | "line" | "ghost" | "lime";
  size?: "sm" | "md";
}) {
  const { pending } = useFormStatus();
  return (
    <Btn type="submit" variant={variant} size={size} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </Btn>
  );
}
