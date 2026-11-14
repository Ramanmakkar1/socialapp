import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CaptionGeneratorTool from "./CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/instagram-caption-generator",
  name: "Instagram caption generator",
  crumb: "Caption generator",
  title: "Instagram Caption Generator: Free Captions by Goal & Tone",
  description:
    "Free Instagram caption generator: enter a topic, pick a goal and tone, and copy six caption drafts with a hook, line breaks and an optional keyword CTA.",
  pill: "Free · no signup · no AI keys",
  h1: { before: "Instagram caption generator:", mark: "six drafts", after: "for any topic" },
  lede: "Type what your post is about, choose a goal and a tone, and get six caption drafts with a hook, short body lines and a call to action. Copy the one that fits and make it yours.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of caption lines and emoji",
  heroPoints: ["6 goals × 4 tones", "Real line breaks", "One-click copy"],
  toolTitle: "Generate your caption",
  toolNote: "Free · generated in your browser",
  stepsTitle: "How to use the Instagram caption generator",
  steps: [
    {
      title: "Enter your topic",
      text: "Type your topic or product in the Topic or product box, for example \"home coffee brewing\" or \"my new ceramic mugs\". It is dropped into every draft.",
      art: "writing",
    },
    {
      title: "Pick a goal, tone and extras",
      text: "Choose a Goal (Engagement, Sell a product, Announce, Educate, Behind the scenes or Giveaway) and a Tone, then tick Add emojis or Add a comment-keyword CTA.",
      art: "feat-ai",
    },
    {
      title: "Copy, edit and schedule",
      text: "Press Copy on the draft you like, or Regenerate to reshuffle the order. Rewrite it in your own voice, then paste it into Instagram or your scheduler.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Caption drafts with structure built in",
  features: [
    {
      title: "Hook, body, call to action",
      text: "Every draft opens with a hook line, adds two short lines about your topic and ends with a question or call to action, separated by blank lines.",
      art: "writing",
    },
    {
      title: "Ready for comment-to-DM",
      text: "Tick the keyword CTA option and each draft ends with a line such as \"Comment CHAT and I'll DM you…\", ready for an automatic DM reply.",
      art: "card-dm",
    },
    {
      title: "Private and instant",
      text: "Drafts are built from fixed templates in your browser. No AI service is called, nothing you type is uploaded and every card shows its character count.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to write Instagram captions that get read in 2026",
    intro:
      "A caption gives your post context, tells people what to do next and helps Instagram understand what the post is about. This generator gives you a structured first draft; the guide below covers how to turn that draft into a caption worth posting.",
    sections: [
      {
        title: "What this caption generator does",
        body: (
          <>
            <p>
              The tool holds six hand-written templates for every combination of <b>goal</b> (six options) and{" "}
              <b>tone</b> (Friendly, Professional, Funny or Bold). When you type a topic, it fills those six templates and
              shows them as cards. If the topic box is empty, the drafts use &ldquo;my newest project&rdquo; as a
              placeholder.
            </p>
            <ul>
              <li>Each draft is a hook, two body lines and a closing line, joined with real line breaks.</li>
              <li><b>Add emojis</b> puts one emoji before the hook and one on the call to action.</li>
              <li>
                <b>Add a comment-keyword CTA</b> swaps the closing line for a &ldquo;Comment WORD and I&apos;ll DM
                you&rdquo; line.
              </li>
              <li><b>Regenerate</b> reshuffles the six drafts for your goal and tone; it does not write new ones.</li>
            </ul>
            <p>
              There is no AI and no network call: the drafts are templates, so treat them as a starting structure and
              add the details only you know.
            </p>
          </>
        ),
      },
      {
        title: "Caption best practices for Instagram in 2026",
        body: (
          <ul>
            <li>
              <b>Lead with the point.</b> The feed shows roughly the first 125 characters or two lines before
              &ldquo;more&rdquo;, so the first line has to make people want the rest.
            </li>
            <li>
              <b>Say the topic in plain words.</b> Instagram search reads captions, so name what the post is about instead
              of relying only on hashtags.
            </li>
            <li>
              <b>Ask for one thing.</b> A single question or a single keyword to comment is easier to act on than three
              requests at once.
            </li>
            <li>
              <b>Stay inside the limits.</b> Captions can be up to 2,200 characters with up to 30 hashtags. Check a long
              caption with the <Link href="/tools/instagram-caption-counter">caption counter</Link>.
            </li>
            <li>
              <b>Keep the spacing.</b> Short paragraphs with blank lines between them are easier to read on a phone.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: an engagement caption for a coffee post",
        body: (
          <>
            <p>
              With the topic &ldquo;home coffee brewing&rdquo;, Goal set to Engagement, Tone set to Friendly and Add
              emojis ticked, the first card reads:
            </p>
            <div className={t.example}>
              <p>✨ Can we talk about something for a second?</p>
              <p>Lately I’ve been thinking a lot about home coffee brewing.</p>
              <p>It feels like everyone has a slightly different take on it.</p>
              <p>What’s your experience been? Drop your thoughts below! 👇</p>
            </div>
            <p>
              Tick <b>Add a comment-keyword CTA</b> and the last line becomes &ldquo;👇 Comment CHAT and I&apos;ll DM you
              my favorite tips on this!&rdquo;. Before posting, swap the general middle lines for something specific, such
              as the grind size or brew ratio you actually use. If you promise a DM, set up the keyword reply with{" "}
              <Link href="/instagram-auto-dm">Instagram auto DM</Link> so everyone who comments CHAT gets it.
            </p>
          </>
        ),
      },
      {
        title: "Common caption mistakes",
        body: (
          <ul>
            <li>Posting a template word for word, so the caption could belong to any account.</li>
            <li>Burying the hook under greetings or hashtags in the first line.</li>
            <li>Promising a DM for a keyword and then never sending it.</li>
            <li>Writing one long block of text with no line breaks.</li>
            <li>Adding a call to action that does not match the goal of the post.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram caption generator questions",
  faqs: [
    {
      q: "How does this Instagram caption generator work?",
      a: "You enter a topic and choose one of six goals and one of four tones. The tool fills six hand-written templates for that goal and tone with your topic and shows them as caption drafts you can copy. It runs in your browser and does not use AI.",
    },
    {
      q: "What is the Instagram caption character limit?",
      a: "An Instagram caption can be up to 2,200 characters, with up to 30 hashtags. The feed only shows about the first 125 characters or two lines before 'more', so put your hook first.",
    },
    {
      q: "What does the Regenerate button do?",
      a: "Regenerate reshuffles the order of the six drafts for your current goal and tone. To see different drafts, change the goal or the tone.",
    },
    {
      q: "Do the generated captions include hashtags?",
      a: "No. The drafts contain a hook, body lines and a call to action only. Add relevant hashtags yourself, for example from the Instagram hashtag generator.",
    },
    {
      q: "What is the comment-keyword CTA option for?",
      a: "It ends each draft with a line asking people to comment a word, such as CHAT or TIPS, to get a DM. Poskoo's Instagram auto DM can send that message automatically to everyone who comments the keyword.",
    },
  ],
  related: [
    "/tools/social-media-post-generator",
    "/tools/instagram-caption-counter",
    "/tools/instagram-hook-generator",
    "/tools/instagram-hashtag-generator",
    "/tools/instagram-line-break-generator",
    "/tools/instagram-comment-keyword-tester",
    "/tools/instagram-post-ideas-generator",
  ],
  schema: {
    features: [
      "Six caption drafts per goal and tone",
      "Six goals and four tones",
      "Optional emojis and comment-keyword CTA",
      "Real line breaks and character count",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your caption is drafted.",
    mark: "Now schedule it.",
    text: "Schedule the post with Poskoo and DM everyone who comments your keyword automatically.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCaptionGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool />
    </ToolPageTemplate>
  );
}
