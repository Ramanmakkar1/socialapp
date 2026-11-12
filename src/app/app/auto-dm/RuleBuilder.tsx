"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { Camera, Check, ChevronRight, ExternalLink, Heart, Loader2, MessageCircle, Plus, Send, X } from "lucide-react";
import styles from "./auto-dm.module.css";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { buildCommentDmMessage } from "@/lib/commentMessage";
import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";
import type { IgMediaItem } from "@/lib/igMedia";
import {
  ANY_COMMENT_KEYWORD,
  MAX_KEYWORD_CHIPS,
  parseKeywordChips,
} from "@/lib/keywordChips";
import { PUBLIC_REPLY_MAX } from "@/lib/publicReply";
import {
  createRule,
  listRecentMedia,
  updateRule,
  type RuleFormInput,
  type RuleTrigger,
} from "./actions";
import type { InstagramAccountOption, RuleFormDefaults } from "./RuleForm";

const INPUT = `${ui.input} mt-1.5`;
const SUGGESTED_KEYWORDS = ["link", "info", "price", "guide", "book", "shop"];
const TEMPLATE_SLUGS = ["free-guide", "product-link", "email-checklist", "follow-bonus"];
const DEFAULT_DM = "Hey {{username}}! Thanks for commenting. Here is the link you asked for 👉 {{link}}";

function normalizeTriggers(raw: RuleTrigger[] | undefined): RuleTrigger[] {
  const list = raw?.length ? raw : ["comment"];
  const out: RuleTrigger[] = [];
  if (list.includes("comment")) out.push("comment");
  if (list.includes("story_reply")) out.push("story_reply");
  if (list.includes("dm")) out.push("dm");
  return out.length > 0 ? out : ["comment"];
}

function accountStatusLabel(status: string): string {
  if (status === "active") return "Connected";
  if (status === "expired" || status === "disconnected") return "Reconnect needed";
  return status;
}

export function AccountReadiness({
  accounts,
  selectedId,
}: {
  accounts: InstagramAccountOption[];
  selectedId: string | null;
}) {
  const selected = selectedId ? accounts.find((a) => a.id === selectedId) : null;
  const activeCount = accounts.filter((a) => a.status === "active").length;

  let tone: "ready" | "warn" | "empty";
  let message: string;
  let linkLabel: string | null = null;

  if (accounts.length === 0) {
    tone = "empty";
    message = "No Instagram account connected yet.";
    linkLabel = "Connect Instagram";
  } else if (selected) {
    if (selected.status === "active") {
      tone = "ready";
      message = `@${selected.username ?? "this account"} is connected and ready.`;
    } else {
      tone = "warn";
      message = `@${selected.username ?? "This account"} needs reconnection before DMs can send.`;
      linkLabel = "Reconnect in Settings";
    }
  } else if (activeCount > 0) {
    tone = "ready";
    message = activeCount === 1 ? "1 connected account is ready." : `${activeCount} connected accounts are ready.`;
  } else {
    tone = "warn";
    message = "Your Instagram account needs reconnection before DMs can send.";
    linkLabel = "Reconnect in Settings";
  }

  const color =
    tone === "ready" ? "var(--poskoo-green)" : tone === "warn" ? "var(--poskoo-coral)" : "var(--poskoo-muted)";

  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" role="status">
      <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color }}>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {message}
      </span>
      {linkLabel && (
        <Link href="/app/settings" className={ui.link}>
          {linkLabel}
        </Link>
      )}
    </p>
  );
}

