"use client";

import { useActionState, useRef } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import PendingButton from "@/components/ui/PendingButton";
import { compactNumber } from "@/lib/trends";
import { addWatchesAction, removeWatchAction, type AddWatchState } from "./actions";
import styles from "./trends.module.css";

export type WatchView = {
  id: string;
  username: string;
  name: string | null;
  profilePictureUrl: string | null;
  followers: number | null;
  followersChange: number | null;
  postsThisWeek: number;
  avgEngagement: number | null;
  changePct: number | null;
  fetchedAt: string | null;
  attempted: boolean;
  error: string | null;
};

const SUGGESTIONS = ["creators", "later", "hootsuite"];

export default function WatchPanel({ watches, limit, plan, canRead }: { watches: WatchView[]; limit: number; plan: string; canRead: boolean }) {
  const [state, formAction, pending] = useActionState<AddWatchState, FormData>(addWatchesAction, null);
  const inputRef = useRef<HTMLInputElement>(null);
  const full = watches.length >= limit;
  const have = new Set(watches.map((w) => w.username));
  const suggestions = SUGGESTIONS.filter((s) => !have.has(s));

  return (
    <section className={styles.card} aria-labelledby="trends-watched">
      <div className={styles.cardHead}>
        <h2 id="trends-watched" className={styles.h2}>Watched accounts</h2>
        <span className={styles.refreshMsg}>{watches.length} / {limit}</span>
      </div>
      <form action={formAction} className={styles.addForm}>
        <label htmlFor="trend-username" className={styles.srOnly}>Instagram username to watch</label>
        <input
          ref={inputRef}
          id="trend-username"
          name="usernames"
          className={styles.input}
          placeholder="@username"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={2000}
          disabled={full}
          aria-describedby="trend-add-help"
        />
        <button type="submit" className={styles.primary} disabled={pending || full} aria-busy={pending}>
          <Plus width={15} height={15} aria-hidden="true" /> {pending ? "Adding…" : "Add"}
        </button>
      </form>
      {state && (
        <p className={`${styles.formMsg} ${state.ok ? styles.formOk : styles.formErr}`} role={state.ok ? "status" : "alert"}>{state.message}</p>
      )}
      <p id="trend-add-help" className={styles.limit}>
        Business or Creator accounts only. Separate several with commas. {plan} plan: up to {limit} accounts.
      </p>
      {suggestions.length > 0 && !full && (
        <div className={styles.suggest}>
          <span>Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                const el = inputRef.current;
                if (!el) return;
                el.value = el.value.trim() ? `${el.value.trim()}, @${s}` : `@${s}`;
                el.focus();
              }}
            >
              @{s}
            </button>
          ))}
        </div>
      )}

      {watches.length > 0 && (
        <ul className={styles.watchList}>
          {watches.map((w) => (
            <li key={w.id} className={`${styles.watch} ${w.error ? styles.watchErr : ""}`}>
              {w.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Instagram CDN avatar
                <img className={styles.watchAvatar} src={w.profilePictureUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <span className={`${styles.watchAvatar} ${styles.watchAvatarEmpty}`} aria-hidden="true">{w.username[0]?.toUpperCase()}</span>
              )}
              <div className={styles.watchMain}>
                <a className={styles.watchName} href={`https://www.instagram.com/${w.username}/`} target="_blank" rel="noopener noreferrer">
                  @{w.username}<span className={styles.srOnly}> on Instagram (opens in a new tab)</span>
                </a>
                {w.fetchedAt && (
                  <p className={styles.watchMeta}>
                    <span>
                      <b>{compactNumber(w.followers)}</b> followers
                      {w.followersChange !== null && w.followersChange !== 0 && (
                        <span className={w.followersChange > 0 ? styles.up : styles.down}> ({w.followersChange > 0 ? "+" : ""}{compactNumber(w.followersChange)} 7d)</span>
                      )}
                    </span>
                    <span><b>{w.postsThisWeek}</b> {w.postsThisWeek === 1 ? "post" : "posts"} this week</span>
                    {w.avgEngagement !== null && (
                      <span>
                        avg <b>{compactNumber(w.avgEngagement)}</b> eng.
                        {w.changePct !== null && <span className={w.changePct >= 0 ? styles.up : styles.down}> ({w.changePct >= 0 ? "+" : ""}{w.changePct}% vs last wk)</span>}
                      </span>
                    )}
                    <span>Updated <LocalTime value={w.fetchedAt} /></span>
                  </p>
                )}
              </div>
              <form action={removeWatchAction}>
                <input type="hidden" name="id" value={w.id} />
                <PendingButton className={styles.iconBtn} aria-label={`Stop watching @${w.username}`} title="Remove">
                  <X width={16} height={16} aria-hidden="true" />
                </PendingButton>
              </form>
              {w.error ? (
                <p className={styles.watchError}><AlertTriangle width={12} height={12} aria-hidden="true" /> {w.error}</p>
              ) : !w.fetchedAt ? (
                <p className={styles.watchPending}>{canRead ? (w.attempted ? "Not read yet." : "Waiting for the first read…") : "Will be read once Instagram is connected via Facebook."}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
