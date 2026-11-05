"use client";

import Link from "next/link";
import { useId, useRef, useState, useTransition, type ComponentType } from "react";
import { MessageCircleHeart, Pencil, Plus, Trash2, X } from "lucide-react";
import EmptyState from "../EmptyState";
import TemplatePicker from "./TemplatePicker";
import AutomationMessagePreview from "@/components/AutomationMessagePreview";
import CommentKeywordTester from "@/components/CommentKeywordTester";
import {
  createRule,
  deleteRule,
  toggleRule,
  updateRule,
  type RuleFormInput,
  type RuleTrigger,
} from "./actions";

const INPUT =
  "mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none";

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
        setErrors(["Could not save this automation. Please try again."]);
      }
    });
  }

  return (
    <form
      className="rounded-2xl border border-line bg-surface p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        submit();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{mode === "edit" ? "Edit automation" : "New automation"}</h2>
        <button type="button" disabled={pending} onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-60" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      {matchModeNote && (
        <p className="mt-3 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink-2">{matchModeNote}</p>
      )}
      <fieldset disabled={pending} className="mt-5 min-w-0 space-y-4 border-0 p-0">
        <div className="rounded-xl border border-line bg-surface-2 p-4">
          <div className="flex flex-wrap items-start gap-4">
            <MultiAccountRoutingIllustration className="shrink-0" />
            <div className="min-w-0 flex-1">
              <label htmlFor={accountId} className="text-sm font-medium text-ink-2">
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
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Rules scoped to one profile only run on comments for that account. Choose{" "}
                <span className="text-ink-2">All connected Instagram accounts</span> to reuse the same keywords and DM
                on every profile you connect.
              </p>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor={nameId} className="text-sm font-medium text-ink-2">Name</label>
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
          <label htmlFor={keywordsId} className="text-sm font-medium text-ink-2">Keywords</label>
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
                <span key={k} className="inline-block rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold text-brand">
                  {k}
                </span>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-muted">Comma-separated, up to 10 keywords.</p>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-ink-2">Match type</legend>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name={`match-${nameId}`}
                checked={matchType === "contains"}
                onChange={() => setMatchType("contains")}
              />
              Comment contains keyword
            </label>
            <label className="flex cursor-pointer items-center gap-2">
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
          <p className="text-sm font-medium text-ink-2">When to send</p>
          <label htmlFor={triggerCommentId} className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
            <input
              id={triggerCommentId}
              type="checkbox"
              checked={triggerComment}
              onChange={(e) => setTriggerComment(e.target.checked)}
            />
            Comments on my posts
          </label>
          <label htmlFor={triggerStoryId} className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
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
          <label htmlFor={dmId} className="text-sm font-medium text-ink-2">DM message</label>
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
              <button type="button" onClick={() => insertToken("{{username}}")} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2 hover:border-brand hover:text-ink">
                {"{{username}}"}
              </button>
              <button type="button" onClick={() => insertToken("{{link}}")} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2 hover:border-brand hover:text-ink">
                {"{{link}}"}
              </button>
            </div>
            <span className={`text-xs ${dmText.length > 1000 ? "text-brand-2" : dmText.length >= 900 ? "text-warn" : "text-muted"}`}>
              {dmText.length}/1000
            </span>
          </div>
        </div>
        <div>
          <label htmlFor={linkId} className="text-sm font-medium text-ink-2">Link URL <span className="text-muted">({linkRequired ? "required" : "optional"})</span></label>
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
            <p id={`${linkId}-help`} className="mt-1 text-xs text-muted">The link is delivered after the selected requirements are met.</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor={emailId} className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
            <input id={emailId} type="checkbox" checked={emailGate} onChange={(e) => setEmailGate(e.target.checked)} />
            Ask for email first
          </label>
          <label htmlFor={followId} className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
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
          <ul role="alert" className="max-w-full space-y-1 break-words text-sm text-warn">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="submit" className="btn-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60">
            {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create automation"}
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink-2 hover:text-ink disabled:opacity-60">
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}

type AutoDmViewProps = {
  rules: DbRuleRow[];
  instagramAccounts: InstagramAccountOption[];
  templateDefaults?: RuleFormDefaults;
  templateNote?: string;
  rewindButton?: ComponentType<{ ruleId: string }>;
};

