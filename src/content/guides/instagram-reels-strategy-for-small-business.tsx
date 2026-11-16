import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// General guidance only. Platform facts are linked to Instagram's own pages or named news coverage;
// everything else is described as what tends to work, to be checked against your own Insights.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          A Reels strategy for a small business comes down to this: post two or three original Reels a week that show
          your work, answer a customer question or teach one small thing, open each one with a clear hook in the first
          second, end with one simple next step, and judge them by reach to non-followers, shares and saves rather than
          likes.
        </strong>
      </p>
      <p>
        You don&apos;t need a studio, a big budget or trending dances. You need a phone, a short list of formats you
        can repeat, and a weekly routine that fits around running the business. This guide gives you all three, with
        examples for a bakery, a salon, a plumber and an online shop, plus a way to turn people who watch your Reels
        into DMs and bookings.
      </p>
    </>
  ),
  sections: [
    {
      id: "why-reels",
      title: "Why should a small business post Reels?",
      body: (
        <>
          <p>
            Most of your feed posts are seen by people who already follow you. Reels are the format Instagram is most
            likely to show to people who don&apos;t. For a local café or a small online shop, that is the cheapest way to
            reach new customers without paying for ads.
          </p>
          <h3>Original content gets the recommendations</h3>
          <p>
            In April 2024 Instagram{" "}
            <Ext href="https://creators.instagram.com/recommendations-and-Originality">explained how it handles
            originality</Ext>: when it finds identical copies of a piece of content, it recommends the original;
            accounts that mostly repost other people&apos;s content become ineligible for recommendations; and content
            with visible watermarks is not eligible. It also said eligible Reels are first shown to a small audience,
            whether or not they follow you, and the ones that do well are shown to more people.
          </p>
          <p>
            That is good news for small businesses. You have something aggregator accounts don&apos;t: a real shop,
            real customers and real work to film. A shaky 20-second clip of your baker shaping croissants at 5 a.m. is
            original. A reposted meme with your logo on it is not.
          </p>
          <Callout kind="warning" title="Don't repost with another app's watermark">
            <p>
              If you film in another app and download the video with its logo in the corner, re-export the clean file
              before posting it to Instagram. Watermarked videos are not eligible for recommendations.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "formats",
      title: "8 Reel formats that work for small businesses",
      body: (
        <>
          <p>
            The easiest way to post consistently is to pick three or four formats and rotate them. You stop asking
            &quot;what do I post?&quot; and start asking &quot;which format is due this week?&quot;. Here are eight that
            suit local and online businesses, with an example for each.
          </p>
          <GuideTable
            caption="Reel formats with small-business examples"
            head={["Format", "What it shows", "Example"]}
            rows={[
              ["Behind the scenes", "How the work actually gets done", "A bakery films the first batch of the day coming out of the oven, with the time on screen."],
              ["Before and after", "A visible change in a few seconds", "A salon shows a colour correction: the starting hair, one mid-step, then the finished look."],
              ["Answer a question", "One question customers ask a lot", "A plumber answers \"Why does my water heater make a popping sound?\" in 30 seconds."],
              ["Process", "Steps from start to finish", "An online candle shop pours, labels and packs one order."],
              ["Customer story", "A real result, told by or about a customer", "A salon client explains why she switched to a shorter cut (with her permission)."],
              ["Quick tip", "One useful thing the viewer can do today", "A bakery shows how to keep sourdough fresh for three days."],
              ["Product demo", "The product in use, not on a shelf", "An online shop shows how a foldable bag packs into its own pocket."],
              ["Meet the team", "The people behind the business", "A plumber introduces the apprentice and the one tool he never leaves without."],
            ]}
          />
          <h3>How to choose your three</h3>
          <p>
            Pick one format that shows <strong>skill</strong> (process, before and after), one that shows{" "}
            <strong>trust</strong> (customer story, meet the team) and one that shows <strong>help</strong> (answer a
            question, quick tip). That mix gives new viewers a reason to watch, a reason to believe you and a reason to
            follow.
          </p>
          <p>
            Short of ideas? List the ten questions customers asked you this month. Each one is a Reel. The{" "}
            <Link href="/tools/instagram-post-ideas-generator">Instagram post ideas generator</Link> can fill gaps when
            the list runs dry.
          </p>
          <Callout kind="example" title="A plumber's first month of formats">
            <p>
              Week 1: &quot;Why your shower runs cold after five minutes&quot; (question). Week 2: replacing a leaking
              tap in 40 seconds (process). Week 3: a customer&apos;s flooded basement before and after (before and
              after). Week 4: meet the van and what&apos;s in it (team). Then repeat with new questions.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "hooks",
      title: "How to hook viewers in the first two seconds",
      body: (
        <>
          <p>
            People decide whether to keep watching almost immediately. Your opening has to tell them what the Reel is
            about and why it matters to them. Clever is optional. Clear is not.
          </p>
          <h3>Say it, show it and write it</h3>
          <ul>
            <li>
              <strong>Say</strong> the hook in your first sentence, with no greeting first. &quot;Hi guys, so today...&quot;
              loses people.
            </li>
            <li>
              <strong>Show</strong> the most interesting frame first. Start on the finished cake or the burst pipe, not
              on an empty counter.
            </li>
            <li>
              <strong>Write</strong> the hook as on-screen text for people watching with the sound off. Keep it to one
              short line.
            </li>
          </ul>
          <h3>Hook lines you can adapt</h3>
          <ul>
            <li>&quot;3 things your hairdresser wishes you&apos;d stop doing at home.&quot;</li>
            <li>&quot;If your boiler makes this noise, call someone this week.&quot;</li>
            <li>&quot;What $40 of bread looks like at 6 a.m.&quot;</li>
            <li>&quot;We pack 200 orders a week. This is the one mistake we stopped making.&quot;</li>
            <li>&quot;You&apos;re storing sourdough wrong (it&apos;s not your fault).&quot;</li>
          </ul>
          <p>
            Write five versions for each Reel and pick the clearest. The{" "}
            <Link href="/tools/instagram-hook-generator">Instagram hook generator</Link> gives you a batch of starting
            points to edit into your own voice.
          </p>
        </>
      ),
    },
    {
      id: "length-and-specs",
      title: "How long should a Reel be, and what about safe zones and covers?",
      body: (
        <>
          <p>
            Instagram raised the Reels limit to three minutes in January 2025,{" "}
            <Ext href="https://www.socialmediatoday.com/news/instagram-officially-expands-reels-length-3-minutes/737766/">
              as announced by Instagram head Adam Mosseri
            </Ext>
            . That doesn&apos;t mean every Reel should be long. Make it as long as the idea needs and no longer.
          </p>
          <GuideTable
            caption="A rough length guide by format"
            head={["Format", "Typical length", "Why"]}
            rows={[
              ["Quick tip or hook-led clip", "7-20 seconds", "One idea, easy to rewatch and share."],
              ["Before and after, product demo", "15-30 seconds", "Enough to show the change without padding."],
              ["Answer a question, process", "30-60 seconds", "Room to explain one thing properly."],
              ["Customer story, longer tutorial", "1-3 minutes", "Only when every part earns its place."],
            ]}
          />
          <p>
            Treat these as starting points, not rules. Your Insights will tell you where people stop watching. If
            most viewers drop off at second 8, the next Reel should get to the point by second 5.
          </p>
          <h3>Size and safe zones</h3>
          <p>
            Film vertical, 9:16, at 1080 by 1920. Instagram&apos;s buttons, caption and username sit over the bottom
            and right edges of a Reel, so keep faces and on-screen text away from them. Check a frame in the{" "}
            <Link href="/tools/instagram-safe-zone-checker">Instagram safe zone checker</Link> and confirm the file with
            the <Link href="/tools/instagram-reels-size-checker">Reels size checker</Link> before you post.
          </p>
          <h3>Covers that make your grid useful</h3>
          <p>
            Your profile grid is often the second thing a new visitor sees. A cover with a short title (&quot;Fix a
            dripping tap&quot;) turns your grid into a menu. Use the same font and layout every time so your Reels look
            like a series. The <Link href="/tools/instagram-reel-cover-maker">Reel cover maker</Link> makes a
            correctly sized cover in your browser.
          </p>
        </>
      ),
    },
    {
      id: "filming-kit",
      title: "What do you need to film Reels on a phone?",
      body: (
        <>
          <p>
            Less than you think. The phone in your pocket is enough. A few cheap additions make the biggest difference:
          </p>
          <ul>
            <li>
              <strong>Light:</strong> face a window, or film near the brightest part of your shop. A small clip-on
              light helps in dark kitchens and vans.
            </li>
            <li>
              <strong>Sound:</strong> if you speak to camera, a basic clip-on microphone matters more than a better
              camera. People forgive soft video; they leave when they can&apos;t hear you.
            </li>
            <li>
              <strong>Stability:</strong> a small tripod or phone clamp lets you film yourself working with both hands.
            </li>
            <li>
              <strong>Clean lens:</strong> wipe it before every shoot. Flour, steam and fingerprints are the most
              common reason phone video looks blurry.
            </li>
          </ul>
          <Callout kind="tip" title="Film in batches, not every day">
            <p>
              Set aside one hour a week. Film three or four Reels back to back while the light is good and the shop is
              quiet. Editing and posting can happen later, and scheduling means nobody has to remember to press publish
              during a busy shift.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "weekly-routine",
      title: "A weekly Reels routine that fits around a business",
      body: (
        <>
          <p>
            Here is a routine that takes about two to three hours a week in total and produces three Reels. Move the
            days around your quiet periods.
          </p>
          <DayList
            days={[
              {
                title: "Monday: plan (20 minutes).",
                body: (
                  <>
                    {" "}Pick this week&apos;s three formats and write one hook for each. Note any customer questions from
                    last week.
                  </>
                ),
              },
              {
                title: "Tuesday: film (60 minutes).",
                body: <> Film all three Reels in one session. Grab a few extra clips of the shop for later.</>,
              },
              {
                title: "Wednesday: edit and caption (45 minutes).",
                body: (
                  <>
                    {" "}Trim, add on-screen text, make covers and write captions with one keyword per Reel for
                    comments.
                  </>
                ),
              },
              {
                title: "Wednesday: schedule (10 minutes).",
                body: (
                  <>
                    {" "}Schedule the three Reels for the week with{" "}
                    <Link href="/instagram-scheduler">Poskoo&apos;s Instagram scheduler</Link>. The{" "}
                    <Link href="/help/schedule-instagram-reels">step-by-step help on scheduling Reels</Link> covers the
                    details.
                  </>
                ),
              },
              {
                title: "Every posting day: reply (10 minutes).",
                body: <> Answer comments and DMs in the first hour or two after a Reel goes live.</>,
              },
              {
                title: "Friday: review (15 minutes).",
                body: (
                  <>
                    {" "}Check which Reel reached the most non-followers and which got the most shares and saves. Make
                    more of that format next week.
                  </>
                ),
              },
            ]}
          />
          <p>
            Three Reels a week that you keep up for three months will teach you far more than a burst of daily posting
            that stops in week two.
          </p>
        </>
      ),
    },
    {
      id: "views-to-dms",
      title: "How to turn Reel views into DMs and customers",
      body: (
        <>
          <p>
            Views don&apos;t pay rent. The goal is to move interested viewers one step closer to buying: a message, a
            booking, a visit. The simplest way is a comment keyword.
          </p>
          <h3>End every Reel with one clear ask</h3>
          <p>
            Say it, and put it in the caption: &quot;Comment PRICE and I&apos;ll DM you this month&apos;s menu&quot;,
            &quot;Comment BOOK for the booking link&quot;, &quot;Comment SIZE and I&apos;ll send the size guide&quot;. One
            keyword per Reel. Short, easy to spell, in capitals.
          </p>
          <h3>Let the DM do the follow-up</h3>
          <p>
            With <Link href="/instagram-auto-dm">Poskoo&apos;s Instagram comment-to-DM automation</Link>, everyone who
            comments the keyword gets your message and link in their DMs through Meta&apos;s official API, even when you
            are busy with customers. You can add a short public reply under the comment (&quot;Sent it to your
            DMs!&quot;) so other viewers see how it works.
          </p>
          <Callout kind="example" title="A bakery's Reel-to-order flow">
            <p>
              Reel: the weekend cake menu being boxed up. Caption ends with &quot;Comment CAKE for the order link&quot;.
              DM: &quot;Hi! Here&apos;s this weekend&apos;s order form 👉 [link]. Orders close Thursday at 6 p.m. Any
              allergies? Just reply here.&quot;
            </p>
          </Callout>
          <p>
            Want more on this? The guide to{" "}
            <Link href="/guides/instagram-comment-to-dm-automation-guide">comment-to-DM automation</Link> covers
            keywords, message templates and Meta&apos;s rules, and{" "}
            <Link href="/guides/how-to-get-more-instagram-followers">how to get more Instagram followers</Link> covers
            the profile side of turning viewers into followers.
          </p>
          <InlineCta
            title="Schedule this week's Reels and catch every comment"
            text="Plan your Reels on a calendar, publish them on time and auto-DM everyone who comments your keyword. Free plan, no credit card."
            tool={{ href: "/instagram-auto-dm", label: "See Instagram auto-DM" }}
          />
        </>
      ),
    },
    {
      id: "measure",
      title: "Which numbers tell you a Reel worked?",
      body: (
        <>
          <p>
            Likes are the least useful number. For a small business, these tell you more:
          </p>
          <ul>
            <li>
              <strong>Reach to non-followers:</strong> how many new people saw it. This is the main reason to post
              Reels.
            </li>
            <li>
              <strong>Watch time and drop-off:</strong> where people stopped watching. A steep early drop means the hook
              or opening frame needs work.
            </li>
            <li>
              <strong>Shares:</strong> someone sent it to a friend. That is one of the clearest signs a Reel was useful.
            </li>
            <li>
              <strong>Saves:</strong> someone wants to come back to it. Tips and how-tos earn saves.
            </li>
            <li>
              <strong>Profile visits, follows and DMs:</strong> the step from viewer to potential customer.
            </li>
          </ul>
          <p>
            You can find these in Instagram&apos;s{" "}
            <Ext href="https://help.instagram.com/iphone-app/788388387972460">Insights for professional accounts</Ext>,
            which cover the past 90 days. Compare Reels against each other, not against a big account in another
            industry. To compare engagement across posts fairly, run the numbers through the{" "}
            <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link>.
          </p>
          <h3>Common mistakes to avoid</h3>
          <ul>
            <li>Starting with your logo or a slow intro instead of the most interesting moment.</li>
            <li>Posting the same clip with a different caption three times in a week.</li>
            <li>Using trending audio that has nothing to do with the business, just because it is trending.</li>
            <li>Ending without an ask, so interested viewers don&apos;t know what to do next.</li>
          </ul>
          <Callout kind="tip" title="Change one thing at a time">
            <p>
              If a Reel flops, change only the hook next time and keep the format. If it still flops, try a different
              format. Changing everything at once means you never learn what made the difference.
            </p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    { label: "Instagram Creators: recommendations and originality (April 2024)", href: "https://creators.instagram.com/recommendations-and-Originality" },
    { label: "Social Media Today: Instagram expands Reels length to 3 minutes (January 2025)", href: "https://www.socialmediatoday.com/news/instagram-officially-expands-reels-length-3-minutes/737766/" },
    { label: "Instagram Help Center: view insights for your professional account", href: "https://help.instagram.com/iphone-app/788388387972460" },
    { label: "Instagram Help Center: create and manage scheduled posts and Reels", href: "https://help.instagram.com/iphone-app/439971288310029" },
  ],
};
