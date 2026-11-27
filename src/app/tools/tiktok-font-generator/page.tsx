import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { FONT_STYLES } from "@/lib/igFonts";
import FontTool from "../instagram-font-generator/FontTool";

const SAMPLE = "Coffee & Co 24";

const config: ToolPageConfig = {
  path: "/tools/tiktok-font-generator",
  name: "TikTok font generator",
  crumb: "Font generator",
  title: "TikTok Font Generator: Copy and Paste Fancy Fonts Free",
  description:
    "Free TikTok font generator: type your text and copy bold, italic, script and other Unicode fonts for your TikTok bio, name and captions. Fits 80 chars.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "TikTok font generator:", mark: "copy and paste", after: "fancy fonts" },
  lede: "Type your text once and see it in 11 Unicode styles, from bold and italic to script and small caps. Copy the one you like into your TikTok bio, name or caption.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of styled letters and emoji",
  heroPoints: ["11 font styles", "Copy with one click", "80-character bio check"],
  toolTitle: "Style your text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok font generator",
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
      text: "Press Copy next to the style and paste it into the Name or Bio field of your TikTok profile, or into a caption.",
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
      text: "The styles are Unicode characters, so they paste as text into a bio, name or caption on most devices.",
      art: "feat-linkbio",
    },
    {
      title: "Private and instant",
      text: "Conversion happens in your browser with a fixed character map. Nothing you type is uploaded or stored.",
      art: "analytics",
    },
  ],
  guide: {
    title: "TikTok fonts: how they work and when to use them",
    intro:
      "TikTok has no font menu for names, bios or captions. The \"fonts\" you see on profiles are Unicode characters that look like styled letters. Here is how this generator makes them and how to use them without hurting readability.",
    sections: [
      {
        title: "Do fancy fonts work on TikTok?",
        body: (
          <>
            <p>
              Yes. The styles are Unicode characters, not a font you install, so they paste into your TikTok bio, name
              and captions on most devices. TikTok treats them as ordinary text.
            </p>
            <ul>
              <li>Some screen readers read styled letters one by one, so keep important words in plain text.</li>
              <li>Styled characters may not show up in TikTok search, so keep keywords in plain letters.</li>
              <li>Rare styles can show as empty boxes on older phones, so test before you save.</li>
            </ul>
          </>
        ),
      },
      {
        title: "How long can a TikTok bio be?",
        body: (
          <>
            <p>
              A TikTok bio can be up to 80 characters. Emojis, spaces and line breaks all count toward that limit, and
              some styled letters count as more than one character. The counter above checks your styled text against
              the 80-character limit.
            </p>
            <p>
              Need help writing the rest of the bio? Try the{" "}
              <Link href="/tools/tiktok-bio-generator">TikTok bio generator</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Where can I use TikTok fonts?",
        body: (
          <>
            <p>You can paste styled text into:</p>
            <ul>
              <li>Your TikTok display name and bio.</li>
              <li><Link href="/tools/tiktok-caption-generator">Video captions</Link> and comments.</li>
              <li>Direct messages and profile text.</li>
            </ul>
            <p>
              Usernames are the exception: TikTok handles only allow letters, numbers, periods and underscores, so
              styled letters do not work there. Use the{" "}
              <Link href="/tools/tiktok-username-generator">TikTok username generator</Link> for a plain handle.
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
  faqTitle: "TikTok font generator questions",
  faqs: [
    {
      q: "How does the TikTok font generator work?",
      a: "It replaces each letter of your text with a matching Unicode character from a styled alphabet, such as Mathematical Bold or Script. The result is plain text you can copy and paste, so no font needs to be installed.",
    },
    {
      q: "Do these fonts work in TikTok bios, names and captions?",
      a: "You can paste these Unicode styles into your TikTok name, bio and captions. They do not work in usernames, which only allow letters, numbers, periods and underscores.",
    },
    {
      q: "Are these fonts searchable and accessible?",
      a: "Not reliably. Styled characters may not match ordinary search terms, and screen readers may read them badly. Keep important keywords in plain text and use styles for a few words only.",
    },
    {
      q: "Do styled fonts count toward the 80-character bio limit?",
      a: "Yes. Styled characters count toward the limit, and some apps count each styled letter as more than one character. Check the counter in the TikTok app before saving.",
    },
    {
      q: "Why do some styles show as boxes?",
      a: "The device or app is missing a font for those Unicode characters. Bold, italic and fullwidth tend to be widely supported; test rarer styles on another phone before using them.",
    },
  ],
  related: [
    "/tools/tiktok-bio-generator",
    "/tools/tiktok-username-generator",
    "/tools/tiktok-caption-generator",
    "/tools/instagram-font-generator",
  ],
  schema: {
    features: [
      "11 Unicode text styles",
      "Bold, italic, script, double-struck, monospace and more",
      "Live preview of every style",
      "80-character TikTok bio check",
      "One-click copy for bios, names and captions",
    ],
  },
  cta: {
    title: "Profile looking sharp?",
    mark: "Keep it posting.",
    text: "Schedule your TikTok videos with Poskoo and keep your profile active, on TikTok's official API.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokFontGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <FontTool platform="TikTok" bioLimit={80} />
    </ToolPageTemplate>
  );
}
