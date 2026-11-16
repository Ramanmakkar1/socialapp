import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// A method guide: time boxes, pillars and a sample month. No invented statistics; platform
// facts link to the platform's own help pages in `sources`.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          A social media content calendar is a simple plan of what you will post, where, in which format and on which
          day. You can build a month of it in about an hour: 10 minutes on goals and content pillars, 15 minutes on ideas,
          10 minutes on a format mix, 15 minutes filling the calendar and 10 minutes batching and scheduling the first
          week.
        </strong>
      </p>
      <p>
        The point is not to fill every square. The point is to stop deciding what to post at 8 pm on the day you were
        meant to post it. A calendar moves those decisions to one calm hour a month, so the rest of the month is just
        making and publishing.
      </p>
      <p>
        This guide walks through that hour step by step, with a full sample month for a small local business you can
        copy, a weekly batching routine, and how to review the month so the next one is easier.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-goes-in",
      title: "What goes in a social media content calendar?",
      body: (
        <>
          <p>
            Keep it small. A calendar that needs ten columns to fill in will be abandoned by week two. Each planned post
            needs five things:
          </p>
          <ul>
            <li><strong>Date:</strong> the day it goes out (the exact time can come later).</li>
            <li><strong>Platform:</strong> Instagram, Facebook, LinkedIn, Threads and so on.</li>
            <li><strong>Format:</strong> Reel, carousel, single image, Story, text post, video.</li>
            <li><strong>Pillar:</strong> which of your three or four topics it belongs to.</li>
            <li><strong>Idea:</strong> one line that says what the post is, specific enough that future you can make it.</li>
          </ul>
          <p>
            Optional extras are a status column (idea, drafted, ready, scheduled) and a link to the caption or media. A
            spreadsheet works fine. Poskoo&apos;s free{" "}
            <Link href="/tools/social-media-content-calendar">social media content calendar template</Link> gives you a
            sample week with these columns that you can edit in the browser and download as a CSV for Google Sheets or
            Excel.
          </p>
          <Callout kind="tip" title="Write the idea, not the topic">
            <p>
              &quot;Bread&quot; is a topic. &quot;Why our sourdough takes 36 hours, shown in 30 seconds&quot; is an idea.
              If the line in your calendar doesn&apos;t tell you what to film or write, it will turn into a blank square
              on the day.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "plan-a-month-in-an-hour",
      title: "How to plan a month of content in one hour",
      body: (
        <>
          <p>
            Set a timer for each block. The time limits are there to stop you polishing. A rough plan you finish beats a
            perfect plan you abandon halfway.
          </p>
          <DayList
            days={[
              {
                title: "Minutes 0-10: Goal and pillars.",
                body: (
                  <>
                    {" "}Write one goal for the month (&quot;fill the Saturday workshop&quot;, &quot;get 30 email
                    sign-ups&quot;, &quot;launch the winter menu&quot;). Then pick three or four content pillars: the
                    recurring topics you post about. More on pillars below.
                  </>
                ),
              },
              {
                title: "Minutes 10-25: Ideas.",
                body: (
                  <>
                    {" "}Brain-dump at least 20 post ideas across your pillars, without judging them. Pull from customer
                    questions, things you did this week, dates coming up and your best posts from last month. If you get
                    stuck, the{" "}
                    <Link href="/tools/instagram-post-ideas-generator">Instagram post ideas generator</Link> gives you
                    ideas with a format, hook and caption starter by niche.
                  </>
                ),
              },
              {
                title: "Minutes 25-35: Format mix.",
                body: (
                  <>
                    {" "}Decide how many posts a week you can really make and in which formats. Three to five feed posts a
                    week plus a few Stories is a realistic target for most small teams. Write the weekly pattern down,
                    for example: Monday carousel, Wednesday Reel, Friday Reel, Saturday photo post.
                  </>
                ),
              },
              {
                title: "Minutes 35-50: Fill the calendar.",
                body: (
                  <>
                    {" "}Drop your best ideas into the weekly pattern. Put anything date-bound (a launch, a holiday, an
                    event) in first, then fill the gaps so each week has a mix of pillars. Leave one slot a week empty
                    on purpose for reactive posts.
                  </>
                ),
              },
              {
                title: "Minutes 50-60: Batch and schedule week one.",
                body: (
                  <>
                    {" "}Write the captions for the first week, gather the photos or clips you already have, and schedule
                    them. Week one is now done before the month even starts, which is the best way to keep going.
                  </>
                ),
              },
            ]}
          />
          <Callout kind="example" title="A good monthly goal is countable">
            <p>
              &quot;Post more&quot; isn&apos;t a goal. &quot;Get 12 workshop bookings from Instagram&quot; is. A countable
              goal tells you which posts to include (the ones that point at the workshop) and how to judge the month at
              the end.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "content-pillars",
      title: "How to choose content pillars",
      body: (
        <>
          <p>
            Content pillars are the three or four themes you come back to again and again. They make planning faster,
            because you never start from a blank page, and they make your account easier to understand, because people
            can tell what you post about.
          </p>
          <h3>A simple pillar set that works for most businesses</h3>
          <GuideTable
            caption="Four pillars for a small business"
            head={["Pillar", "What it does", "Example for a bakery"]}
            rows={[
              ["Teach", "Shows you know your craft and earns saves.", "How to store bread so it stays fresh for 3 days."],
              ["Show", "Behind the scenes, process, people.", "The 5 am shaping shift, sped up."],
              ["Prove", "Reviews, results, customer stories.", "A regular explains why she buys the rye every Friday."],
              ["Sell", "Products, offers, events, with a clear next step.", "Pre-order the holiday box, link in bio."],
            ]}
          />
          <p>
            A rough balance of three helpful or behind-the-scenes posts for every one direct sales post keeps the feed
            useful without hiding what you sell. Adjust it to your goal: in a launch month the &quot;Sell&quot; pillar
            gets more slots.
          </p>
          <h3>Test your pillars with one question</h3>
          <p>
            For each pillar, ask: could I make ten posts about this without repeating myself? If not, it is too narrow.
            And would my ideal customer care? If not, it is a pillar for you, not for them.
          </p>
        </>
      ),
    },
    {
      id: "sample-month",
      title: "A sample month: a local bakery's content calendar",
      body: (
        <>
          <p>
            Here is a full four-week calendar for a small neighbourhood bakery that posts on Instagram and its Facebook
            Page, with a monthly goal of filling a Saturday bread-making workshop. Copy the structure and swap in your own
            ideas.
          </p>
          <GuideTable
            caption="Four-week content calendar for a local bakery (goal: fill the Saturday workshop)"
            head={["Week and day", "Platform", "Format", "Pillar", "Idea"]}
            rows={[
              ["Week 1 Mon", "Instagram", "Carousel", "Teach", "5 signs your sourdough starter is ready to bake with."],
              ["Week 1 Wed", "Instagram + Facebook", "Reel", "Show", "The 5 am shaping shift in 20 seconds."],
              ["Week 1 Fri", "Instagram", "Reel", "Sell", "Workshop announcement: what you'll bake and take home."],
              ["Week 1 Sat", "Facebook", "Photo post", "Prove", "This morning's queue, with a thank-you to regulars."],
              ["Week 2 Mon", "Instagram", "Carousel", "Teach", "How to store bread: counter, freezer or bread bin?"],
              ["Week 2 Wed", "Instagram", "Reel", "Show", "Meet the baker: why Sam switched from office work."],
              ["Week 2 Fri", "Instagram + Facebook", "Reel", "Prove", "Last workshop's students show their loaves."],
              ["Week 2 Sat", "Open", "Reactive", "Any", "Kept free for something that happens this week."],
              ["Week 3 Mon", "Instagram", "Carousel", "Teach", "Rye vs wholemeal vs white: which for which meal."],
              ["Week 3 Wed", "Instagram", "Reel", "Sell", "Comment BREAD and we'll DM you the workshop link."],
              ["Week 3 Fri", "Instagram + Facebook", "Reel", "Show", "Scoring patterns, slowed down."],
              ["Week 3 Sat", "Facebook", "Photo post", "Prove", "A customer review, quoted in their words."],
              ["Week 4 Mon", "Instagram", "Carousel", "Teach", "3 mistakes that make home bread dense."],
              ["Week 4 Wed", "Instagram", "Reel", "Sell", "Last 4 workshop spots: what the day looks like."],
              ["Week 4 Fri", "Instagram + Facebook", "Reel", "Show", "Workshop prep: setting up 8 benches."],
              ["Week 4 Sat", "Open", "Reactive", "Any", "Kept free for the workshop day itself."],
            ]}
          />
          <p>
            Notice the pattern: Monday teaches, Wednesday and Friday are video, Saturday is light. Each week touches every
            pillar, and the sales posts build towards the event instead of repeating the same announcement. Stories are
            not listed: post them most days around whatever is happening, and reshare the week&apos;s posts there.
          </p>
          <Callout kind="tip" title="Turn the sales post into a conversation">
            <p>
              The week 3 Reel asks people to comment a keyword. With{" "}
              <Link href="/instagram-auto-dm">Instagram comment-to-DM automation</Link>, everyone who comments BREAD gets
              the booking link in their DMs automatically, which is easier for them than hunting for a link in your bio.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "batching",
      title: "How to batch content each week",
      body: (
        <>
          <p>
            The calendar tells you what to post. Batching is how you make it without it taking over your week. Instead of
            making one post a day, you make a week of posts in one or two sittings.
          </p>
          <h3>A 90-minute weekly routine</h3>
          <ul>
            <li>
              <strong>20 minutes: shoot.</strong> Film all the week&apos;s clips and photos in one go. Same light, same
              setup, three or four ideas back to back.
            </li>
            <li>
              <strong>30 minutes: edit.</strong> Trim clips, add on-screen text, pick covers. Keep the edits simple; a
              clear first second matters more than effects.
            </li>
            <li>
              <strong>25 minutes: write.</strong> Write every caption for the week. Start each with the hook, end with
              one ask (save, comment, book). The{" "}
              <Link href="/tools/social-media-post-generator">social media post generator</Link> gives you starting
              drafts sized to each platform&apos;s limit if you want a first version to edit.
            </li>
            <li>
              <strong>15 minutes: schedule.</strong> Load everything into your scheduler and check the week on the
              calendar view.
            </li>
          </ul>
          <p>
            Many teams pick a fixed batching slot, such as Thursday afternoon for the following week. The fixed slot
            matters more than the day you choose.
          </p>
          <p>
            Shoot your own material wherever you can. Instagram says it favours original content in recommendations
            and replaces reposted copies with the original, as explained on its{" "}
            <Ext href="https://creators.instagram.com/recommendations-and-Originality">Creators site</Ext>. A batch of
            your own clips is worth more than a week of reposted ones.
          </p>
          <h3>Schedule it so publishing doesn&apos;t depend on you</h3>
          <p>
            Instagram lets professional accounts schedule posts inside the app, up to 75 days ahead, according to{" "}
            <Ext href="https://help.instagram.com/iphone-app/439971288310029">Instagram&apos;s Help Center</Ext>. That
            works for a single account. Once you post to more than one network, a{" "}
            <Link href="/social-media-scheduler">social media scheduler</Link> keeps everything in one queue. Poskoo
            publishes today to Instagram, Facebook Pages, Threads, YouTube, LinkedIn profiles, Bluesky and Mastodon, with
            a week and month calendar view. TikTok, Pinterest, X and LinkedIn Pages publishing are waiting on platform
            approval.
          </p>
          <InlineCta
            title="Put your month on a calendar"
            text="Schedule a week of posts across your channels in one sitting. The Free plan covers 2 accounts and 10 scheduled posts a month."
            tool={{ href: "/tools/social-media-content-calendar", label: "Free calendar template" }}
          />
        </>
      ),
    },
    {
      id: "reactive-posts",
      title: "Leave room for reactive posts",
      body: (
        <>
          <p>
            A calendar that is 100% planned feels stiff. Some of your best posts will come from things you can&apos;t
            plan: a customer&apos;s funny question, a sold-out morning, a trend in your niche, local news.
          </p>
          <ul>
            <li>
              <strong>Keep one open slot a week.</strong> If nothing comes up, use a backup idea from your list.
            </li>
            <li>
              <strong>Keep a backlog of evergreen posts.</strong> Five or six ready-to-go posts that are never out of
              date (how-tos, FAQs) cover a sick day or a slow week.
            </li>
            <li>
              <strong>Move, don&apos;t add.</strong> When something timely comes up, push a planned post back a week
              instead of stacking an extra one on top. Your posting rhythm stays steady and nothing is wasted.
            </li>
          </ul>
          <Callout kind="warning" title="Check scheduled posts when the news changes">
            <p>
              If something serious happens in your area or industry, look through the next few days of scheduled posts. A
              cheerful promo that goes out at the wrong moment can look careless. Pausing or rescheduling takes a minute.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "timing-and-channels",
      title: "Pick times and adapt posts for each channel",
      body: (
        <>
          <p>
            Your calendar sets the day. The hour is the last detail, and it is best decided from your own data rather
            than a generic chart. Start with a few sensible slots, then test them for two or three weeks. Our guide on{" "}
            <Link href="/guides/how-to-find-your-best-time-to-post">how to find your best time to post</Link> walks
            through that test step by step.
          </p>
          <p>
            If one idea goes to several networks, don&apos;t paste the same caption everywhere. A Reel caption with
            hashtags reads oddly on LinkedIn, and a long LinkedIn post won&apos;t fit Threads or Bluesky. Keep the core
            idea and rewrite the opening, length and call to action per platform. The guide to{" "}
            <Link href="/guides/how-to-cross-post-on-social-media">cross-posting without looking lazy</Link> shows how.
          </p>
        </>
      ),
    },
    {
      id: "ai-assistant",
      title: "Optional: use an AI assistant to draft the plan",
      body: (
        <>
          <p>
            AI chat assistants are useful for the brainstorming part of the hour. You can give ChatGPT or Claude your
            goal, pillars and audience and ask for 30 post ideas, then keep the ten that sound like you. Treat what comes
            back as raw material: check facts, cut generic lines and add the details only you know.
          </p>
          <p>
            A prompt that works well: &quot;I run a neighbourhood bakery. This month&apos;s goal is filling a Saturday
            bread workshop. My pillars are Teach, Show, Prove and Sell. Suggest 20 post ideas, each with a format (Reel,
            carousel, photo) and a one-line hook.&quot;
          </p>
          <p>
            If you want the assistant to put drafts straight into your scheduler, Poskoo has an MCP server that
            assistants such as Claude can connect to with an API key. New keys are drafts-only by default, so posts
            arrive as drafts for you to review before anything is scheduled. See{" "}
            <Link href="/schedule-posts-with-claude">how to schedule posts with Claude</Link> or the{" "}
            <Link href="/developers">developer docs</Link> for setup. This is an option, not a requirement: the
            one-hour method works fine with a notebook. Poskoo&apos;s own built-in AI caption features are not switched
            on yet.
          </p>
        </>
      ),
    },
    {
      id: "monthly-review",
      title: "Review the month in 15 minutes",
      body: (
        <>
          <p>
            Before you plan the next month, look back at this one. It is the step most people skip, and it is what makes
            each calendar better than the last.
          </p>
          <ol>
            <li>
              <strong>Did you hit the goal?</strong> Count bookings, sign-ups or sales against the number you wrote down.
            </li>
            <li>
              <strong>Which three posts did best?</strong> Look at saves, shares, comments and reach, not just likes.
              Instagram Insights shows account data for up to the last 90 days, per{" "}
              <Ext href="https://help.instagram.com/iphone-app/788388387972460">Instagram&apos;s Help Center</Ext>.
            </li>
            <li>
              <strong>Which pillar worked?</strong> If every top post was &quot;Show&quot;, give that pillar more slots
              next month.
            </li>
            <li>
              <strong>What did you skip?</strong> If you planned five posts a week and made three, plan four next month.
              A plan you can keep beats an ambitious one.
            </li>
          </ol>
          <p>
            Write the answers at the top of next month&apos;s calendar. Then start the one-hour plan again, with your best
            post types already known.
          </p>
        </>
      ),
    },
  ],
  sources: [
    {
      label: "Instagram Help Center: How to create and manage scheduled posts and Reels",
      href: "https://help.instagram.com/iphone-app/439971288310029",
    },
    {
      label: "Instagram Help Center: Insights for professional accounts",
      href: "https://help.instagram.com/iphone-app/788388387972460",
    },
    {
      label: "Instagram Creators: Recommendations and originality",
      href: "https://creators.instagram.com/recommendations-and-Originality",
    },
  ],
};
