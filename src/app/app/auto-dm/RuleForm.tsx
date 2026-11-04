"use client";

import { useId, useRef, useState, useTransition, type ComponentType } from "react";
import { MessageCircleHeart, Pencil, Plus, Trash2, X } from "lucide-react";
import EmptyState from "../EmptyState";
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
};

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
  };
}

type RuleFormProps = {
  mode: "create" | "edit";
  ruleId?: string;
  initial?: RuleFormDefaults;
  matchModeNote?: string;
  onClose: () => void;
  onSaved: () => void;
};

export function RuleForm({ mode, ruleId, initial, matchModeNote, onClose, onSaved }: RuleFormProps) {
  const nameId = useId();
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
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const keywords = parseKeywords(keywordText);

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
    };
  }

  function submit() {
    setErrors([]);
    startTransition(async () => {
      const input = buildInput();
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
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{mode === "edit" ? "Edit automation" : "New automation"}</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      {matchModeNote && (
        <p className="mt-3 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink-2">{matchModeNote}</p>
      )}
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor={nameId} className="text-sm font-medium text-ink-2">Name</label>
          <input
            id={nameId}
            type="text"
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
          <label htmlFor={linkId} className="text-sm font-medium text-ink-2">Link URL <span className="text-muted">(optional)</span></label>
          <input
            id={linkId}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={INPUT}
            placeholder="https://yoursite.com/guide"
          />
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
        {errors.length > 0 && (
          <ul role="alert" className="space-y-1 text-sm text-warn">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" disabled={pending} onClick={submit} className="btn-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60">
            {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create automation"}
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink-2 hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

type AutoDmViewProps = {
  rules: DbRuleRow[];
  templateDefaults?: RuleFormDefaults;
  templateNote?: string;
  rewindButton?: ComponentType<{ ruleId: string }>;
};

export function AutoDmView({ rules, templateDefaults, templateNote, rewindButton: RewindButton }: AutoDmViewProps) {
  const [formOpen, setFormOpen] = useState(Boolean(templateDefaults));
  const [editing, setEditing] = useState<DbRuleRow | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
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
      }
    : templateDefaults;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Auto-DM</h1>
          <p className="text-sm text-muted">Send a DM to everyone who comments a keyword.</p>
        </div>
        {!formOpen && (
          <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New automation
          </button>
        )}
      </div>

      {formOpen && (
        <div className="mt-6">
          <RuleForm
            mode={editing ? "edit" : "create"}
            ruleId={editing?.id}
            initial={formDefaults}
            matchModeNote={!editing ? templateNote : undefined}
            onClose={closeForm}
            onSaved={() => {}}
          />
        </div>
      )}

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
            phase={2}
          />
          <div className="mt-4 text-center">
            <button type="button" onClick={openCreate} className="btn-primary rounded-full px-5 py-2 text-sm font-semibold">
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
                  {rule.status === "active" && RewindButton ? <RewindButton ruleId={rule.id} /> : null}
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
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}
