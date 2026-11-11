import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { FONT_STYLES } from "@/lib/igFonts";
import FontTool from "./FontTool";

const SAMPLE = "Coffee & Co 24";

const config: ToolPageConfig = {
  path: "/tools/instagram-font-generator",
  name: "Instagram font generator",
  crumb: "Font generator",
  title: "Instagram Font Generator: Copy & Paste Bio Fonts (Free)",
  description:
    "Free Instagram font generator: turn text into 11 Unicode styles such as bold, italic, script and small caps, then copy them into your bio or caption.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram font generator:", mark: "copy and paste", after: "bio fonts" },
  lede: "Type your text once and see it in 11 Unicode styles, from bold and italic to script and small caps. Copy the one you like into your Instagram bio or caption.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of styled letters and emoji",
  heroPoints: ["11 font styles", "Copy with one click", "No signup"],
  toolTitle: "Style your text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram font generator",
  steps: [
    {
      title: "Type your text",
      text: "Replace \"Your bio here\" in Your text with a name, headline or short line. Every style updates as you type.",
      art: "writing",
    },
    {
      title: "Pick a style",
      text: "Scroll the list of 11 styles, from Bold and Italic to Double-struck, Circled and Small caps, and find one that is still easy to read.",
      art: "feat-linkbio",
    },
    {
      title: "Copy and paste it",
      text: "Press Copy next to the style and paste it into the Name or Bio field of your Instagram profile, or into a caption.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Styled text that pastes anywhere",
  features: [
    {
      title: "11 styles side by side",
      text: "See every style at once instead of switching between previews, so comparing bold, script and monospace takes seconds.",
      art: "writing",
    },
    {
      title: "Real Unicode, not an image",
      text: "The styles are Unicode characters, so they paste as text into a bio, caption or comment on most devices.",
      art: "feat-linkbio",
    },
    {
      title: "Private and instant",
      text: "Conversion happens in your browser with a fixed character map. Nothing you type is uploaded or stored.",
      art: "analytics",
    },
  ],
  guide: {
    title: "Instagram fonts: how they work and when to use them",
    intro:
      "Instagram has no font menu for bios or captions. The \"fonts\" you see on profiles are Unicode characters that look like styled letters. Here is how this generator makes them and how to use them without hurting readability.",
    sections: [
      {
        title: "What this font generator does",
        body: (
          <>
            <p>
              Unicode includes alphabets such as Mathematical Bold, Script and Double-struck, plus fullwidth, circled and
              small capital letters. The generator swaps each letter A to Z and a to z in your text for the matching
              character in the style you pick.
            </p>
            <ul>
              <li>Spaces, punctuation, emoji and accented letters are left as they are.</li>
              <li>
                Numbers change in Bold, Double-struck, Monospace, Sans bold and Fullwidth; the other styles keep plain
                digits.
              </li>
              <li>Copy copies exactly the styled line you see.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Example: one line in every style",
        body: (
          <>
            <p>
              Typing <code>{SAMPLE}</code> gives:
            </p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th scope="col">Style</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {FONT_STYLES.map((style) => (
                    <tr key={style.id}>
                      <th scope="row">{style.label}</th>
                      <td>{style.map(SAMPLE)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Notice that &ldquo;&amp;&rdquo; never changes and that only some styles restyle the numbers.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for Instagram fonts in 2026",
        body: (
          <ul>
            <li>
              <b>Style a few words, not everything.</b> A styled name or headline stands out; a fully styled bio is hard
              to read.
            </li>
            <li>
              <b>Keep keywords in plain text.</b> Search may not match styled characters to normal words, so write your
              niche, city or service in plain letters.
            </li>
            <li>
              <b>Think about screen readers.</b> Some read styled letters one by one or by their Unicode names, which
              makes the line hard to follow.
            </li>
            <li>
              <b>Check the bio length.</b> Instagram bios allow 150 characters and styled letters may count as more than
              one, so check the counter in the app. The <Link href="/tools/instagram-bio-generator">bio generator</Link>{" "}
              helps you plan the rest of the bio.
            </li>
            <li>
              <b>Test on another phone.</b> Rare styles can show as empty boxes on older devices.
            </li>
          </ul>
        ),
      },
      {
        title: "Common font mistakes",
        body: (
          <ul>
            <li>Trying to use styled letters in a username: usernames only accept letters, numbers, periods and underscores.</li>
            <li>Writing a whole caption in script or circled letters.</li>
            <li>
              Styling hashtags, which then no longer match the plain tag. Check tags with the{" "}
              <Link href="/tools/instagram-caption-counter">caption counter</Link>.
            </li>
            <li>Styling a call to action keyword such as GUIDE that people need to type back in a comment.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram font generator questions",
  faqs: [
    {
      q: "How does the Instagram font generator work?",
      a: "It replaces each letter of your text with a matching Unicode character from a styled alphabet, such as Mathematical Bold or Script. The result is plain text you can copy and paste, so no font needs to be installed.",
    },
    {
      q: "Do these fonts work in bios, captions and usernames?",
      a: "You can paste these Unicode styles into your Instagram name, bio and captions. They do not work in usernames, which only allow letters, numbers, periods and underscores.",
    },
    {
      q: "Are these fonts searchable and accessible?",
      a: "Not reliably. Styled characters may not match ordinary search terms, and screen readers may read them badly. Keep important keywords in plain text and use styles for a few words only.",
    },
    {
      q: "Do styled fonts count toward the 150-character bio limit?",
      a: "Yes. Styled characters count toward the limit, and some apps count each styled letter as more than one character. Check the counter in the Instagram app before saving.",
    },
    {
      q: "Why do some styles show as boxes?",
      a: "The device or app is missing a font for those Unicode characters. Bold, italic and fullwidth tend to be widely supported; test rarer styles on another phone before using them.",
    },
  ],
  related: [
    "/tools/instagram-bio-generator",
    "/tools/instagram-username-generator",
    "/tools/instagram-caption-formatter",
    "/tools/instagram-line-break-generator",
    "/tools/instagram-caption-counter",
  ],
  schema: {
    features: [
      "11 Unicode text styles",
      "Bold, italic, script, double-struck, monospace and more",
      "Live preview of every style",
      "One-click copy for bios and captions",
    ],
  },
  cta: {
    title: "Profile looking sharp?",
    mark: "Keep it posting.",
    text: "Schedule your Instagram posts with Poskoo and DM everyone who comments your keyword, on the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramFontGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <FontTool />
    </ToolPageTemplate>
  );
}
