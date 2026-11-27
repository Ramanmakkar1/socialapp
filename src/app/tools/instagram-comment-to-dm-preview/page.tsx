import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import FlowPreview from "./FlowPreview";

const config: ToolPageConfig = {
  path: "/tools/instagram-comment-to-dm-preview",
  name: "Instagram comment-to-DM flow preview",
  crumb: "Comment-to-DM preview",
  title: "Instagram Comment-to-DM Preview: Test Keyword Flows",
  description:
    "Preview an Instagram comment-to-DM flow: edit the keyword, sample comment, match type and DM text, plus an optional email step. Local, sends nothing.",
  pill: "Free · local preview · no Instagram login",
  h1: { before: "Instagram comment-to-DM", mark: "flow preview" },
  lede: "See how a keyword comment becomes an Instagram DM before you set up a rule. Edit every step and the simulated flow updates in your browser, without contacting Instagram.",
  art: "card-dm",
  artLabel: "A relaxed creator on a beanbag previews the auto-DM a commenter will get, with DMs flying from their phone",
  heroPoints: ["Contains or exact match", "Optional email step", "Nothing is sent"],
  toolTitle: "Preview your comment-to-DM flow",
  toolNote: "Free · preview only, not a live Meta connection",
  stepsTitle: "How to use the Instagram comment-to-DM preview",
  steps: [
    {
      title: "Set the keyword and a sample comment",
      text: "Type a Trigger keyword such as GUIDE and a Sample post comment, then choose Contains keyword or Exact match only.",
      art: "writing",
    },
    {
      title: "Write the outgoing DM",
      text: "Enter the Outgoing DM text (up to 1,000 characters in this preview). It appears as the brand's message once the comment matches.",
      art: "card-dm",
    },
    {
      title: "Add the optional email step",
      text: "Tick Add an optional email-capture step to preview an email prompt, a sample reply and a follow-up DM. Use sample data only.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "See the whole conversation before it is live",
  features: [
    {
      title: "Step-by-step flow",
      text: "The preview shows the comment, the keyword check, the outgoing DM and, if you want, the email capture and follow-up.",
      art: "feat-dm",
    },
    {
      title: "Real matching results",
      text: "The keyword check uses the same matching function as Poskoo's auto-DM rules, with one-click contains and exact examples.",
      art: "card-dm",
    },
    {
      title: "Nothing leaves the tab",
      text: "No login, no Instagram connection and no saving. The sample email field is never submitted or stored.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "How Instagram comment-to-DM flows work",
    intro:
      "A comment-to-DM flow answers a comment with a private message. You ask people to comment a keyword, an automation checks each new comment, and matching commenters receive the link or resource they asked for. This preview lets you check the wording and the matching before anything is live.",
    sections: [
      {
        title: "What this preview shows",
        body: (
          <>
            <p>The right-hand panel is a sample Instagram post with up to five steps:</p>
            <ul>
              <li><b>1 · Post comment</b>: your sample comment from sample.follower.</li>
              <li><b>2 · Keyword check</b>: whether the comment matches your keyword with the chosen match type.</li>
              <li><b>3 · Outgoing DM preview</b>: your message, shown only when the comment matched.</li>
              <li><b>4 and 5</b>, when the email step is on: the email prompt with a sample address, then the follow-up DM.</li>
            </ul>
            <p>
              A status line under the preview explains the current state, for example a missing keyword or a comment that
              did not match. The account names and post are illustrations, and nothing is sent.
            </p>
          </>
        ),
      },
      {
        title: "Example: one keyword, three comments",
        body: (
          <>
            <p>The three example cards under the tool use the keyword GUIDE and give these results:</p>
            <div className={t.example}>
              <p><b>Contains</b> · &ldquo;Can you send the GUIDE please?&rdquo; · Keyword matched</p>
              <p><b>Exact</b> · &ldquo;Can you send the GUIDE please?&rdquo; · No match</p>
              <p><b>Exact</b> · &ldquo;guide!&rdquo; · Keyword matched</p>
            </div>
            <p>
              Load any example with its button, then change the comment to see how far the rule stretches. For quick
              checks of many comments at once, use the{" "}
              <Link href="/tools/instagram-comment-keyword-tester">comment keyword tester</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for comment-to-DM messages",
        body: (
          <ul>
            <li><b>Deliver what you promised.</b> If the caption says &ldquo;comment GUIDE for the guide&rdquo;, the first DM should contain the guide link.</li>
            <li><b>Keep it short and personal.</b> Thank them, give the link and say what it is. A long sales pitch reads like spam.</li>
            <li><b>Ask for an email only when it adds value</b>, for example for a full guide or a series, and say what you will send.</li>
            <li>
              <b>Track the link.</b> Tag it with the <Link href="/tools/instagram-utm-builder">UTM builder</Link> so you can see
              visits from the DM in your analytics.
            </li>
          </ul>
        ),
      },
      {
        title: "From preview to a live rule",
        body: (
          <>
            <p>
              A live flow needs a professional Instagram account connected through Meta. In{" "}
              <Link href="/instagram-auto-dm">Poskoo&apos;s Instagram auto-DM</Link>, you pick the posts, add the keyword
              and match type, and write the message once. When a comment matches, Poskoo sends the DM through the official
              Meta API, as long as the rule is active and delivery rules allow it.
            </p>
          </>
        ),
      },
      {
        title: "Common comment-to-DM mistakes",
        body: (
          <ul>
            <li>Using exact matching while the caption invites longer comments.</li>
            <li>A keyword that is an everyday word, so normal comments trigger DMs.</li>
            <li>A DM with no link, or a link that is broken or not mobile friendly.</li>
            <li>Asking for an email before giving anything useful in return.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Comment-to-DM preview questions",
  faqs: [
    {
      q: "What does this Instagram comment-to-DM preview do?",
      a: "It shows how a sample post comment, keyword match and outgoing DM fit together. You can edit the keyword, comment, match type and message, and the local preview updates immediately in your browser.",
    },
    {
      q: "What is the difference between contains and exact matching?",
      a: "Contains matching finds your keyword as a whole word or phrase inside a longer comment. Exact matching requires the entire comment to equal the keyword after case, punctuation, leading mentions and spacing are normalized.",
    },
    {
      q: "Does this preview connect to Instagram or send real DMs?",
      a: "No. It is a local preview, not a live Meta connection. It does not read your posts, contact Instagram, save your entries or send comments or DMs. A live Poskoo rule uses a connected professional Instagram account and the official Meta API.",
    },
    {
      q: "How does the optional email-capture step work?",
      a: "Switch it on to preview a sample email prompt, a submitted sample email and a follow-up DM. Use sample data only: the field is never submitted, transmitted or stored.",
    },
    {
      q: "How do I turn this flow into a real automation?",
      a: "Connect a professional Instagram account to Poskoo through Meta, create an auto-DM rule with your keyword, match type and message, and choose the posts it applies to. Poskoo has a free plan.",
    },
  ],
  related: [
    "/tools/instagram-comment-keyword-tester",
    "/tools/instagram-comment-to-dm-calculator",
    "/tools/instagram-dm-link-generator",
    "/tools/instagram-utm-builder",
    "/tools/instagram-post-preview",
  ],
  schema: {
    features: [
      "Simulated comment, keyword check and DM",
      "Contains and exact matching",
      "Optional email-capture and follow-up DM step",
      "One-click matching examples",
      "Runs locally, nothing sent or stored",
    ],
  },
  cta: {
    title: "The flow looks right.",
    mark: "Make it live.",
    text: "Connect Instagram through Meta, add this keyword and message to a Poskoo rule, and every matching comment gets your DM.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCommentToDmPreviewPage() {
  return (
    <ToolPageTemplate config={config}>
      <FlowPreview />
    </ToolPageTemplate>
  );
}
