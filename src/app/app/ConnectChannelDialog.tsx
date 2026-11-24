"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, AtSign, Bell, Check, Facebook, Instagram, Loader2, PartyPopper, Plus, RotateCcw, Youtube, X } from "lucide-react";
import { BlueskyIcon, GbpIcon, LinkedInIcon, MastodonIcon, NEW_NETWORK_ICON, PinterestIcon, TikTokIcon, XIcon } from "@/components/brandIcons";
import { unavailableStatus, type ChannelStatus, type ComingChannel } from "@/lib/channelStatus";
import type { ReminderNetworkId } from "@/lib/networks/reminder";
import { isExtraNetwork, isTokenNetwork, TOKEN_NETWORK_IDS, type AppNetworkId, EXTRA_NETWORK_LABEL, TOKEN_NETWORKS, type TokenNetworkId } from "@/lib/networks/tokenNetworks";
import {
  channelInterestAction,
  connectBlueskyAction,
  connectFarcasterAction,
  connectGbpLocationsAction,
  connectReminderAction,
  connectTokenNetworkAction,
  gbpPickListAction,
  linkedinPagesListAction,
  saveLinkedInPagesAction,
  type BlueskyConnectState,
  type ChannelInterestState,
  type GbpPickResult,
  type LinkedInPagesResult,
  type ReminderConnectState,
  type TokenConnectState,
} from "./connectActions";
import styles from "./shell.module.css";
import cc from "./connectChannel.module.css";

export type ConnectAvailability = {
  /** Instagram (and Facebook Pages through Meta login) need the Meta app keys. */
  instagram: boolean;
  /** Facebook Page publishing comes with the Instagram "Login with Facebook" flow. */
  facebook: boolean;
  threads: boolean;
  youtube: boolean;
  /** Instagram Login (INSTAGRAM_APP_ID/SECRET) is configured: the dialog offers both Instagram flows. */
  instagramLogin?: boolean;
  tiktok?: boolean;
  linkedin?: boolean;
  /** LinkedIn company Pages (LINKEDIN_PAGES_ENABLED + LinkedIn's Community Management API approval). */
  linkedinPages?: boolean;
  pinterest?: boolean;
  x?: boolean;
  gbp?: boolean;
  /** Keyless networks: always available. */
  bluesky?: boolean;
  mastodon?: boolean;
  /** App networks: their client keys are set (src/lib/networks/apps.ts). */
  tumblr?: boolean;
  wpcom?: boolean;
  plurk?: boolean;
  twitch?: boolean;
  farcaster?: boolean;
  /** 2026-11-24 app networks ported from Postiz (src/lib/networks/moreApps.ts). */
  reddit?: boolean;
  dribbble?: boolean;
  vk?: boolean;
  kick?: boolean;
  whop?: boolean;
  mewe?: boolean;
  tiktok_business?: boolean;
  /** Neynar client id for "Sign in with Neynar" (public; only set when Farcaster is configured). */
  farcasterClientId?: string;
  /** Pills + explanations for channels that are built but not switched on (src/lib/channelStatus.ts). */
  statuses?: Partial<Record<ComingChannel, ChannelStatus>>;
  /** Reminder channels work by e-mail: "Coming soon" while no mailer is set up (src/lib/featureReadiness.ts). */
  reminderStatuses?: Partial<Record<ReminderNetworkId, ChannelStatus>>;
};

type NetworkId = "instagram" | "facebook" | "threads" | "youtube" | "tiktok" | "linkedin" | "pinterest" | "x" | "bluesky" | "mastodon" | "gbp" | TokenNetworkId | AppNetworkId;
type Step = "instagram" | "facebook" | "linkedin" | "bluesky" | "mastodon" | "farcaster";

export type Network = {
  id: NetworkId;
  name: string;
  sub: string;
  icon: ReactNode;
  /** One click to the network's consent screen. */
  href?: string;
  /** Opens a step inside the dialog instead of a link. */
  step?: Step;
  /** Token networks: opens the token / webhook form inside the dialog. */
  token?: TokenNetworkId;
  /** Not switched on yet: the card shows a pill and opens an explanation with "Notify me". */
  status?: ChannelStatus;
};

const icon = (I: typeof Instagram) => <I width={24} height={24} aria-hidden="true" />;

function coming(a: ConnectAvailability, id: ComingChannel, name: string): ChannelStatus | undefined {
  const s = a.statuses?.[id];
  if (s) return s.state === "ready" ? undefined : s;
  const on = id === "linkedin_pages" ? a.linkedinPages : a[id];
  return on ? undefined : unavailableStatus(name);
}

