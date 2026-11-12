"use client";

import Link from "next/link";
import { Fragment, useEffect, useId, useOptimistic, useRef, useState, useTransition, type ComponentType } from "react";
import { Activity, LifeBuoy, MessageCircle, MessageCircleHeart, MoreHorizontal, Pause, Pencil, Play, Trash2, X } from "lucide-react";
import EmptyState from "../EmptyState";
import NewAutomationDialog from "../NewAutomationDialog";
import RuleBuilder, { AccountReadiness } from "./RuleBuilder";
import TemplatePicker from "./TemplatePicker";
import styles from "./auto-dm.module.css";
import AutomationMessagePreview from "@/components/AutomationMessagePreview";
import CommentKeywordTester from "@/components/CommentKeywordTester";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import {
  createRule,
  deleteRule,
  toggleRule,
  updateRule,
  type RuleFormInput,
  type RuleTrigger,
} from "./actions";
import { dmAiAvailable, suggestDmMessages } from "./aiActions";
import { PUBLIC_REPLY_MAX } from "@/lib/publicReply";
import { formatCtr } from "@/lib/ctr";

const INPUT = `${ui.input} mt-1.5`;

export type InstagramAccountOption = {
  id: string;
  username: string | null;
  status: string;
};

export type DbRuleRow = {
  id: string;
  name: string;
  keywords: string[];
  match_type: "contains" | "exact";
  dm_text: string;
  link_url: string | null;
  email_gate: boolean;
  follow_gate: boolean;
  status: "active" | "paused";
  triggers: string[];
  social_account_id: string | null;
  public_reply: string | null;
  media_ids?: string[];
  link_label?: string | null;
};

export type RuleFormDefaults = {
  name?: string;
  keywords?: string[];
  matchType?: "contains" | "exact";
  dmText?: string;
  linkUrl?: string;
  emailGate?: boolean;
  followGate?: boolean;
  triggers?: RuleTrigger[];
  matchModeNote?: string;
  socialAccountId?: string | null;
  publicReply?: string | null;
  mediaIds?: string[];
  linkLabel?: string | null;
};

const ALL_ACCOUNTS_VALUE = "";

function accountStatusLabel(status: string): string {
  if (status === "active") return "Connected";
  if (status === "expired" || status === "disconnected") return "Reconnect needed";
  return status;
}

function defaultNewAccountId(accounts: InstagramAccountOption[]): string | null {
  const connected = accounts.find((a) => a.status === "active");
  return connected?.id ?? null;
}

function ruleAccountLabel(rule: DbRuleRow, accounts: InstagramAccountOption[]): string {
  if (!rule.social_account_id) {
    return "All connected Instagram accounts";
  }
  const match = accounts.find((a) => a.id === rule.social_account_id);
  if (match?.username) {
    return `@${match.username}`;
  }
  return "Instagram account";
}

function MultiAccountRoutingIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="120"
      height="72"
      viewBox="0 0 120 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="44" y="8" width="32" height="32" rx="16" fill="color-mix(in srgb, var(--brand) 18%, transparent)" />
      <circle cx="60" cy="20" r="6" fill="var(--brand)" />
      <path d="M52 30c2-3 14-3 16 0" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="40" width="28" height="28" rx="14" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1.5" />
      <circle cx="22" cy="50" r="5" fill="color-mix(in srgb, var(--brand-2) 55%, var(--brand))" />
      <path d="M38 48 L48 36" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      <rect x="84" y="40" width="28" height="28" rx="14" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1.5" />
      <circle cx="98" cy="50" r="5" fill="color-mix(in srgb, var(--brand) 70%, var(--brand-2))" />
      <path d="M82 48 L72 36" stroke="var(--brand-2)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      <path
        d="M56 34c-6 4-10 10-10 14h8"
        stroke="var(--brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 34c6 4 10 10 10 14h-8"
        stroke="var(--brand-2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function parseKeywords(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeTriggers(raw: string[] | RuleTrigger[] | undefined): RuleTrigger[] {
  const list = raw?.length ? raw : ["comment"];
  const out: RuleTrigger[] = [];
  if (list.includes("comment")) out.push("comment");
  if (list.includes("story_reply")) out.push("story_reply");
  if (list.includes("dm")) out.push("dm");
  return out.length > 0 ? out : ["comment"];
}

