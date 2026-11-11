import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import UtmBuilder from "./UtmBuilder";

const config: ToolPageConfig = {
  path: "/tools/instagram-utm-builder",
  name: "Instagram UTM builder",
  crumb: "UTM builder",
  title: "Instagram UTM Builder: Free Campaign URL Generator",
  description:
    "Free Instagram UTM builder: tag bio, Story sticker and auto-DM links with source, medium, campaign and content so analytics shows what sent each visit.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Instagram", mark: "UTM builder", after: "for bio, Story and DM links" },
  lede: "Add campaign tags to the links in your bio, Story stickers and auto-DMs so your website analytics can show which Instagram placement sent each visit.",
  art: "analytics",
  artLabel: "A creator waters a growing bar chart while hearts float up",
  heroPoints: ["Bio, Story and DM presets", "Keeps existing parameters", "Nothing saved"],
  toolTitle: "Build your campaign link",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram UTM builder",
  steps: [
    {
      title: "Pick where the link goes",
      text: "Press Bio link, Story sticker or Auto-DM. The preset sets source to instagram, medium to social and fills utm_content for that placement.",
      art: "feat-linkbio",
    },
    {
      title: "Add your page and campaign",
      text: "Paste the Destination URL and type a Campaign name such as spring_sale. Change source, medium or content if your team uses other values.",
      art: "writing",
    },
    {
      title: "Copy the tagged link",
      text: "The link appears under Your campaign link as you type. Press Copy link and paste it into your bio, Story sticker or DM.",
      art: "analytics",
    },
  ],
  featuresTitle: "Clean campaign links your analytics can read",
  features: [
    {
      title: "Presets for each placement",
      text: "One click sets utm_content to bio_link, story_link_sticker or auto_dm, so the same campaign can be split by where people clicked.",
      art: "feat-leads",
    },
    {
      title: "Safe with existing links",
      text: "Existing utm_ values are replaced, never duplicated, while other parameters and #section anchors are kept. Bare domains get https:// added.",
      art: "analytics",
    },
    {
      title: "Checks before you share",
      text: "The builder rejects non-web links, links with a username or password in them, and incomplete domains, and tells you what to fix.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "How to track Instagram links with UTM tags in 2026",
    intro:
      "Instagram gives you a handful of places to share a link: your bio, Story Link stickers and DMs. Without tags, most of those visits show up in your website analytics with little detail about where they came from. UTM tags fix that by labelling each link.",
    sections: [
      {
        title: "What the UTM builder does",
        body: (
          <>
            <p>
              The builder adds up to four standard parameters to your URL: <code>utm_source</code> (default{" "}
              <code>instagram</code>), <code>utm_medium</code> (default <code>social</code>), <code>utm_campaign</code>{" "}
              (required) and <code>utm_content</code> (optional). If your link already has any of these, they are replaced
              with the new values, so you never end up with two.
            </p>
            <p>
              Everything happens in your browser. The link is not shortened, saved or sent anywhere, and the tool does not
              check that the page exists.
            </p>
          </>
        ),
      },
      {
        title: "UTM naming best practices",
        body: (
          <ul>
            <li>
              <b>Keep source and medium consistent.</b> Use <code>instagram</code> and <code>social</code> every time.
              Analytics tools typically treat <code>Instagram</code> and <code>instagram</code> as different values.
            </li>
            <li>
              <b>One campaign name per offer.</b> Use the same <code>utm_campaign</code> across the bio, Story and DM
              versions of one promotion.
            </li>
            <li>
              <b>Use content to split placements.</b> That is what the presets do, so you can compare bio clicks with
              Story or DM clicks.
            </li>
            <li>
              <b>Lowercase with underscores.</b> <code>spring_sale</code> is easier to filter than{" "}
              <code>Spring Sale 2026!</code>.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one campaign, tagged for the bio",
        body: (
          <>
            <p>
              Destination <code>https://example.com/spring-sale?ref=ig#offer</code>, campaign <code>spring_sale</code>{" "}
              and the Bio link preset give:
            </p>
            <div className={t.example}>
              <p style={{ wordBreak: "break-all" }}>
                https://example.com/spring-sale?ref=ig&amp;utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=spring_sale&amp;utm_content=bio_link#offer
              </p>
            </div>
            <p>
              The existing <code>ref</code> parameter and the <code>#offer</code> anchor are kept. For the Story and
              auto-DM versions, keep the same campaign name and press the other presets to change only the content value.
            </p>
          </>
        ),
      },
      {
        title: "Website analytics vs Poskoo click counts",
        body: (
          <>
            <p>
              UTM tags label traffic; they do not count anything on their own. Your destination site needs analytics
              installed (for example Google Analytics, following{" "}
              <a href="https://support.google.com/analytics/answer/10917952?hl=en" target="_blank" rel="noopener noreferrer">
                Google&apos;s campaign URL guidance
              </a>
              ) to report sessions, sign-ups and sales by source, medium and campaign.
            </p>
            <p>
              Poskoo counts something different: how many people clicked the link inside an auto-DM it sent. Use both
              together. <Link href="/instagram-auto-dm">Instagram auto DM</Link> stats show which comment rule drives
              clicks, and your analytics shows what those visitors did on your site.
            </p>
          </>
        ),
      },
      {
        title: "Common UTM mistakes",
        body: (
          <ul>
            <li>Tagging internal links on your own site, which can overwrite the original source of a visit.</li>
            <li>Mixing spellings such as <code>ig</code>, <code>insta</code> and <code>instagram</code> for the same source.</li>
            <li>Forgetting to update the bio link when a campaign ends.</li>
            <li>
              Sending people to a profile instead of a page. If the goal is a conversation rather than a visit, use the{" "}
              <Link href="/tools/instagram-dm-link-generator">DM link generator</Link> instead.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram UTM questions",
  faqs: [
    {
      q: "Do UTM tags track clicks by themselves?",
      a: "No. UTM parameters only label the visit. Your website needs an analytics tool, such as Google Analytics, to read the labels and report the traffic under your campaign.",
    },
    {
      q: "Which source and medium should I use for Instagram?",
      a: "Use instagram as the source and social as the medium, and keep the spelling identical every time. Use utm_content to tell the bio link, Story sticker and auto-DM apart.",
    },
    {
      q: "What happens if my link already has UTM tags or other parameters?",
      a: "The builder replaces utm_source, utm_medium, utm_campaign and utm_content with your new values, so you never get duplicates. Other parameters and #section anchors stay as they were.",
    },
    {
      q: "Do I have to type https://?",
      a: "No. If you paste a bare domain such as example.com/offer, the builder adds https:// for you. Only http and https links can be tagged.",
    },
    {
      q: "Is my link saved or shortened?",
      a: "No. The builder runs only in your browser. Nothing is shortened, saved or sent anywhere, so copy the finished link before you leave the page.",
    },
  ],
  related: [
    "/tools/instagram-dm-link-generator",
    "/tools/instagram-comment-to-dm-calculator",
    "/tools/instagram-comment-keyword-tester",
    "/tools/social-media-analytics-report",
    "/tools/instagram-engagement-rate-calculator",
  ],
  schema: {
    features: [
      "Adds utm_source, utm_medium, utm_campaign and utm_content",
      "Presets for bio, Story sticker and auto-DM links",
      "Replaces existing UTM values without duplicates",
      "Keeps other query parameters and anchors",
      "Runs in the browser, nothing saved",
    ],
  },
  cta: {
    title: "Tag the link,",
    mark: "then DM it to every commenter.",
    text: "Poskoo sends your tagged link to everyone who comments a keyword on your post and shows how many people clicked it.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramUtmBuilderPage() {
  return (
    <ToolPageTemplate config={config}>
      <UtmBuilder />
    </ToolPageTemplate>
  );
}
