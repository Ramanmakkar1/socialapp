"use client";

import { useState } from "react";
import { AtSign, Bookmark, Facebook, Globe2, Heart, Image as ImageIcon, Instagram, MessageCircle, MoreHorizontal, Music2, Play, Repeat2, Send, Share2, ThumbsUp, Youtube } from "lucide-react";
import { captionTokens, truncateCaption } from "@/lib/captionTokens";
import { mediaKindFromUrl } from "@/lib/mediaUpload";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";
import { NEW_NETWORK_COLOR, NEW_NETWORK_ICON } from "@/components/brandIcons";
import { GBP_CTA_LABEL, GBP_TYPE_LABEL, parseGbpOptions, type GbpOptions } from "@/lib/networks/options";
import styles from "./postPreview.module.css";

const ICON: Record<PlatformId, typeof Instagram> = { instagram: Instagram, facebook: Facebook, threads: AtSign, youtube: Youtube, ...NEW_NETWORK_ICON };
const COLOR: Record<PlatformId, string> = { instagram: "#d62976", facebook: "#1877f2", threads: "#000", youtube: "#ff0000", ...NEW_NETWORK_COLOR };

type Props = {
  selected: PlatformId[];
  /** Caption each selected network will post (custom override or the main caption). */
  captions: Partial<Record<PlatformId, string>>;
  mediaUrls: string[];
  accountNames: Record<string, string>;
  /** Short time label for the post header ("now" when no time is set). */
  whenLabel?: string;
  /** Composer options of the networks that have them (Google Business Profile post type / CTA). */
  netOptions?: Record<string, Record<string, unknown>>;
};

function Caption({ text, platform }: { text: string; platform: PlatformId }) {
  const limit = platform === "instagram" ? 125 : platform === "tiktok" ? 90 : platform === "facebook" || platform === "linkedin" ? 240 : 0;
  const { text: shown, cut } = limit ? truncateCaption(text, limit) : { text, cut: false };
  return (
    <>
      {captionTokens(shown).map((t, i) =>
        t.kind === "text" ? <span key={i}>{t.text}</span> : <span key={i} className={styles.token}>{t.text}</span>,
      )}
      {cut && <span className={styles.more}>… {platform === "linkedin" ? "see more" : "more"}</span>}
    </>
  );
}

function Bars({ lines = 3 }: { lines?: number }) {
  return (
    <span className={styles.bars} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => <span key={i} style={{ width: i === lines - 1 ? "55%" : "100%" }} />)}
    </span>
  );
}

function Media({ urls, shape, dark = false }: { urls: string[]; shape: "square" | "wide" | "tall" | "auto"; dark?: boolean }) {
  const cls = `${styles.media} ${styles[`media_${shape}`]} ${dark ? styles.mediaDark : ""}`;
  if (urls.length === 0) {
    // Network-shaped skeleton until media is added (not a flat grey box).
    return (
      <div className={`${cls} ${styles.mediaEmpty}`} aria-hidden="true">
        <span className={styles.mediaEmptyInner}>
          <ImageIcon width={22} height={22} />
          <span>Add a photo or video</span>
        </span>
      </div>
    );
  }
  const one = (url: string, key?: number) =>
    mediaKindFromUrl(url) === "video" ? (
      <span key={key} className={styles.videoWrap}>
        <video src={url} muted playsInline preload="metadata" />
        <span className={styles.play} aria-hidden="true"><Play width={18} height={18} fill="currentColor" /></span>
      </span>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts
      <img key={key} src={url} alt="" />
    );
  if (urls.length === 1 || shape === "square" || shape === "tall") {
    return (
      <div className={cls}>
        {one(urls[0])}
        {urls.length > 1 && <span className={styles.count}>1/{urls.length}</span>}
      </div>
    );
  }
  return <div className={`${cls} ${styles.grid} ${styles[`grid${Math.min(urls.length, 4)}`]}`}>{urls.slice(0, 4).map((u, i) => one(u, i))}</div>;
}

function Avatar({ name, platform, size = 36 }: { name: string; platform: PlatformId; size?: number }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, background: `color-mix(in srgb, ${COLOR[platform]} 16%, white)`, color: COLOR[platform] }} aria-hidden="true">
      {name.replace(/^@/, "").slice(0, 1).toUpperCase() || "P"}
    </span>
  );
}

// One realistic post mock per network, with that network's header, media shape and action row.
function shortDate(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return y ? new Date(Date.UTC(y, m - 1, day)).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }) : "";
}

