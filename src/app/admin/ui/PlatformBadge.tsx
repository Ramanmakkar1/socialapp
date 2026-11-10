import { AtSign, Facebook, Instagram, Youtube } from "lucide-react";
import styles from "../admin.module.css";

export type PlatformId = "instagram" | "facebook" | "threads" | "youtube" | "tiktok";

const ICON: Record<PlatformId, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  threads: AtSign,
  youtube: Youtube,
  tiktok: AtSign,
};

const COLOR: Record<PlatformId, string> = {
  instagram: styles.pfIg,
  facebook: styles.pfFb,
  threads: styles.pfTh,
  youtube: styles.pfYt,
  tiktok: styles.pfTt,
};

const LABEL: Record<PlatformId, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  youtube: "YouTube",
  tiktok: "TikTok",
};

// A 16px brand-colour platform icon, optionally followed by the @handle.
export default function PlatformBadge({ platform, handle }: { platform: PlatformId; handle?: string }) {
  const Icon = ICON[platform];
  return (
    <span className={styles.pf} title={LABEL[platform]}>
      <span className={COLOR[platform]} style={{ width: "100%", height: "100%", borderRadius: 5, display: "grid", placeItems: "center" }}>
        <Icon size={11} color="#fff" aria-hidden="true" />
      </span>
      {handle ? <span style={{ marginLeft: 4, fontSize: 13 }}>{handle}</span> : null}
    </span>
  );
}
