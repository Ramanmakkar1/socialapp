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