/** Google Business Profile update as it shows on Google Search / Maps: business, photo, text, button. */
function GbpPost({ text, media, account, when, opts }: { text: string; media: string[]; account?: string; when: string; opts: GbpOptions }) {
  const name = account ? account.replace(/^@/, "") : "Your business";
  const dates = opts.type !== "STANDARD" && opts.startDate ? `${shortDate(opts.startDate)}${opts.endDate ? ` – ${shortDate(opts.endDate)}` : ""}` : "";
  const button = opts.type === "OFFER" ? "View offer" : opts.cta ? GBP_CTA_LABEL[opts.cta] : "";
  return (
    <article className={`${styles.post} ${styles.gbp}`}>
      <header className={styles.gbpHead}>
        <span className={styles.gbpLogo} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <span>
          <b className={styles.name}>{name}</b>
          <span className={styles.meta}>{GBP_TYPE_LABEL[opts.type]} · {when}</span>
        </span>
      </header>
      {media.length > 0 ? <Media urls={media.slice(0, 1)} shape="wide" /> : null}
      {opts.type !== "STANDARD" && <p className={styles.gbpTitle}>{opts.title || (opts.type === "OFFER" ? "Offer title" : "Event title")}</p>}
      {dates && <p className={styles.gbpDates}>{dates}</p>}
      <p className={styles.text}>{text.trim() ? text : <span className={styles.meta}>Your update text appears here.</span>}</p>
      {opts.type === "OFFER" && opts.couponCode && <p className={styles.gbpCoupon}>Code: <b>{opts.couponCode}</b></p>}
      {button && <span className={styles.gbpCta}>{button}</span>}
    </article>
  );
}

function NetworkPost({ platform, text, media, account, when }: { platform: PlatformId; text: string; media: string[]; account?: string; when: string }) {
  const handle = account ? account.replace(/^@/, "") : "yourhandle";
  const name = account ? handle : "Your account";
  const empty = !text.trim() && media.length === 0;
  const body = empty ? <Bars /> : text.trim() ? <Caption text={text} platform={platform} /> : null;

  switch (platform) {
    case "instagram":
      return (
        <article className={styles.post}>
          <header className={styles.head}>
            <Avatar name={name} platform={platform} size={30} />
            <b className={styles.name}>{handle}</b>
            <MoreHorizontal className={styles.end} width={18} height={18} aria-hidden="true" />
          </header>
          <Media urls={media} shape="square" />
          <div className={styles.actions}>
            <Heart width={20} height={20} /><MessageCircle width={20} height={20} /><Send width={20} height={20} />
            <Bookmark className={styles.end} width={20} height={20} />
          </div>
          <p className={styles.text}>{empty ? <Bars lines={2} /> : <><b>{handle}</b> {body}</>}</p>
          <p className={`${styles.meta} ${styles.pad}`}>{when}</p>
        </article>
      );
    case "facebook":
    case "linkedin":
      return (
        <article className={styles.post}>
          <header className={styles.head}>
            <Avatar name={name} platform={platform} size={38} />
            <span className={styles.who}>
              <b className={styles.name}>{name}</b>
              <span className={styles.meta}>{when} · <Globe2 width={11} height={11} aria-hidden="true" /></span>
            </span>
            <MoreHorizontal className={styles.end} width={18} height={18} aria-hidden="true" />
          </header>
          <p className={styles.text}>{body}</p>
          {media.length > 0 || empty ? <Media urls={media} shape="wide" /> : null}
          <div className={`${styles.actions} ${styles.actionsSpread}`}>
            <span><ThumbsUp width={16} height={16} /> Like</span>
            <span><MessageCircle width={16} height={16} /> Comment</span>
            {platform === "linkedin" ? <span><Repeat2 width={16} height={16} /> Repost</span> : null}
            <span>{platform === "linkedin" ? <Send width={16} height={16} /> : <Share2 width={16} height={16} />} {platform === "linkedin" ? "Send" : "Share"}</span>
          </div>
        </article>
      );
    case "youtube":
      return (
        <article className={styles.post}>
          <Media urls={media} shape="wide" dark />
          <div className={styles.ytRow}>
            <Avatar name={name} platform={platform} size={34} />
            <span className={styles.who}>
              <b className={styles.ytTitle}>{empty ? <Bars lines={1} /> : (text.split("\n")[0] || "Untitled video")}</b>
              <span className={styles.meta}>{name} · {when}</span>
            </span>
          </div>
        </article>
      );
    case "tiktok":
      return (
        <article className={`${styles.post} ${styles.tiktok}`}>
          <Media urls={media} shape="tall" dark />
          <div className={styles.ttOverlay}>
            <b>@{handle}</b>
            <p>{body}</p>
            <span className={styles.ttSound}><Music2 width={12} height={12} aria-hidden="true" /> Original sound</span>
          </div>
          <div className={styles.ttRail} aria-hidden="true">
            <Heart width={22} height={22} fill="currentColor" /><MessageCircle width={22} height={22} fill="currentColor" /><Bookmark width={22} height={22} fill="currentColor" /><Share2 width={22} height={22} />
          </div>
        </article>
      );
    case "pinterest":
      return (
        <article className={styles.post}>
          <div className={styles.pinTop}><span className={styles.pinSave}>Save</span></div>
          <Media urls={media} shape="tall" />
          <p className={styles.text}>{body}</p>
          <header className={styles.head}>
            <Avatar name={name} platform={platform} size={26} />
            <span className={styles.meta}>{name}</span>
          </header>
        </article>
      );
    default: {
      // Bluesky, Threads, X, Mastodon: avatar column, name + handle + time, text, media, action row.
      const domain = platform === "bluesky" ? ".bsky.social" : platform === "mastodon" ? "@mastodon.social" : "";
      return (
        <article className={`${styles.post} ${styles.feed}`}>
          <Avatar name={name} platform={platform} size={38} />
          <div className={styles.feedMain}>
            <header className={styles.feedHead}>
              <b className={styles.name}>{name}</b>
              <span className={styles.meta}>{platform === "threads" ? "" : `@${handle}${handle.includes(".") || !domain ? "" : domain} · `}{when}</span>
              <MoreHorizontal className={styles.end} width={16} height={16} aria-hidden="true" />
            </header>
            <p className={styles.text}>{body}</p>
            {media.length > 0 ? <Media urls={media} shape="auto" /> : null}
            <div className={`${styles.actions} ${styles.actionsFeed}`}>
              <MessageCircle width={17} height={17} />
              <Repeat2 width={17} height={17} />
              <Heart width={17} height={17} />
              {platform === "threads" ? <Send width={17} height={17} /> : platform === "x" ? <Bookmark width={17} height={17} /> : <MoreHorizontal width={17} height={17} />}
            </div>
          </div>
        </article>
      );
    }
  }
}

