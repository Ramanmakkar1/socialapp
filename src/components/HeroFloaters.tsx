import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, ChartColumn, Facebook, Heart, Instagram, Link2, Mail, MessageCircle, Send, Sparkles, UserPlus } from "lucide-react";

type Floater = { Icon: LucideIcon; color: string; x: string; y: string; delay: number; size?: number };

// Tiles that bob in the empty sky around the headline (outer bands only, never over the text).
const FLOATERS: Floater[] = [
  { Icon: Instagram, color: "#E1306C", x: "7%", y: "22%", delay: 0 },
  { Icon: CalendarDays, color: "#F0643C", x: "20%", y: "17%", delay: 1.2, size: 40 },
  { Icon: Mail, color: "#1F1830", x: "15%", y: "38%", delay: 2.1, size: 40 },
  { Icon: Facebook, color: "#1877F2", x: "89%", y: "20%", delay: 0.6 },
  { Icon: Link2, color: "#22A06B", x: "78%", y: "17%", delay: 1.8, size: 40 },
  { Icon: ChartColumn, color: "#7C5CFF", x: "92%", y: "40%", delay: 2.6, size: 40 },
  { Icon: Sparkles, color: "#E8A400", x: "82%", y: "33%", delay: 0.9, size: 40 },
];

// Tiles that keep launching out of the phone in the video (bottom-left) and drift up.
const LAUNCHERS: Floater[] = [
  { Icon: Heart, color: "#EC4899", x: "13%", y: "58%", delay: 0 },
  { Icon: MessageCircle, color: "#7C5CFF", x: "15%", y: "60%", delay: 2.3 },
  { Icon: Send, color: "#2F7CF6", x: "12%", y: "57%", delay: 4.6 },
  { Icon: UserPlus, color: "#22A06B", x: "14%", y: "59%", delay: 6.9 },
];

function Tile({ f, kind }: { f: Floater; kind: "float" | "launch" }) {
  const size = f.size ?? 48;
  const style = { left: f.x, top: f.y, width: size, height: size, animationDelay: `${f.delay}s`, color: f.color } as CSSProperties;
  return (
    <span className={`heroTile ${kind}`} style={style}>
      <f.Icon size={Math.round(size * 0.5)} strokeWidth={2.2} aria-hidden="true" />
    </span>
  );
}

export function HeroFloaters() {
  return (
    <div className="heroFloaters" aria-hidden="true">
      {FLOATERS.map((f, i) => <Tile key={`f${i}`} f={f} kind="float" />)}
      {LAUNCHERS.map((f, i) => <Tile key={`l${i}`} f={f} kind="launch" />)}
    </div>
  );
}
