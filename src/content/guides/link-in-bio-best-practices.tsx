import Link from "next/link";
import { Callout, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Practical guidance only. The one dated platform fact (Instagram's five bio links, April 2023)
// is linked to news coverage of the announcement in the sources list.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          A good link in bio does one job: it sends people who liked a post to the next step you want them to take. Put
          one main action at the top, keep the list to three to five links, write labels that say what people get, and
          change the top link whenever your latest post points somewhere new.
        </strong>
      </p>
      <p>
        Most link-in-bio pages fail for the same reason: they try to list everything. A visitor arrives from a Reel about
        one thing, finds twelve buttons about other things, and leaves. This guide covers what to put on the page, in
        what order, how to word each link, how to track clicks, and how to point people to it without sounding like an
        ad.
      </p>
      <p>
        It works whether you use Instagram&apos;s own bio links or a separate link-in-bio page. You&apos;ll find ready
        examples for a creator, a local business and a coach further down.
      </p>
    </>
  ),
  sections: [
    {
      id: "native-links-vs-page",
      title: "Instagram's own bio links or a link-in-bio page?",
      body: (
        <>
          <p>
            Since April 2023, Instagram lets you add up to five links to your profile. Mark Zuckerberg announced it on
            his broadcast channel, and{" "}
            <Ext href="https://techcrunch.com/2023/04/18/instagram-takes-on-linktree-and-others-with-support-for-up-to-5-links-in-bio/">
              TechCrunch covered the launch
            </Ext>{" "}
            the same day. You add them under Edit profile, then Links.
          </p>
          <p>
            The catch is how they show. Only the first link appears in your bio. The rest sit behind a small
            &quot;and more&quot; tap that opens a pop-up list. So in practice, one link gets seen and the other four
            mostly don&apos;t.
          </p>
          <h3>When native links are enough</h3>
          <ul>
            <li>You have one main destination, such as a booking page or a shop.</li>
            <li>You don&apos;t need to know which link gets clicked.</li>
            <li>You rarely change what you promote.</li>
          </ul>
          <h3>When a link-in-bio page makes more sense</h3>
          <ul>
            <li>You promote different things from different posts and need one stable link that you update.</li>
            <li>You want click counts per link, so you know what people actually want.</li>
            <li>You want the page to look like your brand, with a photo, a short line about you and your recent posts.</li>
            <li>You use the same link on several platforms, not just Instagram.</li>
          </ul>
          <p>
            Many accounts use both: the link-in-bio page as the first native link, and one or two direct links
            underneath for people who know exactly what they want.
          </p>
        </>
      ),
    },
    {
      id: "what-to-put-on-it",
      title: "What should go on your link-in-bio page?",
      body: (
        <>
          <p>
            Think of the page as a short menu, not a sitemap. Here is an order that works for most accounts:
          </p>
          <ol>
            <li>
              <strong>One primary action.</strong> The thing you most want a visitor to do this month: book a call,
              grab the free guide, shop the new drop. It goes first, and it should match what your recent posts talk
              about.
            </li>
            <li>
              <strong>The link from your latest post.</strong> If a Reel says &quot;link in bio&quot;, that link must be
              near the top. People who tap through from a post are looking for one specific thing.
            </li>
            <li>
              <strong>A way to stay in touch.</strong> A newsletter, a free resource or a waitlist, so visitors who
              aren&apos;t ready to buy can still say yes to something small.
            </li>
            <li>
              <strong>Your evergreen offer.</strong> The product, service or menu that is always available.
            </li>
            <li>
              <strong>One trust or contact link.</strong> Reviews, a portfolio, a location map or a contact form.
            </li>
          </ol>
          <p>
            That is five links. If you are tempted to add more, ask whether anyone has clicked the fifth one in the
            last month. If not, it is taking attention away from the ones that matter.
          </p>
          <Callout kind="tip" title="One page, one promise">
            <p>
              Your bio says who you help. Your link-in-bio page should continue that same sentence. If your bio says
              &quot;quick dinners for busy parents&quot;, the top link should be about quick dinners, not your podcast
              guest spot from last year.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "examples",
      title: "Link in bio ideas: three example pages",
      body: (
        <>
          <p>
            Here is what a focused page looks like for three common types of account. Each one keeps to five links or
            fewer, with the main action first.
          </p>
          <GuideTable
            caption="Example link-in-bio pages, top link first"
            head={["Account", "Link 1 (main action)", "Links 2-3", "Links 4-5"]}
            rows={[
              [
                "Food creator",
                "Get this week's 5 dinner recipes (free PDF)",
                "Recipe from today's Reel; my kitchen tools list",
                "Cookbook pre-order; work with me",
              ],
              [
                "Local bakery",
                "Order a custom cake",
                "This week's specials; opening hours and map",
                "Read our reviews; wholesale enquiries",
              ],
              [
                "Business coach",
                "Book a free 20-minute call",
                "Free pricing checklist; latest podcast episode",
                "Client results; 6-week programme details",
              ],
            ]}
          />
          <p>
            Notice what&apos;s missing: no links to every other social profile (people found you on one already), no
            &quot;my website&quot; with no reason to visit, and nothing that hasn&apos;t been clicked in months.
          </p>
          <p>
            The free resource in each example does double duty. It gives a visitor a low-effort yes, and it can collect
            an email so you can follow up. Our guide to{" "}
            <Link href="/guides/how-to-grow-email-list-from-instagram">growing an email list from Instagram</Link> covers
            how to build that freebie and where else to offer it.
          </p>
        </>
      ),
    },
    {
      id: "link-labels",
      title: "How to write link labels people actually click",
      body: (
        <>
          <p>
            A label is a tiny headline. It should tell the visitor what they get and, if possible, why now. Short
            beats clever. Most people read the first three or four words and decide.
          </p>
          <GuideTable
            caption="Weak vs strong link labels"
            head={["Weak label", "Stronger label", "Why it works"]}
            rows={[
              ["My website", "See prices and book online", "Says what happens on the other side."],
              ["Free stuff", "Free 7-day meal plan (PDF)", "Specific result and format."],
              ["Shop", "Shop the linen shirt from today's Reel", "Connects to the post they just watched."],
              ["Podcast", "Episode 42: pricing your first offer", "Gives a reason to choose this episode."],
              ["Contact", "Ask a question (reply in 24h)", "Sets an expectation and lowers the effort."],
            ]}
          />
          <h3>Quick rules for labels</h3>
          <ul>
            <li>Start with a verb: get, book, shop, read, watch, join.</li>
            <li>Name the format when it helps: PDF, checklist, 5-minute video, free call.</li>
            <li>Say &quot;free&quot; only if it really is free with no catch.</li>
            <li>Keep each label short enough to fit on one line on a phone.</li>
          </ul>
          <p>
            The same thinking applies to the bio text above your link. If you need a fresh angle, the{" "}
            <Link href="/tools/instagram-bio-generator">Instagram bio generator</Link> gives you several options to
            edit, including a call to action that points at the link.
          </p>
        </>
      ),
    },
    {
      id: "tracking",
      title: "How to track which links get clicked",
      body: (
        <>
          <p>
            You can&apos;t improve a page if you don&apos;t know what people tap. There are two layers of tracking, and
            they answer different questions.
          </p>
          <h3>Click counts: what do people want?</h3>
          <p>
            A link-in-bio tool that counts clicks per link tells you which offers pull and which are dead weight. Check
            it every couple of weeks. If a link gets almost nothing for a month, move it down or remove it.
          </p>
          <h3>UTM parameters: what happens after the click?</h3>
          <p>
            Click counts stop at the click. To see whether those visitors signed up or bought, add UTM parameters to the
            destination URL so your website analytics can tell where they came from. Google describes the standard
            parameters, such as <code>utm_source</code>, <code>utm_medium</code> and <code>utm_campaign</code>, in its{" "}
            <Ext href="https://support.google.com/analytics/answer/10917952">guide to campaign URLs</Ext>.
          </p>
          <p>A simple, consistent pattern for bio links:</p>
          <ul>
            <li><code>utm_source=instagram</code></li>
            <li><code>utm_medium=social</code></li>
            <li><code>utm_campaign=bio</code> (or the name of the offer, such as <code>spring-sale</code>)</li>
            <li><code>utm_content=link1</code> if you want to compare positions on the page</li>
          </ul>
          <p>
            The <Link href="/tools/instagram-utm-builder">Instagram UTM builder</Link> puts these together for you, so
            you don&apos;t mistype a parameter and split your data across two spellings.
          </p>
          <Callout kind="warning" title="Keep your naming boring">
            <p>
              Pick lowercase names and stick to them. &quot;Instagram&quot;, &quot;instagram&quot; and &quot;IG&quot;
              show up as three different sources in most analytics tools.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "keep-it-fresh",
      title: "Keep the page in step with your content",
      body: (
        <>
          <p>
            A link-in-bio page goes stale faster than any other page you own, because your posts change every week and
            the page usually doesn&apos;t. Build a small habit around it.
          </p>
          <ul>
            <li>
              <strong>When you post a &quot;link in bio&quot; Reel, update the page first.</strong> Put that link at
              the top on the day the post goes out. Nothing loses a visitor faster than tapping through and not finding
              the thing.
            </li>
            <li>
              <strong>Remove expired offers the day they end.</strong> A sold-out product or a past event makes the
              whole page look neglected.
            </li>
            <li>
              <strong>Review once a month.</strong> Check click counts, drop the weakest link and ask whether the main
              action still matches what you are posting about.
            </li>
            <li>
              <strong>Show recent work.</strong> If your tool can display your latest posts under the links, visitors
              see that the account is active without going back to Instagram.
            </li>
          </ul>
          <Callout kind="example" title="A weekly update in two minutes">
            <p>
              Monday: a bakery posts a Reel about its new sourdough. Before posting, the owner moves &quot;Order this
              week&apos;s sourdough&quot; to the top of the page and moves &quot;Custom cakes&quot; to second. On
              Sunday night the sourdough link comes down and the cake link goes back to first.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "point-people-to-it",
      title: "How to send people to your link without sounding salesy",
      body: (
        <>
          <p>
            &quot;Link in bio&quot; at the end of every caption turns into wallpaper. People stop seeing it. Give them
            a reason and a specific thing to look for instead.
          </p>
          <h3>In captions</h3>
          <p>
            Name the exact link: &quot;The full recipe is the first link in my bio, called &apos;5 dinners
            PDF&apos;.&quot; That tells people what to tap once they get there.
          </p>
          <h3>In Stories</h3>
          <p>
            Stories can carry their own link sticker, so you don&apos;t always need the bio. Use the sticker for the
            specific offer and mention the bio page as the place to find it later.
          </p>
          <h3>In DMs</h3>
          <p>
            The most direct route skips the bio altogether. Ask people to comment a keyword, then send the link straight
            to their DMs. They don&apos;t have to visit your profile, find the page and pick the right button. Our
            playbook on{" "}
            <Link href="/guides/instagram-comment-to-dm-automation-guide">comment-to-DM automation</Link> walks through
            setting this up, and it pairs well with a bio page: the DM handles the post&apos;s offer, the bio page
            handles everyone else.
          </p>
          <h3>In search</h3>
          <p>
            People also find you through search, both on Instagram and in Google. A clear name field and bio help the
            right people land on your profile in the first place, which is covered in our guide to{" "}
            <Link href="/guides/social-media-seo-2026">social media SEO</Link>.
          </p>
        </>
      ),
    },
    {
      id: "poskoo-link-in-bio",
      title: "Setting up a link-in-bio page in Poskoo",
      body: (
        <>
          <p>
            Poskoo includes a <Link href="/instagram-link-in-bio">link-in-bio page</Link> alongside its scheduler and
            auto-DM tools. Here is what it does today:
          </p>
          <ul>
            <li>One public page with your links. You add a label and a full https:// address for each, and reorder them whenever your top offer changes.</li>
            <li>An optional avatar and a short bio line, plus four colour themes: Sunrise, Mint, Lilac and Ink.</li>
            <li>Every link gets a tracked short link, and the Link in bio screen shows clicks per link and in total.</li>
            <li>Your latest published posts from Poskoo appear under the links.</li>
            <li>A Publish switch, so you can hide the page while you rework it.</li>
          </ul>
          <p>
            The Free plan includes 5 links, which is enough for the structure in this guide. The Pro plan raises that to
            20 links; Pro is launching soon, and you are never charged without choosing a plan. Step-by-step setup is in
            the <Link href="/help/instagram-link-in-bio-setup">link-in-bio help article</Link>, and if you are moving
            from another tool, see how it compares on the <Link href="/linktree-alternative">Linktree alternative</Link>{" "}
            page.
          </p>
          <InlineCta
            title="Build a link-in-bio page that tracks every click"
            text="Add your links, pick a theme and see which offer people actually tap. Free plan, no credit card."
            tool={{ href: "/instagram-link-in-bio", label: "See link in bio" }}
          />
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Common link-in-bio mistakes",
      body: (
        <>
          <ul>
            <li>
              <strong>Too many links.</strong> Ten equal buttons means no main action. Cut to five and put the one that
              matters first.
            </li>
            <li>
              <strong>The post&apos;s link is missing or buried.</strong> If a caption says &quot;link in bio&quot;, the
              link should be in the top two.
            </li>
            <li>
              <strong>Vague labels.</strong> &quot;Click here&quot; and &quot;Website&quot; give no reason to tap.
            </li>
            <li>
              <strong>Broken or expired links.</strong> Tap every link on your phone once a month. Sold-out products and
              past events go.
            </li>
            <li>
              <strong>Sending people to a slow desktop page.</strong> Almost every visitor arrives on a phone. Check
              that each destination loads quickly and is readable on a small screen.
            </li>
            <li>
              <strong>No way to follow up.</strong> If nobody can leave an email or start a conversation, every visitor
              who isn&apos;t ready today is gone for good.
            </li>
            <li>
              <strong>Never checking clicks.</strong> The page should change based on what people tap, not on what you
              guessed they wanted.
            </li>
          </ul>
          <p>
            Fix these and a link-in-bio page becomes a small, steady source of sign-ups and sales, instead of a list
            you set up once and forgot.
          </p>
        </>
      ),
    },
  ],
  sources: [
    {
      label: "TechCrunch: Instagram takes on Linktree with support for up to 5 links in bio (April 18, 2023)",
      href: "https://techcrunch.com/2023/04/18/instagram-takes-on-linktree-and-others-with-support-for-up-to-5-links-in-bio/",
    },
    {
      label: "Search Engine Land: Instagram now allows up to 5 links in bio",
      href: "https://searchengineland.com/instagram-now-allows-up-to-5-links-in-bio-395742",
    },
    {
      label: "Google Analytics Help: URL builders, collect campaign data with custom URLs",
      href: "https://support.google.com/analytics/answer/10917952",
    },
  ],
};