/** Composer preview: network tabs (when several are selected) over a realistic mock of the post. */
export default function PostPreview({ selected, captions, mediaUrls, accountNames, whenLabel = "now", netOptions = {} }: Props) {
  const [tab, setTab] = useState<PlatformId | null>(null);
  const active: PlatformId = tab && selected.includes(tab) ? tab : selected[0] ?? "instagram";
  const media = mediaUrls.map((u) => u.trim()).filter(Boolean);
  return (
    <section className={styles.wrap} aria-label="Post preview">
      <div className={styles.top}>
        <h3 className={styles.title}>Preview</h3>
        {selected.length > 1 ? (
          <div className={styles.tabs} role="tablist" aria-label="Preview network">
            {selected.map((p) => {
              const Icon = ICON[p];
              return (
                <button key={p} type="button" role="tab" aria-selected={p === active} className={styles.tab} onClick={() => setTab(p)} title={PLATFORMS[p].label}>
                  <Icon width={14} height={14} style={{ color: COLOR[p] }} aria-hidden="true" />
                  <span>{PLATFORMS[p].label}</span>
                </button>
              );
            })}
          </div>
        ) : selected.length === 1 ? (
          <span className={styles.single}>
            {(() => { const Icon = ICON[active]; return <Icon width={14} height={14} style={{ color: COLOR[active] }} aria-hidden="true" />; })()}
            {PLATFORMS[active].label}
          </span>
        ) : (
          <span className={styles.single}>Pick a channel</span>
        )}
      </div>
      <div role={selected.length > 1 ? "tabpanel" : undefined} aria-label={`${PLATFORMS[active].label} preview`} className={selected.length === 0 ? styles.idle : undefined}>
        {active === "gbp" ? (
          <GbpPost text={captions.gbp ?? ""} media={media} account={accountNames.gbp} when={whenLabel} opts={parseGbpOptions(netOptions.gbp)} />
        ) : (
          <NetworkPost platform={active} text={captions[active] ?? ""} media={media} account={accountNames[active]} when={whenLabel} />
        )}
      </div>
    </section>
  );
}