function defaultsToInput(defaults: RuleFormDefaults | undefined): Partial<RuleFormInput> {
  if (!defaults) return {};
  return {
    name: defaults.name,
    keywords: defaults.keywords,
    matchType: defaults.matchType,
    dmText: defaults.dmText,
    linkUrl: defaults.linkUrl ?? "",
    emailGate: defaults.emailGate,
    followGate: defaults.followGate,
    triggers: defaults.triggers ? normalizeTriggers(defaults.triggers) : undefined,
    socialAccountId: defaults.socialAccountId,
    publicReply: defaults.publicReply ?? "",
  };
}

type RuleFormProps = {
  mode: "create" | "edit";
  ruleId?: string;
  initial?: RuleFormDefaults;
  matchModeNote?: string;
  instagramAccounts: InstagramAccountOption[];
  onClose: () => void;
  onSaved: () => void;
};

export function RuleForm({ mode, ruleId, initial, matchModeNote, instagramAccounts, onClose, onSaved }: RuleFormProps) {
  const nameId = useId();
  const accountId = useId();
  const keywordsId = useId();
  const dmId = useId();
  const publicReplyId = useId();
  const linkId = useId();
  const emailId = useId();
  const followId = useId();
  const triggerCommentId = useId();
  const triggerStoryId = useId();
  const dmRef = useRef<HTMLTextAreaElement>(null);

  const base = defaultsToInput(initial);
  const initialTriggers = normalizeTriggers(base.triggers);
  const [name, setName] = useState(base.name ?? "");
  const [keywordText, setKeywordText] = useState((base.keywords ?? []).join(", "));
  const [matchType, setMatchType] = useState<"contains" | "exact">(base.matchType ?? "contains");
  const [dmText, setDmText] = useState(base.dmText ?? "");
  const [publicReply, setPublicReply] = useState(base.publicReply ?? "");
  const [linkUrl, setLinkUrl] = useState(base.linkUrl ?? "");
  const [emailGate, setEmailGate] = useState(base.emailGate ?? false);
  const [followGate, setFollowGate] = useState(base.followGate ?? false);
  const [triggerComment, setTriggerComment] = useState(initialTriggers.includes("comment"));
  const [triggerStoryReply, setTriggerStoryReply] = useState(initialTriggers.includes("story_reply"));
  const initialAccount =
    base.socialAccountId !== undefined
      ? base.socialAccountId
      : mode === "create"
        ? defaultNewAccountId(instagramAccounts)
        : null;
  const [socialAccountId, setSocialAccountId] = useState<string | null>(initialAccount);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [aiOn, setAiOn] = useState<boolean | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [aiTone, setAiTone] = useState("friendly");
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const [aiError, setAiError] = useState("");
  const [aiPending, startAiTransition] = useTransition();
  const aiGoalId = useId();
  const aiToneId = useId();

  useEffect(() => {
    let active = true;
    dmAiAvailable()
      .then((available) => {
        if (active) setAiOn(available);
      })
      .catch(() => {
        if (active) setAiOn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const keywords = parseKeywords(keywordText);
  const linkRequired = emailGate || followGate;

  function insertToken(token: string) {
    const el = dmRef.current;
    if (!el) {
      setDmText((prev) => `${prev}${token}`);
      return;
    }
    const start = el.selectionStart ?? dmText.length;
    const end = el.selectionEnd ?? dmText.length;
    const next = dmText.slice(0, start) + token + dmText.slice(end);
    setDmText(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function buildInput(): RuleFormInput {
    const triggers: RuleTrigger[] = [];
    if (triggerComment) triggers.push("comment");
    if (triggerStoryReply) triggers.push("story_reply");
    return {
      name,
      keywords: parseKeywords(keywordText),
      matchType,
      dmText,
      publicReply,
      linkUrl,
      emailGate,
      followGate,
      triggers,
      socialAccountId,
    };
  }

  function submit() {
    if (pending) return;
    setErrors([]);
    startTransition(async () => {
      const input = buildInput();
      try {
        const result =
          mode === "edit" && ruleId
            ? await updateRule(ruleId, input)
            : await createRule(input);
        if (result.ok) {
          onSaved();
          onClose();
        } else {
          setErrors(result.errors);
        }
      } catch {
        setErrors(["Could not save this Auto-DM. Please try again."]);
      }
    });
  }

  return (
    <form
      className={`${ui.card} p-5 sm:p-6`}
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        submit();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="m-0 text-lg font-semibold text-[var(--poskoo-ink)]">{mode === "edit" ? "Edit Auto-DM" : "New Auto-DM"}</h2>
        <button type="button" disabled={pending} onClick={onClose} className="rounded-full p-2 text-[var(--poskoo-muted)] hover:bg-[var(--poskoo-band)] hover:text-[var(--poskoo-ink)] disabled:opacity-60" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      {matchModeNote && (
        <p className={`${ui.notice} mt-3 text-sm`}>{matchModeNote}</p>
      )}
      <fieldset disabled={pending} className="mt-5 min-w-0 space-y-4 border-0 p-0">
        <div className={`${ui.card} ${ui.band} p-4`}>
          <div className="flex flex-wrap items-start gap-4">
            <MultiAccountRoutingIllustration className="shrink-0" />
            <div className="min-w-0 flex-1">
              <label htmlFor={accountId} className={ui.label}>
                Instagram account
              </label>
              <select
                id={accountId}
                value={socialAccountId ?? ALL_ACCOUNTS_VALUE}
                onChange={(e) => {
                  const v = e.target.value;
                  setSocialAccountId(v === ALL_ACCOUNTS_VALUE ? null : v);
                }}
                className={INPUT}
              >
                <option value={ALL_ACCOUNTS_VALUE}>All connected Instagram accounts</option>
                {instagramAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    @{a.username ?? "unknown"} ({accountStatusLabel(a.status)})
                  </option>
                ))}
              </select>
              <AccountReadiness accounts={instagramAccounts} selectedId={socialAccountId} />
              <p className="mt-2 text-xs leading-relaxed text-[var(--poskoo-muted)]">
                Rules scoped to one profile only run on comments for that account. Choose{" "}
                <span className="text-[var(--poskoo-ink)]">All connected Instagram accounts</span> to reuse the same keywords and DM
                on every profile you connect.
              </p>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor={nameId} className={ui.label}>Name</label>
          <input
            id={nameId}
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
            placeholder="Free guide DM"
          />
        </div>
        <div>
          <label htmlFor={keywordsId} className={ui.label}>Keywords</label>
          <input
            id={keywordsId}
            type="text"
            value={keywordText}
            onChange={(e) => setKeywordText(e.target.value)}
            className={INPUT}
            placeholder="GUIDE, LINK"
          />
          {keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <span key={k} className={`${ui.pill} font-mono text-xs`} style={{ color: "var(--poskoo-violet)" }}>
                  {k}
                </span>
              ))}
            </div>
          )}
          <p className={`mt-1 text-xs text-[var(--poskoo-muted)]`}>Comma-separated, up to 20 keywords.</p>
        </div>
        <fieldset>
          <legend className={ui.label}>Match type</legend>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className={ui.checkRow}>
              <input
                type="radio"
                name={`match-${nameId}`}
                checked={matchType === "contains"}
                onChange={() => setMatchType("contains")}
              />
              Comment contains keyword
            </label>
            <label className={ui.checkRow}>
              <input
                type="radio"
                name={`match-${nameId}`}
                checked={matchType === "exact"}
                onChange={() => setMatchType("exact")}
              />
              Comment matches exactly
            </label>
          </div>
        </fieldset>
        <div className="space-y-2">
          <p className={ui.label}>When to send</p>
          <label htmlFor={triggerCommentId} className={ui.checkRow}>
            <input
              id={triggerCommentId}
              type="checkbox"
              checked={triggerComment}
              onChange={(e) => setTriggerComment(e.target.checked)}
            />
            Comments on my posts
          </label>
          <label htmlFor={triggerStoryId} className={ui.checkRow}>
            <input
              id={triggerStoryId}
              type="checkbox"
              checked={triggerStoryReply}
              onChange={(e) => setTriggerStoryReply(e.target.checked)}
            />
            Replies to my stories
          </label>
        </div>
        <div>
          <CommentKeywordTester keywords={keywords} matchType={matchType} commentTrigger={triggerComment} />
        </div>
        <div>
          <label htmlFor={dmId} className={ui.label}>DM message</label>
          <textarea
            id={dmId}
            ref={dmRef}
            required
            rows={6}
            maxLength={1000}
            value={dmText}
            onChange={(e) => setDmText(e.target.value)}
            className={`${INPUT} resize-y`}
            placeholder="Hey {{username}}! Here is your link 👉 {{link}}"
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => insertToken("{{username}}")} className={`${ui.pill} text-xs hover:border-[var(--poskoo-violet)]`}>
                {"{{username}}"}
              </button>
              <button type="button" onClick={() => insertToken("{{link}}")} className={`${ui.pill} text-xs hover:border-[var(--poskoo-violet)]`}>
                {"{{link}}"}
              </button>
            </div>
            <span className={`text-xs ${dmText.length > 1000 ? "text-[var(--poskoo-red)]" : dmText.length >= 900 ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-muted)]"}`}>
              {dmText.length}/1000
            </span>
          </div>
          {aiOn && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setAiOpen((open) => !open)}
                aria-expanded={aiOpen}
                className={`${ui.pill} text-xs hover:border-[var(--poskoo-violet)]`}
              >
                ✨ Write with AI
              </button>
              {aiOpen && (
                <div className="mt-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <label htmlFor={aiGoalId} className={ui.label}>What is this DM for?</label>
                      <input
                        id={aiGoalId}
                        type="text"
                        maxLength={300}
                        value={aiGoal}
                        onChange={(e) => setAiGoal(e.target.value)}
                        className={INPUT}
                        placeholder="Send my free pricing guide to people who comment GUIDE"
                      />
                    </div>
                    <div className="sm:w-44">
                      <label htmlFor={aiToneId} className={ui.label}>Tone</label>
                      <select
                        id={aiToneId}
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className={INPUT}
                      >
                        {(["friendly", "professional", "playful", "excited"] as const).map((tone) => (
                          <option key={tone} value={tone}>
                            {tone[0].toUpperCase() + tone.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={aiPending || aiGoal.trim() === ""}
                    onClick={() => {
                      setAiError("");
                      setAiIdeas([]);
                      startAiTransition(async () => {
                        try {
                          const r = await suggestDmMessages({
                            goal: aiGoal,
                            keyword: keywords[0],
                            hasLink: linkUrl.trim() !== "",
                            emailGate,
                            tone: aiTone,
                          });
                          if (r.ok) setAiIdeas(r.ideas);
                          else setAiError(r.error);
                        } catch {
                          setAiError("AI request failed. Try again.");
                        }
                      });
                    }}
                    className={`${ui.pill} mt-3 min-h-10`}
                  >
                    {aiPending ? "Writing…" : "Get 3 ideas"}
                  </button>
                  {aiError && (
                    <p role="alert" className="mt-2 text-sm text-[var(--poskoo-red)]">
                      {aiError}
                    </p>
                  )}
                  {aiIdeas.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {aiIdeas.map((idea, index) => (
                        <article key={`${index}-${idea.slice(0, 40)}`} className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
                          <p className="whitespace-pre-wrap text-sm text-[var(--poskoo-ink)]">{idea}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setDmText(idea.slice(0, 1000));
                              setAiOpen(false);
                            }}
                            className={`${ui.pill} mt-2 min-h-10`}
                          >
                            Use this
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {triggerComment && (
          <div>
            <label htmlFor={publicReplyId} className={ui.label}>Public reply under the comment (optional)</label>
            <textarea
              id={publicReplyId}
              rows={2}
              maxLength={PUBLIC_REPLY_MAX}
              value={publicReply}
              onChange={(e) => setPublicReply(e.target.value)}
              className={`${INPUT} resize-y`}
              placeholder="Sent it to your DMs! 📩"
            />
            <p className={`mt-1 text-xs text-[var(--poskoo-muted)]`}>Posted as a reply to the comment after the DM is sent, so others see it worked. Leave empty to skip.</p>
          </div>
        )}
        <div>
          <label htmlFor={linkId} className={ui.label}>Link URL <span className="text-[var(--poskoo-muted)]">({linkRequired ? "required" : "optional"})</span></label>
          <input
            id={linkId}
            type="url"
            required={linkRequired}
            aria-describedby={linkRequired ? `${linkId}-help` : undefined}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={INPUT}
            placeholder="https://yoursite.com/guide"
          />
          {linkRequired && (
            <p id={`${linkId}-help`} className={`mt-1 text-xs text-[var(--poskoo-muted)]`}>The link is delivered after the selected requirements are met.</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor={emailId} className={ui.checkRow}>
            <input id={emailId} type="checkbox" checked={emailGate} onChange={(e) => setEmailGate(e.target.checked)} />
            Ask for email first
          </label>
          <label htmlFor={followId} className={ui.checkRow}>
            <input id={followId} type="checkbox" checked={followGate} onChange={(e) => setFollowGate(e.target.checked)} />
            Require follow
          </label>
        </div>
        <AutomationMessagePreview
          dmText={dmText}
          linkUrl={linkUrl}
          emailGate={emailGate}
          followGate={followGate}
        />
        {errors.length > 0 && (
          <ul role="alert" className="max-w-full space-y-1 break-words text-sm text-[var(--poskoo-red)]">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Btn type="submit" variant="dark" disabled={pending} aria-busy={pending}>
            {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create Auto-DM"}
          </Btn>
          <Btn type="button" variant="line" onClick={onClose} disabled={pending}>
            Cancel
          </Btn>
        </div>
      </fieldset>
    </form>
  );
}

export type RuleStats = { dms: number; clicks: number; uniqueClicks?: number };

type AutoDmViewProps = {
  rules: DbRuleRow[];
  instagramAccounts: InstagramAccountOption[];
  templateDefaults?: RuleFormDefaults;
  templateNote?: string;
  rewindButton?: ComponentType<{ ruleId: string }>;
  /** DMs sent and link clicks per rule id (missing = unknown). */
  stats?: Record<string, RuleStats>;
  /** Opens a blank builder with this trigger preselected (from ?trigger=). */
  startTrigger?: RuleTrigger;
};

const TRIGGER_LABEL: Record<string, string> = { comment: "Comments", story_reply: "Story replies", dm: "DM keyword" };

function ruleTypeLabel(rule: DbRuleRow): string {
  const t = normalizeTriggers(rule.triggers);
  return `${t.map((x) => TRIGGER_LABEL[x] ?? x).join(" + ")} → DM`;
}

function ruleSummary(rule: DbRuleRow, accounts: InstagramAccountOption[]): string {
  const kw = rule.keywords.includes("*") ? "any word" : rule.keywords.map((k) => `“${k}”`).join(", ");
  const posts = (rule.media_ids?.length ?? 0) > 0 ? `${rule.media_ids!.length} selected ${rule.media_ids!.length === 1 ? "post" : "posts"}` : "any post";
  // Only comment triggers are scoped to posts; story replies and DMs are not.
  const where = normalizeTriggers(rule.triggers)
    .map((t) => (t === "comment" ? `comments on ${posts}` : t === "story_reply" ? "story replies" : "DMs"))
    .join(" + ");
  const dm = rule.dm_text.replace(/\s+/g, " ").trim();
  return `${kw} in ${where} · ${ruleAccountLabel(rule, accounts)} · “${dm.length > 60 ? `${dm.slice(0, 60)}…` : dm}”`;
}

function RuleIcon({ rule }: { rule: DbRuleRow }) {
  const t = normalizeTriggers(rule.triggers);
  const tone = t[0] === "story_reply" ? styles.iconStory : t[0] === "dm" ? styles.iconDm : styles.iconComment;
  return (
    <span className={`${styles.ruleIcon} ${tone}`} aria-hidden="true">
      <MessageCircle width={18} height={18} />
    </span>
  );
}

function RuleMenu({
  rule,
  pending,
  canRewind,
  onEdit,
  onRewind,
  onDelete,
}: {
  rule: DbRuleRow;
  pending: boolean;
  canRewind: boolean;
  onEdit: () => void;
  onRewind: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute("open");
  return (
    <details ref={ref} className={styles.menu}>
      <summary className={styles.iconBtn} aria-label={`More actions for ${rule.name}`}>
        <MoreHorizontal width={18} height={18} aria-hidden="true" />
      </summary>
      <div className={styles.menuList} role="menu">
        <button type="button" role="menuitem" className={styles.menuItem} disabled={pending} onClick={() => { close(); onEdit(); }}>
          <Pencil width={15} height={15} aria-hidden="true" /> Edit Auto-DM
        </button>
        {canRewind && (
          <button type="button" role="menuitem" className={styles.menuItem} disabled={pending} onClick={() => { close(); onRewind(); }}>
            <Activity width={15} height={15} aria-hidden="true" /> Send to past comments
          </button>
        )}
        <Link role="menuitem" href={`/app/leads?rule=${encodeURIComponent(rule.id)}`} className={styles.menuItem} onClick={close}>
          <MessageCircleHeart width={15} height={15} aria-hidden="true" /> View captured leads
        </Link>
        <button type="button" role="menuitem" className={`${styles.menuItem} ${styles.menuDanger}`} disabled={pending} onClick={() => { close(); onDelete(); }}>
          <Trash2 width={15} height={15} aria-hidden="true" /> Delete
        </button>
      </div>
    </details>
  );
}

export function AutoDmView({
  rules,
  instagramAccounts,
  templateDefaults,
  templateNote,
  rewindButton: RewindButton,
  stats = {},
  startTrigger,
}: AutoDmViewProps) {
  const [formOpen, setFormOpen] = useState(Boolean(templateDefaults) || Boolean(startTrigger));
  const [editing, setEditing] = useState<DbRuleRow | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [rewindId, setRewindId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  // Pause/Resume and Delete show at once; the actions revalidate this page, and a failed one snaps back.
  const [shownRules, applyRuleChange] = useOptimistic(rules, (cur, change: { id: string; kind: "toggle" | "delete" }) =>
    change.kind === "delete"
      ? cur.filter((r) => r.id !== change.id)
      : cur.map((r) => (r.id === change.id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r)));
  // Picking a template is a client-side navigation, so open the draft when the template changes.
  const templateKey = templateDefaults?.name ?? "";
  const [seenTemplateKey, setSeenTemplateKey] = useState(templateKey);
  const [blankDraft, setBlankDraft] = useState(false);
  const [seenTrigger, setSeenTrigger] = useState(startTrigger);
  if (templateKey !== seenTemplateKey) {
    setSeenTemplateKey(templateKey);
    if (templateKey) {
      setEditing(null);
      setBlankDraft(false);
      setFormOpen(true);
    }
  }
  if (startTrigger !== seenTrigger) {
    setSeenTrigger(startTrigger);
    if (startTrigger) {
      setEditing(null);
      setBlankDraft(false);
      setFormOpen(true);
    }
  }

  // Chooser dialog on this page: open the builder for the picked trigger in place.
  const [picked, setPicked] = useState<{ trigger: RuleTrigger; n: number } | null>(null);
  function startFromChooser(trigger: RuleTrigger) {
    setPicked((p) => ({ trigger, n: (p?.n ?? 0) + 1 }));
    setEditing(null);
    setBlankDraft(false);
    setFormOpen(true);
  }
  const activeTrigger = picked?.trigger ?? startTrigger;

  function openCreate(blank = false) {
    setEditing(null);
    setBlankDraft(blank);
    setFormOpen(true);
  }

  function openEdit(rule: DbRuleRow) {
    setEditing(rule);
    setFormOpen(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function onToggle(id: string) {
    setActionError(null);
    startTransition(async () => {
      applyRuleChange({ id, kind: "toggle" });
      try {
        const result = await toggleRule(id);
        if (!result.ok) setActionError(result.errors.join(" "));
      } catch {
        setActionError("Could not update this Auto-DM. Please try again.");
      }
    });
  }

  function onDelete(id: string) {
    setActionError(null);
    startTransition(async () => {
      applyRuleChange({ id, kind: "delete" });
      try {
        const result = await deleteRule(id);
        if (result.ok) {
          setConfirmDeleteId(null);
        } else {
          setActionError(result.errors.join(" "));
        }
      } catch {
        setActionError("Could not delete this Auto-DM. Please try again.");
      }
    });
  }

  const triggerDefaults: RuleFormDefaults | undefined = activeTrigger ? { triggers: [activeTrigger] } : undefined;
  const formDefaults: RuleFormDefaults | undefined = editing
    ? {
        name: editing.name,
        keywords: editing.keywords,
        matchType: editing.match_type,
        dmText: editing.dm_text,
        publicReply: editing.public_reply ?? "",
        linkUrl: editing.link_url ?? "",
        emailGate: editing.email_gate,
        followGate: editing.follow_gate,
        triggers: normalizeTriggers(editing.triggers),
        socialAccountId: editing.social_account_id,
        mediaIds: editing.media_ids ?? [],
        linkLabel: editing.link_label ?? "Open link",
      }
    : blankDraft
      ? undefined
      : picked ? triggerDefaults : templateDefaults ?? triggerDefaults;
  const live = shownRules.filter((r) => r.status === "active").length;

  return (
    <>
      <header className={styles.pageHead}>
        <div className="flex min-w-0 items-center gap-3">
          <span className={styles.pageIcon} aria-hidden="true"><MessageCircleHeart width={20} height={20} /></span>
          <div className="min-w-0">
          <h1 className={styles.pageTitle}>Auto-DM</h1>
          <p className={styles.pageSub}>Comment to DM: send your link to everyone who comments a keyword. Story replies and DMs work too.</p>
          </div>
        </div>
        <div className={styles.headActions}>
          <Link href="/app/auto-dm/activity" className={styles.headLink}><Activity width={16} height={16} aria-hidden="true" /> Activity</Link>
          <Link href="/help/instagram-auto-dm-not-working" className={styles.headLink}><LifeBuoy width={16} height={16} aria-hidden="true" /> DMs not sending?</Link>
          {!formOpen && (
            <NewAutomationDialog label="New Auto-DM" className={styles.primaryBtn} onStart={startFromChooser} />
          )}
        </div>
      </header>
      {instagramAccounts.length > 1 && !formOpen && (
        <p className={`${ui.hint} mt-2 max-w-xl`}>
          Assign each rule to a specific profile or share one rule across all connected Instagram accounts.
        </p>
      )}

      {formOpen && (
        <div className="mt-6">
          <RuleBuilder
            key={editing ? `edit:${editing.id}` : blankDraft ? "create:blank" : `create:${picked ? `${picked.trigger}-${picked.n}` : templateKey || startTrigger || ""}`}
            mode={editing ? "edit" : "create"}
            ruleId={editing?.id}
            initial={formDefaults}
            matchModeNote={!editing && !blankDraft ? templateNote : undefined}
            instagramAccounts={instagramAccounts}
            onClose={closeForm}
            onSaved={() => {}}
          />
        </div>
      )}

      {actionError && (
        <p role="alert" className={`${ui.notice} ${ui.noticeWarn} mt-4 max-w-full break-words`}>
          {actionError}
        </p>
      )}

      {shownRules.length === 0 && !formOpen ? (
        <div className="mt-6">
          <EmptyState
            icon={MessageCircleHeart}
            title="No Auto-DMs yet"
            text="Create a keyword rule to send DMs when someone comments on your posts."
          />
          <div className="mt-4 text-center">
            <Btn onClick={() => openCreate()}>Create your first Auto-DM</Btn>
          </div>
        </div>
      ) : (
        shownRules.length > 0 && (
          <section className={styles.tableCard} aria-labelledby="your-automations">
            <div className={styles.tableHead}>
              <h2 id="your-automations" className={styles.tableTitle}>Your Auto-DMs</h2>
              <span className={styles.tableMeta}>{live} live · {shownRules.length - live} paused</span>
            </div>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Auto-DM</th>
                    <th scope="col" className={styles.num}>DMs</th>
                    <th scope="col" className={styles.num}>Clicks</th>
                    <th scope="col" className={styles.num}>CTR</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {shownRules.map((rule) => {
                    const st = stats[rule.id];
                    const ctr = st ? formatCtr(st.uniqueClicks ?? st.clicks, st.dms) : "–";
                    const active = rule.status === "active";
                    const canRewind = active && rule.triggers.includes("comment") && Boolean(RewindButton);
                    return (
                      <Fragment key={rule.id}>
                        <tr>
                          <td>
                            <div className={styles.ruleCell}>
                              <RuleIcon rule={rule} />
                              <div className="min-w-0">
                                <p className={styles.ruleName}>
                                  {rule.name}
                                  <span className={styles.ruleType}>{ruleTypeLabel(rule)}</span>
                                </p>
                                <p className={styles.ruleSummary} title={ruleSummary(rule, instagramAccounts)}>{ruleSummary(rule, instagramAccounts)}</p>
                              </div>
                            </div>
                          </td>
                          <td className={styles.num} data-label="DMs">{st ? st.dms.toLocaleString("en-US") : "–"}</td>
                          <td className={styles.num} data-label="Clicks">{st ? st.clicks.toLocaleString("en-US") : "–"}</td>
                          <td className={styles.num} data-label="CTR">{ctr}</td>
                          <td data-label="Status">
                            <span className={`${styles.statusPill} ${active ? styles.statusLive : styles.statusPaused}`}>
                              <span aria-hidden="true" />{active ? "Live" : "Paused"}
                            </span>
                          </td>
                          <td className={styles.actionsCell}>
                            <div className={styles.rowActions}>
                              <button type="button" className={styles.ghostBtn} disabled={pending} onClick={() => onToggle(rule.id)}>
                                {active ? <Pause width={14} height={14} aria-hidden="true" /> : <Play width={14} height={14} aria-hidden="true" />}
                                {active ? "Pause" : "Resume"}
                                <span className="sr-only"> {rule.name}</span>
                              </button>
                              <RuleMenu
                                rule={rule}
                                pending={pending}
                                canRewind={canRewind}
                                onEdit={() => openEdit(rule)}
                                onRewind={() => setRewindId((cur) => (cur === rule.id ? null : rule.id))}
                                onDelete={() => setConfirmDeleteId(rule.id)}
                              />
                            </div>
                          </td>
                        </tr>
                        {(confirmDeleteId === rule.id || (rewindId === rule.id && canRewind && RewindButton)) && (
                          <tr className={styles.subRow}>
                            <td colSpan={6}>
                              {confirmDeleteId === rule.id ? (
                                <span className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="text-[var(--poskoo-ink)]">Delete “{rule.name}”? This cannot be undone.</span>
                                  <button type="button" disabled={pending} onClick={() => onDelete(rule.id)} className={`${ui.btn} ${ui.btnDanger} ${ui.sm}`}>
                                    Yes, delete
                                  </button>
                                  <Btn variant="ghost" size="sm" disabled={pending} onClick={() => setConfirmDeleteId(null)}>
                                    Cancel
                                  </Btn>
                                </span>
                              ) : RewindButton ? (
                                <RewindButton ruleId={rule.id} />
                              ) : null}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      )}

      {!formOpen && <TemplatePicker activeTitle={templateKey} onReopen={() => openCreate()} />}
    </>
  );
}
