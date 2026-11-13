import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import UsernameTool from "../instagram-username-generator/UsernameTool";

const config: ToolPageConfig = {
  path: "/tools/tiktok-username-generator",
  name: "TikTok username generator",
  crumb: "TikTok username generator",
  title: "TikTok Username Generator: Free Handle Ideas to Copy",
  description:
    "Free TikTok username generator: turn your name and niche into clean, creative or brand handle ideas of 24 characters or fewer that follow TikTok rules.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "TikTok username generator:", mark: "handle ideas", after: "to copy" },
  lede: "A TikTok username can be 2 to 24 characters and use letters, numbers, underscores and periods, but it cannot end with a period. Type your name and niche to get valid ideas you can copy.",
  art: "writing",
  artLabel: "A creator writes TikTok username ideas with a giant pencil on a phone-shaped card",
  heroPoints: ["2–24 characters", "Valid characters only", "No signup"],
  toolTitle: "Generate TikTok username ideas",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok username generator",
  steps: [
    {
      title: "Enter a name and niche",
      text: "Type Your name or brand and a Niche or topic. You can leave the name empty to get niche-only ideas such as the.fitness.",
      art: "writing",
    },
    {
      title: "Pick a style",
      text: "Choose Clean (personal), Creative or Business / brand. Your style's patterns come first, followed by ideas from the other two styles.",
      art: "feat-ai",
    },
    {
      title: "Copy and check it in TikTok",
      text: "Press Copy next to a username, then open Profile > Edit profile > Username in the TikTok app to see whether it is free.",
      art: "card-dm",
    },
  ],
  featuresTitle: "TikTok handle ideas that fit before you try them",
  features: [
    {
      title: "Made for TikTok's character rules",
      text: "Every idea is 2 to 24 characters, uses only lowercase letters, numbers, periods and underscores, and never starts, ends or doubles up with a period.",
      art: "analytics",
    },
    {
      title: "Three styles, one list",
      text: "Choose clean personal handles, playful creative options or brand formats, with first.last variants when your name has two words.",
      art: "writing",
    },
    {
      title: "Private and repeatable",
      text: "No AI and no randomness: fixed patterns build the same list in your browser every time, and your name and niche are never uploaded.",
      art: "feat-linkbio",
    },
  ],
  guide: {
    title: "How to choose a TikTok username",
    intro:
      "Your TikTok username is the unique handle after @ in your profile and profile link. A short, recognisable name is easier for viewers to remember, say and type when they want to find you again.",
    sections: [
      {
        title: "What are the TikTok username rules?",
        body: (
          <>
            <p>
              TikTok usernames must be 2 to 24 characters and can contain letters, numbers, underscores and periods.
              A username cannot end with a period. This generator also avoids periods at the start and repeated periods
              so its suggestions stay clean and easy to read.
            </p>
            <p>
              Every suggestion is checked against the 24-character limit, but the tool does not contact TikTok. A valid
              format does not mean a username is available, so check your favourite in the app before deciding.
            </p>
          </>
        ),
      },
      {
        title: "How do I change my TikTok username?",
        body: (
          <>
            <p>
              In the TikTok app, open <b>Profile</b>, tap <b>Edit profile</b>, then tap <b>Username</b>. Enter your new
              handle and save it if TikTok confirms that it is available. TikTok lets you change your username once every
              30 days, so check the spelling before you save.
            </p>
            <p>
              Your old profile links may stop working after a change. Update the TikTok link anywhere you have shared it,
              such as your website, email signature and other social profiles.
            </p>
          </>
        ),
      },
      {
        title: "TikTok username vs display name",
        body: (
          <p>
            Your username is your unique @handle and forms part of your TikTok profile URL. Your display name, called a
            nickname in TikTok settings, is the name people see at the top of your profile and does not have to be unique.
            You can use a short username such as <code>@maya.moves</code> and a fuller display name such as Maya Chen Fitness.
          </p>
        ),
      },
      {
        title: "How do I pick a memorable TikTok handle?",
        body: (
          <ul>
            <li><b>Keep it short and sayable.</b> Say it aloud once and check that someone else could spell it.</li>
            <li><b>Match your other profiles.</b> A consistent handle makes it easier to move between platforms.</li>
            <li><b>Use your niche selectively.</b> Add a topic when it clarifies your content without boxing you in.</li>
            <li><b>Limit punctuation and numbers.</b> One period or underscore is usually easier to remember than several.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "TikTok username questions",
  faqs: [
    {
      q: "What characters can a TikTok username use?",
      a: "A TikTok username can be 2 to 24 characters and use letters, numbers, underscores and periods. It cannot end with a period. Ideas from this tool also avoid starting periods and repeated periods.",
    },
    {
      q: "Does this generator check TikTok username availability?",
      a: "No. It runs entirely in your browser and does not contact TikTok. Open Profile > Edit profile > Username in the TikTok app to check whether an idea is free.",
    },
    {
      q: "How often can I change my TikTok username?",
      a: "TikTok lets you change your username once every 30 days. Check the spelling and availability before saving because you may need to wait before changing it again.",
    },
    {
      q: "Can I generate TikTok username ideas without my name?",
      a: "Yes. Leave the name field empty and enter only a niche or topic. The generator will build ideas from that topic, such as the.fitness or fitness.daily.",
    },
  ],
  related: [
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-hashtag-generator",
    "/tools/instagram-username-generator",
    "/tools/best-time-to-post-on-tiktok",
    "/tools/youtube-handle-generator",
  ],
  schema: {
    features: [
      "Up to 30 TikTok username ideas per search",
      "Clean, creative and business styles",
      "Checks TikTok's 2-to-24-character limit",
      "Niche-only ideas when no name is given",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Found your TikTok handle?",
    mark: "Schedule your next post.",
    text: "Schedule TikTok posts with Poskoo after connecting your account through TikTok's official sign-in. Your TikTok password is never entered in Poskoo.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokUsernameGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <UsernameTool platform="tiktok" />
    </ToolPageTemplate>
  );
}
