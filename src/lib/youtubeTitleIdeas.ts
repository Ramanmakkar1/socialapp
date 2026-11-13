export const TITLE_STYLES = [
  { id: "how-to", label: "How-to" },
  { id: "list", label: "List" },
  { id: "question", label: "Question" },
  { id: "beginner", label: "Beginner" },
  { id: "mistakes", label: "Mistakes" },
  { id: "vs-review", label: "Vs / review" },
] as const;

export type TitleStyle = (typeof TITLE_STYLES)[number]["id"];
export type TitleStyleFilter = TitleStyle | "all";

/** YouTube's hard title limit. */
export const YT_TITLE_MAX = 100;
/** Roughly how many title characters stay visible in search results. */
export const YT_TITLE_SEARCH_VISIBLE = 70;

const FALLBACK_TOPIC = "home workouts";
const MAX_TOPIC_LENGTH = 60;

/** Trim, collapse inner whitespace and cap the topic so titles stay readable. */
export function normalizeTitleTopic(topic: string): string {
  return (
    topic.replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH) || FALLBACK_TOPIC
  );
}

/** Title-case each word so the topic reads well inside a title. */
function titleCase(topic: string): string {
  return topic
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

const TEMPLATES: Record<TitleStyle, ((topic: string) => string)[]> = {
  "how-to": [
    (t) => `How to ${t} (Step by Step)`,
    (t) => `How to ${t} in 2026`,
    (t) => `How to ${t} for Beginners`,
    (t) => `How to ${t} Fast: A Simple Guide`,
    (t) => `How to Get Better at ${t}`,
  ],
  list: [
    (t) => `7 ${t} Tips I Wish I Knew Sooner`,
    (t) => `5 ${t} Tips for Faster Results`,
    (t) => `10 ${t} Ideas That Actually Work`,
    (t) => `3 ${t} Hacks for Busy People`,
    (t) => `5 ${t} Rules I Follow Every Day`,
  ],
  question: [
    (t) => `Is ${t} Worth It in 2026?`,
    (t) => `What Should You Know Before ${t}?`,
    (t) => `Why Is ${t} So Hard?`,
    (t) => `Can You Learn ${t} in 30 Days?`,
    (t) => `What Is the Best Way to Start ${t}?`,
  ],
  beginner: [
    (t) => `${t} for Beginners: Full Guide`,
    (t) => `${t} for Beginners: Where to Start`,
    (t) => `${t} Basics Explained in 10 Minutes`,
    (t) => `A Beginner's Guide to ${t}`,
    (t) => `${t} 101: Everything You Need to Start`,
  ],
  mistakes: [
    (t) => `5 ${t} Mistakes to Avoid`,
    (t) => `The ${t} Mistake That Costs You Time`,
    (t) => `Stop Making These ${t} Mistakes`,
    (t) => `${t} Mistakes Beginners Make (And How to Fix Them)`,
    (t) => `7 ${t} Mistakes I Learned the Hard Way`,
  ],
  "vs-review": [
    (t) => `${t} Review: Is It Worth It?`,
    (t) => `${t} vs the Alternatives: Which Is Better?`,
    (t) => `Honest ${t} Review After 30 Days`,
    (t) => `${t} Review 2026: Pros, Cons and Verdict`,
    (t) => `Should You Buy ${t}? An Honest Review`,
  ],
};

/** Fill the title templates for one style (or every style) with the user's topic. */
export function generateTitles(topic: string, style: string): string[] {
  const clean = titleCase(normalizeTitleTopic(topic));
  const styles =
    style === "all"
      ? TITLE_STYLES
      : TITLE_STYLES.filter((s) => s.id === style);
  const titles: string[] = [];
  for (const s of styles) {
    for (const fill of TEMPLATES[s.id]) {
      titles.push(fill(clean));
    }
  }
  return [...new Set(titles)];
}
