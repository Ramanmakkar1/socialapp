"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, AtSign, Facebook, Instagram, Loader2, PartyPopper, Plus, RotateCcw, Youtube, X } from "lucide-react";
import { BlueskyIcon, GbpIcon, LinkedInIcon, MastodonIcon, PinterestIcon, TikTokIcon, XIcon } from "@/components/brandIcons";
import { connectBlueskyAction, connectGbpLocationsAction, gbpPickListAction, type BlueskyConnectState, type GbpPickResult } from "./connectActions";
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
  pinterest?: boolean;
  x?: boolean;
  gbp?: boolean;
  /** Keyless networks: always available. */
  bluesky?: boolean;
  mastodon?: boolean;
};

type NetworkId = "instagram" | "facebook" | "threads" | "youtube" | "tiktok" | "linkedin" | "pinterest" | "x" | "bluesky" | "mastodon" | "gbp";

type Network = {
  id: NetworkId;
  name: string;
  sub: string;
  icon: ReactNode;
  href?: string;
  /** Opens a step inside the dialog instead of a link. */
  step?: "instagram" | "bluesky" | "mastodon";
  /** Supported by the app, but the server keys are missing. */
  off?: boolean;
};

const icon = (I: typeof Instagram) => <I width={22} height={22} aria-hidden="true" />;

export function networks(a: ConnectAvailability): Network[] {
  const bothIg = a.facebook && a.instagramLogin;
  return [
    { id: "instagram", name: "Instagram", sub: "Business or Creator", icon: icon(Instagram), ...(bothIg ? { step: "instagram" as const } : { href: "/api/instagram/connect" }), off: !a.instagram },
    { id: "facebook", name: "Facebook", sub: "Page", icon: icon(Facebook), href: "/api/instagram/connect?via=facebook", off: !a.facebook },
    { id: "tiktok", name: "TikTok", sub: "Creator or Business", icon: icon(TikTokIcon), href: "/api/tiktok/connect", off: !a.tiktok },
    { id: "youtube", name: "YouTube", sub: "Channel", icon: icon(Youtube), href: "/api/youtube/connect", off: !a.youtube },
    { id: "linkedin", name: "LinkedIn", sub: "Profile", icon: icon(LinkedInIcon), href: "/api/linkedin/connect", off: !a.linkedin },
    { id: "x", name: "X", sub: "Profile", icon: icon(XIcon), href: "/api/x/connect", off: !a.x },
    { id: "threads", name: "Threads", sub: "Profile", icon: icon(AtSign), href: "/api/threads/connect", off: !a.threads },
    { id: "pinterest", name: "Pinterest", sub: "Business or personal", icon: icon(PinterestIcon), href: "/api/pinterest/connect", off: !a.pinterest },
    { id: "gbp", name: "Google Business Profile", sub: "Locations", icon: icon(GbpIcon), href: "/api/gbp/connect", off: !a.gbp },
    { id: "bluesky", name: "Bluesky", sub: "Profile", icon: icon(BlueskyIcon), step: "bluesky", off: a.bluesky === false },
    { id: "mastodon", name: "Mastodon", sub: "Any server", icon: icon(MastodonIcon), step: "mastodon", off: a.mastodon === false },
  ];
}

const LABEL: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", threads: "Threads", youtube: "YouTube", tiktok: "TikTok",
  linkedin: "LinkedIn", pinterest: "Pinterest", x: "X", bluesky: "Bluesky", mastodon: "Mastodon", gbp: "Google Business Profile",
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
  | { kind: "instagram" }
  | { kind: "bluesky" }
  | { kind: "mastodon" }
  | { kind: "pick" }
  | { kind: "success"; net: string; handle: string }
  | { kind: "error"; net: string; code: string };

const IG_FLOW_KEY = "poskoo.igFlow";

function retryHref(net: string): string | null {
  if (net === "bluesky" || net === "mastodon") return null;
  if (net === "facebook") return "/api/instagram/connect?via=facebook";
  return `/api/${net}/connect`;
}

