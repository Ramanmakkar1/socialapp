"use client";

// Per-network settings in the composer for TikTok, Pinterest and LinkedIn company pages.
// TikTok's Content Sharing Guidelines are followed to the letter: creator shown, visibility picked
// by the user from creator_info (no default), interaction toggles off by default and greyed out when
// the creator disabled them, commercial content disclosure, and the consent sentence.
import { useEffect, useId, useState } from "react";
import { mediaKindFromUrl } from "@/lib/mediaUpload";
import {
  GBP_CTA_LABEL,
  GBP_TITLE_MAX,
  GBP_TYPE_LABEL,
  gbpOptionsError,
  parseGbpOptions,
  type GbpOptions,
  type GbpPostType,
  PINTEREST_TITLE_MAX,
  TIKTOK_PRIVACY_LABEL,
  parsePinterestOptions,
  parseTikTokOptions,
  tiktokConsentText,
  type TikTokOptions,
} from "@/lib/networks/options";
import type { PlatformId } from "@/lib/platforms";
import { pinterestBoardsAction, tiktokCreatorInfoAction, type PinterestBoardsResult, type TikTokCreatorResult } from "./networkActions";

export type NetworkPanelData = {
  /** LinkedIn organizations the member administers (only with the Community Management API). */
  linkedinOrgs?: { urn: string; name: string }[];
};

type Props = {
  enabled: Record<PlatformId, boolean>;
  options: Record<string, Record<string, unknown>>;
  onChange: (network: string, value: Record<string, unknown>) => void;
  mediaUrls: string[];
  data: NetworkPanelData;
};

const box = "rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4";
const field =
  "mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none";
const check = "rounded border-[var(--poskoo-line)] text-[var(--poskoo-violet)] focus:ring-[var(--poskoo-violet)]";
const linkCls = "text-[var(--poskoo-violet)] underline";

export default function NetworkOptionsPanel({ enabled, options, onChange, mediaUrls, data }: Props) {
  return (
    <>
      {enabled.tiktok && <TikTokPanel value={parseTikTokOptions(options.tiktok)} onChange={(v) => onChange("tiktok", v)} mediaUrls={mediaUrls} />}
      {enabled.pinterest && <PinterestPanel value={options.pinterest ?? {}} onChange={(v) => onChange("pinterest", v)} />}
      {enabled.gbp && <GbpPanel value={parseGbpOptions(options.gbp)} onChange={(v) => onChange("gbp", v)} mediaUrls={mediaUrls} />}
      {enabled.linkedin && (data.linkedinOrgs?.length ?? 0) > 0 && (
        <LinkedInPanel value={options.linkedin ?? {}} orgs={data.linkedinOrgs ?? []} onChange={(v) => onChange("linkedin", v)} />
      )}
    </>
  );
}

function useVideoDuration(url: string | null): number | null {
  const [duration, setDuration] = useState<number | null>(null);
  useEffect(() => {
    if (!url) return;
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => setDuration(Number.isFinite(el.duration) ? el.duration : null);
    el.onerror = () => setDuration(null);
    el.src = url;
    return () => {
      el.removeAttribute("src");
    };
  }, [url]);
  return url ? duration : null;
}

