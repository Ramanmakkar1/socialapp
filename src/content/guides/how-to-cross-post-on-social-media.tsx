import Link from "next/link";
import { Callout, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Platform limits are taken from official docs (Mastodon, Instagram) and Poskoo's own counter tools.
// No invented reach numbers: tailoring advice is framed as practice, not a guaranteed result.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          To cross-post without looking lazy, share the same idea on every network but change the packaging for each
          one: the format and size, the first line, the length, the hashtags, the link and the call to action. One idea,
          five versions, scheduled from one place.
        </strong>
      </p>
      <p>
        Cross-posting gets a bad name because most people do it badly. They paste an Instagram caption with 20 hashtags
        into LinkedIn, or post a TikTok with the watermark still on it to Reels. Followers notice, and some platforms
        limit how far that content travels.
      </p>
      <p>
        Done well, cross-posting is the most efficient thing a small team can do. This guide covers what to change on
        each network, walks one idea through five versions, and gives you a checklist to run before you hit schedule.
      </p>
    </>
  ),
  sections: [
    {
      id: "cross-posting-vs-repurposing",
      title: "Cross-posting vs repurposing: what's the difference?",
      body: (
        <>
          <p>
            <strong>Cross-posting</strong> means publishing the same piece of content on several networks at about the
            same time, with small edits for each one. A Reel that also goes out as a YouTube Short and a Facebook Reel is
            cross-posted.
          </p>
          <p>
            <strong>Repurposing</strong> means turning one piece into a different format. A blog post that becomes a
            carousel, a thread and a short video is repurposed. It takes more work, and it often travels further because
            each version is native to its network.
          </p>
          <p>
            Most good social calendars use both. Cross-post the things that already fit several networks, and repurpose
            your best ideas into new formats once they have proved themselves.
          </p>
          <Callout kind="tip" title="The lazy test">
            <p>
              Before you cross-post, ask: would a follower who sees this on two networks feel it was made for each of
              them? If the answer is no, you need more than a copy and paste.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "what-to-tailor",
      title: "What to tailor on each network",
      body: (
        <>
          <p>
            You do not need to rewrite everything. Eight things make the difference between a post that looks native and
            one that looks pasted in.
          </p>
          <ul>
            <li><strong>Format and aspect ratio:</strong> vertical video, square image, landscape link card.</li>
            <li><strong>Length:</strong> each network has a different limit and a different sweet spot.</li>
            <li><strong>First line:</strong> the only part most people read before they decide.</li>
            <li><strong>Hashtags:</strong> <Link href="/tools/instagram-hashtag-generator">a few on Instagram</Link>, almost none on LinkedIn, CamelCase on Mastodon.</li>
            <li><strong>Links:</strong> clickable in some captions, dead text in others.</li>
            <li><strong>Mentions and tags:</strong> handles differ across networks, so check every @.</li>
            <li><strong>Tone:</strong> casual on Threads, professional on LinkedIn, direct on Bluesky.</li>
            <li><strong>Call to action:</strong> comment, save, click, reply, follow. Pick the one the network supports.</li>
          </ul>
          <GuideTable
            caption="What to change per network"
            head={["Network", "Format", "Length and text", "Hashtags and links"]}
            rows={[
              ["Instagram", "Vertical Reel 9:16, or 4:5 carousel", "Hook in the first line; up to 2,200 characters", "A few specific hashtags; links in captions are not clickable, so point to your bio or a comment keyword"],
              ["Facebook Pages", "Reel, photo or link post", "Shorter, conversational captions", "Links are clickable; hashtags optional"],
              ["Threads", "Text first, image or video optional", "Up to 500 characters, up to 5 links", "One topic tag is enough"],
              ["Bluesky", "Text with up to 4 images or a link card", "Up to 300 characters", "Links get a card; hashtags are optional"],
              ["LinkedIn profile", "Text with an image", "Lead with a clear point; short paragraphs", "Two or three hashtags at most; links work"],
              ["YouTube Shorts", "Vertical video 9:16", "Short title that says what the video is", "Hashtags in the title or description"],
              ["Mastodon", "Text with media and alt text", "500 characters by default; every link counts as 23", "Hashtags are how people find you; use CamelCase"],
            ]}
          />
          <p>
            For exact image and video sizes on each network, keep the{" "}
            <Link href="/tools/social-media-image-sizes">social media image size guide</Link> open while you export.
            Mastodon&apos;s limits come from its{" "}
            <Ext href="https://docs.joinmastodon.org/user/posting/">official posting docs</Ext>.
          </p>
          <Callout kind="warning" title="TikTok, X and Pinterest">
            <p>
              The same tailoring applies to TikTok, X and Pinterest. In Poskoo, publishing to those three is waiting on
              platform approval, so for now post there natively and use Poskoo for the networks above.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "worked-example",
      title: "One idea, five versions: a worked example",
      body: (
        <>
          <p>
            Say you run a small houseplant shop and you filmed a 40-second video showing how to tell if a plant needs
            water: push a finger into the soil, check the weight of the pot, look at the leaves. Here is how that one
            idea becomes five native posts.
          </p>
          <Callout kind="example" title="Instagram Reel caption">
            <p>
              Stop watering on a schedule. Do this instead 👇
            </p>
            <p>
              1. Finger test: dry 2 knuckles down? Water.
              <br />
              2. Lift the pot: light means thirsty.
              <br />
              3. Leaves: soft and droopy, not crispy.
            </p>
            <p>
              Save this for your next plant check. Comment WATER and I&apos;ll send you our free care chart.
            </p>
          </Callout>
          <Callout kind="example" title="Threads post">
            <p>
              Unpopular opinion: watering every Sunday is how most houseplants die. Check the soil with your finger
              instead. Two knuckles dry? Water. Still damp? Walk away. What&apos;s the plant you keep overwatering?
            </p>
          </Callout>
          <Callout kind="example" title="Bluesky post">
            <p>
              Most overwatered plants were on a schedule. The better check takes 10 seconds: finger in the soil to the
              second knuckle, then lift the pot. Dry and light means water. We made a one-page chart: [link]
            </p>
          </Callout>
          <Callout kind="example" title="LinkedIn profile post">
            <p>
              The most common question in our shop isn&apos;t which plant to buy. It&apos;s why a plant died.
            </p>
            <p>
              Nine times out of ten, the answer is a watering schedule. So we stopped selling schedules and started
              teaching a 10-second check instead. Returns on plant care issues went down, and customers came back for a
              second plant.
            </p>
            <p>The lesson for any small business: teach the habit, not the rule.</p>
          </Callout>
          <Callout kind="example" title="YouTube Shorts title and description">
            <p>
              <strong>Title:</strong> How to tell if your plant needs water (10-second check)
            </p>
            <p>
              <strong>Description:</strong> Finger test, pot weight, leaf check. Free care chart linked in our channel.
              #houseplants #plantcare
            </p>
          </Callout>
          <p>
            Notice what stayed the same: the idea and the three checks. Everything around them changed. The Instagram
            version asks for a save and a comment keyword. Threads asks a question. Bluesky leads with the link. LinkedIn
            turns it into a business lesson. YouTube gets a searchable title.
          </p>
          <p>
            If you are stuck on a version, the{" "}
            <Link href="/tools/social-media-post-generator">social media post generator</Link> gives you a starting
            draft per network, and the{" "}
            <Link href="/tools/instagram-line-break-generator">Instagram line break generator</Link> keeps your line breaks
            when you paste.
          </p>
        </>
      ),
    },
    {
      id: "watermarks",
      title: "Watermarks and originality: why clean files matter",
      body: (
        <>
          <p>
            If you film on one app and download the video to post somewhere else, it usually carries that app&apos;s
            watermark. Upload the original file instead.
          </p>
          <p>
            Instagram is explicit about this. Its{" "}
            <Ext href="https://creators.instagram.com/recommendations-and-Originality">
              guidance on recommendations and originality
            </Ext>{" "}
            lists &quot;no visible watermarks&quot; as one of the conditions for content to be eligible for
            recommendation, alongside being original. It also says accounts that mostly repost other people&apos;s
            content without adding to it can become ineligible for recommendations.
          </p>
          <ul>
            <li>Export the master file from your editor before you add any app-specific text or stickers.</li>
            <li>Keep captions and on-screen text in your editor, not burned in by another app.</li>
            <li>Name files by idea and version, such as plant-water-check-vertical.mp4, so you upload the right one.</li>
          </ul>
        </>
      ),
    },
    {
      id: "timing",
      title: "Should you post everywhere at the same time?",
      body: (
        <>
          <p>
            Not necessarily. Each audience is online at different times, and posting everywhere in the same minute
            makes it hard to reply to everyone while the posts are fresh.
          </p>
          <ul>
            <li>Stagger the networks by an hour or two so you can answer the first wave of replies on each.</li>
            <li>Post where your biggest audience is first, then the rest.</li>
            <li>Leave a day between near-identical versions if the same people follow you in two places.</li>
          </ul>
          <p>
            If you only post to Instagram, its app can schedule posts and Reels for professional accounts, up to 75
            days ahead, according to the{" "}
            <Ext href="https://help.instagram.com/iphone-app/439971288310029">Instagram Help Center</Ext>. For several
            networks at once, a scheduler that holds every version in one calendar saves the most time.
          </p>
          <h3>A simple weekly routine</h3>
          <p>
            Cross-posting works best as a habit, not a scramble. One routine that fits a small team:
          </p>
          <ol>
            <li><strong>Monday:</strong> pick three ideas for the week and decide which networks each one suits.</li>
            <li><strong>Tuesday:</strong> film or design the master versions, exported clean and in the right sizes.</li>
            <li><strong>Wednesday:</strong> write the main caption for each idea, then the per-network versions.</li>
            <li><strong>Thursday:</strong> schedule everything, staggered by network.</li>
            <li><strong>Every day:</strong> fifteen minutes of replies on each network where a post went out.</li>
          </ol>
          <p>
            Batching the writing in one sitting is what keeps the versions consistent. When you write five versions of
            the same idea back to back, you can see where one is weaker and fix it before anything goes live.
          </p>
          <p>
            To find your own best slots per network, follow the method in{" "}
            <Link href="/guides/how-to-find-your-best-time-to-post">how to find your best time to post</Link>: start
            with a few test slots, then keep the ones your analytics back up.
          </p>
        </>
      ),
    },
    {
      id: "what-not-to-cross-post",
      title: "What not to cross-post (and common mistakes)",
      body: (
        <>
          <p>
            Some content belongs on one network only. Copying it elsewhere tends to confuse people or make the account
            look automated.
          </p>
          <h3>Keep these native</h3>
          <ul>
            <li>
              <strong>Replies and conversations.</strong> A reply to someone on Threads makes no sense as a standalone
              LinkedIn post.
            </li>
            <li>
              <strong>Trend formats.</strong> A Reel built on a trending sound or a platform-specific meme rarely
              translates. Make a new version or skip it.
            </li>
            <li>
              <strong>Platform features.</strong> Polls, Story stickers, Instagram comment keywords and Bluesky link
              cards only work where they were made.
            </li>
            <li>
              <strong>Time-sensitive replies to news.</strong> By the time a second version goes out, the moment may have
              passed.
            </li>
          </ul>
          <h3>Mistakes that give cross-posting away</h3>
          <ul>
            <li>
              <strong>&quot;Link in bio&quot; on a network with clickable links.</strong> On Facebook, LinkedIn, Bluesky
              and Threads, just add the link.
            </li>
            <li>
              <strong>Broken mentions.</strong> @yourpartner on Instagram may be someone else entirely on Bluesky, or
              nobody at all on LinkedIn.
            </li>
            <li>
              <strong>Hashtag walls.</strong> Twenty tags look normal to some Instagram audiences and spammy almost
              everywhere else.
            </li>
            <li>
              <strong>Cropped video.</strong> A 9:16 video squeezed into a square feed slot loses captions and faces at
              the edges. Check the safe zones before you export.
            </li>
            <li>
              <strong>Calls to action that don&apos;t exist.</strong> &quot;Double tap if you agree&quot; means nothing
              on LinkedIn, and &quot;Comment GUIDE&quot; only works where you have a comment-to-DM rule running.
            </li>
          </ul>
          <Callout kind="tip" title="One account, one voice">
            <p>
              Tailoring is about format and tone, not personality. Your opinions, your examples and your way of
              explaining things should be recognisable on every network. Only the packaging changes.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "checklist",
      title: "A cross-posting checklist",
      body: (
        <>
          <p>Run through this before you schedule any cross-posted piece.</p>
          <GuideTable
            caption="Pre-publish checklist"
            head={["Check", "What to look for"]}
            rows={[
              ["Format", "Right aspect ratio for each network; no black bars"],
              ["File", "Clean original, no other app's watermark"],
              ["First line", "Rewritten for each network's audience"],
              ["Length", "Under each limit, without cutting the point"],
              ["Hashtags", "Right number and style per network"],
              ["Links", "Clickable where possible; a clear path where not"],
              ["Mentions", "Each @handle checked on that network"],
              ["Call to action", "One ask per post, matched to the network"],
              ["Alt text", "Added for images, especially on Mastodon and Bluesky"],
              ["Timing", "Staggered so you can reply on each"],
            ]}
          />
        </>
      ),
    },
    {
      id: "in-poskoo",
      title: "How to cross-post with Poskoo",
      body: (
        <>
          <p>
            <Link href="/social-media-scheduler">Poskoo&apos;s social media scheduler</Link> is built for this workflow.
            Today it publishes to Instagram, Facebook Pages, Threads, YouTube, LinkedIn profiles, Bluesky and Mastodon.
          </p>
          <ol>
            <li>Write your main caption once and add your media.</li>
            <li>Tick the networks you want to post to.</li>
            <li>
              Open each network&apos;s tab and tick <em>Customize</em> to write that network&apos;s own version. The
              composer checks each version against that network&apos;s character limit.
            </li>
            <li>Pick a time and schedule. The post shows on your calendar with a status for each network.</li>
          </ol>
          <p>
            There is also a &quot;Tailor per network&quot; button for AI rewrites, but Poskoo&apos;s built-in AI is not
            switched on yet, so for now you edit each version by hand. The worked example above shows how little that
            takes once you know what to change.
          </p>
          <p>
            Choosing where to put your effort? Our comparison of{" "}
            <Link href="/guides/threads-vs-bluesky-for-brands">Threads vs Bluesky for brands</Link> covers two of the
            networks where tailoring matters most.
          </p>
          <InlineCta
            title="Write once, tailor per network, schedule everywhere"
            text="Start on the Free plan with 2 social accounts and 10 scheduled posts a month. No credit card."
            tool={{ href: "/tools/social-media-image-sizes", label: "Check image sizes" }}
          />
        </>
      ),
    },
  ],
  sources: [
    {
      label: "Instagram: Helping creators find new audiences (recommendations and originality)",
      href: "https://creators.instagram.com/recommendations-and-Originality",
    },
    { label: "Mastodon documentation: Posting", href: "https://docs.joinmastodon.org/user/posting/" },
    {
      label: "Instagram Help Center: Create and manage scheduled posts and Reels",
      href: "https://help.instagram.com/iphone-app/439971288310029",
    },
  ],
};
