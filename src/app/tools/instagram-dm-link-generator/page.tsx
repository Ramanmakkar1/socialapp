import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import DmLinkGenerator from "./DmLinkGenerator";

const config: ToolPageConfig = {
  path: "/tools/instagram-dm-link-generator",
  name: "Instagram DM link generator",
  crumb: "DM link generator",
  title: "Instagram DM Link Generator: Free ig.me Link Maker",
  description:
    "Free Instagram DM link generator: turn your @username or profile URL into an ig.me link that opens a DM, plus a bio line, HTML link and Story tip.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram DM link generator:", mark: "ig.me links", after: "in one step" },
  lede: "Turn your @username into an ig.me link that opens a direct message with your account. Copy it for your bio, Story sticker, email or website button.",
  art: "card-dm",
  artLabel: "A relaxed creator on a beanbag while DMs fly out of his phone to followers",
  heroPoints: ["ig.me/m format", "Bio, HTML and Story copy", "No login"],
  toolTitle: "Create your Instagram DM link",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram DM link generator",
  steps: [
    {
      title: "Enter your username",
      text: "Type it in the Instagram username box, or paste @yourname or an instagram.com profile URL. The tool strips the @, spaces and URL for you.",
      art: "writing",
    },
    {
      title: "Copy the link or a snippet",
      text: "Press Copy link for the ig.me URL, or copy the ready-made Bio line, HTML link or Story Link sticker tip below it.",
      art: "card-dm",
    },
    {
      title: "Test it, then share it",
      text: "Press Open link to check it opens a DM with your account, then paste it into your bio, a Story sticker, an email or a website button.",
      art: "feat-linkbio",
    },
  ],
  featuresTitle: "One link that skips straight to the conversation",
  features: [
    {
      title: "Paste anything, get a clean link",
      text: "Handles with @, full profile URLs and stray spaces all become one valid ig.me/m link, with a clear message if the username has invalid characters.",
      art: "feat-dm",
    },
    {
      title: "Ready-made snippets",
      text: "Get a bio line, an HTML anchor tag for your site or email, and step-by-step text for a Story Link sticker, each with its own copy button.",
      art: "writing",
    },
    {
      title: "No login, no tracking",
      text: "The link is built in your browser from a public username. The tool does not connect to Instagram or Meta and does not store your handle.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to use Instagram DM links in 2026",
    intro:
      "A DM link takes someone straight to a new message with your account, without searching your profile or tapping Message. It is the shortest path from interest to conversation, whether the person finds you in a Story, an email or on your website.",
    sections: [
      {
        title: "What an ig.me link is and how this tool builds it",
        body: (
          <>
            <p>
              An ig.me/m link is Instagram&apos;s short link format for direct messages. The format is always{" "}
              <code>https://ig.me/m/username</code>. On a phone with Instagram installed it usually opens the app to a
              chat with that account; on a computer it opens Instagram on the web.
            </p>
            <p>
              The generator takes what you type, removes any <code>@</code>, spaces or <code>instagram.com/</code> prefix,
              and checks the result is 1 to 30 letters, numbers, periods or underscores. It does not check that the
              account exists, so press <b>Open link</b> once to confirm it works.
            </p>
          </>
        ),
      },
      {
        title: "Where to use your DM link",
        body: (
          <ul>
            <li>
              <b>Bio:</b> paste the link or the ready-made bio line so followers can message you in one tap.
            </li>
            <li>
              <b>Stories:</b> add a Link sticker (if your account has access) and paste the same URL.
            </li>
            <li>
              <b>Email and newsletters:</b> use the HTML snippet for a &ldquo;Message me on Instagram&rdquo; link.
            </li>
            <li>
              <b>QR codes:</b> encode the ig.me URL so print materials or event signs open a DM when scanned.
            </li>
            <li>
              <b>Website:</b> put the link on a contact page, link-in-bio page or order confirmation page.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: links for @maya.bakes",
        body: (
          <>
            <p>
              Pasting <code>https://www.instagram.com/maya.bakes/</code> into the tool gives these outputs:
            </p>
            <div className={t.example}>
              <p><b>DM link:</b> https://ig.me/m/maya.bakes</p>
              <p><b>Bio line:</b> DM me here: https://ig.me/m/maya.bakes</p>
              <p><b>HTML link:</b> &lt;a href=&quot;https://ig.me/m/maya.bakes&quot; target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot;&gt;Message me on Instagram&lt;/a&gt;</p>
            </div>
            <p>
              If you link to your website from DMs too, tag that URL with the{" "}
              <Link href="/tools/instagram-utm-builder">Instagram UTM builder</Link> so your analytics shows which
              placement sent the visit.
            </p>
          </>
        ),
      },
      {
        title: "DM link best practices and mistakes",
        body: (
          <ul>
            <li>
              <b>Say why to message.</b> &ldquo;DM me for prices&rdquo; gets more messages than a bare link.
            </li>
            <li>
              <b>Be ready to answer.</b> A DM link that leads to slow replies costs more trust than no link at all.
            </li>
            <li>
              <b>Do not confuse it with a profile link.</b> <code>instagram.com/username</code> shows your grid;{" "}
              <code>ig.me/m/username</code> opens a chat. Pick the one that fits the goal.
            </li>
            <li>
              <b>Update it if you change your username.</b> The link contains your handle, so an old link stops pointing
              to you after a rename.
            </li>
            <li>
              <b>Let comments start DMs too.</b> With an <Link href="/instagram-auto-dm">Instagram auto DM</Link>, people
              who comment a keyword on your post get your link in their inbox automatically.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram DM link questions",
  faqs: [
    {
      q: "What is an ig.me/m link?",
      a: "It is Instagram's short link format that opens a new direct message with the username in the URL, usually in the Instagram app on phones. Example: https://ig.me/m/yourname opens a DM thread with @yourname.",
    },
    {
      q: "How is this different from linking to my Instagram profile?",
      a: "A profile link (instagram.com/yourname) shows your grid and bio. An ig.me/m link skips straight to messaging, which is better when you want leads, support questions or giveaway entries in DMs.",
    },
    {
      q: "Can I use the same link in my bio, Stories and on my website?",
      a: "Yes. The ig.me URL works anywhere you can paste a link: Instagram bio, Story Link sticker, email signature, QR codes and HTML links on your site.",
    },
    {
      q: "Does this tool need my Instagram password or Meta login?",
      a: "No. This page only formats a public username into the correct ig.me URL in your browser. It does not connect to Instagram, check that the account exists or store your handle.",
    },
    {
      q: "Why does the tool say my username is invalid?",
      a: "Instagram usernames use only letters, numbers, periods and underscores, up to 30 characters. Remove other symbols or spaces, or paste your profile URL and the tool will extract the username.",
    },
  ],
  related: [
    "/tools/instagram-utm-builder",
    "/tools/instagram-bio-generator",
    "/tools/instagram-comment-to-dm-preview",
    "/tools/instagram-comment-keyword-tester",
    "/tools/instagram-username-generator",
  ],
  schema: {
    features: [
      "Creates ig.me/m direct message links",
      "Accepts @handles and profile URLs",
      "Bio line, HTML link and Story sticker snippets",
      "Username format check",
      "No login, runs in the browser",
    ],
  },
  cta: {
    title: "Start the conversation,",
    mark: "then let DMs send themselves.",
    text: "Poskoo DMs your link to everyone who comments a keyword on your Instagram post, and schedules your posts too.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramDmLinkGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <DmLinkGenerator />
    </ToolPageTemplate>
  );
}