/** The Connect grid, in Buffer's order. Substack is left out on purpose: it has no public posting API. */
export function networks(a: ConnectAvailability): Network[] {
  const off = (on: boolean | undefined, name: string) => (on === false ? unavailableStatus(name) : undefined);
  return [
    { id: "instagram", name: "Instagram", sub: "Business, Creator, or Personal", icon: icon(Instagram), step: "instagram" },
    { id: "threads", name: "Threads", sub: "Profile", icon: icon(AtSign), href: "/api/threads/connect", status: off(a.threads, "Threads") },
    { id: "linkedin", name: "LinkedIn", sub: "Page or Profile", icon: icon(LinkedInIcon), step: "linkedin", status: a.linkedin ? undefined : unavailableStatus("LinkedIn") },
    { id: "facebook", name: "Facebook", sub: "Page or Group", icon: icon(Facebook), step: "facebook" },
    { id: "bluesky", name: "Bluesky", sub: "Profile", icon: icon(BlueskyIcon), step: "bluesky", status: off(a.bluesky, "Bluesky") },
    { id: "youtube", name: "YouTube", sub: "Channel", icon: icon(Youtube), href: "/api/youtube/connect", status: off(a.youtube, "YouTube") },
    { id: "tiktok", name: "TikTok", sub: "Business or Personal", icon: icon(TikTokIcon), href: "/api/tiktok/connect", status: coming(a, "tiktok", "TikTok") },
    { id: "mastodon", name: "Mastodon", sub: "Profile", icon: icon(MastodonIcon), step: "mastodon", status: off(a.mastodon, "Mastodon") },
    { id: "pinterest", name: "Pinterest", sub: "Business or Profile", icon: icon(PinterestIcon), href: "/api/pinterest/connect", status: coming(a, "pinterest", "Pinterest") },
    { id: "gbp", name: "Google Business", sub: "Profile", icon: icon(GbpIcon), href: "/api/gbp/connect", status: coming(a, "gbp", "Google Business Profile") },
    { id: "x", name: "Twitter / X", sub: "Profile", icon: icon(XIcon), href: "/api/x/connect", status: coming(a, "x", "X") },
    { id: "tumblr", name: "Tumblr", sub: "Blog", icon: icon(NEW_NETWORK_ICON.tumblr), href: "/api/tumblr/connect", status: coming(a, "tumblr", "Tumblr") },
    { id: "wpcom", name: "WordPress.com", sub: "Site", icon: icon(NEW_NETWORK_ICON.wpcom), href: "/api/wpcom/connect", status: coming(a, "wpcom", "WordPress.com") },
    { id: "farcaster", name: "Farcaster", sub: "Profile", icon: icon(NEW_NETWORK_ICON.farcaster), step: "farcaster", status: coming(a, "farcaster", "Farcaster") },
    { id: "twitch", name: "Twitch", sub: "Channel chat", icon: icon(NEW_NETWORK_ICON.twitch), href: "/api/twitch/connect", status: coming(a, "twitch", "Twitch") },
    { id: "plurk", name: "Plurk", sub: "Profile", icon: icon(NEW_NETWORK_ICON.plurk), href: "/api/plurk/connect", status: coming(a, "plurk", "Plurk") },
    { id: "reddit", name: "Reddit", sub: "Subreddits", icon: icon(NEW_NETWORK_ICON.reddit), href: "/api/reddit/connect", status: coming(a, "reddit", "Reddit") },
    { id: "tiktok_business", name: "TikTok Business", sub: "Business account", icon: icon(NEW_NETWORK_ICON.tiktok_business), href: "/api/tiktok_business/connect", status: coming(a, "tiktok_business", "TikTok Business") },
    { id: "dribbble", name: "Dribbble", sub: "Shots", icon: icon(NEW_NETWORK_ICON.dribbble), href: "/api/dribbble/connect", status: coming(a, "dribbble", "Dribbble") },
    { id: "vk", name: "VK", sub: "Wall", icon: icon(NEW_NETWORK_ICON.vk), href: "/api/vk/connect", status: coming(a, "vk", "VK") },
    { id: "kick", name: "Kick", sub: "Channel chat", icon: icon(NEW_NETWORK_ICON.kick), href: "/api/kick/connect", status: coming(a, "kick", "Kick") },
    { id: "whop", name: "Whop", sub: "Forum", icon: icon(NEW_NETWORK_ICON.whop), href: "/api/whop/connect", status: coming(a, "whop", "Whop") },
    { id: "mewe", name: "MeWe", sub: "Timeline", icon: icon(NEW_NETWORK_ICON.mewe), href: "/api/mewe/connect", status: coming(a, "mewe", "MeWe") },
  ];
}

/** Chat, blogs and self-hosted networks: a token, key or webhook, no app review (src/lib/networks/tokenNetworks.ts). */
export function tokenNetworks(): Network[] {
  return TOKEN_NETWORK_IDS.map((id) => ({ id, name: TOKEN_NETWORKS[id].label, sub: TOKEN_NETWORKS[id].sub, icon: icon(NEW_NETWORK_ICON[id]), token: id }));
}

const LABEL: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", threads: "Threads", youtube: "YouTube", tiktok: "TikTok",
  linkedin: "LinkedIn", pinterest: "Pinterest", x: "X", bluesky: "Bluesky", mastodon: "Mastodon", gbp: "Google Business Profile",
  ig_personal: "Instagram (personal)", fb_group: "Facebook Group",
  ...EXTRA_NETWORK_LABEL,
};

/** Plain-words message for a failed connect (?connect_error=<code>&net=<network>). */
export function connectErrorText(code: string, net: string): string {
  const name = LABEL[net] ?? "this channel";
  switch (code) {
    case "declined":
      return `You need to allow Poskoo to publish to ${name}. Try again and keep all boxes ticked.`;
    case "state_error":
      return `The ${name} login link expired or was opened in another browser. Try again from here.`;
    case "limit":
      return "Your plan's connected channels are all in use. Disconnect one in Settings, then try again. Reconnecting a channel you already have always works.";
    case "taken":
      return `This ${name} account is already connected to another Poskoo account.`;
    case "not_configured":
      return `Connecting ${name} isn't switched on on this server yet.`;
    case "plan_required":
      return `Posting to ${name} is part of the Agency plan. Upgrade in Settings > Plan & billing to connect ${name}.`;
    case "bad_instance":
      return "That doesn't look like a Mastodon server address. Type just the server, e.g. mastodon.social.";
    case "gbp_pending":
      return "Google Business Profile posting is waiting for Google's approval. Poskoo has asked Google for API access; you can connect your locations once Google approves it.";
    case "no_locations":
      return "We couldn't find a Google Business Profile location on that Google account. Sign in with the Google account that manages your business profile.";
    case "instance_unreachable":
      return "We couldn't reach that Mastodon server, or it isn't a Mastodon server. Check the address and try again.";
    default:
      return `Something went wrong while connecting ${name}. Please try again.`;
  }
}

type View =
  | { kind: "grid" }
  | { kind: Step }
  | { kind: "status"; id: string; name: string; icon: ReactNode; bg: string; status: ChannelStatus }
  | { kind: "reminder"; platform: ReminderNetworkId }
  | { kind: "token"; net: TokenNetworkId }
  | { kind: "request" }
  | { kind: "pick" }
  | { kind: "pickLinkedin" }
  | { kind: "success"; net: string; handle: string }
  | { kind: "error"; net: string; code: string };