const CORE: NetworkId[] = ["instagram", "facebook", "threads", "youtube", "tiktok"];
function coreRank(id: NetworkId): number {
  const i = CORE.indexOf(id);
  return i === -1 ? CORE.length : i;
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
      <span className={`${styles.connectIcon} ${styles[`netBg_${n.id}`] ?? ""}`}>{n.icon}</span>
      <span className={styles.connectText}>
        <b>{n.name}</b>
        <span>{n.sub}</span>
      </span>
    </>
  );
}

// "Connect a new channel" window (Buffer-style). Every card is one click: straight to the network's
// own consent screen, or a one-step form inside the dialog (Instagram flow choice, Bluesky handle +
// app password, Mastodon server). After the round trip the dialog reopens on success or on a
// plain-words error with Retry.
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
  // Core channels first (in colour); channels whose server keys are missing go in a separate muted group.
  const ready = list.filter((n) => !n.off).sort((a, b) => coreRank(a.id) - coreRank(b.id));
  const notReady = list.filter((n) => n.off);
  const [view, setView] = useState<View>({ kind: "grid" });
  const [igFlow, setIgFlow] = useState<"instagram" | "facebook">("instagram");
  const [bsState, bsAction, bsPending] = useActionState<BlueskyConnectState, FormData>(connectBlueskyAction, null);

  useEffect(() => {
    // ?connected=<net>[&handle=], ?connect_error=<code>&net=<net>, ?connect=<net> or #connect open the window.
    const url = new URL(window.location.href);
    const p = url.searchParams;
    let next: View | null = null;
    if (p.get("connected")) next = { kind: "success", net: p.get("connected") ?? "", handle: p.get("handle") ?? "" };
    else if (p.get("connect_pick") === "gbp") next = { kind: "pick" };
    else if (p.get("connect_error")) next = { kind: "error", net: p.get("net") ?? "", code: p.get("connect_error") ?? "" };
    else if (p.get("connect") === "bluesky" || p.get("connect") === "mastodon") next = { kind: p.get("connect") as "bluesky" | "mastodon" };
    else if (p.get("connect") === "instagram") next = { kind: "instagram" };
    else if (url.hash === "#connect" || p.get("connect") === "1") next = { kind: "grid" };
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
  }, []);

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

  const open = () => {
    setView({ kind: "grid" });
    showDialog(ref.current, titleRef.current);
  };

  const full = slots ? slots.used >= slots.limit : false;
  const back = (
    <button type="button" className={styles.connectBack} onClick={() => setView({ kind: "grid" })}>
      <ArrowLeft width={16} height={16} aria-hidden="true" /> All channels
    </button>
  );

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
            <h2 id="connect-title" ref={titleRef} tabIndex={-1} className={`${styles.connectTitle} ${cc.title}`}>
              {view.kind === "success" ? "Channel connected" : view.kind === "error" ? "Couldn't connect" : view.kind === "pick" ? "Select the locations to connect" : "Connect a new channel"}
            </h2>
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
              <ul className={`${styles.connectGrid} ${cc.grid}`}>
                {ready.map((n) => (
                  <li key={n.id}>
                    {n.step ? (
                      <button type="button" className={`${styles.connectCard} ${styles.connectCardBtn} ${cc.card}`} onClick={() => setView({ kind: n.step! })}><CardBody n={n} /></button>
                    ) : (
                      <a href={n.href} className={`${styles.connectCard} ${cc.card}`}><CardBody n={n} /></a>
                    )}
                  </li>
                ))}
              </ul>
              {notReady.length > 0 && (
                <section className={cc.offGroup} aria-labelledby="connect-off-heading">
                  <h3 id="connect-off-heading" className={cc.offTitle}>Not available yet</h3>
                  <ul className={cc.offGrid}>
                    {notReady.map((n) => (
                      <li key={n.id}>
                        <span className={cc.offCard} aria-disabled="true" title={`Connecting ${n.name} isn't switched on yet`}>
                          <span className={cc.offIcon}>{n.icon}</span>
                          <span className={cc.offName}>{n.name}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <p className={styles.connectFoot}>Instagram needs a professional (Business or Creator) account. <Link href="/help/getting-started">See the setup steps</Link></p>
              <details className={styles.connectMore}>
                <summary>Facebook profile or Group?</summary>
                <p className={styles.connectFoot}>
                  Poskoo can post to Facebook <b>Pages</b> only. Meta removed posting to personal profiles from its API in 2018 and to Groups in 2024, so no app can publish there.
                </p>
              </details>
            </>
          )}

          {view.kind === "instagram" && (
            <div className={styles.connectStep}>
              {back}
              <p className={styles.connectLead}>Is it an Instagram <b>Business</b> or <b>Creator</b> account?</p>
              <div className={styles.connectBtnCol}>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation */}
                <a href="/api/instagram/connect?via=instagram" className={igFlow === "instagram" ? styles.connectPrimary : styles.connectSecondary} onClick={() => rememberIg("instagram")}>
                  <Instagram width={18} height={18} aria-hidden="true" /> Continue with Instagram <span className={styles.connectHint}>Recommended</span>
                </a>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth start is a route handler: full navigation */}
                <a href="/api/instagram/connect?via=facebook" className={igFlow === "facebook" ? styles.connectPrimary : styles.connectSecondary} onClick={() => rememberIg("facebook")}>
                  <Facebook width={18} height={18} aria-hidden="true" /> Connect via Facebook Page
                </a>
              </div>
              <p className={styles.connectFoot}>
                Personal account? <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noreferrer">How to switch to a professional account</a> (free, takes a minute).
              </p>
            </div>
          )}

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

          {view.kind === "pick" && <GbpPicker onBack={() => setView({ kind: "grid" })} />}

          {view.kind === "success" && (
            <div className={styles.connectStep}>
              <p className={styles.connectSuccess}>
                <PartyPopper width={22} height={22} aria-hidden="true" />
                <span>
                  <b>{view.handle ? (view.handle.includes(" ") || view.handle.startsWith("@") ? view.handle : `@${view.handle}`) : (LABEL[view.net] ?? "Your channel")}</b> is connected
                  {view.handle && LABEL[view.net] ? ` to ${LABEL[view.net]}` : ""}.
                </span>
              </p>
              <div className={styles.connectBtnCol}>
                <a href={`/app/calendar?compose=1&with=${encodeURIComponent(view.net)}`} className={styles.connectPrimary}>Create your first post</a>
                <button type="button" className={styles.connectSecondary} onClick={() => setView({ kind: "grid" })}>Connect another channel</button>
              </div>
            </div>
          )}

          {view.kind === "error" && (
            <div className={styles.connectStep}>
              <p role="alert" className={styles.connectError}>{connectErrorText(view.code, view.net)}</p>
              <div className={styles.connectBtnCol}>
                {view.code !== "limit" && view.code !== "taken" && view.code !== "not_configured" && (
                  retryHref(view.net) ? (
                    <a href={retryHref(view.net)!} className={styles.connectPrimary}><RotateCcw width={16} height={16} aria-hidden="true" /> Retry</a>
                  ) : (
                    <button type="button" className={styles.connectPrimary} onClick={() => setView({ kind: view.net === "bluesky" ? "bluesky" : "mastodon" })}>
                      <RotateCcw width={16} height={16} aria-hidden="true" /> Retry
                    </button>
                  )
                )}
                {view.code === "limit" && <Link href="/app/settings#accounts-heading" className={styles.connectPrimary} onClick={() => ref.current?.close()}>Manage channels</Link>}
                <button type="button" className={styles.connectSecondary} onClick={() => setView({ kind: "grid" })}>All channels</button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
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
