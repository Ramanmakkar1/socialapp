"use client";

import { useEffect, useRef } from "react";

const FADE_MS = 500;

// Full-bleed looping hero video. The 13 s file itself is a seamless loop (its last
// second crossfades into its first, see public/landing/hero-loop.mp4), so it
// loops natively; JS only fades it in once on first play (requestAnimationFrame).
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let frame: number | null = null;
    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      video.style.opacity = "1";
      return;
    }

    const fadeIn = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / FADE_MS, 1);
        video.style.opacity = String(t);
        frame = t < 1 ? requestAnimationFrame(step) : null;
      };
      frame = requestAnimationFrame(step);
    };

    video.addEventListener("playing", fadeIn, { once: true });

    // Defer the download until the poster has painted and the browser is idle,
    // so the video never competes with the LCP image on first load.
    const load = () => {
      idleHandle = null;
      timeoutHandle = null;
      if (!video.getAttribute("src")) video.src = src;
      video.play().catch(() => {
        // Autoplay blocked (e.g. low-power mode): show the poster frame instead.
        video.style.opacity = "1";
      });
    };

    if ("requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(load, { timeout: 2000 });
    } else {
      timeoutHandle = setTimeout(load, 200);
    }

    return () => {
      video.removeEventListener("playing", fadeIn);
      if (frame !== null) cancelAnimationFrame(frame);
      if (idleHandle !== null) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
    };
  }, [src]);

  // The frame crops the panorama: full-bleed behind the hero on desktop, a
  // full-width bottom strip (the whole comment-to-DM story) under the copy on phones.
  return (
    // The poster is painted as the frame background straight away (fast LCP); the video fades in over it.
    <div className="heroVideoFrame" aria-hidden="true" style={{ backgroundImage: `url(${poster})` }}>
      <video
        ref={videoRef}
        className="heroVideo"
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