const IG_FLOW_KEY = "poskoo.igFlow";

function retryHref(net: string): string | null {
  if (net === "bluesky" || net === "mastodon" || net === "ig_personal" || net === "fb_group" || net === "farcaster" || isTokenNetwork(net)) return null;
  if (net === "facebook") return "/api/instagram/connect?via=facebook";
  return `/api/${net}/connect`;
}

function retryView(net: string): View {
  if (net === "ig_personal" || net === "fb_group") return { kind: "reminder", platform: net };
  if (isTokenNetwork(net)) return { kind: "token", net };
  if (net === "farcaster") return { kind: "farcaster" };
  return { kind: net === "bluesky" ? "bluesky" : "mastodon" };
}

// Opens the modal and puts focus on its title (not the close button), so the first Tab reaches the cards.
function showDialog(dialog: HTMLDialogElement | null, title: HTMLElement | null) {
  if (!dialog) return;
  if (!dialog.open) dialog.showModal();
  title?.focus({ preventScroll: true });
}

function CardBody({ n }: { n: Network }) {
  return (
    <>
      <span className={`${cc.tile} ${styles[`netBg_${n.id}`] ?? ""}`}>{n.icon}</span>
      <span className={cc.name}>{n.name}</span>
      <span className={cc.sub}>{n.sub}</span>
      {n.status && <span className={`${cc.pill} ${n.status.state === "awaiting" ? cc.pillAwaiting : ""}`}>{n.status.pill}</span>}
    </>
  );
}

