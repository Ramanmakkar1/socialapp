"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import ui from "@/components/ui/ui.module.css";

function DeleteSubmitButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${ui.btn} ${ui.btnDanger}`} disabled={pending || !enabled} aria-busy={pending}>
      {pending ? "Deleting…" : "Delete my account"}
    </button>
  );
}

export default function DeleteAccountForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  const [confirm, setConfirm] = useState("");
  return (
    <form action={action}>
      <p className={ui.hint}>
        This permanently deletes your Poskoo account, connected account tokens, scheduled posts, auto-DM rules, contacts
        and links. It can&apos;t be undone. Export your contacts first from Contacts → Export CSV.
      </p>
      <label htmlFor="delete-confirm" className={ui.label}>
        Type DELETE to confirm
      </label>
      <input
        id="delete-confirm"
        name="confirm"
        autoComplete="off"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className={ui.input}
      />
      <div>
        <DeleteSubmitButton enabled={confirm === "DELETE"} />
      </div>
    </form>
  );
}
