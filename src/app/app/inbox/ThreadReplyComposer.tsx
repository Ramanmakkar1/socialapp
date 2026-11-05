"use client";

import { useEffect, useId, useMemo, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { replyInThreadAction } from "./actions";
import ReplySubmitButton from "./ReplySubmitButton";

const EMPTY = { message: "", available: true };

// Cache a stable snapshot, including an in-memory fallback when storage is blocked.
function draftStore(key: string) {
  let snapshot = EMPTY;
  const listeners = new Set<() => void>();
  function update(message: string, available: boolean) {
    if (message === snapshot.message && available === snapshot.available) return;
    snapshot = { message, available };
    listeners.forEach((notify) => notify());
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(notify: () => void) {
      listeners.add(notify);
      try {
        update(sessionStorage.getItem(key) ?? snapshot.message, true);
      } catch {
        update(snapshot.message, false);
      }
      return () => { listeners.delete(notify); };
    },
    save(message: string) {
      try {
        // Empty edits are retained too; successful sends explicitly remove the key.
        sessionStorage.setItem(key, message);
        update(message, true);
      } catch {
        update(message, false);
      }
    },
    clear() {
      try {
        sessionStorage.removeItem(key);
        update("", true);
      } catch {
        update("", false);
      }
    },
  };
}

function ReplyFields({ draft, store }: {
  draft: typeof EMPTY;
  store: ReturnType<typeof draftStore>;
}) {
  const id = useId();
  const { pending } = useFormStatus();
  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium">Reply</label>
      <textarea
        id={id}
        name="message"
        required
        maxLength={1000}
        rows={3}
        value={draft.message}
        onChange={(event) => store.save(event.target.value)}
        readOnly={pending}
        aria-describedby={`${id}-draft ${id}-count`}
        placeholder="Write a reply…"
        className="mt-2 block w-full min-w-0 resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
      />
      <p id={`${id}-draft`} role="status" className={`mt-2 text-xs ${draft.available ? "text-muted" : "text-warn"}`}>
        {draft.available
          ? "Your draft stays in this browser tab until the message is sent."
          : "Draft storage is unavailable. Copy your reply before sending; it may be lost after a redirect."}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span id={`${id}-count`} className="text-xs text-muted">{draft.message.length}/1000 characters</span>
        <ReplySubmitButton label="Send" />
      </div>
    </>
  );
}

export default function ThreadReplyComposer({ userId, accountId, senderId, sent }: {
  userId: string;
  accountId: string;
  senderId: string;
  sent: boolean;
}) {
  const router = useRouter();
  const key = JSON.stringify(["inbox-reply", userId, accountId, senderId]);
  const store = useMemo(() => draftStore(key), [key]);
  const draft = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);

  useEffect(() => {
    if (!sent) return;
    store.clear();
    // Consume this result so a later draft survives refreshes and history navigation.
    const url = new URL(window.location.href);
    if (url.searchParams.get("thread") === `${accountId}:${senderId}` && url.searchParams.get("ok") === "dm") {
      url.searchParams.delete("ok");
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    }
  }, [sent, store, router, accountId, senderId]);

  return (
    <form action={replyInThreadAction} onSubmit={() => store.save(draft.message)} className="mt-4 min-w-0">
      <input type="hidden" name="account_id" value={accountId} />
      <input type="hidden" name="sender_id" value={senderId} />
      <ReplyFields draft={draft} store={store} />
    </form>
  );
}