function TikTokPanel({ value, onChange, mediaUrls }: { value: TikTokOptions; onChange: (v: TikTokOptions) => void; mediaUrls: string[] }) {
  const id = useId();
  const [creator, setCreator] = useState<TikTokCreatorResult | null>(null);
  useEffect(() => {
    let active = true;
    tiktokCreatorInfoAction()
      .then((r) => active && setCreator(r))
      .catch(() => active && setCreator({ ok: false, error: "Could not reach TikTok. Try again in a moment." }));
    return () => {
      active = false;
    };
  }, []);
  const filled = mediaUrls.map((u) => u.trim()).filter((u) => u !== "");
  const videoUrl = filled.find((u) => mediaKindFromUrl(u) === "video") ?? null;
  const isPhoto = filled.length > 0 && !videoUrl;
  const duration = useVideoDuration(videoUrl);
  const set = (patch: Partial<TikTokOptions>) => onChange({ ...value, ...patch });
  const info = creator?.ok ? creator.info : null;
  const maxDuration = info?.maxVideoPostDurationSec ?? 0;
  const tooLong = duration !== null && maxDuration > 0 && duration > maxDuration;
  const inbox = value.mode === "inbox";

  return (
    <section className={box} aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="m-0 text-sm font-semibold text-[var(--poskoo-ink)]">TikTok settings</h3>
      {creator === null && <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Loading your TikTok account…</p>}
      {creator && !creator.ok && <p className="mt-2 text-sm text-[var(--poskoo-coral)]" role="alert">{creator.error}</p>}
      {info && (
        <p className="mt-2 flex items-center gap-2 text-sm text-[var(--poskoo-ink)]">
          {info.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- TikTok CDN avatar, short-lived URL
            <img src={info.avatarUrl} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
          ) : null}
          Posting to <b>{info.nickname || info.username}</b>
          {info.username ? <span className="text-[var(--poskoo-muted)]">@{info.username}</span> : null}
        </p>
      )}

      <fieldset className="mt-3">
        <legend className="text-sm font-medium text-[var(--poskoo-ink)]">How to post</legend>
        <label className="mt-1 flex items-center gap-2 text-sm text-[var(--poskoo-ink)]">
          <input type="radio" name={`${id}-mode`} checked={!inbox} onChange={() => set({ mode: "direct" })} /> Post directly to my profile
        </label>
        <label className="mt-1 flex items-center gap-2 text-sm text-[var(--poskoo-ink)]">
          <input type="radio" name={`${id}-mode`} checked={inbox} onChange={() => set({ mode: "inbox" })} /> Send to my TikTok inbox as a draft (I finish it in the TikTok app)
        </label>
      </fieldset>

      {!inbox && (
        <>
          <label htmlFor={`${id}-privacy`} className="mt-3 block text-sm font-medium text-[var(--poskoo-ink)]">Who can view this {isPhoto ? "post" : "video"}</label>
          <select
            id={`${id}-privacy`}
            value={value.privacyLevel}
            onChange={(e) => set({ privacyLevel: e.target.value as TikTokOptions["privacyLevel"] })}
            className={field}
            disabled={!info}
          >
            <option value="" disabled>Choose who can view</option>
            {(info?.privacyLevelOptions ?? []).map((p) => (
              <option key={p} value={p} disabled={p === "SELF_ONLY" && value.brandedContent}>
                {TIKTOK_PRIVACY_LABEL[p]}
                {p === "SELF_ONLY" && value.brandedContent ? " (not available for branded content)" : ""}
              </option>
            ))}
          </select>
          {value.brandedContent && <p className="mt-1 text-xs text-[var(--poskoo-muted)]">Branded content visibility cannot be set to private.</p>}

          <fieldset className="mt-3">
            <legend className="text-sm font-medium text-[var(--poskoo-ink)]">Allow users to</legend>
            <div className="mt-1 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-[var(--poskoo-ink)]" title={info?.commentDisabled ? "Comments are turned off in your TikTok settings" : undefined}>
                <input type="checkbox" className={check} checked={value.allowComment && !info?.commentDisabled} disabled={!info || info.commentDisabled} onChange={(e) => set({ allowComment: e.target.checked })} /> Comment
              </label>
              {!isPhoto && (
                <>
                  <label className="flex items-center gap-2 text-sm text-[var(--poskoo-ink)]" title={info?.duetDisabled ? "Duet is turned off in your TikTok settings" : undefined}>
                    <input type="checkbox" className={check} checked={value.allowDuet && !info?.duetDisabled} disabled={!info || info.duetDisabled} onChange={(e) => set({ allowDuet: e.target.checked })} /> Duet
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--poskoo-ink)]" title={info?.stitchDisabled ? "Stitch is turned off in your TikTok settings" : undefined}>
                    <input type="checkbox" className={check} checked={value.allowStitch && !info?.stitchDisabled} disabled={!info || info.stitchDisabled} onChange={(e) => set({ allowStitch: e.target.checked })} /> Stitch
                  </label>
                </>
              )}
            </div>
          </fieldset>

          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--poskoo-ink)]">
              <input
                type="checkbox"
                className={check}
                checked={value.commercial}
                onChange={(e) => set({ commercial: e.target.checked, ...(e.target.checked ? {} : { yourBrand: false, brandedContent: false }) })}
              />
              Disclose {isPhoto ? "post" : "video"} content
            </label>
            <p className="mt-1 text-xs text-[var(--poskoo-muted)]">Turn on to disclose that this content promotes goods or services in exchange for something of value. It may promote you, a third party, or both.</p>
            {value.commercial && (
              <div className="mt-2 space-y-2 pl-6">
                <label className="flex items-start gap-2 text-sm text-[var(--poskoo-ink)]">
                  <input type="checkbox" className={`${check} mt-0.5`} checked={value.yourBrand} onChange={(e) => set({ yourBrand: e.target.checked })} />
                  <span>
                    <b>Your brand</b> — you are promoting yourself or your own business.
                    {value.yourBrand && !value.brandedContent && <span className="block text-xs text-[var(--poskoo-muted)]">Your {isPhoto ? "photo" : "video"} will be labeled “Promotional content”.</span>}
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-[var(--poskoo-ink)]">
                  <input
                    type="checkbox"
                    className={`${check} mt-0.5`}
                    checked={value.brandedContent}
                    disabled={value.privacyLevel === "SELF_ONLY"}
                    title={value.privacyLevel === "SELF_ONLY" ? "Branded content visibility cannot be set to private." : undefined}
                    onChange={(e) => set({ brandedContent: e.target.checked })}
                  />
                  <span>
                    <b>Branded content</b> — you are promoting another brand or a third party.
                    {value.brandedContent && <span className="block text-xs text-[var(--poskoo-muted)]">Your {isPhoto ? "photo" : "video"} will be labeled “Paid partnership”.</span>}
                  </span>
                </label>
                {!value.yourBrand && !value.brandedContent && (
                  <p className="text-xs text-[var(--poskoo-coral)]" role="alert">You need to indicate if your content promotes yourself, a third party, or both.</p>
                )}
              </div>
            )}
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--poskoo-ink)]">
            <input type="checkbox" className={check} checked={value.isAigc} onChange={(e) => set({ isAigc: e.target.checked })} /> This content is AI-generated
          </label>
        </>
      )}

      {tooLong && (
        <p className="mt-3 text-sm text-[var(--poskoo-coral)]" role="alert">
          This video is {Math.round(duration ?? 0)} seconds; your TikTok account can post videos up to {maxDuration} seconds.
        </p>
      )}
      {filled.length === 0 && <p className="mt-3 text-xs text-[var(--poskoo-muted)]">TikTok needs a video (or photos uploaded in Poskoo).</p>}

      <p className="mt-3 text-xs text-[var(--poskoo-muted)]">
        {inbox ? (
          <>The video goes to your TikTok inbox; open TikTok to edit and post it. </>
        ) : null}
        {value.brandedContent ? (
          <>
            By posting, you agree to TikTok&apos;s{" "}
            <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noreferrer" className={linkCls}>Branded Content Policy</a> and{" "}
            <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer" className={linkCls}>Music Usage Confirmation</a>.
          </>
        ) : (
          <>
            By posting, you agree to TikTok&apos;s{" "}
            <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer" className={linkCls}>Music Usage Confirmation</a>.
          </>
        )}
        <span className="sr-only">{tiktokConsentText(value)}</span>
      </p>
      <p className="mt-1 text-xs text-[var(--poskoo-muted)]">After publishing, it can take a few minutes for TikTok to process the post and show it on your profile.</p>
    </section>
  );
}

