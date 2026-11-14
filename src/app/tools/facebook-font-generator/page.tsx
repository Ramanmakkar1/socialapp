import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { FONT_STYLES } from "@/lib/igFonts";
import FontTool from "../instagram-font-generator/FontTool";

const SAMPLE = "Coffee & Co 24";

const config: ToolPageConfig = {
  path: "/tools/facebook-font-generator",
  name: "Facebook font generator",
  crumb: "Font generator",
  title: "Facebook Font Generator: Bold, Italic & Fancy Text",
  description:
    "Copy bold, italic and script Unicode text for Facebook posts, comments and your 101-character intro. Free, private and paste-ready in one click.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Facebook font generator:", mark: "copy and paste", after: "bold and italic text" },
  lede: "Facebook has no font menu, but you can copy Unicode bold, italic and script letters into posts, comments and your 101-character profile intro; type below and copy a style.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of styled letters and emoji",
  heroPoints: ["11 font styles", "Copy with one click", "101-character intro check"],
  toolTitle: "Style your text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Facebook font generator",
  steps: [
    {
      title: "Type your text",
      text: "Replace \"Your bio here\" in Your text with a headline, a name or a short line. Every style updates as you type.",
      art: "writing",
    },
    {
      title: "Pick a style",
      text: "Scroll the list of 11 styles, from Bold and Italic to Double-struck, Circled and Small caps, and find one that is still easy to read.",
      art: "feat-linkbio",
    },
    {
      title: "Copy and paste it",
      text: "Press Copy next to the style and paste it into a Facebook post, a comment or your profile intro.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Styled text that pastes anywhere on Facebook",
  features: [
    {
      title: "11 styles side by side",
      text: "See every style at once instead of switching between previews, so comparing bold, script and monospace takes seconds.",
      art: "writing",
    },
    {
      title: "Real Unicode, not an image",
      text: "The styles are Unicode characters, so they paste as text into a post, comment or your intro on most devices.",
      art: "feat-linkbio",
    },
    {
      title: "Private and instant",
      text: "Conversion happens in your browser with a fixed character map. Nothing you type is uploaded or stored.",
      art: "analytics",
    },
  ],
  guide: {
    title: "Facebook fonts: how they work and when to use them",
    intro:
      "Facebook has no font menu for posts, comments or your profile intro. The \"fonts\" you see in profiles and comments are Unicode characters that look like styled letters. Here is how this generator makes them and how to use them without hurting readability.",
    sections: [
      {
        title: "What this Facebook font generator does",
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
        title: "How long can a Facebook intro be?",
        body: (
          <>
            <p>
              Facebook profile intros are short: this tool checks your styled text against a 101-character limit, so you
              can see whether the line fits before you paste it. Posts can be much longer, while comments have their own
              limit.
            </p>
            <p>
              Need help writing the rest of the post? Try the{" "}
              <Link href="/tools/facebook-character-counter">Facebook character counter</Link>, and add relevant tags
              with the <Link href="/tools/facebook-hashtag-generator">Facebook hashtag generator</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Where can I use styled text on Facebook?",
        body: (
          <>
            <p>You can paste styled text into:</p>
            <ul>
              <li>Posts and comments on Pages and personal profiles.</li>
              <li>Your profile intro and short bio lines.</li>
              <li>Messages and group posts.</li>
            </ul>
            <p>
              Usernames are the exception: Facebook handles only allow letters, numbers and periods, so styled letters do
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
            <p>Notice that &ldquo;&amp;&rdquo; never changes and that only some styles restyle the numbers.</p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Facebook font generator questions",
  faqs: [
    {
      q: "How do I write bold text on Facebook?",
      a: "Type your text in the generator, choose the Bold style and press Copy, then paste it into your post, comment or intro. Facebook has no bold button, so the bold look comes from Unicode characters rather than a font setting.",
    },
    {
      q: "Does styled text work on Facebook Pages?",
      a: "Yes. The same Unicode characters paste into Page posts and comments, and into your personal profile intro. Use them sparingly on Pages so captions stay easy to read and searchable.",
    },
    {
      q: "Will fancy fonts hurt my reach or accessibility?",
      a: "Styled letters can reduce reach because search and screen readers may not match them to ordinary words. Keep keywords and hashtags in plain text, use styles for a few decorative words, and never set a whole caption in script or symbols.",
    },
    {
      q: "Do fancy fonts count as more characters on Facebook?",
      a: "Yes. Styled letters are still characters, and some count as more than one. Check your intro with this tool's 101-character counter and longer text with the Facebook character counter before you publish.",
    },
    {
      q: "Why do some styles show as boxes?",
      a: "The device or app is missing a font for those Unicode characters. Bold, italic and fullwidth tend to be widely supported; test rarer styles on another phone before using them.",
    },
  ],
  related: [
    "/tools/facebook-character-counter",
    "/tools/facebook-hashtag-generator",
    "/tools/facebook-post-preview",
    "/tools/facebook-bio-generator",
  ],
  schema: {
    features: [
      "11 Unicode text styles",
      "Bold, italic, script, double-struck, monospace and more",
      "Live preview of every style",
      "101-character Facebook intro check",
      "One-click copy for posts, comments and intros",
    ],
  },
  cta: {
    title: "Intro looking sharp?",
    mark: "Keep it posting.",
    text: "Plan and schedule your Facebook Page posts with Poskoo, on Meta's official API.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookFontGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <FontTool platform="facebook" />
    </ToolPageTemplate>
  );
}
