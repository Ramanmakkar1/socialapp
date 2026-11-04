"use client";

import { useFormStatus } from "react-dom";

export default function ReplySubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-primary" disabled={pending} aria-busy={pending}>
      {pending ? "Sending…" : label}
    </button>
  );
}
