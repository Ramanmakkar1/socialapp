import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { FONT_STYLES } from "@/lib/igFonts";
import FontTool from "../instagram-font-generator/FontTool";

const SAMPLE = "Coffee & Co 24";

const config: ToolPageConfig = {
  path: "/tools/x-font-generator",
  name: "X font generator",
  crumb: "Font generator",
  title: "X (Twitter) Font Generator: Bold & Italic Text Free",
  description:
    "Free X (Twitter) font generator: turn text into bold, italic, script and other Unicode styles, then copy and paste into posts, your bio or display name.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "X (Twitter) font generator:", mark: "copy and paste", after: "bold and italic text" },
  lede: "X does not let you change fonts, but you can paste Unicode bold, italic, script and other styled letters into posts, your bio (160 characters) and your display name; type below and copy.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of styled letters and emoji",
  heroPoints: ["11 font styles", "Copy with one click", "160-character bio check"],
  toolTitle: "Style your text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the X font generator",
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
      text: "Press Copy next to the style and paste it into a post, your X bio or your display name.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Styled text that pastes anywhere on X",
  features: [
    {
      title: "11 styles side by side",
      text: "See every style at once instead of switching between previews, so comparing bold, script and monospace takes seconds.",
      art: "writing",
    },
    {
      title: "Real Unicode, not an image",
      text: "The styles are Unicode characters, so they paste as text into a post, bio or display name on most devices.",
      art: "feat-linkbio",
    },
    {
      title: "Private and instant",
      text: "Conversion happens in your browser with a fixed character map. Nothing you type is uploaded or stored.",
      art: "analytics",
    },
  ],
  guide: {
    title: "X fonts: how they work and when to use them",
    intro:
      "X has no font menu for posts, bios or display names. The \"fonts\" you see on profiles are Unicode characters that look like styled letters. Here is how this generator makes them and how to use them without hurting readability.",
    sections: [
      {
        title: "What this X font generator does",
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
        title: "How long can an X bio be?",
        body: (
          <>
            <p>
              An X bio can be up to 160 characters. Emojis, spaces and line breaks all count toward that limit, and some
              styled letters count as more than one character. The counter above checks your styled text against the
              160-character limit.
            </p>
            <p>
              Need help writing the rest of the bio? Try the{" "}
              <Link href="/tools/x-bio-generator">X bio generator</Link>, and check post length with the{" "}
              <Link href="/tools/x-character-counter">X character counter</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Where can I use styled text on X?",
        body: (
          <>
            <p>You can paste styled text into:</p>
            <ul>
              <li>Posts and replies.</li>
              <li>Your X bio and display name.</li>
              <li>Direct messages and profile text.</li>
            </ul>
            <p>
              Usernames are the exception: X handles only allow letters, numbers and underscores, so styled letters do
              not work there.
            </p>
          </>
        ),
      },
      {
        title: "Accessibility: keep key words plain",
        body: (
          <>
            <p>
              Screen readers may read styled letters one by one or by their Unicode names, which makes a line hard to
              follow. Keep important words, names and calls to action in plain text, and use styles for a few words
              only.
            </p>
            <p>
              Styled characters may also not match ordinary search terms, so keep keywords in plain letters if you want
              your posts to be found.
            </p>
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
    ],
  },
  faqTitle: "X font generator questions",
  faqs: [
    {
      q: "How do I bold text on X?",
      a: "Type your text in the generator, choose the Bold style and press Copy, then paste it into your post, bio or display name. X has no bold button, so the bold look comes from Unicode characters rather than a font setting.",
    },
    {
      q: "Do fancy fonts count as more characters on X?",
      a: "Yes. Styled letters are still characters, and some count as more than one in the X counter. A post can be up to 280 characters and a bio up to 160, so check the counter in X before you publish.",
    },
    {
      q: "Are fancy fonts allowed on X?",
      a: "Yes. Styled Unicode text is ordinary text and is allowed in posts, bios and display names. It does not work in usernames, and X may limit or flag accounts that use styled text to impersonate or mislead.",
    },
    {
      q: "Are these fonts searchable and accessible?",
      a: "Not reliably. Styled characters may not match ordinary search terms, and screen readers may read them badly. Keep important keywords in plain text and use styles for a few words only.",
    },
    {
      q: "Why do some styles show as boxes?",
      a: "The device or app is missing a font for those Unicode characters. Bold, italic and fullwidth tend to be widely supported; test rarer styles on another phone before using them.",
    },
  ],
  related: [
    "/tools/x-character-counter",
    "/tools/x-bio-generator",
    "/tools/x-post-generator",
    "/tools/x-header-size-checker",
  ],
  schema: {
    features: [
      "11 Unicode text styles",
      "Bold, italic, script, double-struck, monospace and more",
      "Live preview of every style",
      "160-character X bio check",
      "One-click copy for posts, bios and display names",
    ],
  },
  cta: {
    title: "Profile looking sharp?",
    mark: "Keep it posting.",
    text: "Plan and schedule your X posts with Poskoo, on X's official API.",
  },
};

export const metadata = toolMetadata(config);

export default function XFontGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <FontTool platform="x" />
    </ToolPageTemplate>
  );
}
