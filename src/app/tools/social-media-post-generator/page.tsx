import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import { PostGeneratorPicker } from "./PostGeneratorPicker";

const config: ToolPageConfig = {
  path: "/tools/social-media-post-generator",
  name: "Social media post generator",
  crumb: "Social media post generator",
  title: "Free Social Media Post Generator for Every Platform",
  description:
    "Free social media post generator: pick Instagram, TikTok, Facebook, LinkedIn, X or Pinterest, add your topic and get six drafts sized to each limit.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Social media", mark: "post generator" },
  lede: "The free social media post generator writes six ready-to-copy post drafts for Instagram, TikTok, Facebook, LinkedIn, X (Twitter) and Pinterest from one topic, each sized to that platform's character limit.",
  art: "writing",
  artLabel: "A creator writes one post and adapts it for several social platforms",
  heroPoints: ["Six drafts per topic", "Platform-specific limits", "Runs in your browser"],
  toolTitle: "Generate your social media posts",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate social media posts",
  steps: [
    {
      title: "Pick a platform",
      text: "Choose Instagram, TikTok, Facebook, LinkedIn, X or Pinterest. The generator switches to that platform's length limit, wording and call-to-action style.",
      art: "writing",
    },
    {
      title: "Add your topic, goal and tone",
      text: "Describe what the post is about and choose whether it should engage, sell, announce, educate or show behind the scenes. Pick a tone that fits your brand.",
      art: "card-schedule",
    },
    {
      title: "Review and copy",
      text: "Compare the six drafts, check each against the platform limit and copy the one you like into your scheduler or the app.",
      art: "visual",
    },
  ],
  featuresTitle: "One topic, drafts for every platform",
  features: [
    {
      title: "Platform-aware drafts",
      text: "Every draft follows the chosen platform's limits and conventions, so a Pinterest description reads differently from a LinkedIn post.",
      art: "writing",
    },
    {
      title: "Six directions to compare",
      text: "Each run gives you six options built around your topic, with a hook, supporting lines and a call to action.",
      art: "visual",
    },
    {
      title: "Private and repeatable",
      text: "Fixed templates build the posts in your browser. Your topic is not uploaded, and the tool uses no AI or platform scraping.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to social media post limits",
    intro:
      "Each platform gives you a different amount of room. Use this table to see the caption limit before you write, then open the dedicated generator for the platform you are posting to.",
    sections: [
      {
        title: "Social media caption limits by platform",
        body: (
          <>
            <p>
              The table lists the maximum caption or post length for each platform. A limit is a ceiling, not a target:
              the strongest posts usually stop well before the maximum and put the point first.
            </p>
            <table>
              <thead>
                <tr>
                  <th scope="col">Platform</th>
                  <th scope="col">Caption limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Link href="/tools/instagram-caption-generator">Instagram</Link></td>
                  <td>2,200 characters</td>
                </tr>
                <tr>
                  <td><Link href="/tools/tiktok-caption-generator">TikTok</Link></td>
                  <td>4,000 characters</td>
                </tr>
                <tr>
                  <td><Link href="/tools/facebook-caption-generator">Facebook</Link></td>
                  <td>63,206 characters</td>
                </tr>
                <tr>
                  <td><Link href="/tools/linkedin-post-generator">LinkedIn</Link></td>
                  <td>3,000 characters</td>
                </tr>
                <tr>
                  <td><Link href="/tools/pinterest-description-generator">Pinterest</Link></td>
                  <td>500 characters</td>
                </tr>
                <tr>
                  <td><Link href="/tools/x-post-generator">X (Twitter)</Link></td>
                  <td>280 characters</td>
                </tr>
                <tr>
                  <td><Link href="/tools/threads-post-generator">Threads</Link></td>
                  <td>500 characters</td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        title: "How to choose the right platform",
        body: (
          <>
            <p>
              Start with where your audience already spends time. A short, punchy idea suits X or Threads, a visual
              product story fits Instagram or Pinterest, and a longer professional lesson belongs on LinkedIn.
            </p>
            <p>
              You do not need a different idea for every network. Write the core post once, then adjust the hook, the
              amount of detail and the call to action for each platform&apos;s limit and culture.
            </p>
          </>
        ),
      },
      {
        title: "How long should a social media post be?",
        body: (
          <>
            <p>
              Use only as much text as the idea needs. Instagram posts often work best under 2,200 characters, TikTok
              captions under 4,000, LinkedIn posts around a few short paragraphs and X posts under 280 characters.
            </p>
            <p>
              Long limits such as Facebook&apos;s 63,206 characters are there for flexibility, not as a writing goal. Put
              the most important sentence first so readers see it before any &ldquo;see more&rdquo; cut-off.
            </p>
          </>
        ),
      },
      {
        title: "Common social media post mistakes",
        body: (
          <ul>
            <li>Reusing one caption unchanged across every platform.</li>
            <li>Burying the point under introductions or hashtags.</li>
            <li>Writing to the maximum length instead of the clearest length.</li>
            <li>Ending without a clear next step, such as a comment, save or link.</li>
            <li>
              Publishing without checking the limit. Use the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link> for the visual side too.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Social media post generator questions",
  faqs: [
    {
      q: "Is the social media post generator free?",
      a: "Yes. It is free, needs no signup and runs entirely in your browser. Generate as many drafts as you like, then copy the one that fits.",
    },
    {
      q: "Does it use AI?",
      a: "No. It combines fixed post templates in your browser using your topic, goal, tone and emoji choice. It does not upload your text, call an AI service or scrape any social platform.",
    },
    {
      q: "Which platforms does it support?",
      a: "The picker covers Instagram, TikTok, Facebook, LinkedIn, X (Twitter) and Pinterest. Each option applies that platform's character limit and call-to-action style to the six drafts.",
    },
    {
      q: "What is the caption limit for each platform?",
      a: "Instagram 2,200 characters, TikTok 4,000, Facebook 63,206, LinkedIn 3,000, Pinterest 500, X 280 and Threads 500. The comparison table on this page links to the dedicated generator where one exists.",
    },
    {
      q: "Can I schedule the posts I generate?",
      a: "Yes. Copy a draft into Poskoo's scheduler, connect your account with its official login and plan the post on your calendar.",
    },
  ],
  related: [
    "/tools/instagram-caption-generator",
    "/tools/tiktok-caption-generator",
    "/tools/facebook-caption-generator",
    "/tools/linkedin-post-generator",
    "/tools/pinterest-description-generator",
    "/tools/x-post-generator",
  ],
  schema: {
    features: [
      "Six social media post drafts for any topic",
      "Platform picker for Instagram, TikTok, Facebook, LinkedIn, X and Pinterest",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks, bodies and calls to action",
      "Character counts against each platform's limit",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your posts are ready.",
    mark: "Schedule them.",
    text: "Connect your accounts with their official login, plan every post on one calendar and publish automatically with Poskoo's social media scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function SocialMediaPostGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <PostGeneratorPicker />
    </ToolPageTemplate>
  );
}
