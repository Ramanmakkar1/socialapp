"use client";

import { useEffect, useRef } from "react";

// Animated doodle illustration with a transparent background (Grok video, see public/landing/anim/).
// Safari plays HEVC-with-alpha (.mov); every other browser plays VP9-with-alpha (.webm).
// The video loads only when it scrolls near the viewport, pauses off-screen, and stays on the
// still poster for reduced-motion users.
const ANIM_SIZES = {
  "analytics": [420, 276],
  "card-dm": [480, 480],
  "card-leads": [480, 480],
  "card-schedule": [480, 480],
  "demo-dm": [600, 394],
  "demo-schedule": [600, 394],
  "feat-ai": [360, 360],
  "feat-calendar": [480, 270],
  "feat-dm": [360, 360],
  "feat-leads": [360, 360],
  "feat-linkbio": [360, 360],
  "multichannel": [720, 474],
  "problem": [640, 640],
  "compare": [600, 394],
  "help": [600, 394],
  "features": [600, 394],
  "legal": [600, 394],
  "developers": [600, 394],
  "writing": [480, 480],
  "visual": [480, 480],
  "hashtag": [480, 480],
  "pricing": [600, 394],
} as const;

export type AnimName = keyof typeof ANIM_SIZES;

/** Default descriptions for each illustration, used when a call site has no specific label. */
export const ANIM_LABELS: Record<AnimName, string> = {
  "analytics": "A creator waters a growing bar chart while hearts float up",
  "card-dm": "A relaxed creator on a beanbag while DMs fly out of his phone to followers",
  "card-leads": "Two friends high-five next to a board of contacts with check marks and a rising chart",
  "card-schedule": "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  "demo-dm": "A comment sends a paper-plane DM with a link to a happy follower, who is saved as a new lead",
  "demo-schedule": "A creator relaxes in a beanbag with a coffee while a weekly calendar of posts publishes on its own",
  "feat-ai": "An AI helper drafts a caption idea beside a phone",
  "feat-calendar": "A creator plans posts on a weekly calendar",
  "feat-dm": "A creator's phone sends an automatic DM to a follower who commented",
  "feat-leads": "A creator collects new leads in a contact list",
  "feat-linkbio": "A creator's link-in-bio page with click tracking",
  "multichannel": "A creator at a laptop sends one post that splits to several phones and screens",
  "problem": "A tired creator at night buried under phones and chat-bubble notifications",
  "compare": "Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all",
  "help": "A creator reads on a giant open book under a lightbulb and a signpost",
  "features": "A creator points at an open toolbox of calendar, chat, mail, chart and link tools",
  "legal": "A calm creator holds a shield with a check mark next to a padlock, a key and a neat document",
  "developers": "A developer types code on a laptop while a plug connects to a socket and gears turn",
  "writing": "A creator writes on a giant phone screen with a big pencil while a puppy watches",
  "visual": "A creator arranges photos and video frames on a phone screen",
  "hashtag": "A creator juggles colourful hashtag balloons above a phone",
  "pricing": "A happy creator in an armchair holds one membership card while app cards and bills fly away",
};

function isSafari() {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg|android/i.test(ua);
}

export function AnimArt({ name, label, className }: { name: AnimName; label?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [width, height] = ANIM_SIZES[name];
  const base = `/landing/anim/${name}`;

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute("src")) video.src = `${base}${isSafari() ? ".mov" : ".webm"}`;
          video.play().catch(() => {});
        } else if (video.getAttribute("src")) {
          video.pause();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [base]);

  // The video itself stays out of the accessibility tree (role="img" is not valid on <video>);
  // the description is read from a visually hidden span next to it.
  return (
    <>
    <video
      ref={ref}
      className={className ? `animArt ${className}` : "animArt"}
      poster={`${base}.webp`}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={-1}
      aria-hidden="true"
    />
    {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}