function validOptionalHttpsUrl(raw: string): boolean {
  if (!raw.trim()) return true;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function StepCard({
  number,
  title,
  valid,
  optional = false,
  children,
}: {
  number: number;
  title: string;
  valid: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  const titleId = `automation-step-${number}`;
  return (
    <section aria-labelledby={titleId} className={`${styles.stepCard} scroll-mt-28`}>
      <div className={styles.stepHead}>
        <span
          role="img"
          aria-label={valid ? `Step ${number} complete` : `Step ${number} incomplete`}
          className={`${styles.stepCheck} ${valid ? styles.stepDone : ""}`}
        >
          {valid ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> : <span className={styles.stepNum} aria-hidden="true">{number}</span>}
        </span>
        <h2 id={titleId} className={styles.stepTitle}>
          {title}
          {optional && <span className={styles.stepOptional}>Optional</span>}
        </h2>
      </div>
      <div className={styles.stepBody}>{children}</div>
    </section>
  );
}

function PhonePreview({
  comment,
  publicReply,
  dmText,
  linkUrl,
  linkLabel,
  emailGate,
  followGate,
}: {
  comment: string;
  publicReply: string;
  dmText: string;
  linkUrl: string;
  linkLabel: string;
  emailGate: boolean;
  followGate: boolean;
}) {
  const trimmedLink = linkUrl.trim();
  const gated = emailGate || followGate;
  const rendered = useMemo(
    () =>
      buildCommentDmMessage({
        dmText,
        fromUsername: "jane_doe",
        linkUrl: trimmedLink || null,
        emailGate,
        followGate,
        resolvedLink: gated ? null : trimmedLink || null,
      }),
    [dmText, trimmedLink, emailGate, followGate, gated],
  );
  // {{link}} renders as the link button chip: with a URL the URL is lifted out of the text,
  // without one the raw token is hidden and a placeholder chip shows where the button goes.
  const hasLinkToken = /\{\{\s*link\s*\}\}/i.test(dmText);
  const showChip = !gated && (Boolean(trimmedLink) || hasLinkToken);
  const body = (!gated && trimmedLink ? rendered.split(trimmedLink).join("") : rendered).replace(/\{\{\s*link\s*\}\}/gi, "");
  const firstPublicReply = publicReply.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "";

  return (
    <div className={styles.canvas}>
      <h2 className={styles.canvasTitle}>Preview Auto-DM</h2>
      <div className={styles.phone}>
        <div className={styles.screen}>
          <span className={styles.notch} aria-hidden="true" />
          <div className={styles.statusBar} aria-hidden="true"><span>9:41</span><span>5G</span></div>
          <div className={styles.dmHeader}>
            <span className={styles.dmAvatar} aria-hidden="true">JD</span>
            <span className={styles.dmName}><b>jane_doe</b><span>Instagram</span></span>
          </div>
          <div className={styles.thread}>
            <p className={styles.threadNote}>jane_doe commented “{comment}” on your post</p>
            {firstPublicReply && <p className={styles.replyNote}>Public reply: {firstPublicReply}</p>}
            {showChip ? (
              <div className={styles.outCard}>
                <p aria-live="polite" aria-atomic="true">{body.trim() || "Your opening DM will appear here as you type."}</p>
                <span className={styles.linkBtn}>
                  {linkLabel.trim() || "Open link"}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                </span>
              </div>
            ) : (
              <div className={styles.outBubble} aria-live="polite" aria-atomic="true">
                {body.trim() || "Your opening DM will appear here as you type."}
              </div>
            )}
            {gated && <p className={styles.threadNote}>The link is sent after they {followGate ? "follow" : ""}{followGate && emailGate ? " and " : ""}{emailGate ? "share their email" : ""}.</p>}
          </div>
          <div className={styles.inputBar} aria-hidden="true">
            <span><Camera className="h-3 w-3" /></span>
            <span>Message…</span>
          </div>
        </div>
      </div>
      <p className={styles.canvasFoot}>Local preview, nothing is sent</p>
    </div>
  );
}

type RuleBuilderProps = {
  mode: "create" | "edit";
  ruleId?: string;
  initial?: RuleFormDefaults;
  matchModeNote?: string;
  instagramAccounts: InstagramAccountOption[];
  onClose: () => void;
  onSaved: () => void;
};

export default function RuleBuilder({
  mode,
  ruleId,
  initial,
  matchModeNote,
  instagramAccounts,
  onClose,
  onSaved,
}: RuleBuilderProps) {
  const initialKeywords = initial?.keywords ?? [];
  const initialMediaIds = initial?.mediaIds ?? [];
  const initialAccount = initial?.socialAccountId !== undefined
    ? initial.socialAccountId
    : instagramAccounts.find((account) => account.status === "active")?.id ?? null;
  const initialTriggers = normalizeTriggers(initial?.triggers);

  const [name, setName] = useState(initial?.name ?? "");
  const [socialAccountId, setSocialAccountId] = useState<string | null>(initialAccount);
  const [triggerComment, setTriggerComment] = useState(initialTriggers.includes("comment"));
  const [triggerStoryReply, setTriggerStoryReply] = useState(initialTriggers.includes("story_reply"));
  const [triggerDm, setTriggerDm] = useState(initialTriggers.includes("dm"));
  const [postMode, setPostMode] = useState<"any" | "specific">(initialMediaIds.length > 0 ? "specific" : "any");
  const [mediaIds, setMediaIds] = useState<string[]>(initialMediaIds);
  const [media, setMedia] = useState<IgMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(initialMediaIds.length > 0 && Boolean(initialAccount));
  const [mediaError, setMediaError] = useState("");
  const [visibleMedia, setVisibleMedia] = useState(6);
  const [anyWord, setAnyWord] = useState(initialKeywords.includes(ANY_COMMENT_KEYWORD));
  const [keywords, setKeywords] = useState<string[]>(initialKeywords.filter((keyword) => keyword !== ANY_COMMENT_KEYWORD));
  const [keywordDraft, setKeywordDraft] = useState("");
  const [matchType, setMatchType] = useState<"contains" | "exact">(initial?.matchType ?? "contains");
  const [publicReply, setPublicReply] = useState(initial?.publicReply ?? "");
  const [followGate, setFollowGate] = useState(initial?.followGate ?? false);
  const [emailGate, setEmailGate] = useState(initial?.emailGate ?? false);
  const [dmText, setDmText] = useState(initial?.dmText ?? DEFAULT_DM);
  const [linkLabel, setLinkLabel] = useState(initial?.linkLabel ?? "Open link");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (postMode !== "specific" || !socialAccountId) return;
    let active = true;
    listRecentMedia(socialAccountId)
      .then((result) => {
        if (!active) return;
        setMediaLoading(false);
        if (result.ok) {
          setMedia(result.media);
          setMediaError("");
        } else {
          setMedia([]);
          setMediaError(result.error);
        }
      })
      .catch(() => {
        if (!active) return;
        setMediaLoading(false);
        setMedia([]);
        setMediaError("Could not load recent posts. Please try again.");
      });
    return () => {
      active = false;
    };
  }, [postMode, socialAccountId]);

  const linkRequired = followGate || emailGate;
  const stepOneValid = !triggerComment || postMode === "any" || (Boolean(socialAccountId) && mediaIds.length > 0);
  const stepTwoValid = anyWord || keywords.length > 0;
  const stepFiveValid = Boolean(dmText.trim()) && validOptionalHttpsUrl(linkUrl) && (!linkRequired || Boolean(linkUrl.trim()));
  const previewComment = anyWord ? "Love this post!" : keywords[0] ?? "link";

  function addKeywordChips(raw: string) {
    const parsed = parseKeywordChips(raw);
    if (parsed.length === 0) return;
    setKeywords((current) => {
      const seen = new Set(current.map((keyword) => keyword.toLocaleLowerCase()));
      const next = [...current];
      for (const keyword of parsed) {
        if (next.length >= MAX_KEYWORD_CHIPS) break;
        const key = keyword.toLocaleLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(keyword);
      }
      return next;
    });
    setKeywordDraft("");
  }

  function buildInput(): RuleFormInput {
    const triggers: RuleTrigger[] = [];
    if (triggerComment) triggers.push("comment");
    if (triggerStoryReply) triggers.push("story_reply");
    if (triggerDm) triggers.push("dm");
    return {
      name,
      keywords: anyWord ? [ANY_COMMENT_KEYWORD] : keywords,
      matchType,
      dmText,
      publicReply,
      linkUrl,
      linkLabel,
      emailGate,
      followGate,
      triggers,
      socialAccountId,
      mediaIds: triggerComment && postMode === "specific" ? mediaIds : [],
    };
  }

  function submit(saveAsNew = false) {
    if (pending) return;
    setErrors([]);
    startTransition(async () => {
      try {
        const input = buildInput();
        const shouldUpdate = mode === "edit" && ruleId && !saveAsNew;
        const result = shouldUpdate ? await updateRule(ruleId, input) : await createRule(input);
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

  function applyTemplate(template: DmTemplate) {
    setName(template.title);
    setAnyWord(template.matchMode === "any");
    setKeywords(template.matchMode === "any" ? [] : [...template.keywords]);
    setMatchType(template.matchMode === "exact" ? "exact" : "contains");
    setDmText(template.dmMessage);
    setPublicReply(template.publicReply);
    setEmailGate(template.askEmail);
    setFollowGate(template.requireFollow);
    setTemplateOpen(false);
  }

  const templates = TEMPLATE_SLUGS.flatMap((slug) => {
    const template = DM_TEMPLATES.find((item) => item.slug === slug);
    return template ? [template] : [];
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(false);
      }}
      className="min-w-0"
    >
      <div className={styles.builderBar}>
        <div className={styles.builderBarLeft}>
          <p className={styles.builderTitle}>{mode === "edit" ? "Edit Auto-DM" : "New Auto-DM"}</p>
          <Link href="/help/instagram-auto-dm-not-working" className={`${ui.link} px-1 py-2 text-sm`}>Need help?</Link>
        </div>
        <div className={styles.builderBarRight}>
          <button type="button" className={styles.lineBtn} disabled={pending} onClick={onClose}>Cancel</button>
          {/* Save as new always calls createRule; the primary button updates in edit mode. */}
          {mode === "edit" && (
            <button type="button" className={styles.lineBtn} disabled={pending} onClick={() => submit(true)}>
              Save as new Auto-DM
            </button>
          )}
          <button type="submit" className={styles.goLive} disabled={pending} aria-busy={pending}>
            {pending ? "Saving…" : mode === "edit" ? "Update Auto-DM" : "Go live"}
          </button>
        </div>
      </div>

      {matchModeNote && <p className={`${ui.notice} mb-5 text-sm`}>{matchModeNote}</p>}
      {errors.length > 0 && (
        <ul role="alert" className={`${ui.notice} ${ui.noticeWarn} mb-5 space-y-1 text-sm`}>
          {errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      )}

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <aside className="min-w-0 lg:sticky lg:top-20" aria-label="Live Instagram preview">
          <PhonePreview
            comment={previewComment}
            publicReply={publicReply}
            dmText={dmText}
            linkUrl={linkUrl}
            linkLabel={linkLabel}
            emailGate={emailGate}
            followGate={followGate}
          />
        </aside>

        <fieldset disabled={pending} className="m-0 min-w-0 space-y-4 border-0 p-0">
          <section className={styles.stepCard} aria-labelledby="automation-settings">
            <h2 id="automation-settings" className={styles.stepTitle}>Auto-DM settings</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rule-builder-name" className={ui.label}>Name</label>
                <input id="rule-builder-name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className={INPUT} placeholder="Free guide DM" />
              </div>
              <div>
                <label htmlFor="rule-builder-account" className={ui.label}>Instagram account</label>
                <select
                  id="rule-builder-account"
                  value={socialAccountId ?? ""}
                  onChange={(event) => {
                    const next = event.target.value || null;
                    setSocialAccountId(next);
                    setMediaIds([]);
                    setMedia([]);
                    setVisibleMedia(6);
                    setMediaError("");
                    setMediaLoading(postMode === "specific" && Boolean(next));
                  }}
                  className={INPUT}
                >
                  <option value="">All connected Instagram accounts</option>
                  {instagramAccounts.map((account) => (
                    <option key={account.id} value={account.id}>@{account.username ?? "unknown"} ({accountStatusLabel(account.status)})</option>
                  ))}
                </select>
                <AccountReadiness accounts={instagramAccounts} selectedId={socialAccountId} />
              </div>
            </div>
            <fieldset className="m-0 mt-4 border-0 p-0">
              <legend className={ui.label}>Triggers</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className={`${styles.toggleRow} ${triggerComment ? styles.toggleRowOn : ""}`} style={{ marginTop: 0 }}>
                  <input type="checkbox" checked={triggerComment} onChange={(event) => setTriggerComment(event.target.checked)} />
                  Post and reel comments
                </label>
                <label className={`${styles.toggleRow} ${triggerStoryReply ? styles.toggleRowOn : ""}`} style={{ marginTop: 0 }}>
                  <input type="checkbox" checked={triggerStoryReply} onChange={(event) => setTriggerStoryReply(event.target.checked)} />
                  Story replies
                </label>
                <label className={`${styles.toggleRow} ${triggerDm ? styles.toggleRowOn : ""}`} style={{ marginTop: 0 }}>
                  <input type="checkbox" checked={triggerDm} onChange={(event) => setTriggerDm(event.target.checked)} />
                  DMs with a keyword
                </label>
              </div>
            </fieldset>
          </section>

          <StepCard number={1} title="When a user comments on" valid={stepOneValid}>
            <div>
              <label className={`${styles.toggleRow} ${postMode === "specific" ? styles.toggleRowOn : ""}`}>
                <input
                  type="radio"
                  name="post-mode"
                  checked={postMode === "specific"}
                  onChange={() => {
                    setPostMode("specific");
                    setMediaLoading(Boolean(socialAccountId));
                    setMediaError(socialAccountId ? "" : "Choose one Instagram account above to select its posts.");
                  }}
                />
                <span>A specific post or reel<span className={styles.toggleHint}>Only comments on the posts you pick</span></span>
              </label>
              <label className={`${styles.toggleRow} ${postMode === "any" ? styles.toggleRowOn : ""}`}>
                <input type="radio" name="post-mode" checked={postMode === "any"} onChange={() => { setPostMode("any"); setMediaIds([]); }} />
                <span>Any post or reel<span className={styles.toggleHint}>Every post and reel on the account, including future ones</span></span>
              </label>
            </div>
            {postMode === "specific" && triggerComment && (
              <div className="mt-4">
                {!socialAccountId && <p className={`${ui.notice} ${ui.noticeWarn} text-sm`}>Choose one Instagram account above to select its posts.</p>}
                {mediaLoading && <p role="status" className="flex items-center gap-2 text-sm text-[var(--poskoo-muted)]"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Loading recent posts…</p>}
                {mediaError && <p role="alert" className="text-sm text-[var(--poskoo-red)]">{mediaError}</p>}
                {!mediaLoading && !mediaError && socialAccountId && media.length === 0 && <p className="text-sm text-[var(--poskoo-muted)]">No recent posts or reels were found on this account.</p>}
                {media.length > 0 && (
                  <>
                    <ul className={`${styles.thumbStrip} m-0 list-none`}>
                      {media.slice(0, visibleMedia).map((item) => {
                        const selected = mediaIds.includes(item.id);
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              aria-pressed={selected}
                              aria-label={`${selected ? "Remove" : "Select"} ${item.isReel ? "reel" : "post"}${item.caption ? `: ${item.caption.slice(0, 80)}` : ""}`}
                              onClick={() => setMediaIds((current) => selected ? current.filter((id) => id !== item.id) : [...current, item.id])}
                              className={`group relative block aspect-[4/5] w-full overflow-hidden rounded-xl border-2 text-left ${selected ? "border-[var(--poskoo-violet)]" : "border-[var(--poskoo-line)]"}`}
                            >
                              {item.imageUrl ? (
                                // Instagram CDN hosts vary; a plain lazy image does not require remote image configuration.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.imageUrl} alt={item.caption ? item.caption.slice(0, 100) : "Instagram post"} loading="lazy" className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full items-center justify-center bg-[var(--poskoo-band)] p-3 text-xs text-[var(--poskoo-muted)]">{item.isReel ? "Reel" : "Instagram post"}</span>
                              )}
                              <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6 text-[11px] font-semibold text-white">
                                <span className="inline-flex items-center gap-0.5"><Heart className="h-3 w-3" aria-hidden="true" />{item.likes ?? "–"}</span>
                                <span className="inline-flex items-center gap-0.5"><MessageCircle className="h-3 w-3" aria-hidden="true" />{item.comments ?? "–"}</span>
                                <span className="ml-auto">{item.isReel ? "Reel" : "Post"}</span>
                              </span>
                              {selected && <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--fill-strong,var(--poskoo-violet))] text-white"><Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="m-0 text-sm text-[var(--poskoo-muted)]">{mediaIds.length} selected</p>
                      {visibleMedia < media.length && <Btn type="button" variant="ghost" size="sm" onClick={() => setVisibleMedia((count) => count + 6)}>Show more<ChevronRight className="h-4 w-4" aria-hidden="true" /></Btn>}
                    </div>
                  </>
                )}
              </div>
            )}
          </StepCard>

          <StepCard number={2} title="And their comment has" valid={stepTwoValid}>
            <div className="mb-4">
              <label className={`${styles.toggleRow} ${!anyWord ? styles.toggleRowOn : ""}`}>
                <input type="radio" name="keyword-mode" checked={!anyWord} onChange={() => setAnyWord(false)} />
                <span>A specific keyword<span className={styles.toggleHint}>Only comments with one of your keywords</span></span>
              </label>
              <label className={`${styles.toggleRow} ${anyWord ? styles.toggleRowOn : ""}`}>
                <input type="radio" name="keyword-mode" checked={anyWord} onChange={() => setAnyWord(true)} />
                <span>Any word<span className={styles.toggleHint}>Reply to every comment</span></span>
              </label>
            </div>
            {!anyWord && (
              <>
                <label htmlFor="rule-builder-keywords" className={ui.label}>Keyword chips</label>
                <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1.5 focus-within:border-[var(--poskoo-violet)]">
                  {keywords.map((keyword) => (
                    <span key={keyword} className="inline-flex items-center gap-1 rounded-full bg-[var(--poskoo-band)] py-1.5 pl-3 pr-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">
                      {keyword}
                      <button type="button" aria-label={`Remove ${keyword}`} onClick={() => setKeywords((current) => current.filter((item) => item !== keyword))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[var(--poskoo-card)]"><X className="h-3.5 w-3.5" aria-hidden="true" /></button>
                    </span>
                  ))}
                  <input
                    id="rule-builder-keywords"
                    value={keywordDraft}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (/[,，\n\r]/.test(value)) addKeywordChips(value);
                      else setKeywordDraft(value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === "," || event.key === "，") {
                        event.preventDefault();
                        addKeywordChips(keywordDraft);
                      }
                    }}
                    onBlur={() => addKeywordChips(keywordDraft)}
                    placeholder={keywords.length === 0 ? "Type a keyword, then Enter" : "Add another"}
                    className="min-h-10 min-w-32 flex-1 border-0 bg-transparent px-2 text-sm text-[var(--poskoo-ink)] outline-none placeholder:text-[var(--poskoo-muted)]"
                    disabled={keywords.length >= MAX_KEYWORD_CHIPS}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_KEYWORDS.filter((keyword) => !keywords.some((item) => item.toLocaleLowerCase() === keyword)).map((keyword) => (
                      <button key={keyword} type="button" disabled={keywords.length >= MAX_KEYWORD_CHIPS} onClick={() => addKeywordChips(keyword)} className={`${ui.pill} min-h-9 text-xs hover:border-[var(--poskoo-violet)]`}><Plus className="h-3 w-3" aria-hidden="true" />{keyword}</button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[var(--poskoo-muted)]">{keywords.length}/{MAX_KEYWORD_CHIPS}</span>
                </div>
              </>
            )}
            {!anyWord && (
              <fieldset className="m-0 mt-4 border-0 p-0">
                <legend className={ui.label}>Keyword match</legend>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                  <label className={ui.checkRow}><input type="radio" name="keyword-match" checked={matchType === "contains"} onChange={() => setMatchType("contains")} />Contains</label>
                  <label className={ui.checkRow}><input type="radio" name="keyword-match" checked={matchType === "exact"} onChange={() => setMatchType("exact")} />Exact comment</label>
                </div>
              </fieldset>
            )}
          </StepCard>

          <StepCard number={3} title="Reply publicly under the comment" valid optional>
            <label htmlFor="rule-builder-public-reply" className={ui.label}>Reply variants</label>
            <textarea
              id="rule-builder-public-reply"
              rows={3}
              maxLength={PUBLIC_REPLY_MAX}
              value={publicReply}
              onChange={(event) => setPublicReply(event.target.value)}
              className={`${INPUT} resize-y`}
              placeholder={"Sent it to your DMs! 📩\nCheck your messages — it is there! ✅"}
              disabled={!triggerComment}
            />
            <div className="mt-1.5 flex flex-wrap justify-between gap-2 text-xs text-[var(--poskoo-muted)]">
              <span>Put each variant on a new line. One is chosen at random.</span>
              <span>{publicReply.length}/{PUBLIC_REPLY_MAX}</span>
            </div>
          </StepCard>

          <StepCard number={4} title="They will optionally get" valid>
            <div className="space-y-2">
              <div className="flex min-h-14 items-center gap-3 rounded-xl bg-[var(--poskoo-paper)] px-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--poskoo-lime)]"><Send className="h-4 w-4" aria-hidden="true" /></span>
                <div><p className="m-0 text-sm font-semibold text-[var(--poskoo-ink)]">Opening DM</p><p className="m-0 text-xs text-[var(--poskoo-muted)]">The message in step 5 starts the conversation.</p></div>
              </div>
              <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-[var(--poskoo-line)] px-3 py-3">
                <input type="checkbox" checked={followGate} onChange={(event) => setFollowGate(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--poskoo-violet)]" />
                <span><span className="block text-sm font-semibold text-[var(--poskoo-ink)]">Ask to follow first</span><span className="mt-0.5 block text-xs text-[var(--poskoo-muted)]">Send the link after they follow and reply “done”.</span></span>
              </label>
              <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-[var(--poskoo-line)] px-3 py-3">
                <input type="checkbox" checked={emailGate} onChange={(event) => setEmailGate(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--poskoo-violet)]" />
                <span><span className="block text-sm font-semibold text-[var(--poskoo-ink)]">Ask for email first</span><span className="mt-0.5 block text-xs text-[var(--poskoo-muted)]">Collect an email before the link is delivered.</span></span>
              </label>
            </div>
          </StepCard>

          <StepCard number={5} title="And they get a DM with" valid={stepFiveValid}>
            <div className="mb-3 flex justify-end">
              <Btn type="button" variant="ghost" size="sm" onClick={() => setTemplateOpen((open) => !open)} aria-expanded={templateOpen}><MessageCircle className="h-4 w-4" aria-hidden="true" />Use template</Btn>
            </div>
            {templateOpen && (
              <div className="mb-4 grid gap-2 rounded-2xl bg-[var(--poskoo-paper)] p-3 sm:grid-cols-2">
                {templates.map((template) => (
                  <button key={template.slug} type="button" onClick={() => applyTemplate(template)} className="min-h-14 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-left hover:border-[var(--poskoo-violet)]">
                    <span className="block text-sm font-semibold text-[var(--poskoo-ink)]">{template.title}</span>
                    <span className="mt-0.5 block text-xs text-[var(--poskoo-muted)]">{template.useCase}</span>
                  </button>
                ))}
              </div>
            )}
            <label htmlFor="rule-builder-dm" className={ui.label}>Message</label>
            <textarea id="rule-builder-dm" required rows={7} maxLength={1000} value={dmText} onChange={(event) => setDmText(event.target.value)} className={`${INPUT} resize-y`} placeholder="Hey {{username}}! Here is your link 👉 {{link}}" />
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-xs text-[var(--poskoo-muted)]">Use {"{{username}}"} and {"{{link}}"} where you need them.</p>
              <span className={`text-xs font-semibold ${dmText.length >= 900 ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-muted)]"}`}>{dmText.length}/1000</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
              <div>
                <label htmlFor="rule-builder-link-label" className={ui.label}>Link button text</label>
                <input id="rule-builder-link-label" maxLength={80} value={linkLabel} onChange={(event) => setLinkLabel(event.target.value)} className={INPUT} placeholder="Open link" />
              </div>
              <div>
                <label htmlFor="rule-builder-link" className={ui.label}>Link URL {linkRequired && <span className="text-[var(--poskoo-coral)]">(required with gates)</span>}</label>
                <input id="rule-builder-link" type="url" required={linkRequired} value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} className={INPUT} placeholder="https://yoursite.com/guide" />
              </div>
            </div>
          </StepCard>
        </fieldset>
      </div>
    </form>
  );
}
