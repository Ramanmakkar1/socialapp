// "Is this network live yet?" for the network scheduler pages (TikTok, X, Pinterest …), read from
// the same catalog as the rest of the site (src/lib/platform-support.ts → channelStatus.ts), so a
// page never describes publishing as working before the keys and platform approval are in place.
import Link from "next/link";
import { getPlatformCopy, type PlatformEntry } from "@/lib/platform-support";

export type NetworkAvailability = "live" | "awaiting" | "soon";

export function networkAvailability(id: string): NetworkAvailability {
  const entry: PlatformEntry | undefined = getPlatformCopy().catalog.find((e) => e.id === id);
  if (!entry) return "soon";
  return entry.live ? "live" : entry.awaiting ? "awaiting" : "soon";
}

/** Short status phrase: "waiting on TikTok's platform approval" / "coming soon". */
export function availabilityPhrase(state: NetworkAvailability, network: string): string {
  return state === "awaiting" ? `built and waiting on ${network}'s platform approval` : "coming soon";
}

/** Callout under the hero while a network isn't live. Renders nothing once it is. */
export function ChannelStatusNote({ state, network }: { state: NetworkAvailability; network: string }) {
  if (state === "live") return null;
  return (
    <p className="channelNote" role="note">
      <span className="soonPill">{state === "awaiting" ? "Awaiting approval" : "Coming soon"}</span>
      <span>
        {network} publishing isn&apos;t live yet: it&apos;s {availabilityPhrase(state, network)}. You can sign up on the Free plan
        today and schedule to the networks that already work; {network} appears in your calendar as soon as it&apos;s switched on.{" "}
        <Link href="/features">See what works today</Link>.
      </span>
    </p>
  );
}
