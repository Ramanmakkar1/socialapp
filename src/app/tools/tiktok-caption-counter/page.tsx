import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import t from "@/components/tools/tools.module.css";
import TikTokCaptionCounter from "./TikTokCaptionCounter";

const limitRows: [string, string][] = [
  ["Caption", "4,000 characters"],
  ["Bio", "80 characters"],
  ["Username", "24 characters"],
  ["Comment", "150 characters"],
];

const config: ToolPageConfig = {
  path: "/tools/tiktok-caption-counter",
  name: "TikTok caption character counter",
  crumb: "TikTok caption counter",
  title: "TikTok Caption Character Counter: Free 4,000 Limit Check",
  description: "Free TikTok caption counter with the 4,000-character limit, unique hashtag and mention counts, and a live preview of what shows before more. No signup.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "TikTok caption character counter", after: "with the 4,000 limit" },
  lede: "TikTok captions can be up to 4,000 characters, including hashtags, but only the first line or so shows in the feed.",
  art: "writing",
  artLabel: "A creator writes a TikTok caption beside a character meter, hashtags and a phone feed preview",
  heroPoints: ["4,000-character caption limit", "Hashtag and mention counts", "Preview before more"],
  toolTitle: "Count your TikTok caption",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok caption counter",
  steps: [
    {
      title: "Write or paste your caption",
      text: "Add your draft to the caption box. The character count and remaining space update as you type, including hashtags and mentions.",
      art: "writing",
    },
    {
      title: "Check tags and the feed opening",
      text: "Review the unique hashtag and mention chips, then check the phone preview to see roughly what appears before more.",
      art: "visual",
    },
    {
      title: "Trim and copy your caption",
      text: "Keep the count at 4,000 or below, put your main idea in the opening, then press Copy caption to use your finished text.",
      art: "analytics",
    },
  ],
  featuresTitle: "Check your limit and your opening",
  features: [
    {
      title: "The full 4,000 limit",
      text: "See exactly how many code-point characters your caption uses, how many remain and whether it has gone over TikTok's limit.",
      art: "analytics",
    },
    {
      title: "Tags pulled out for you",
      text: "Unique hashtags and mentions appear in separate lists, making it easy to spot duplicates and review the accounts you tagged.",
      art: "hashtag",
    },
    {
      title: "A preview before more",
      text: "Check roughly what viewers see in the feed before they tap more. Your caption stays in your browser and is never uploaded.",
      art: "visual",
    },
  ],
  guide: {
    title: "TikTok caption limits and feed previews",
    intro: "A TikTok caption can contain 4,000 characters, but viewers usually see only its opening in the feed. Check the total length and the visible first line before you post.",
    sections: [
      {
        title: "What is the TikTok caption character limit?",
        body: (
          <p>
            TikTok captions can be up to <b>4,000 characters</b>. <Link href="/tools/tiktok-hashtag-generator">Hashtags</Link>, mentions, spaces, punctuation and line breaks
            all count toward that total. This counter uses code points, so a standalone emoji such as 😀 counts as one
            character rather than two UTF-16 code units.
          </p>
        ),
      },
      {
        title: "What are TikTok's text limits?",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">TikTok field</th><th scope="col">Character limit</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ),
      },
      {
        title: "How much of a TikTok caption shows before more?",
        body: (
          <p>
            Only the first line or so usually appears before <b>more</b>, and the exact cutoff varies with screen size,
            layout and line breaks. The phone preview uses approximately 100 characters as a guide, not an exact cutoff.
            Put the hook or main point first so it is visible without a tap.
          </p>
        ),
      },
      {
        title: "How do I schedule a checked TikTok caption?",
        body: (
          <p>
            Finish your caption here, then open the <Link href="/tiktok-scheduler">TikTok scheduler</Link> to connect
            through TikTok&apos;s official sign-in and choose a publishing time. For a first scheduled post, follow the{" "}
            <Link href="/help/schedule-tiktok-posts">step-by-step TikTok scheduling guide</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "TikTok caption counter questions",
  faqs: [
    {
      q: "How many characters can a TikTok caption have?",
      a: "A TikTok caption can have up to 4,000 characters. Hashtags, mentions, spaces, punctuation and line breaks all count toward the limit.",
    },
    {
      q: "How much of a TikTok caption shows before more?",
      a: "Usually only the first line or so appears in the feed. The exact cutoff varies by device and line breaks, so this tool shows approximately the first 100 characters as a guide.",
    },
    {
      q: "Do hashtags and mentions count toward the TikTok limit?",
      a: "Yes. The # and @ symbols and every character in a hashtag or mention count toward the 4,000-character caption limit. The chips list each unique tag once.",
    },
    {
      q: "Is my TikTok caption uploaded or saved?",
      a: "No. All counting and previewing happens in your browser. Your caption is not uploaded or saved, and you do not need to sign in.",
    },
  ],
  related: ["/tools/tiktok-caption-generator", "/tools/tiktok-hashtag-generator", "/tools/x-character-counter", "/tools/linkedin-character-counter", "/tools/instagram-caption-counter"],
  schema: {
    features: [
      "TikTok caption counting against the 4,000-character limit",
      "Unique hashtag and mention extraction with chips",
      "Phone preview of approximately 100 characters before more",
      "Live remaining count and over-limit progress bar",
      "Copy and clear controls with no caption upload",
    ],
  },
  cta: {
    title: "Your TikTok caption fits.",
    mark: "Now schedule it.",
    text: "Connect TikTok through its official sign-in, add your video and caption to Poskoo's calendar and publish at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokCaptionCounterPage() {
  const state = networkAvailability("tiktok");
  const pageConfig =
    state === "live"
      ? config
      : {
          ...config,
          guide: {
            ...config.guide,
            sections: config.guide.sections.map((section) =>
              section.title === "How do I schedule a checked TikTok caption?"
                ? {
                    ...section,
                    body: (
                      <p>
                        Finish your caption here, then post it from the TikTok app. Publishing in the{" "}
                        <Link href="/tiktok-scheduler">TikTok scheduler</Link> is {availabilityPhrase(state, "TikTok")};{" "}
                        the{" "}
                        <Link href="/help/schedule-tiktok-posts">step-by-step TikTok scheduling guide</Link> shows the
                        setup once it is live.
                      </p>
                    ),
                  }
                : section
            ),
          },
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <TikTokCaptionCounter />
    </ToolPageTemplate>
  );
}
