"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

/**
 * Plain submit button (keeps the caller's styling) that disables itself and sets aria-busy while its
 * form's server action runs, so icon buttons like Like / Hide / Done give instant feedback.
 */
export default function PendingButton({ disabled, style, ...rest }: Omit<ComponentProps<"button">, "type">) {
  const { pending } = useFormStatus();
  return (
    <button
      {...rest}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      style={pending ? { ...style, opacity: 0.6, cursor: "progress" } : style}
    />
  );
}
