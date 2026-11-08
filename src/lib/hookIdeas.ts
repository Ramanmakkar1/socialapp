export const HOOK_STYLES = [
  { id: "curiosity", label: "Curiosity" },
  { id: "mistake", label: "Mistake" },
  { id: "how-to", label: "How-to" },
  { id: "myth", label: "Myth" },
  { id: "story", label: "Story" },
  { id: "list", label: "List" },
  { id: "contrarian", label: "Contrarian" },
  { id: "result", label: "Result" },
] as const;

export type HookStyle = (typeof HOOK_STYLES)[number]["id"];
export type HookStyleFilter = HookStyle | "all";

/** One template per hook; it receives the topic and returns the finished first line. */
const TEMPLATES: Record<HookStyle, ((topic: string) => string)[]> = {
  curiosity: [
    (t) => `Nobody tells you this about ${t}`,
    (t) => `The ${t} secret most people miss`,
    (t) => `What I wish I knew before ${t}`,
    (t) => `This changes how you think about ${t}`,
    (t) => `The ${t} fact nobody expects`,
    (t) => `Nobody talks about this side of ${t}`,
  ],
  mistake: [
    (t) => `Stop doing this if you want better ${t}`,
    (t) => `The ${t} mistake that costs you followers`,
    (t) => `I made this ${t} mistake so you don't have to`,
    (t) => `You are doing ${t} wrong. Here is the fix`,
    (t) => `The quiet ${t} mistake that kills your reach`,
    (t) => `Fix this ${t} mistake before your next Reel`,
  ],
  "how-to": [
    (t) => `How to fix ${t} in one minute`,
    (t) => `How I got ${t} right on the first try`,
    (t) => `Here is how to actually fix ${t}`,
    (t) => `The fastest way to improve ${t}`,
    (t) => `How to master ${t} without burning out`,
    (t) => `A simple way to fix ${t} today`,
  ],
  myth: [
    (t) => `The ${t} myth that has to go`,
    (t) => `Everyone is wrong about ${t}`,
    (t) => `This ${t} advice is ruining your results`,
    (t) => `Stop believing these ${t} myths`,
    (t) => `The biggest lie you hear about ${t}`,
    (t) => `Myth vs fact: ${t}`,
  ],
  story: [
    (t) => `I was today years old when I learned ${t}`,
    (t) => `The ${t} lesson that cost me a year`,
    (t) => `This is why I changed how I do ${t}`,
    (t) => `What ${t} taught me the hard way`,
    (t) => `The ${t} lesson that changed everything`,
    (t) => `Read this before you try ${t}`,
  ],
  list: [
    (t) => `3 ${t} tips I wish I knew sooner`,
    (t) => `5 ${t} mistakes to avoid this week`,
    (t) => `3 things about ${t} nobody says out loud`,
    (t) => `4 ${t} hacks that actually work`,
    (t) => `5 ${t} rules I follow every single day`,
    (t) => `7 ${t} truths I learned the hard way`,
  ],
  contrarian: [
    (t) => `Unpopular opinion: ${t} is not that hard`,
    (t) => `You do not need more ${t}. You need less noise`,
    (t) => `${t} advice is keeping you stuck`,
    (t) => `Most ${t} tips are a waste of time`,
    (t) => `The ${t} rules that never worked`,
    (t) => `Stop following ${t} advice from people who never do it`,
  ],
  result: [
    (t) => `This is what better ${t} looks like`,
    (t) => `How we turned ${t} around in one week`,
    (t) => `From zero to a ${t} win in 30 days`,
    (t) => `What happens when you fix ${t} for 30 days`,
    (t) => `Real ${t} results, no filters`,
    (t) => `The ${t} result that surprised even us`,
  ],
};

const FALLBACK_TOPIC = "your niche";
const MAX_TOPIC_LENGTH = 60;

/** Trim, collapse inner whitespace and cap the topic so the hooks stay readable. */
export function normalizeTopic(topic: string): string {
  return (
    topic.replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH) || FALLBACK_TOPIC
  );
}

/** Fill the hook templates for one style (or every style) with the user's topic. */
export function generateHooks(topic: string, style: HookStyleFilter): string[] {
  const clean = normalizeTopic(topic);
  const styles =
    style === "all" ? HOOK_STYLES : HOOK_STYLES.filter((s) => s.id === style);
  const hooks: string[] = [];
  for (const s of styles) {
    for (const fill of TEMPLATES[s.id]) {
      hooks.push(fill(clean));
    }
  }
  return [...new Set(hooks)];
}

/** One hook per line, for the "Copy all" button. */
export function hooksToText(hooks: string[]): string {
  return hooks.join("\n");
}
