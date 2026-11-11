import { AnimArt } from "./AnimArt";
type HelpGuideVariant = "start" | "troubleshoot" | "schedule" | "connect" | "autodm" | "story";

const LABELS: Record<HelpGuideVariant, string> = {
  start: "Getting started guide: a creator reading on a giant open book under a lightbulb and a signpost",
  troubleshoot: "Troubleshooting guide: a creator reading on a giant open book under a lightbulb and a signpost",
  schedule: "Scheduling guide: a creator reading on a giant open book under a lightbulb and a signpost",
  connect: "Connecting accounts guide: a creator reading on a giant open book under a lightbulb and a signpost",
  autodm: "Auto-DM guide: a creator reading on a giant open book under a lightbulb and a signpost",
  story: "Story replies guide: a creator reading on a giant open book under a lightbulb and a signpost",
};

export default function HelpGuideIllustration({
  variant,
  className,
}: {
  variant: HelpGuideVariant;
  className?: string;
}) {
  return (
    <div className={className}>
      <AnimArt name="help" label={LABELS[variant]} />
    </div>
  );
}