function PinterestPanel({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const id = useId();
  const opts = parsePinterestOptions(value);
  const [boards, setBoards] = useState<PinterestBoardsResult | null>(null);
  useEffect(() => {
    let active = true;
    pinterestBoardsAction()
      .then((r) => active && setBoards(r))
      .catch(() => active && setBoards({ ok: false, error: "Could not load your Pinterest boards." }));
    return () => {
      active = false;
    };
  }, []);
  const set = (patch: Partial<typeof opts>) => onChange({ ...opts, ...patch });
  const titleLen = Array.from(opts.title).length;
  return (
    <section className={box} aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="m-0 text-sm font-semibold text-[var(--poskoo-ink)]">Pinterest pin</h3>
      <label htmlFor={`${id}-board`} className="mt-3 block text-sm font-medium text-[var(--poskoo-ink)]">Board</label>
      <select id={`${id}-board`} value={opts.boardId} onChange={(e) => set({ boardId: e.target.value })} className={field} disabled={!boards?.ok}>
        <option value="">{boards === null ? "Loading boards…" : boards.ok ? (boards.boards.length ? "Choose a board" : "No boards yet: create one on Pinterest") : "Boards unavailable"}</option>
        {boards?.ok && boards.boards.map((b) => <option key={b.id} value={b.id}>{b.name}{b.privacy === "SECRET" ? " (secret)" : ""}</option>)}
      </select>
      {boards && !boards.ok && <p className="mt-1 text-sm text-[var(--poskoo-coral)]" role="alert">{boards.error}</p>}
      <label htmlFor={`${id}-title`} className="mt-3 block text-sm font-medium text-[var(--poskoo-ink)]">Pin title</label>
      <input id={`${id}-title`} value={opts.title} maxLength={PINTEREST_TITLE_MAX} onChange={(e) => set({ title: e.target.value })} placeholder="A short, searchable title" className={field} />
      <p className={`mt-1 text-xs ${titleLen > PINTEREST_TITLE_MAX ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-muted)]"}`}>{titleLen} / {PINTEREST_TITLE_MAX}</p>
      <label htmlFor={`${id}-link`} className="mt-2 block text-sm font-medium text-[var(--poskoo-ink)]">Destination link (optional)</label>
      <input id={`${id}-link`} type="url" value={opts.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://your-site.com/page" className={field} />
      <p className="mt-2 text-xs text-[var(--poskoo-muted)]">The caption is the pin description (up to 500 characters). Pins need an image.</p>
    </section>
  );
}

function LinkedInPanel({ value, orgs, onChange }: { value: Record<string, unknown>; orgs: { urn: string; name: string }[]; onChange: (v: Record<string, unknown>) => void }) {
  const id = useId();
  const author = typeof value.author === "string" ? value.author : "";
  return (
    <section className={box}>
      <label htmlFor={`${id}-author`} className="block text-sm font-medium text-[var(--poskoo-ink)]">Post on LinkedIn as</label>
      <select id={`${id}-author`} value={author} onChange={(e) => onChange({ author: e.target.value })} className={field}>
        <option value="">My profile</option>
        {orgs.map((o) => <option key={o.urn} value={o.urn}>{o.name} (page)</option>)}
      </select>
    </section>
  );
}

function GbpPanel({ value, onChange, mediaUrls }: { value: GbpOptions; onChange: (v: GbpOptions) => void; mediaUrls: string[] }) {
  const id = useId();
  const set = (patch: Partial<GbpOptions>) => onChange({ ...value, ...patch });
  const media = mediaUrls.map((u) => u.trim()).filter(Boolean).map((url) => ({ type: mediaKindFromUrl(url) === "video" ? ("video" as const) : ("image" as const), url }));
  const problem = gbpOptionsError(value, media);
  const types: GbpPostType[] = ["STANDARD", "OFFER", "EVENT"];
  const isEvent = value.type === "EVENT";
  return (
    <section className={box} aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="m-0 text-sm font-semibold text-[var(--poskoo-ink)]">Google Business Profile post</h3>
      <div role="tablist" aria-label="Post type" className="mt-3 inline-flex rounded-full border border-[var(--poskoo-line)] p-0.5">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={value.type === t}
            onClick={() => set({ type: t })}
            className={`rounded-full px-3 py-1 text-sm ${value.type === t ? "bg-[var(--poskoo-ink)] text-white" : "text-[var(--poskoo-ink)]"}`}
          >
            {GBP_TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      {value.type !== "STANDARD" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--poskoo-ink)] sm:col-span-2">
            {value.type === "OFFER" ? "Offer title" : "Event title"}
            <input value={value.title} maxLength={GBP_TITLE_MAX} onChange={(e) => set({ title: e.target.value })} className={field} placeholder={value.type === "OFFER" ? "20% off all pastries" : "Latte art workshop"} />
          </label>
          <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
            Start date
            <input type="date" value={value.startDate} onChange={(e) => set({ startDate: e.target.value })} className={field} />
          </label>
          <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
            End date
            <input type="date" value={value.endDate} onChange={(e) => set({ endDate: e.target.value })} className={field} />
          </label>
          {isEvent && (
            <>
              <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
                Start time (optional)
                <input type="time" value={value.startTime} onChange={(e) => set({ startTime: e.target.value })} className={field} />
              </label>
              <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
                End time (optional)
                <input type="time" value={value.endTime} onChange={(e) => set({ endTime: e.target.value })} className={field} />
              </label>
            </>
          )}
        </div>
      )}
      {value.type === "OFFER" && (
        <div className="mt-3 grid gap-3">
          <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
            Coupon code (optional)
            <input value={value.couponCode} onChange={(e) => set({ couponCode: e.target.value })} className={field} />
          </label>
          <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
            Link to redeem (optional)
            <input type="url" value={value.redeemUrl} onChange={(e) => set({ redeemUrl: e.target.value })} className={field} placeholder="https://" />
          </label>
          <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
            Terms and conditions (optional)
            <textarea value={value.terms} rows={2} onChange={(e) => set({ terms: e.target.value })} className={field} />
          </label>
        </div>
      )}
      {value.type !== "OFFER" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
            Button (optional)
            <select value={value.cta} onChange={(e) => set({ cta: e.target.value as GbpOptions["cta"] })} className={field}>
              <option value="">None</option>
              {(Object.keys(GBP_CTA_LABEL) as (keyof typeof GBP_CTA_LABEL)[]).map((c) => <option key={c} value={c}>{GBP_CTA_LABEL[c]}</option>)}
            </select>
          </label>
          {value.cta && value.cta !== "CALL" && (
            <label className="block text-sm font-medium text-[var(--poskoo-ink)]">
              Button link
              <input type="url" value={value.ctaUrl} onChange={(e) => set({ ctaUrl: e.target.value })} className={field} placeholder="https://" />
            </label>
          )}
        </div>
      )}
      {value.cta === "CALL" && value.type !== "OFFER" && <p className="mt-1 text-xs text-[var(--poskoo-muted)]">“Call now” uses the phone number on your Business Profile.</p>}
      <p className="mt-3 text-xs text-[var(--poskoo-muted)]">The caption is the post text (up to 1,500 characters). One JPG or PNG photo, 10 KB to 5 MB, at least 250×250.</p>
      {problem && media.length > 0 && <p className="mt-2 text-sm text-[var(--poskoo-coral)]" role="alert">{problem}</p>}
    </section>
  );
}
