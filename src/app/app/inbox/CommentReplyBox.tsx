"use client";

import { useId, useState } from "react";
import { Send } from "lucide-react";
import { useFormStatus } from "react-dom";
import styles from "./inbox.module.css";

const MAX = 2200;

function SendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.sendBtn} disabled={disabled || pending} aria-busy={pending}>
      <Send width={15} height={15} aria-hidden="true" />
      {pending ? "Sending…" : "Reply"}
    </button>
  );
}

// Public reply under a comment (Buffer-style): "Replying to @handle", textarea prefilled with the
// mention, character counter, send. Posts through the existing replyToCommentAction.
export default function CommentReplyBox({
  action,
  accountId,
  commentId,
  handle,
  returnTo = {},
}: {
  action: (formData: FormData) => Promise<void>;
  accountId: string;
  commentId: string;
  handle: string | null;
  /** Hidden return_* fields so the redirect keeps the selected post/filter. */
  returnTo?: Record<string, string>;
}) {
  const id = useId();
  const mention = handle ? `@${handle} ` : "";
  const [text, setText] = useState(mention);
  const empty = text.trim() === "" || text.trim() === mention.trim();
  return (
    <form action={action} className={styles.replyBox}>
      <input type="hidden" name="account_id" value={accountId} />
      <input type="hidden" name="comment_id" value={commentId} />
      {Object.entries(returnTo).map(([k, v]) => (v ? <input key={k} type="hidden" name={`return_${k}`} value={v} /> : null))}
      <label htmlFor={id} className={styles.replyingTo}>
        Replying to <b>{handle ? `@${handle}` : "this comment"}</b>
      </label>
      <textarea
        id={id}
        name="message"
        required
        maxLength={MAX}
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.replyInput}
      />
      <div className={styles.replyFoot}>
        <span className={styles.counter} aria-live="polite">{text.length}/{MAX}</span>
        <SendButton disabled={empty} />
      </div>
    </form>
  );
}
