"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Calculator, Coins, RotateCcw } from "lucide-react";
import t from "@/components/tools/tools.module.css";

type Platform = "instagram" | "tiktok";

const DEFAULTS: Record<Platform, { low: string; high: string; label: string }> = {
  instagram: { low: "5", high: "25", label: "Instagram" },
  tiktok: { low: "10", high: "25", label: "TikTok" },
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function multiplierFor(rate: number | null): { value: number; label: string } {
  if (rate === null) return { value: 1, label: "x1 (add engagement rate to adjust)" };
  if (rate < 1) return { value: 0.5, label: "x0.5 (under 1%)" };
  if (rate <= 3) return { value: 1, label: "x1 (1–3%)" };
  if (rate <= 6) return { value: 1.5, label: "x1.5 (3–6%)" };
  return { value: 2, label: "x2 (over 6%)" };
}

const fieldClass =
  "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--poskoo-violet)]";
const labelClass = "text-sm font-semibold";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";

export type MoneyCalculatorProps = {
  platform?: Platform;
};

export default function MoneyCalculator({ platform = "instagram" }: MoneyCalculatorProps = {}) {
  const d = DEFAULTS[platform];
  const uid = useId();
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("");
  const [low, setLow] = useState(d.low);
  const [high, setHigh] = useState(d.high);
  const [posts, setPosts] = useState("4");
  const [views, setViews] = useState("");
  const [rpmLow, setRpmLow] = useState("0.40");
  const [rpmHigh, setRpmHigh] = useState("1.00");
  const isTikTok = platform === "tiktok";

  const result = useMemo(() => {
    const f = Number(followers);
    const lo = Number(low);
    const hi = Number(high);
    const n = Number(posts);
    if (!Number.isFinite(f) || f <= 0 || !Number.isFinite(lo) || !Number.isFinite(hi) || lo < 0 || hi < lo) {
      return null;
    }
    const rate = engagement.trim() === "" ? null : Number(engagement);
    const mult = multiplierFor(rate === null || !Number.isFinite(rate) ? null : rate);
    const perThousand = f / 1000;
    const postLow = perThousand * lo * mult.value;
    const postHigh = perThousand * hi * mult.value;
    const monthly = Number.isFinite(n) && n > 0 ? n : 0;
    const v = Number(views);
    const rLo = Number(rpmLow);
    const rHi = Number(rpmHigh);
    const rewards =
      isTikTok && Number.isFinite(v) && v > 0 && Number.isFinite(rLo) && Number.isFinite(rHi) && rLo >= 0 && rHi >= rLo
        ? { low: (v / 1000) * rLo, high: (v / 1000) * rHi }
        : null;
    return {
      mult,
      postLow,
      postHigh,
      reelLow: postLow * 1.3,
      reelHigh: postHigh * 1.3,
      storyLow: postLow * 0.4,
      storyHigh: postHigh * 0.4,
      monthLow: postLow * monthly,
      monthHigh: postHigh * monthly,
      posts: monthly,
      rewards,
    };
  }, [followers, engagement, low, high, posts, views, rpmLow, rpmHigh, isTikTok]);

  const hasInput = followers.trim() !== "" || engagement.trim() !== "" || views.trim() !== "";

  function reset() {
    setFollowers("");
    setEngagement("");
    setLow(d.low);
    setHigh(d.high);
    setPosts("4");
    setViews("");
    setRpmLow("0.40");
    setRpmHigh("1.00");
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Inputs */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor={`${uid}-followers`} className={labelClass}>
                Followers
              </label>
              <input
                id={`${uid}-followers`}
                type="text"
                inputMode="decimal"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className={`mt-2 ${fieldClass}`}
                placeholder="e.g. 12000"
              />
            </div>
            <div className="min-w-0">
              <label htmlFor={`${uid}-engagement`} className={labelClass}>
                Average engagement rate %
              </label>
              <input
                id={`${uid}-engagement`}
                type="text"
                inputMode="decimal"
                value={engagement}
                onChange={(e) => setEngagement(e.target.value)}
                className={`mt-2 ${fieldClass}`}
                placeholder="e.g. 3.5"
              />
              <p className="mt-1 text-xs text-[#5f5873]">
                Not sure?{" "}
                <Link
                  href={isTikTok ? "/tools/tiktok-engagement-rate-calculator" : "/tools/instagram-engagement-rate-calculator"}
                  className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2"
                >
                  Calculate your engagement rate
                </Link>
                .
              </p>
            </div>
          </div>

          {isTikTok && (
            <div className="mt-4 border-t border-dashed border-[var(--poskoo-line)] pt-4">
              <label htmlFor={`${uid}-views`} className={labelClass}>
                Average views per video <span className="font-normal text-[#5f5873]">(optional)</span>
              </label>
              <input
                id={`${uid}-views`}
                type="text"
                inputMode="decimal"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                className={`mt-2 ${fieldClass}`}
                placeholder="e.g. 25000"
              />
              <p className="mt-1 text-xs text-[#5f5873]">
                Used only for the optional Creator Rewards estimate below.
              </p>
            </div>
          )}

          <div className="mt-4 border-t border-dashed border-[var(--poskoo-line)] pt-4">
            <p className="text-sm font-semibold">Rate per 1,000 followers (USD)</p>
            <p className="mt-1 text-xs text-[#5f5873]">
              Defaults: ${d.low} low to ${d.high} high per 1,000 followers per {isTikTok ? "sponsored video" : "feed post"}. Edit them to match your niche.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label htmlFor={`${uid}-low`} className="text-xs font-semibold text-[#3d3450]">
                  Low
                </label>
                <input
                  id={`${uid}-low`}
                  type="text"
                  inputMode="decimal"
                  value={low}
                  onChange={(e) => setLow(e.target.value)}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor={`${uid}-high`} className="text-xs font-semibold text-[#3d3450]">
                  High
                </label>
                <input
                  id={`${uid}-high`}
                  type="text"
                  inputMode="decimal"
                  value={high}
                  onChange={(e) => setHigh(e.target.value)}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-dashed border-[var(--poskoo-line)] pt-4">
            <label htmlFor={`${uid}-posts`} className={labelClass}>
              Sponsored posts per month
            </label>
            <input
              id={`${uid}-posts`}
              type="text"
              inputMode="decimal"
              value={posts}
              onChange={(e) => setPosts(e.target.value)}
              className={`mt-2 ${fieldClass}`}
              placeholder="4"
            />
          </div>

          <p className="mt-3 text-xs text-[#5f5873]">
            Engagement multiplier: under 1% x0.5, 1–3% x1, 3–6% x1.5, over 6% x2.
          </p>

          {isTikTok && (
            <div className="mt-4 border-t border-dashed border-[var(--poskoo-line)] pt-4">
              <p className="text-sm font-semibold">Creator Rewards estimate (optional)</p>
              <p className="mt-1 text-xs text-[#5f5873]">
                Qualifying views are views on videos over 1 minute. Enter an RPM of $0.40 to $1.00. This is an estimate, not data from TikTok.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label htmlFor={`${uid}-rpm-low`} className="text-xs font-semibold text-[#3d3450]">
                    RPM low (USD)
                  </label>
                  <input
                    id={`${uid}-rpm-low`}
                    type="text"
                    inputMode="decimal"
                    value={rpmLow}
                    onChange={(e) => setRpmLow(e.target.value)}
                    className={`mt-1 ${fieldClass}`}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor={`${uid}-rpm-high`} className="text-xs font-semibold text-[#3d3450]">
                    RPM high (USD)
                  </label>
                  <input
                    id={`${uid}-rpm-high`}
                    type="text"
                    inputMode="decimal"
                    value={rpmHigh}
                    onChange={(e) => setRpmHigh(e.target.value)}
                    className={`mt-1 ${fieldClass}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-5 text-center" aria-live="polite">
            <p className="text-sm text-[#3d3450]">Estimated price per {isTikTok ? "sponsored video" : "sponsored post"}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
              {result === null ? "—" : `${money.format(result.postLow)}–${money.format(result.postHigh)}`}
            </p>
            <p className="mt-2 text-xs text-[#5f5873]">
              Estimate only. Not a guarantee and not data from {d.label}.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40"
            disabled={!hasInput}
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear numbers
          </button>
        </aside>
      </div>

      {/* Breakdown */}
      {result === null ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] px-4 py-8 text-center text-sm text-[#3d3450]">
          <Calculator className="h-7 w-7 text-[var(--poskoo-violet)]" aria-hidden="true" />
          <p>Enter your followers and rate per 1,000 to see an estimated {isTikTok ? "sponsored-video" : "sponsored-post"} range.</p>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-2 gap-3 ${isTikTok ? "" : "lg:grid-cols-4"}`}>
            <div className={kpi}>
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
                <Coins className="h-3.5 w-3.5" aria-hidden="true" /> {isTikTok ? "Sponsored video" : "Feed post"}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
                {money.format(result.postLow)}–{money.format(result.postHigh)}
              </p>
              <p className="mt-1 text-xs text-[#3d3450]">Estimate per {isTikTok ? "video" : "post"}.</p>
            </div>
            {!isTikTok && (
              <>
                <div className={kpi}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">Reel (x1.3)</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
                    {money.format(result.reelLow)}–{money.format(result.reelHigh)}
                  </p>
                  <p className="mt-1 text-xs text-[#3d3450]">Estimate per Reel.</p>
                </div>
                <div className={kpi}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">Story (x0.4)</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
                    {money.format(result.storyLow)}–{money.format(result.storyHigh)}
                  </p>
                  <p className="mt-1 text-xs text-[#3d3450]">Estimate per Story.</p>
                </div>
              </>
            )}
            <div className={kpi}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
                Monthly ({result.posts} {isTikTok ? "videos" : "posts"})
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
                {money.format(result.monthLow)}–{money.format(result.monthHigh)}
              </p>
              <p className="mt-1 text-xs text-[#3d3450]">Estimate per month.</p>
            </div>
          </div>

          {isTikTok && result.rewards !== null && (
            <div className={kpi}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
                Creator Rewards estimate
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
                {money.format(result.rewards.low)}–{money.format(result.rewards.high)}
              </p>
              <p className="mt-1 text-xs text-[#3d3450]">
                Qualifying views ÷ 1,000 × ${rpmLow}–${rpmHigh} RPM. An estimate only, not from TikTok.
              </p>
            </div>
          )}

          <div className={t.example}>
            <p>
              <b>Formula:</b> (followers ÷ 1,000) × rate per 1,000 × engagement multiplier = estimated price per {isTikTok ? "video" : "post"}.
            </p>
            <p>
              ({Number(followers).toLocaleString("en-US")} ÷ 1,000) × ${low}–${high} × {result.mult.value} ={" "}
              {money.format(result.postLow)}–{money.format(result.postHigh)} per {isTikTok ? "video" : "post"}.
            </p>
            <p>
              {isTikTok
                ? `Monthly = video × ${result.posts} sponsored videos.`
                : `Reel = post × 1.3. Story = post × 0.4. Monthly = post × ${result.posts} posts.`}
            </p>
            <p>
              Engagement multiplier used: {result.mult.label}. This is an estimate, not a guarantee and not data from{" "}
              {d.label}.
            </p>
          </div>
        </>
      )}

      <p className="text-center text-sm">
        <Link href="/signup" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
          Plan and schedule your sponsored posts with Poskoo
        </Link>
      </p>
    </div>
  );
}
