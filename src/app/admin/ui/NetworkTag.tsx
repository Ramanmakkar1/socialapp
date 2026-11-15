import { NETWORK_LABEL, isNetworkId } from "@/lib/networks/common";
import PlatformBadge, { type PlatformId } from "./PlatformBadge";
import styles from "../admin.module.css";

const BADGED = new Set<string>(["instagram", "facebook", "threads", "youtube", "tiktok"]);
const CORE_LABEL: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", threads: "Threads", youtube: "YouTube" };

export function networkLabel(id: string): string {
  return CORE_LABEL[id] ?? (isNetworkId(id) ? NETWORK_LABEL[id] : id);
}

// Brand badge for the five badged platforms, plain text label for every other network.
export default function NetworkTag({ platform, handle }: { platform: string; handle?: string | null }) {
  if (BADGED.has(platform)) return <PlatformBadge platform={platform as PlatformId} handle={handle ?? undefined} />;
  return (
    <span className={styles.muted} title={networkLabel(platform)}>
      {networkLabel(platform)}
      {handle ? ` · ${handle}` : ""}
    </span>
  );
}
