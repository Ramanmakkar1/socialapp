import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Method guide. We deliberately give no universal "best times" as facts: starting slots are
// framed as things to test, and platform features link to the platform's own help pages.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          There is no single best time to post on social media that works for every account. The best time is when your
          own audience is online and paying attention, and you find it in three steps: pick two or three sensible
          starting slots, check each platform&apos;s analytics for when your followers are active, then test those slots
          for two to three weeks and keep the ones that win.
        </strong>
      </p>
      <p>
        Published &quot;best time&quot; charts are averages across thousands of accounts with different audiences, time
        zones and topics. They are a fine place to start, but a bakery in Leeds, a SaaS founder in Toronto and a fitness
        creator with followers in three countries will not share the same best hour.
      </p>
      <p>
        This guide gives you the method instead: where to find your audience data on each platform, how to run a fair
        timing test, a log you can copy to record results, and how to handle followers in other time zones.
      </p>
    </>
  ),
  sections: [
    {
      id: "does-timing-matter",
      title: "Does posting time still matter?",
      body: (
        <>
          <p>
            Yes, but less than what you post. Feeds today are ranked, not shown in strict time order, so a strong post can
            keep finding viewers for days. Timing still helps because a post that gets early views, replies and shares
            has a better chance of being shown to more people. If you publish while most of your audience is asleep, you
            give away that first window.
          </p>
          <h3>Day of the week vs time of day</h3>
          <p>
            Both matter, but the day is usually easier to get right. Your audience&apos;s routine is the guide: office
            workers behave differently on Monday morning than on Saturday morning, and a weekend-heavy business such as a
            café or a market stall may find its best posts go out on Friday or Saturday. Test days and hours together, and
            don&apos;t assume weekends are dead until your own numbers say so.
          </p>
          <p>
            So think of timing as a small advantage you can test cheaply, not a magic switch. A weak post at the perfect
            minute still flops. A great post at a decent time usually does fine.
          </p>
          <Callout kind="tip" title="Fix the content first">
            <p>
              If every post gets low reach whatever time you choose, timing is not your problem. Work on hooks, formats
              and topic first, then come back to timing once you have posts worth optimising.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "starting-slots",
      title: "Step 1: Pick two or three starting slots",
      body: (
        <>
          <p>
            You need somewhere to begin before you have data. Use common sense about your audience&apos;s day:
          </p>
          <ul>
            <li>
              <strong>Before work:</strong> commuters and early risers check their phones in the morning.
            </li>
            <li>
              <strong>Lunch:</strong> a short scroll break in the middle of the working day.
            </li>
            <li>
              <strong>Evening:</strong> after dinner, when people have more time to watch longer videos.
            </li>
          </ul>
          <p>
            Then adjust for who you serve. A B2B audience on LinkedIn mostly reads during working days. Parents of young
            children may scroll late in the evening. A local restaurant&apos;s followers might plan dinner in the
            afternoon.
          </p>
          <p>
            Poskoo&apos;s free finders turn this into a starting grid you can copy. Choose your audience&apos;s time zone
            and the days you can post, and you get a morning, midday and evening slot to test:
          </p>
          <ul>
            <li><Link href="/tools/best-time-to-post-on-social-media">Best time to post on social media</Link> (all platforms)</li>
            <li><Link href="/tools/best-time-to-post-on-instagram">Best time to post on Instagram</Link></li>
            <li><Link href="/tools/best-time-to-post-on-linkedin">Best time to post on LinkedIn</Link></li>
            <li><Link href="/tools/best-time-to-post-on-threads">Best time to post on Threads</Link></li>
            <li><Link href="/tools/best-time-to-post-on-tiktok">Best time to post on TikTok</Link></li>
          </ul>
          <p>
            Treat the output as hypotheses to test, not answers. That is how the tools are built.
          </p>
        </>
      ),
    },
    {
      id: "platform-analytics",
      title: "Step 2: Check when your audience is online, platform by platform",
      body: (
        <>
          <p>
            Most platforms show you some version of &quot;when your followers are active&quot;. It is the best free data
            you have, because it is about your audience, not an average one. Menus move around between app updates, so
            if a path below looks different, search the platform&apos;s help centre for the report name.
          </p>
          <h3>Instagram</h3>
          <p>
            You need a professional (Business or Creator) account. Open your professional dashboard, go to Insights and
            look at your followers: the Most active times chart shows the hours and days your followers use Instagram.
            Instagram&apos;s{" "}
            <Ext href="https://help.instagram.com/iphone-app/788388387972460">Help Center</Ext> says account Insights
            cover up to the last 90 days, and follower trends need an account with at least 100 followers.
          </p>
          <h3>Facebook Pages</h3>
          <p>
            Page insights live in Meta Business Suite (or the professional dashboard for a Page). Look at when your posts
            reached the most people and which ones earned comments and shares. If you post the same content to Instagram
            and Facebook, compare the two: the audiences often behave differently.
          </p>
          <h3>LinkedIn</h3>
          <p>
            Personal profiles have post analytics (impressions, reactions, comments) on each post and in the analytics
            section of your profile. Company Pages have their own Analytics tab. LinkedIn doesn&apos;t give a simple
            &quot;most active hours&quot; chart, so the timing test below matters more here.
          </p>
          <h3>Threads</h3>
          <p>
            Threads has insights for your profile with views and interactions over time. Compare views and replies on
            posts published at different times of day. Replies are a strong sign that a post landed when people had time
            to talk.
          </p>
          <h3>YouTube</h3>
          <p>
            YouTube Studio&apos;s Analytics has an Audience tab with a report called &quot;When your viewers are on
            YouTube&quot;. Google&apos;s{" "}
            <Ext href="https://support.google.com/youtube/answer/9314416?hl=en">YouTube Help</Ext> says it shows when
            your viewers were online across YouTube in the last 28 days. A common approach is to publish a little before
            the busiest hours, so the video is processed and ready when most viewers arrive.
          </p>
          <h3>TikTok</h3>
          <p>
            TikTok&apos;s analytics (in TikTok Studio on desktop, or the analytics screen in the app) include a followers
            view with when your followers are active. Use it the same way: pick the busiest windows as test slots.
          </p>
          <Callout kind="warning" title="Check the time zone of every chart">
            <p>
              Analytics charts are not always shown in your local time. Before you write down &quot;7 pm&quot;, check
              which time zone the report uses, and convert if needed.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "timing-test",
      title: "Step 3: Run a two-to-three-week timing test",
      body: (
        <>
          <p>
            Now test your slots against each other. The goal is a fair comparison: change the time, keep as much else the
            same as you can.
          </p>
          <DayList
            days={[
              {
                title: "Choose 2-3 slots per platform.",
                body: <> Use your analytics peaks and the starting slots from step 1. More than three and the test drags on.</>,
              },
              {
                title: "Rotate them across similar posts.",
                body: (
                  <>
                    {" "}Post the same format at each slot, for example a Reel at 8 am Monday, a Reel at 12 pm Wednesday
                    and a Reel at 7 pm Friday, then swap the days the following week so no slot always gets the best day.
                  </>
                ),
              },
              {
                title: "Schedule everything in advance.",
                body: (
                  <>
                    {" "}Manual posting drifts: you post at 7:40 instead of 7:00 because you were busy. A{" "}
                    <Link href="/social-media-scheduler">social media scheduler</Link> publishes at the exact minute, which
                    keeps the test honest.
                  </>
                ),
              },
              {
                title: "Log results after 48 hours.",
                body: (
                  <>
                    {" "}Most posts get the bulk of their early reach in the first day or two. Record the numbers at the same
                    point for every post, so a post you checked after a week isn&apos;t compared with one you checked after
                    a day.
                  </>
                ),
              },
              {
                title: "Decide after 2-3 weeks.",
                body: (
                  <>
                    {" "}Keep the slot that wins most often, drop the one that loses most often, and test one new slot in
                    its place next month.
                  </>
                ),
              },
            ]}
          />
          <h3>A results log you can copy</h3>
          <p>
            A simple table in a spreadsheet is enough. Here is what one week of an Instagram test might look like (the
            numbers are made-up examples to show the layout):
          </p>
          <GuideTable
            caption="Example timing-test log (illustrative numbers)"
            head={["Post", "Day and slot", "Format", "Reach at 48h", "Saves + shares", "Comments", "Notes"]}
            rows={[
              ["Storage tips", "Mon 8 am", "Reel", "1,240", "38", "12", "Strong hook"],
              ["Shaping shift", "Wed 12 pm", "Reel", "860", "15", "6", "Weaker topic"],
              ["Workshop promo", "Fri 7 pm", "Reel", "1,410", "22", "31", "Comment keyword"],
              ["Rye vs white", "Mon 12 pm", "Reel", "990", "29", "9", "Swapped slot"],
              ["Scoring slow-mo", "Wed 7 pm", "Reel", "1,320", "41", "14", ""],
              ["Customer story", "Fri 8 am", "Reel", "780", "11", "5", "Holiday morning"],
            ]}
          />
          <p>
            Use the notes column for anything that might explain an outlier: a holiday, a trending sound, a weak hook. In
            the example, evening posts look stronger, but the 8 am Monday post also did well. One more week of swapping
            would settle it.
          </p>
        </>
      ),
    },
    {
      id: "compare-fairly",
      title: "How to compare posts fairly",
      body: (
        <>
          <p>
            Timing tests go wrong when you compare posts that differ in more than time. A few rules keep the comparison
            meaningful:
          </p>
          <ul>
            <li>
              <strong>Compare like with like.</strong> Reels against Reels, carousels against carousels. Formats reach
              people differently, so a carousel at 9 am vs a Reel at 6 pm tells you nothing about timing.
            </li>
            <li>
              <strong>Use rates, not just totals.</strong> If your follower count grows during the test, later posts have
              an advantage. Reach per follower or engagement rate evens that out. The{" "}
              <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link> does the maths.
            </li>
            <li>
              <strong>Look for a pattern, not one winner.</strong> One viral post at 3 pm doesn&apos;t make 3 pm your best
              time. A slot that wins three weeks in a row does.
            </li>
            <li>
              <strong>Ignore tiny differences.</strong> If two slots are within a few percent of each other, they are a
              tie. Pick the one that fits your schedule.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "time-zones",
      title: "What if your followers live in different time zones?",
      body: (
        <>
          <p>
            Start by finding where most of your audience is. Instagram Insights, YouTube Analytics and most other
            platforms show top countries or cities. Then:
          </p>
          <ul>
            <li>
              <strong>One main region:</strong> post on that region&apos;s clock, even if it is the middle of your
              night. Schedule it so you don&apos;t have to be awake.
            </li>
            <li>
              <strong>Two big regions:</strong> look for an overlap, such as morning in North America being evening in
              Europe, or alternate slots on different days so each region gets posts at a good local time.
            </li>
            <li>
              <strong>Spread worldwide:</strong> timing matters less, because someone is always awake. Focus on content
              and keep a steady rhythm.
            </li>
          </ul>
          <p>
            The{" "}
            <Link href="/tools/instagram-time-zone-converter">Instagram time zone converter</Link> turns a posting time
            into your audience&apos;s local time, with daylight saving handled, so you don&apos;t schedule an hour off
            after the clocks change.
          </p>
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Common timing mistakes to avoid",
      body: (
        <>
          <h3>Copying another account&apos;s schedule</h3>
          <p>
            A big creator in your niche posting at 6 pm tells you about their audience, not yours. Their followers may
            live elsewhere, be a different age or use the app at different times. Borrow the idea of testing, not the
            hour.
          </p>
          <h3>Using one time for every platform</h3>
          <p>
            People open LinkedIn, Instagram and YouTube in different moods and at different points in the day. Test each
            network separately. A slot that wins on LinkedIn on a Tuesday morning may lose on Instagram, and the other
            way round.
          </p>
          <h3>Changing too many things at once</h3>
          <p>
            If you change the time, the format and the topic in the same week, you won&apos;t know which change made the
            difference. During a timing test, keep the format steady and let time be the main thing that varies.
          </p>
          <h3>Judging too early</h3>
          <p>
            One or two posts per slot is not enough. Small accounts in particular see big swings from post to post. Give
            each slot at least three or four posts before you call a winner.
          </p>
          <h3>Forgetting to show up after posting</h3>
          <p>
            Timing helps most when you are around to reply in the first hour. If your best slot is a time you can never
            check comments, a slightly worse slot where you can reply quickly may do better overall. Early replies keep
            the conversation going and show new viewers the account is active.
          </p>
        </>
      ),
    },
    {
      id: "put-it-on-schedule",
      title: "Put your best times on a schedule",
      body: (
        <>
          <p>
            Once you know your slots, the hard part is hitting them every week. Write them into your{" "}
            <Link href="/guides/social-media-content-calendar-guide">social media content calendar</Link> as fixed
            posting times, so every new idea already has a time waiting for it.
          </p>
          <p>
            Instagram&apos;s own app can schedule posts and Reels for professional accounts up to 75 days ahead,
            according to{" "}
            <Ext href="https://help.instagram.com/iphone-app/439971288310029">Instagram&apos;s Help Center</Ext>. If you
            post to several networks, a scheduler keeps every slot in one place. Poskoo publishes today to Instagram,
            Facebook Pages, Threads, YouTube, LinkedIn profiles, <Link href="/bluesky-scheduler">Bluesky</Link> and <Link href="/mastodon-scheduler">Mastodon</Link>, shows times in your browser&apos;s
            time zone, and marks each post as published or failed so you can fix and retry. TikTok, Pinterest, X and
            LinkedIn Pages publishing are still waiting on platform approval.
          </p>
          <InlineCta
            title="Schedule your posts at the times that work"
            text="Plan the week on a calendar and let Poskoo publish at the exact minute. Free plan, no credit card."
            tool={{ href: "/tools/best-time-to-post-on-social-media", label: "Find starting times" }}
          />
          <h3>Re-test every few months</h3>
          <p>
            Audiences change. A new wave of followers, a season, a new format or a platform update can shift when your
            posts do best. Repeat a short test every quarter, or whenever reach drops for several weeks without an
            obvious reason.
          </p>
        </>
      ),
    },
  ],
  sources: [
    {
      label: "Instagram Help Center: Insights for professional accounts",
      href: "https://help.instagram.com/iphone-app/788388387972460",
    },
    {
      label: "Instagram Help Center: How to create and manage scheduled posts and Reels",
      href: "https://help.instagram.com/iphone-app/439971288310029",
    },
    {
      label: "YouTube Help: Understand your YouTube audience",
      href: "https://support.google.com/youtube/answer/9314416?hl=en",
    },
  ],
};
