"use client";

import { useActionState } from "react";
import { removeAnthropicKeyAction, saveAnthropicKeyAction, testAnthropicKeyAction, type AiKeyActionState } from "./actions";
import styles from "../admin.module.css";

function Message({ state }: { state: AiKeyActionState }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={state.ok ? styles.settingsMsgOk : styles.settingsMsgErr}>
      {state.message}
    </p>
  );
}

/** Paste / save, test and remove the stored Anthropic API key. The key never comes back to the browser. */
export default function AiKeyForm({ hasStored, hasKey, canStore }: { hasStored: boolean; hasKey: boolean; canStore: boolean }) {
  const [saveState, saveAction, saving] = useActionState(saveAnthropicKeyAction, null);
  const [testState, testAction, testing] = useActionState(testAnthropicKeyAction, null);
  const [removeState, removeAction, removing] = useActionState(removeAnthropicKeyAction, null);
  const busy = saving || testing || removing;

  return (
    <div className={styles.settingsStack}>
      {/* React resets this uncontrolled form after the action, so the pasted key leaves the page. */}
      <form action={saveAction} className={styles.settingsStack}>
        <div>
          <label htmlFor="anthropic-api-key" className={styles.settingsLabel}>
            {hasStored ? "Replace the Anthropic API key" : "Anthropic API key"}
          </label>
          <input
            id="anthropic-api-key"
            name="api_key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-…"
            required
            disabled={!canStore || busy}
            className={styles.settingsInput}
          />
        </div>
        <div className={styles.settingsRow}>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!canStore || busy}>
            {saving ? "Saving and testing…" : "Save"}
          </button>
        </div>
        <Message state={saveState} />
      </form>
      <div className={styles.settingsRow}>
        <form action={testAction}>
          <button type="submit" className={styles.btn} disabled={!hasKey || busy}>
            {testing ? "Testing…" : "Test connection"}
          </button>
        </form>
        {hasStored && (
          <form
            action={removeAction}
            onSubmit={(e) => {
              if (!window.confirm("Remove the stored Anthropic API key? AI features switch off unless ANTHROPIC_API_KEY is set on the server.")) e.preventDefault();
            }}
          >
            <button type="submit" className={`${styles.btn} ${styles.btnDanger}`} disabled={busy}>
              {removing ? "Removing…" : "Remove key"}
            </button>
          </form>
        )}
      </div>
      <Message state={testState} />
      <Message state={removeState} />
    </div>
  );
}