// "Connect a new channel" window (Buffer-style grid). Every card is one click: straight to the
// network's own consent screen, or a one-step form inside the dialog (Instagram / Facebook / LinkedIn
// account type, Bluesky handle + app password, Mastodon server, reminder channels). Channels that
// are built but not switched on show a status pill and an honest explanation with "Notify me".
// After the round trip the dialog reopens on success or on a plain-words error with Retry.
export default function ConnectChannelDialog({
  availability,
  label,
  compact = false,
  slots,
}: {
  availability: ConnectAvailability;
  label: string;
  compact?: boolean;
  /** Plan usage for the "x of y channels used" line. */
  slots?: { used: number; limit: number };
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const list = networks(availability);
  const moreList = tokenNetworks();
  const [view, setView] = useState<View>({ kind: "grid" });
  const [igFlow, setIgFlow] = useState<"instagram" | "facebook">("instagram");
  const [bsState, bsAction, bsPending] = useActionState<BlueskyConnectState, FormData>(connectBlueskyAction, null);

  useEffect(() => {
    // ?connected=<net>[&handle=], ?connect_error=<code>&net=<net>, ?connect=<net> or #connect open the window.
    const url = new URL(window.location.href);
    const p = url.searchParams;
    const c = p.get("connect");
    let next: View | null = null;
    if (p.get("connected")) next = { kind: "success", net: p.get("connected") ?? "", handle: p.get("handle") ?? "" };
    else if (p.get("connect_pick") === "gbp") next = { kind: "pick" };
    else if (p.get("connect_pick") === "linkedin") next = { kind: "pickLinkedin" };
    else if (p.get("connect_error")) next = { kind: "error", net: p.get("net") ?? "", code: p.get("connect_error") ?? "" };
    else if (c === "bluesky" || c === "mastodon" || c === "instagram" || c === "facebook" || c === "linkedin") next = { kind: c };
    else if (c === "ig_personal" || c === "fb_group") {
      const soon = availability.reminderStatuses?.[c];
      next = soon && soon.state !== "ready"
        ? { kind: "status", id: c, name: LABEL[c], icon: icon(c === "ig_personal" ? Instagram : Facebook), bg: styles[`netBg_${c === "ig_personal" ? "instagram" : "facebook"}`] ?? "", status: soon }
        : { kind: "reminder", platform: c };
    }
    else if (isTokenNetwork(c)) next = { kind: "token", net: c };
    else if (c === "farcaster") next = { kind: "farcaster" };
    else if (url.hash === "#connect" || c === "1") next = { kind: "grid" };
    try {
      const saved = window.localStorage.getItem(IG_FLOW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- remembered choice lives in the browser only
      if (saved === "instagram" || saved === "facebook") setIgFlow(saved);
    } catch {
      // storage blocked: keep the default
    }
    if (!next) return;
    setView(next);
    showDialog(ref.current, titleRef.current);
    for (const k of ["connected", "handle", "connect_error", "net", "connect", "connect_pick"]) p.delete(k);
    window.history.replaceState(null, "", `${url.pathname}${p.toString() ? `?${p.toString()}` : ""}${url.hash === "#connect" ? "" : url.hash}`);
  }, [availability.reminderStatuses]);

  useEffect(() => {
    // In-page links to #connect (Settings, onboarding checklist) open the grid without a reload.
    const onHash = () => {
      if (window.location.hash !== "#connect") return;
      setView({ kind: "grid" });
      if (!ref.current?.open) showDialog(ref.current, titleRef.current);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    };
    // Next.js <Link href="#connect"> changes the hash with pushState (no hashchange event): catch the click.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a || !a.getAttribute("href")?.endsWith("#connect") || a.closest("dialog")) return;
      e.preventDefault();
      setView({ kind: "grid" });
      if (!ref.current?.open) showDialog(ref.current, titleRef.current);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  function rememberIg(flow: "instagram" | "facebook") {
    try {
      window.localStorage.setItem(IG_FLOW_KEY, flow);
    } catch {
      // ignore
    }
  }

  const go = (next: View) => {
    setView(next);
    titleRef.current?.focus({ preventScroll: true });
  };

  const open = () => {
    setView({ kind: "grid" });
    showDialog(ref.current, titleRef.current);
  };

  const openStatus = (n: Network, status: ChannelStatus, id: string = n.id) =>
    go({ kind: "status", id, name: n.name, icon: n.icon, bg: styles[`netBg_${n.id}`] ?? "", status });

  const full = slots ? slots.used >= slots.limit : false;
  const back = (
    <button type="button" className={styles.connectBack} onClick={() => go({ kind: "grid" })}>
      <ArrowLeft width={16} height={16} aria-hidden="true" /> All channels
    </button>
  );
  const net = (id: NetworkId) => list.find((n) => n.id === id)!;
  const a = availability;
  const bothIg = a.facebook && a.instagramLogin;
  const igAuto = a.instagram;
  const pagesStatus = coming(a, "linkedin_pages", "LinkedIn Pages");
  const reminderSoon = (p: ReminderNetworkId) => {
    const s = a.reminderStatuses?.[p];
    return s && s.state !== "ready" ? s : undefined;
  };
  const igRemind = reminderSoon("ig_personal");
  const groupRemind = reminderSoon("fb_group");

  const title =
    view.kind === "success" ? "Channel connected"
    : view.kind === "error" ? "Couldn't connect"
    : view.kind === "pick" ? "Select the locations to connect"
    : view.kind === "pickLinkedin" ? "Select the LinkedIn Pages to connect"
    : view.kind === "request" ? "Request a channel"
    : view.kind === "reminder" ? (view.platform === "ig_personal" ? "Add an Instagram personal account" : "Add a Facebook Group")
    : view.kind === "token" ? `Connect ${TOKEN_NETWORKS[view.net].label}`
    : "Connect a new channel";

  return (
    <>
      <button type="button" className={compact ? styles.connectIconBtn : `${styles.channel} ${styles.channelAdd}`} onClick={open} aria-haspopup="dialog">
        <span className={styles.channelAvatar} aria-hidden="true"><Plus width={14} height={14} /></span>
        {!compact && <span className={styles.channelName}>{label}</span>}
        {compact && <span className="sr-only">{label}</span>}
      </button>
      <dialog
        ref={ref}
        className={`${styles.connectDialog} ${cc.dialog}`}
        aria-labelledby="connect-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className={styles.connectInner}>
          <div className={styles.connectHead}>
            <h2 id="connect-title" ref={titleRef} tabIndex={-1} className={`${styles.connectTitle} ${cc.title}`}>{title}</h2>
            <button type="button" className={`${styles.connectClose} ${cc.close}`} onClick={() => ref.current?.close()} aria-label="Close">
              <X width={18} height={18} aria-hidden="true" />
            </button>
          </div>

          {view.kind === "grid" && (
            <>
              {slots && (
                <p className={full ? styles.connectNote : styles.connectSlots}>
                  {slots.used} of {slots.limit} channels used on your plan.
                  {full ? " Disconnect one in Settings to add a new one; reconnecting an existing channel always works." : ""}
                  {full && slots.limit < 25 ? <> <Link href="/app/settings/billing" className="underline underline-offset-2">Upgrade for more channels</Link></> : null}
                </p>
              )}
              <ul className={cc.grid}>
                {list.map((n) => (
                  <li key={n.id}>
                    {n.status ? (
                      <button type="button" className={`${cc.card} ${cc.cardSoon}`} onClick={() => openStatus(n, n.status!)} aria-label={`${n.name}: ${n.status.pill}. Learn more`}>
                        <CardBody n={n} />
                      </button>
                    ) : n.step ? (
                      <button type="button" className={cc.card} onClick={() => go({ kind: n.step! })}><CardBody n={n} /></button>
                    ) : (
                      <a href={n.href} className={cc.card}><CardBody n={n} /></a>
                    )}
                  </li>
                ))}
              </ul>
              <p className={styles.connectLead}>Chat, blogs and self-hosted</p>
              <ul className={cc.grid}>
                {moreList.map((n) => (
                  <li key={n.id}>
                    <button type="button" className={cc.card} onClick={() => go({ kind: "token", net: n.token! })}><CardBody n={n} /></button>
                  </li>
                ))}
                <li>
                  <button type="button" className={`${cc.card} ${cc.cardRequest}`} onClick={() => go({ kind: "request" })}>
                    <span className={`${cc.tile} ${cc.tileRequest}`}><Plus width={24} height={24} aria-hidden="true" /></span>
                    <span className={cc.name}>Can&apos;t find it?</span>
                    <span className={cc.sub}>Request a channel</span>
                  </button>
                </li>
              </ul>
              <p className={styles.connectFoot}>
                <Bell width={13} height={13} aria-hidden="true" className={cc.inlineIcon} /> Instagram personal accounts and Facebook Groups have no posting API, so Poskoo reminds you to post them.{" "}
                <Link href="/help/getting-started">Setup help</Link>
              </p>
            </>
          )}

          {view.kind === "status" && (
            <div className={styles.connectStep}>
              {back}
              <div className={cc.statusHead}>
                <span className={`${cc.tile} ${view.bg}`}>{view.icon}</span>
                <span className={`${cc.pill} ${view.status.state === "awaiting" ? cc.pillAwaiting : ""}`}>{view.status.pill}</span>
              </div>
              <p className={styles.connectLead}><b>{view.status.title}</b></p>
              <p className={cc.body}>{view.status.body}</p>
              <NotifyForm channel={view.id} />
            </div>
          )}

          {view.kind === "instagram" && (
            <div className={styles.connectStep}>
              {back}
              <p className={styles.connectLead}>Which kind of Instagram account is it?</p>
              <div className={cc.options}>
                <div className={cc.option}>
                  <p className={cc.optionTitle}>Business or Creator <span className={cc.tag}>Posts automatically</span></p>
                  {igAuto ? (
                    <div className={styles.connectBtnCol}>
                      {(bothIg || a.instagramLogin) && (
                        // eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation
                        <a href="/api/instagram/connect?via=instagram" className={!bothIg || igFlow === "instagram" ? styles.connectPrimary : styles.connectSecondary} onClick={() => rememberIg("instagram")}>
                          <Instagram width={18} height={18} aria-hidden="true" /> Continue with Instagram {bothIg && <span className={styles.connectHint}>Recommended</span>}
                        </a>
                      )}
                      {a.facebook && (
                        // eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation
                        <a href="/api/instagram/connect?via=facebook" className={!bothIg || igFlow === "facebook" ? styles.connectPrimary : styles.connectSecondary} onClick={() => rememberIg("facebook")}>
                          <Facebook width={18} height={18} aria-hidden="true" /> Connect via Facebook Page
                        </a>
                      )}
                      {!a.facebook && !a.instagramLogin && (
                        // eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation
                        <a href="/api/instagram/connect" className={styles.connectPrimary}><Instagram width={18} height={18} aria-hidden="true" /> Connect Instagram</a>
                      )}
                    </div>
                  ) : (
                    <button type="button" className={styles.connectSecondary} onClick={() => openStatus(net("instagram"), unavailableStatus("Instagram auto-publishing"), "instagram")}>
                      Not switched on yet. Learn more
                    </button>
                  )}
                </div>
                <div className={cc.option}>
                  <p className={cc.optionTitle}>Personal account <span className={`${cc.tag} ${cc.tagRemind}`}><Bell width={11} height={11} aria-hidden="true" /> Reminders</span>{igRemind ? <span className={cc.pill}>{igRemind.pill}</span> : null}</p>
                  <p className={cc.optionText}>Instagram has no posting API for personal accounts. Poskoo e-mails you the caption and files at the scheduled time; you post it in the app.</p>
                  {igRemind ? (
                    <button type="button" className={styles.connectSecondary} onClick={() => openStatus(net("instagram"), igRemind, "ig_personal")}>
                      Coming soon. Learn more
                    </button>
                  ) : (
                    <button type="button" className={styles.connectSecondary} onClick={() => go({ kind: "reminder", platform: "ig_personal" })}>
                      <Bell width={16} height={16} aria-hidden="true" /> Get reminders for a personal account
                    </button>
                  )}
                </div>
              </div>
              <p className={styles.connectFoot}>
                Want auto-publishing? <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noreferrer">Switch to a professional account</a> (free, takes a minute).
              </p>
            </div>
          )}

          {view.kind === "facebook" && (
            <div className={styles.connectStep}>
              {back}
              <p className={styles.connectLead}>Where do you want to post on Facebook?</p>
              <div className={cc.options}>
                <div className={cc.option}>
                  <p className={cc.optionTitle}>Facebook Page <span className={cc.tag}>Posts automatically</span></p>
                  {a.facebook ? (
                    // eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation
                    <a href="/api/instagram/connect?via=facebook" className={styles.connectPrimary}><Facebook width={18} height={18} aria-hidden="true" /> Connect a Page</a>
                  ) : (
                    <button type="button" className={styles.connectSecondary} onClick={() => openStatus(net("facebook"), unavailableStatus("Facebook Pages"), "facebook")}>
                      Not switched on yet. Learn more
                    </button>
                  )}
                </div>
                <div className={cc.option}>
                  <p className={cc.optionTitle}>Facebook Group <span className={`${cc.tag} ${cc.tagRemind}`}><Bell width={11} height={11} aria-hidden="true" /> Reminders</span>{groupRemind ? <span className={cc.pill}>{groupRemind.pill}</span> : null}</p>
                  <p className={cc.optionText}>Meta removed posting to Groups from its API in April 2024, so no app can publish there. Poskoo e-mails you the post at the scheduled time, ready to paste.</p>
                  {groupRemind ? (
                    <button type="button" className={styles.connectSecondary} onClick={() => openStatus(net("facebook"), groupRemind, "fb_group")}>
                      Coming soon. Learn more
                    </button>
                  ) : (
                    <button type="button" className={styles.connectSecondary} onClick={() => go({ kind: "reminder", platform: "fb_group" })}>
                      <Bell width={16} height={16} aria-hidden="true" /> Get reminders for a Group
                    </button>
                  )}
                </div>
              </div>
              <p className={styles.connectFoot}>Personal profiles can&apos;t be connected: Meta doesn&apos;t let apps post to them.</p>
            </div>
          )}

          {view.kind === "linkedin" && (
            <div className={styles.connectStep}>
              {back}
              <p className={styles.connectLead}>Post to your LinkedIn profile or a company Page?</p>
              <div className={cc.options}>
                <div className={cc.option}>
                  <p className={cc.optionTitle}>Profile <span className={cc.tag}>Posts automatically</span></p>
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation */}
                  <a href="/api/linkedin/connect" className={styles.connectPrimary}><LinkedInIcon width={18} height={18} aria-hidden="true" /> Connect your profile</a>
                </div>
                <div className={cc.option}>
                  <p className={cc.optionTitle}>
                    Company Page {pagesStatus ? <span className={`${cc.pill} ${cc.pillAwaiting}`}>{pagesStatus.pill}</span> : <span className={cc.tag}>Posts automatically</span>}
                  </p>
                  {pagesStatus ? (
                    <>
                      <p className={cc.optionText}>{pagesStatus.body}</p>
                      <NotifyForm channel="linkedin_pages" />
                    </>
                  ) : (
                    <>
                      <p className={cc.optionText}>Sign in with LinkedIn, then pick the Pages you&apos;re an admin or content admin of.</p>
                      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation */}
                      <a href="/api/linkedin/connect" className={styles.connectSecondary}><LinkedInIcon width={18} height={18} aria-hidden="true" /> Connect Pages</a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {view.kind === "reminder" && <ReminderForm platform={view.platform} back={back} />}

          {view.kind === "request" && <RequestForm back={back} />}

          {view.kind === "token" && <TokenForm key={view.net} net={view.net} back={back} />}

          {view.kind === "farcaster" && <FarcasterSignIn clientId={a.farcasterClientId ?? ""} back={back} />}

          {view.kind === "bluesky" && (
            <form action={bsAction} className={styles.connectStep}>
              {back}
              <p className={styles.connectLead}>Connect Bluesky with an app password.</p>
              <label className={styles.connectLabel}>
                Handle
                <input name="handle" required autoComplete="username" placeholder="yourname.bsky.social" className={styles.connectInput} />
              </label>
              <label className={styles.connectLabel}>
                App password
                <input name="app_password" type="password" required autoComplete="off" placeholder="xxxx-xxxx-xxxx-xxxx" className={styles.connectInput} />
              </label>
              <p className={styles.connectFoot}>
                Create one in Bluesky: <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer">Settings → Privacy and security → App passwords</a>. Don&apos;t use your main password.
              </p>
              <details className={styles.connectMore}>
                <summary>Self-hosted account?</summary>
                <label className={styles.connectLabel}>
                  Hosting provider
                  <input name="service" placeholder="https://bsky.social" className={styles.connectInput} />
                </label>
              </details>
              {bsState?.error && <p role="alert" className={styles.connectError}>{bsState.error}</p>}
              <button type="submit" className={styles.connectPrimary} disabled={bsPending}>
                {bsPending ? <Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> : <BlueskyIcon width={16} height={16} aria-hidden="true" />} Connect Bluesky
              </button>
            </form>
          )}

          {view.kind === "mastodon" && (
            <form action="/api/mastodon/connect" method="get" className={styles.connectStep}>
              {back}
              <p className={styles.connectLead}>Which Mastodon server is your account on?</p>
              <label className={styles.connectLabel}>
                Server
                <input name="instance" required inputMode="url" autoCapitalize="none" placeholder="mastodon.social" className={styles.connectInput} />
              </label>
              <p className={styles.connectFoot}>The part after the second @ in your handle, e.g. @you@<b>mastodon.social</b>. You&apos;ll approve Poskoo on your server next.</p>
              <button type="submit" className={styles.connectPrimary}>
                <MastodonIcon width={16} height={16} aria-hidden="true" /> Continue
              </button>
            </form>
          )}

          {view.kind === "pick" && <GbpPicker onBack={() => go({ kind: "grid" })} />}

          {view.kind === "pickLinkedin" && <LinkedInPagesPicker onBack={() => go({ kind: "grid" })} />}

          {view.kind === "success" && (
            <div className={styles.connectStep}>
              <p className={styles.connectSuccess}>
                <PartyPopper width={22} height={22} aria-hidden="true" />
                <span>
                  <b>{view.handle ? (view.handle.includes(" ") || view.handle.startsWith("@") || view.net === "fb_group" || isExtraNetwork(view.net) ? view.handle : `@${view.handle}`) : (LABEL[view.net] ?? "Your channel")}</b> is connected
                  {view.handle && LABEL[view.net] ? ` to ${LABEL[view.net]}` : ""}.
                </span>
              </p>
              {(view.net === "ig_personal" || view.net === "fb_group") && (
                <p className={cc.body}>
                  <Bell width={14} height={14} aria-hidden="true" className={cc.inlineIcon} /> Posts you schedule here aren&apos;t published automatically: at the scheduled time Poskoo e-mails you the caption and files, plus a “Mark as posted” link.
                </p>
              )}
              <div className={styles.connectBtnCol}>
                <a href={`/app/publish?compose=1&with=${encodeURIComponent(view.net)}`} className={styles.connectPrimary}>Create your first post</a>
                <button type="button" className={styles.connectSecondary} onClick={() => go({ kind: "grid" })}>Connect another channel</button>
              </div>
            </div>
          )}

          {view.kind === "error" && (
            <div className={styles.connectStep}>
              <p role="alert" className={styles.connectError}>{connectErrorText(view.code, view.net)}</p>
              <div className={styles.connectBtnCol}>
                {view.code !== "limit" && view.code !== "taken" && view.code !== "not_configured" && view.code !== "plan_required" && (
                  retryHref(view.net) ? (
                    <a href={retryHref(view.net)!} className={styles.connectPrimary}><RotateCcw width={16} height={16} aria-hidden="true" /> Retry</a>
                  ) : (
                    <button type="button" className={styles.connectPrimary} onClick={() => go(retryView(view.net))}>
                      <RotateCcw width={16} height={16} aria-hidden="true" /> Retry
                    </button>
                  )
                )}
                {view.code === "plan_required" && <Link href="/app/settings/billing" className={styles.connectPrimary} onClick={() => ref.current?.close()}>See plans</Link>}
                {view.code === "limit" && <Link href="/app/settings#accounts-heading" className={styles.connectPrimary} onClick={() => ref.current?.close()}>Manage channels</Link>}
                <button type="button" className={styles.connectSecondary} onClick={() => go({ kind: "grid" })}>All channels</button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

// "Notify me when it's ready" (channel_requests, kind = notify). Honest: it only records interest.
function NotifyForm({ channel }: { channel: string }) {
  const [state, action, pending] = useActionState<ChannelInterestState, FormData>(channelInterestAction, null);
  if (state?.ok) {
    return (
      <p className={cc.thanks} role="status">
        <Check width={16} height={16} aria-hidden="true" /> {state.message}
      </p>
    );
  }
  return (
    <form action={action} className={styles.connectBtnCol}>
      <input type="hidden" name="kind" value="notify" />
      <input type="hidden" name="channel" value={channel} />
      {state && !state.ok && <p role="alert" className={styles.connectError}>{state.error}</p>}
      <button type="submit" className={styles.connectPrimary} disabled={pending}>
        {pending ? <Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> : <Bell width={16} height={16} aria-hidden="true" />} Notify me when it&apos;s ready
      </button>
    </form>
  );
}

// "Can't find it? Request a channel": channel name + optional note, then a thank-you state.
function RequestForm({ back }: { back: ReactNode }) {
  const [state, action, pending] = useActionState<ChannelInterestState, FormData>(channelInterestAction, null);
  if (state?.ok) {
    return (
      <div className={styles.connectStep}>
        {back}
        <p className={cc.thanks} role="status">
          <PartyPopper width={18} height={18} aria-hidden="true" /> {state.message} We read every request and use them to decide what to build next.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className={styles.connectStep}>
      {back}
      <p className={styles.connectLead}>Which channel should Poskoo support next?</p>
      <input type="hidden" name="kind" value="request" />
      <label className={styles.connectLabel}>
        Channel name
        <input name="channel" required minLength={2} maxLength={80} placeholder="e.g. Reddit, Tumblr, WhatsApp Channels" className={styles.connectInput} />
      </label>
      <label className={styles.connectLabel}>
        Anything we should know? <span className={cc.optional}>(optional)</span>
        <textarea name="note" rows={3} maxLength={500} placeholder="How you'd use it, account type…" className={`${styles.connectInput} ${cc.textarea}`} />
      </label>
      {state && !state.ok && <p role="alert" className={styles.connectError}>{state.error}</p>}
      <button type="submit" className={styles.connectPrimary} disabled={pending}>
        {pending ? <Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> : null} Send request
      </button>
    </form>
  );
}

// Token networks: one form per network from its spec (token / key / webhook / server address).
// The secret is checked against the network once, then stored encrypted; it is never shown again.
function TokenForm({ net, back }: { net: TokenNetworkId; back: ReactNode }) {
  const [state, action, pending] = useActionState<TokenConnectState, FormData>(connectTokenNetworkAction, null);
  const spec = TOKEN_NETWORKS[net];
  const Icon = NEW_NETWORK_ICON[net];
  return (
    <form action={action} className={styles.connectStep}>
      {back}
      <input type="hidden" name="network" value={net} />
      <p className={styles.connectLead}>Connect {spec.label} with {spec.fields.some((f) => f.name === "webhook") ? "a webhook" : "a token"}.</p>
      {spec.warning && (
        <p role="note" className={styles.connectError}>
          <AlertTriangle width={14} height={14} aria-hidden="true" className={cc.inlineIcon} /> {spec.warning}
        </p>
      )}
      {spec.fields.map((f) => (
        <label key={f.name} className={styles.connectLabel}>
          {f.label} {f.optional && <span className={cc.optional}>(optional)</span>}
          <input
            name={f.name}
            required={!f.optional}
            type={f.type === "password" ? "password" : "text"}
            inputMode={f.type === "url" ? "url" : undefined}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            placeholder={f.placeholder}
            className={styles.connectInput}
          />
        </label>
      ))}
      <p className={styles.connectFoot}>
        {spec.help}
        {spec.helpUrl && <> <a href={spec.helpUrl} target="_blank" rel="noreferrer">How to get it</a></>}
      </p>
      {state?.error && <p role="alert" className={styles.connectError}>{state.error}</p>}
      <button type="submit" className={styles.connectPrimary} disabled={pending}>
        {pending ? <Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> : <Icon width={16} height={16} aria-hidden="true" />} Connect {spec.label}
      </button>
    </form>
  );
}

// Farcaster: "Sign in with Neynar" (Neynar's script opens Warpcast approval in a popup). On success
// the browser hands the signer UUID + fid to the server, which checks both with Neynar.
type NeynarSignIn = { signer_uuid?: string; fid?: number | string };
declare global {
  interface Window {
    poskooNeynarSignIn?: (data: NeynarSignIn) => void;
  }
}
// Neynar's hosted SIWN widget (docs.neynar.com "Sign in with Neynar").
const SIWN_SCRIPT = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js";

function FarcasterSignIn({ clientId, back }: { clientId: string; back: ReactNode }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  useEffect(() => {
    window.poskooNeynarSignIn = (data) => {
      start(async () => {
        const r = await connectFarcasterAction(String(data.signer_uuid ?? ""), String(data.fid ?? ""));
        if (r?.error) setError(r.error);
      });
    };
    if (!document.querySelector(`script[src="${SIWN_SCRIPT}"]`)) {
      const s = document.createElement("script");
      s.src = SIWN_SCRIPT;
      s.async = true;
      document.body.appendChild(s);
    }
    return () => {
      delete window.poskooNeynarSignIn;
    };
  }, []);
  return (
    <div className={styles.connectStep}>
      {back}
      <p className={styles.connectLead}>Sign in with Farcaster, then approve Poskoo in Warpcast.</p>
      <div className="neynar_signin" data-client_id={clientId} data-success-callback="poskooNeynarSignIn" data-theme="light" />
      <p className={styles.connectFoot}>Poskoo can only post casts you schedule; it can&apos;t read your messages. Casts are text only, up to 320 bytes.</p>
      {pending && <p className={styles.connectLead}><Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> Connecting…</p>}
      {error && <p role="alert" className={styles.connectError}>{error}</p>}
    </div>
  );
}

// Reminder channel: the @handle or the group, no OAuth. Explains the e-mail flow before adding.
function ReminderForm({ platform, back }: { platform: ReminderNetworkId; back: ReactNode }) {
  const [state, action, pending] = useActionState<ReminderConnectState, FormData>(connectReminderAction, null);
  const ig = platform === "ig_personal";
  return (
    <form action={action} className={styles.connectStep}>
      {back}
      <input type="hidden" name="platform" value={platform} />
      <ol className={cc.howList}>
        <li>Schedule posts to {ig ? "this account" : "this group"} like any other channel.</li>
        <li>At the scheduled time Poskoo e-mails you the caption (ready to copy) and the photos or video.</li>
        <li>Post it in {ig ? "Instagram" : "Facebook"}, then tap “Mark as posted”.</li>
      </ol>
      {ig ? (
        <label className={styles.connectLabel}>
          Instagram username
          <input name="target" required autoCapitalize="none" autoComplete="off" spellCheck={false} placeholder="@yourname" className={styles.connectInput} />
        </label>
      ) : (
        <>
          <label className={styles.connectLabel}>
            Group link or name
            <input name="target" required autoCapitalize="none" autoComplete="off" placeholder="facebook.com/groups/yourgroup" className={styles.connectInput} />
          </label>
          <label className={styles.connectLabel}>
            Group name <span className={cc.optional}>(optional, shown in Poskoo)</span>
            <input name="name" maxLength={80} placeholder="Edmonton Plant Swap" className={styles.connectInput} />
          </label>
        </>
      )}
      <p className={styles.connectFoot}>No password or login needed. It counts as one channel on your plan.</p>
      {state?.error && <p role="alert" className={styles.connectError}>{state.error}</p>}
      <button type="submit" className={styles.connectPrimary} disabled={pending}>
        {pending ? <Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> : <Bell width={16} height={16} aria-hidden="true" />} Add {ig ? "Instagram account" : "group"} with reminders
      </button>
    </form>
  );
}

// LinkedIn Pages picker (LINKEDIN_PAGES_ENABLED): Pages the member administers, all ticked on a fresh connect.
function LinkedInPagesPicker({ onBack }: { onBack: () => void }) {
  const [list, setList] = useState<LinkedInPagesResult | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [state, action, pending] = useActionState(saveLinkedInPagesAction, null);
  useEffect(() => {
    let active = true;
    linkedinPagesListAction()
      .then((r) => {
        if (!active) return;
        setList(r);
        if (r.ok) setChecked(new Set(r.pages.filter((p) => p.selected).map((p) => p.urn)));
      })
      .catch(() => active && setList({ ok: false, error: "Could not load your LinkedIn Pages. Try again." }));
    return () => {
      active = false;
    };
  }, []);
  if (list === null) return <p className={styles.connectLead}><Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> Loading your Pages…</p>;
  if (!list.ok) {
    return (
      <div className={styles.connectStep}>
        <p role="alert" className={styles.connectError}>{list.error}</p>
        <div className={styles.connectBtnCol}>
          <button type="button" className={styles.connectSecondary} onClick={onBack}>All channels</button>
        </div>
      </div>
    );
  }
  return (
    <form action={action} className={styles.connectStep}>
      <p className={styles.connectSlots}>Your profile ({list.profile}) is connected. Pick the Pages you also want to post to; you choose the author per post in the composer.</p>
      <ul className={styles.connectPickList}>
        {list.pages.map((pg) => (
          <li key={pg.urn}>
            <label className={styles.connectPickItem}>
              <input
                type="checkbox"
                name="page"
                value={pg.urn}
                checked={checked.has(pg.urn)}
                onChange={(e) => {
                  const next = new Set(checked);
                  if (e.target.checked) next.add(pg.urn);
                  else next.delete(pg.urn);
                  setChecked(next);
                }}
              />
              <span className={`${styles.connectIcon} ${styles.netBg_linkedin}`}><LinkedInIcon width={18} height={18} aria-hidden="true" /></span>
              <span className={styles.connectPickText}><b>{pg.name}</b><span>Company Page</span></span>
            </label>
          </li>
        ))}
      </ul>
      {state?.error && <p role="alert" className={styles.connectError}>{state.error}</p>}
      <button type="submit" className={styles.connectPrimary} disabled={pending}>
        {pending ? <Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> : null} {checked.size === 0 ? "Profile only" : `Connect ${checked.size === 1 ? "1 Page" : `${checked.size} Pages`}`}
      </button>
    </form>
  );
}

// Buffer-style "Select the locations to connect": every location pre-ticked up to the plan's free
// slots (already connected ones are free), extras disabled with a note, one Connect button.
function GbpPicker({ onBack }: { onBack: () => void }) {
  const [list, setList] = useState<GbpPickResult | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [state, action, pending] = useActionState(connectGbpLocationsAction, null);
  useEffect(() => {
    let active = true;
    gbpPickListAction()
      .then((r) => {
        if (!active) return;
        setList(r);
        if (r.ok) {
          const pre = new Set<string>();
          let free = r.slotsLeft;
          for (const l of r.locations) {
            if (l.connected) pre.add(l.location);
            else if (free > 0) {
              pre.add(l.location);
              free -= 1;
            }
          }
          setChecked(pre);
        }
      })
      .catch(() => active && setList({ ok: false, error: "Could not load your locations. Try again." }));
    return () => {
      active = false;
    };
  }, []);
  if (list === null) return <p className={styles.connectLead}><Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> Loading your locations…</p>;
  if (!list.ok) {
    return (
      <div className={styles.connectStep}>
        <p role="alert" className={styles.connectError}>{list.error}</p>
        <div className={styles.connectBtnCol}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler */}
          <a href="/api/gbp/connect" className={styles.connectPrimary}><RotateCcw width={16} height={16} aria-hidden="true" /> Retry</a>
          <button type="button" className={styles.connectSecondary} onClick={onBack}>All channels</button>
        </div>
      </div>
    );
  }
  const newChecked = list.locations.filter((l) => !l.connected && checked.has(l.location)).length;
  const full = newChecked >= list.slotsLeft;
  return (
    <form action={action} className={styles.connectStep}>
      <p className={styles.connectSlots}>
        {newChecked} of {list.slotsLeft} available on your plan selected.
        {list.locations.some((l) => !l.connected && !checked.has(l.location)) && full ? " Your plan has no room for more; disconnect a channel in Settings to add others." : ""}
      </p>
      <ul className={styles.connectPickList}>
        {list.locations.map((l) => {
          const on = checked.has(l.location);
          const disabled = !l.connected && !on && full;
          return (
            <li key={l.location}>
              <label className={`${styles.connectPickItem} ${disabled ? styles.connectPickItemOff : ""}`}>
                <input
                  type="checkbox"
                  name="location"
                  value={l.location}
                  checked={on}
                  disabled={disabled}
                  onChange={(e) => {
                    const next = new Set(checked);
                    if (e.target.checked) next.add(l.location);
                    else next.delete(l.location);
                    setChecked(next);
                  }}
                />
                <span className={`${styles.connectIcon} ${styles.netBg_gbp}`}><GbpIcon width={18} height={18} aria-hidden="true" /></span>
                <span className={styles.connectPickText}>
                  <b>{l.title}</b>
                  <span>{[l.address, l.connected ? "already connected" : ""].filter(Boolean).join(" · ") || l.accountName}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {state?.error && <p role="alert" className={styles.connectError}>{state.error}</p>}
      <button type="submit" className={styles.connectPrimary} disabled={pending || checked.size === 0}>
        {pending ? <Loader2 width={16} height={16} className="animate-spin" aria-hidden="true" /> : null} Connect {checked.size === 1 ? "1 location" : `${checked.size} locations`}
      </button>
    </form>
  );
}
