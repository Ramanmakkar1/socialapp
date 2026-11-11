import {
  AlignLeft, AtSign, Calculator, CalendarDays, ChartColumn, Circle, Clapperboard, Eye, Frame, GalleryHorizontal,
  Gauge, Gift, Globe, Hash, Image, KeyRound, Layers, Lightbulb, Link, List, Megaphone, MessageSquare, Palette,
  Percent, Pilcrow, Scissors, Smartphone, Sparkles, SquareCheck, SquareStack, Tag, Type, User, Workflow,
  type LucideIcon,
} from "lucide-react";
import type { ToolIconName } from "./registry";

const ICONS: Record<ToolIconName, LucideIcon> = {
  sparkles: Sparkles, hash: Hash, type: Type, pilcrow: Pilcrow, align: AlignLeft, layers: Layers,
  lightbulb: Lightbulb, megaphone: Megaphone, user: User, at: AtSign, eye: Eye, message: MessageSquare,
  image: Image, gallery: GalleryHorizontal, scissors: Scissors, "square-stack": SquareStack, frame: Frame,
  smartphone: Smartphone, circle: Circle, clapperboard: Clapperboard, palette: Palette, calendar: CalendarDays,
  chart: ChartColumn, check: SquareCheck, globe: Globe, gauge: Gauge, percent: Percent, key: KeyRound,
  workflow: Workflow, calculator: Calculator, link: Link, gift: Gift, tag: Tag, list: List,
};

export function ToolIcon({ name, size = 20 }: { name: ToolIconName; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} aria-hidden="true" strokeWidth={2} />;
}
