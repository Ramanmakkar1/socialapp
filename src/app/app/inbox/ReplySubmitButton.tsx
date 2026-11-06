"use client";

import { useFormStatus } from "react-dom";
import { Btn } from "@/components/ui/kit";

export default function ReplySubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Btn type="submit" variant="dark" size="sm" disabled={pending} aria-busy={pending}>
      {pending ? "Sending…" : label}
    </Btn>
  );
}
