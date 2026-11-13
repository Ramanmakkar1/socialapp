import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import UsernameTool from "../instagram-username-generator/UsernameTool";

const config: ToolPageConfig = {
  path: "/tools/youtube-handle-generator",
  name: "YouTube handle generator",
  crumb: "YouTube handle generator",
  title: "YouTube Handle Generator: Free @Handle & Channel Name Ideas",
  description:
    "Free YouTube handle generator: turn your name and niche into @handle and channel name ideas of 3 to 30 characters that follow YouTube's handle rules.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "YouTube handle generator:", mark: "channel name ideas", after: "to copy" },
  lede: "A YouTube handle is your unique @name. It must be 3 to 30 characters and can use letters, numbers, periods, underscores and hyphens. Enter your name and niche to get handle ideas you can copy.",
  art: "writing",
  artLabel: "A creator writes YouTube handle ideas with a giant pencil on a phone-shaped card",
  heroPoints: ["3–30 characters", "Valid characters only", "No signup"],
  toolTitle: "Generate YouTube handle ideas",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the YouTube handle generator",
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
      title: "Copy and check it in YouTube Studio",
      text: "Press Copy next to a handle, then open YouTube Studio > Customization > Basic info > Handle to see whether it is free.",
      art: "card-dm",
    },
  ],
  featuresTitle: "YouTube handle ideas that fit before you try them",
  features: [
    {
      title: "Made for YouTube's character rules",
      text: "Every idea is 3 to 30 characters and uses only lowercase letters, numbers, periods and underscores, so it fits YouTube's handle format.",
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
    title: "How to choose a YouTube handle",
    intro:
      "Your YouTube handle is the unique @name that appears on your channel and in your channel URL. A short, recognisable handle is easier for viewers to remember, say and type when they want to find you again.",
    sections: [
      {
        title: "What are the YouTube handle rules?",
        body: (
          <>
            <p>
              YouTube handles must be 3 to 30 characters and can contain letters, numbers, periods, underscores and
              hyphens. This generator uses lowercase letters, numbers, periods and underscores, so every suggestion fits
              the YouTube format.
            </p>
            <p>
              Every suggestion is checked against the 30-character limit, but the tool does not contact YouTube. A valid
              format does not mean a handle is available, so check your favourite in YouTube Studio before deciding.
            </p>
          </>
        ),
      },
      {
        title: "How do I change my YouTube handle?",
        body: (
          <>
            <p>
              In YouTube Studio, open <b>Customization</b>, then <b>Basic info</b>, then <b>Handle</b>. Enter your new
              handle and save it if YouTube confirms that it is available.
            </p>
            <p>
              Your old channel links may stop working after a change. Update the YouTube link anywhere you have shared it,
              such as your website, email signature and other social profiles.
            </p>
          </>
        ),
      },
      {
        title: "YouTube handle vs channel name",
        body: (
          <p>
            Your handle is your unique @name and forms part of your YouTube channel URL. Your channel name is the display
            name people see on your channel and videos, and it does not have to be unique. You can use a short handle such
            as <code>@maya.moves</code> and a fuller channel name such as Maya Chen Fitness.
          </p>
        ),
      },
      {
        title: "How do I pick a memorable YouTube handle?",
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
  faqTitle: "YouTube handle questions",
  faqs: [
    {
      q: "What characters can a YouTube handle use?",
      a: "A YouTube handle must be 3 to 30 characters and can use letters, numbers, periods, underscores and hyphens. Ideas from this tool use lowercase letters, numbers, periods and underscores.",
    },
    {
      q: "Does this generator check YouTube handle availability?",
      a: "No. It runs entirely in your browser and does not contact YouTube. Open YouTube Studio > Customization > Basic info > Handle to check whether an idea is free.",
    },
    {
      q: "How do I change my YouTube handle?",
      a: "In YouTube Studio, open Customization, then Basic info, then Handle. Enter your new handle and save it if YouTube confirms that it is available.",
    },
    {
      q: "Can I generate YouTube handle ideas without my name?",
      a: "Yes. Leave the name field empty and enter only a niche or topic. The generator will build ideas from that topic, such as the.fitness or fitness.daily.",
    },
  ],
  related: [
    "/tools/tiktok-username-generator",
    "/tools/instagram-username-generator",
    "/tools/youtube-title-counter",
    "/tools/youtube-tag-generator",
  ],
  schema: {
    features: [
      "Up to 30 YouTube handle ideas per search",
      "Clean, creative and business styles",
      "Checks YouTube's 3-to-30-character limit",
      "Niche-only ideas when no name is given",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Found your YouTube handle?",
    mark: "Schedule your next video.",
    text: "Schedule YouTube videos and Shorts with Poskoo after connecting your channel through Google's official sign-in. Your Google password is never entered in Poskoo.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeHandleGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <UsernameTool platform="youtube" />
    </ToolPageTemplate>
  );
}