export function AutoDmView({
  rules,
  instagramAccounts,
  templateDefaults,
  templateNote,
  rewindButton: RewindButton,
}: AutoDmViewProps) {
  const [formOpen, setFormOpen] = useState(Boolean(templateDefaults));
  const [editing, setEditing] = useState<DbRuleRow | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  // Picking a template is a client-side navigation, so open the draft when the template changes.
  const templateKey = templateDefaults?.name ?? "";
  const [seenTemplateKey, setSeenTemplateKey] = useState(templateKey);
  const [blankDraft, setBlankDraft] = useState(false);
  if (templateKey !== seenTemplateKey) {
    setSeenTemplateKey(templateKey);
    if (templateKey) {
      setEditing(null);
      setBlankDraft(false);
      setFormOpen(true);
    }
  }

  function openCreate(blank = false) {
    setEditing(null);
    setBlankDraft(blank);
    setFormOpen(true);
  }

  function openEdit(rule: DbRuleRow) {
    setEditing(rule);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function onToggle(id: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await toggleRule(id);
        if (!result.ok) setActionError(result.errors.join(" "));
      } catch {
        setActionError("Could not update this automation. Please try again.");
      }
    });
  }

  function onDelete(id: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await deleteRule(id);
        if (result.ok) {
          setConfirmDeleteId(null);
        } else {
          setActionError(result.errors.join(" "));
        }
      } catch {
        setActionError("Could not delete this automation. Please try again.");
      }
    });
  }

  const formDefaults: RuleFormDefaults | undefined = editing
    ? {
        name: editing.name,
        keywords: editing.keywords,
        matchType: editing.match_type,
        dmText: editing.dm_text,
        linkUrl: editing.link_url ?? "",
        emailGate: editing.email_gate,
        followGate: editing.follow_gate,
        triggers: normalizeTriggers(editing.triggers),
        socialAccountId: editing.social_account_id,
      }
    : blankDraft
      ? undefined
      : templateDefaults;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Auto-DM</h1>
          <p className="text-sm text-muted">Send a DM to everyone who comments a keyword.</p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/app/auto-dm/activity" className="font-medium text-brand hover:underline">Activity</Link>
            <Link href="/help/instagram-auto-dm-not-working" className="font-medium text-brand hover:underline">DMs not sending?</Link>
          </p>
          {instagramAccounts.length > 1 && (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted">
              Assign each rule to a specific profile or share one rule across all connected Instagram accounts.
            </p>
          )}
        </div>
        {!formOpen && (
          <button type="button" onClick={() => openCreate(true)} className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New automation
          </button>
        )}
      </div>

      {formOpen && (
        <div className="mt-6">
          <RuleForm
            key={editing ? `edit:${editing.id}` : blankDraft ? "create:blank" : `create:${templateKey}`}
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

      {!formOpen && <TemplatePicker activeTitle={templateKey} onReopen={() => openCreate()} />}

      {actionError && (
        <p role="alert" className="mt-4 max-w-full break-words rounded-xl border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          {actionError}
        </p>
      )}

      {rules.length === 0 && !formOpen ? (
        <div className="mt-6">
          <EmptyState
            icon={MessageCircleHeart}
            title="No automations yet"
            text="Create a keyword rule to send DMs when someone comments on your posts."
          />
          <div className="mt-4 text-center">
            <button type="button" onClick={() => openCreate()} className="btn-primary rounded-full px-5 py-2 text-sm font-semibold">
              Create your first automation
            </button>
          </div>
        </div>
      ) : (
        rules.length > 0 && (
          <ul className="mt-6 space-y-4">
            {rules.map((rule) => (
              <li key={rule.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{rule.name}</h2>
                    <p className="mt-1 text-xs text-muted">
                      <span className="font-medium text-ink-2">Account:</span>{" "}
                      {ruleAccountLabel(rule, instagramAccounts)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rule.keywords.map((k) => (
                        <span key={k} className="inline-block rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold text-brand">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${rule.status === "active" ? "bg-brand/15 text-brand" : "border border-line text-muted"}`}
                  >
                    {rule.status === "active" ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {rule.status === "active" && rule.triggers.includes("comment") && RewindButton ? (
                    <RewindButton ruleId={rule.id} />
                  ) : null}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onToggle(rule.id)}
                    className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-ink disabled:opacity-60"
                  >
                    {rule.status === "active" ? "Pause" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(rule)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {confirmDeleteId === rule.id ? (
                    <span className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-ink-2">Delete this rule?</span>
                      <button type="button" disabled={pending} onClick={() => onDelete(rule.id)} className="rounded-full bg-warn/15 px-3 py-1.5 font-medium text-warn disabled:opacity-60">
                        Yes, delete
                      </button>
                      <button type="button" disabled={pending} onClick={() => setConfirmDeleteId(null)} className="rounded-full border border-line px-3 py-1.5 text-ink-2 disabled:opacity-60">
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setConfirmDeleteId(rule.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-warn disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                  <Link
                    href={`/app/leads?rule=${encodeURIComponent(rule.id)}`}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-line px-3 py-1.5 text-sm font-medium text-brand hover:border-brand hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    View captured leads
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}
