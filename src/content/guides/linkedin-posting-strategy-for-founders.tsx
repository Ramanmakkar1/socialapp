import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Practical guidance only. No invented reach or engagement numbers: format advice is framed as
// what to test, and platform facts link to LinkedIn's own help pages and developer docs.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          A LinkedIn posting strategy that works for founders and coaches is simple: fix your profile first, pick three
          or four topics you can talk about for a year, post two or three times a week from your personal profile, open
          every post with a line that earns the &quot;...more&quot; tap, and spend as much time commenting on other
          people&apos;s posts as writing your own.
        </strong>
      </p>
      <p>
        LinkedIn rewards people who show up with a clear point of view, week after week. You don&apos;t need to go
        viral. You need the right few hundred people to recognise your name when they need what you sell.
      </p>
      <p>
        This guide covers the profile, the topics, the formats, how to write the opening lines, three sample posts you
        can adapt, how often to post, and a four-week plan to get started.
      </p>
    </>
  ),
  sections: [
    {
      id: "profile-first",
      title: "Start with your profile, not your posts",
      body: (
        <>
          <p>
            Every good post sends people to your profile. If the profile doesn&apos;t say what you do and who you help,
            that attention leaks away. Spend an hour here before you write anything.
          </p>
          <h3>Headline: who you help and how</h3>
          <p>
            Your headline follows you everywhere: under your name on every post and every comment. A job title alone
            (&quot;Founder at Acme&quot;) tells a stranger nothing. Try the pattern &quot;I help [who] [do what]&quot;
            or &quot;[Role] | [result you deliver] | [proof]&quot;.
          </p>
          <ul>
            <li>Weak: &quot;CEO &amp; Founder | Entrepreneur | Speaker&quot;</li>
            <li>Stronger: &quot;Founder of Acme | Helping clinics cut no-shows with simple SMS reminders&quot;</li>
            <li>Stronger (coach): &quot;Sales coach for first-time founders | From zero to first 10 customers&quot;</li>
          </ul>
          <p>
            The <Link href="/tools/linkedin-headline-generator">LinkedIn headline generator</Link> gives you several
            versions to edit if you are stuck.
          </p>
          <h3>About section: the longer version of your headline</h3>
          <p>
            Write it in the first person. Open with the problem you solve, add two or three lines of proof (clients,
            results, years of experience), then say what to do next: book a call, read the newsletter, send a DM. The{" "}
            <Link href="/tools/linkedin-summary-generator">LinkedIn summary generator</Link> drafts a starting point.
          </p>
          <h3>Featured: your best three things</h3>
          <p>
            The Featured section sits near the top of your profile and can hold posts, articles, links and media.{" "}
            <Ext href="https://www.linkedin.com/help/linkedin/answer/111587">LinkedIn&apos;s help page</Ext> explains how
            to add it. Use it for a lead magnet, your best-performing post and a booking or product link.
          </p>
        </>
      ),
    },
    {
      id: "content-pillars",
      title: "Pick three or four content pillars",
      body: (
        <>
          <p>
            Pillars are the topics you come back to again and again. They make writing easier (you never start from a
            blank page) and they teach your audience what to expect from you. Pick topics where you have real
            experience and an opinion.
          </p>
          <GuideTable
            caption="Example content pillars for founders and coaches"
            head={["Pillar", "Example post", "What it builds"]}
            rows={[
              [
                "Lessons from building",
                "\"We lost our biggest client in month 9. Here's what we changed.\"",
                "Trust and relatability",
              ],
              [
                "How-to for your customer",
                "\"The 4-question script I use on every discovery call.\"",
                "Expertise; saves and shares",
              ],
              [
                "Point of view",
                "\"Most onboarding emails are too long. Here's why I send three lines.\"",
                "Memorability; comments",
              ],
              [
                "Proof and stories",
                "\"A client went from 2 to 11 booked calls a week. The one change that did it.\"",
                "Demand for your offer",
              ],
              [
                "Behind the scenes",
                "\"Our pricing page, before and after. What we cut and why.\"",
                "Connection; curiosity about the product",
              ],
            ]}
          />
          <p>
            Rotate through them. A week might be one how-to, one lesson and one point of view. If you sell something,
            make sure at least one post in four connects clearly to the problem your offer solves.
          </p>
          <Callout kind="tip" title="Write down 20 ideas per pillar">
            <p>
              Before you post anything, list 20 ideas under each pillar: questions clients ask, mistakes you see,
              decisions you made, numbers from your own business. That list will carry you for months.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "formats",
      title: "Which post formats should you use?",
      body: (
        <>
          <p>
            LinkedIn supports several formats. Each suits a different kind of idea, so choose by the idea, not by what
            you think the algorithm likes this month.
          </p>
          <ul>
            <li>
              <strong>Text only.</strong> Fast to make and good for stories, opinions and lessons. Short paragraphs and
              white space keep it readable on a phone.
            </li>
            <li>
              <strong>Text plus one image.</strong> A photo of you, a whiteboard sketch or a screenshot adds context and
              makes the post easier to spot in the feed.
            </li>
            <li>
              <strong>Document (carousel).</strong> A PDF that people swipe through. Good for frameworks, checklists and
              step-by-step guides that people want to save.
            </li>
            <li>
              <strong>Short video.</strong> Good for showing your face and voice, which builds trust quickly. Add
              captions, since many people watch without sound.
            </li>
            <li>
              <strong>Polls.</strong> Useful for genuine questions you want answered, such as which topic to cover next.
              Use them sparingly.
            </li>
          </ul>
          <p>
            Test two or three formats over a month and compare the results in your post analytics, rather than following
            a rule. What works for a design coach may not work for a B2B software founder.
          </p>
          <p>
            Check image sizes with the{" "}
            <Link href="/tools/linkedin-post-image-size-checker">LinkedIn post image size checker</Link> so nothing gets
            cropped in the feed.
          </p>
        </>
      ),
    },
    {
      id: "hooks",
      title: "Write opening lines that earn the \"...more\" tap",
      body: (
        <>
          <p>
            LinkedIn shows the first few lines of a post in the feed, then cuts it off behind &quot;...more&quot;.
            Those first lines decide whether anyone reads the rest. Treat them like a headline.
          </p>
          <h3>What a strong opening does</h3>
          <ul>
            <li>Names a specific situation the reader recognises.</li>
            <li>Promises a takeaway, a story or a surprise.</li>
            <li>Uses a line break early, so the first sentence stands on its own.</li>
          </ul>
          <h3>Openers you can adapt</h3>
          <ul>
            <li>&quot;I turned down a $40k contract last week. Here&apos;s why.&quot;</li>
            <li>&quot;Three things I&apos;d tell myself on day one of running a business:&quot;</li>
            <li>&quot;Your discovery calls are too long. Mine are 20 minutes.&quot;</li>
            <li>&quot;We tried cold email for 6 months. What actually brought clients in:&quot;</li>
          </ul>
          <p>
            Generate more options with the <Link href="/tools/linkedin-hook-generator">LinkedIn hook generator</Link>,
            then make them true to your experience. Use the{" "}
            <Link href="/tools/linkedin-post-preview">LinkedIn post preview</Link> to see where your post gets cut off,
            the <Link href="/tools/linkedin-text-formatter">text formatter</Link> for bold or italic lines, and the{" "}
            <Link href="/tools/linkedin-character-counter">character counter</Link> to keep long posts in check.
          </p>
          <Callout kind="warning" title="Don't bait">
            <p>
              An opener that promises something the post doesn&apos;t deliver wins one click and loses trust. Your
              audience is small and remembers. Keep every promise the first line makes.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "sample-posts",
      title: "Three sample posts you can adapt",
      body: (
        <>
          <p>
            Here are three complete posts in different styles. Swap in your own details; the structure is the useful
            part.
          </p>
          <Callout kind="example" title="1. The lesson post (founder)">
            <p>We almost shut down in month 14.</p>
            <p>
              Revenue was flat, and I blamed marketing. Then I listened back to 10 sales calls in a row. In 7 of them I
              talked about features before the customer finished describing their problem.
            </p>
            <p>
              What changed: I now ask three questions before I show anything. What happens today? What does it cost
              you? What have you tried?
            </p>
            <p>Close rate went up the next quarter. Same product, same price.</p>
            <p>What&apos;s one habit you changed that moved the numbers?</p>
          </Callout>
          <Callout kind="example" title="2. The how-to post (coach)">
            <p>How I help clients write a pricing page in one afternoon:</p>
            <p>
              1. One sentence on who it&apos;s for. 2. Three plans, maximum. 3. The middle plan is the one you want
              people to pick. 4. Answer the top three objections right under the prices. 5. One button per plan, with
              the same wording.
            </p>
            <p>Save this for the next time you rewrite yours.</p>
          </Callout>
          <Callout kind="example" title="3. The point-of-view post">
            <p>Unpopular opinion: you don&apos;t need a content calendar in your first 3 months on LinkedIn.</p>
            <p>
              You need a list of 30 questions your customers ask you. Answer one per post. By month three you&apos;ll
              know which topics people care about, and then the calendar writes itself.
            </p>
            <p>Agree or disagree?</p>
          </Callout>
          <p>
            Each one opens with a clear line, gives something useful in the middle and ends with a question or a simple
            ask. None of them needs hashtags to make sense. If you add any, keep it to a couple of specific ones.
          </p>
        </>
      ),
    },
    {
      id: "commenting",
      title: "Comment on other people's posts as much as you post",
      body: (
        <>
          <p>
            For a new or small profile, thoughtful comments are often the fastest way to be seen. A good comment on a
            larger post in your field puts your name and headline in front of an audience that already cares about the
            topic.
          </p>
          <h3>What makes a comment worth reading</h3>
          <ul>
            <li>Add a detail, an example or a counterpoint, not just &quot;Great post!&quot;</li>
            <li>Keep it to two to four sentences.</li>
            <li>Comment early on posts from people your customers follow.</li>
            <li>Reply to every comment on your own posts, especially in the first hour or two.</li>
          </ul>
          <p>
            A practical routine: 15 minutes a day, five to ten real comments on posts from peers, customers and people in
            your niche. Over a few weeks, the same names start showing up in your own comments.
          </p>
        </>
      ),
    },
    {
      id: "how-often",
      title: "How often should founders post on LinkedIn?",
      body: (
        <>
          <p>
            <strong>Two or three posts a week is a pace most founders and coaches can keep.</strong> That&apos;s enough
            to stay visible without turning LinkedIn into a second job. Consistency over months matters more than any
            single week.
          </p>
          <p>
            Pick fixed days, for example Tuesday and Thursday mornings, and write in one batch. Timing matters less than
            showing up, but if you want a starting point, read our guide on{" "}
            <Link href="/guides/how-to-find-your-best-time-to-post">finding your own best time to post</Link> and test a
            couple of slots.
          </p>
          <h3>Personal profile or company Page?</h3>
          <p>
            For founders and coaches, the personal profile usually does the heavy lifting. People follow people, and
            your posts reach your own network first. A company Page is still useful for job posts, product updates and
            credibility, but treat it as the supporting act.
          </p>
        </>
      ),
    },
    {
      id: "scheduling",
      title: "Schedule your posts so the plan survives a busy week",
      body: (
        <>
          <p>
            Writing on Sunday and posting by hand on Tuesday is where most plans break. Scheduling fixes that.
          </p>
          <ul>
            <li>
              <strong>LinkedIn&apos;s own scheduler.</strong> In the post composer, the clock icon lets you pick a
              future date and time. It works for single posts on LinkedIn only.
            </li>
            <li>
              <strong>A scheduler like Poskoo.</strong> Plan LinkedIn alongside your other channels on one calendar. The{" "}
              <Link href="/linkedin-scheduler">Poskoo LinkedIn scheduler</Link> publishes text and image posts to your
              personal LinkedIn profile today. Publishing to LinkedIn company Pages needs LinkedIn&apos;s{" "}
              <Ext href="https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview">
                Community Management API
              </Ext>{" "}
              approval, which Poskoo is still waiting on, so Pages are not supported yet.
            </li>
          </ul>
          <p>
            The <Link href="/help/schedule-linkedin-posts">LinkedIn scheduling help article</Link> walks through
            connecting your profile and setting a time. The Free plan covers 2 social accounts and 10 scheduled posts a
            month, which covers two LinkedIn posts a week. Unlimited scheduling is part of the Pro plan, which is launching
            soon.
          </p>
          <InlineCta
            title="Write on Sunday, post all week"
            text="Schedule LinkedIn posts to your personal profile alongside your other channels. Free plan, no credit card."
            tool={{ href: "/tools/linkedin-post-preview", label: "Preview a LinkedIn post" }}
          />
        </>
      ),
    },
    {
      id: "measure-and-plan",
      title: "Measure what works, then follow a 4-week plan",
      body: (
        <>
          <p>
            Open any post and tap its impressions to see analytics.{" "}
            <Ext href="https://www.linkedin.com/help/linkedin/answer/a701208">LinkedIn&apos;s help page</Ext> explains the
            numbers, including members reached (distinct people who saw it) and out-of-network impressions (people who
            don&apos;t follow you yet). Watch those, plus comments, profile views and the DMs a post brings in. Likes
            matter least.
          </p>
          <p>
            To compare posts fairly, use the{" "}
            <Link href="/tools/linkedin-engagement-rate-calculator">LinkedIn engagement rate calculator</Link>, which
            turns reactions, comments and reposts into one number per post.
          </p>
          <DayList
            days={[
              {
                title: "Week 1: Fix the profile and write the list.",
                body: (
                  <>
                    {" "}Rewrite your headline and About section, add three Featured items, pick your pillars and write
                    20 ideas under each. Post twice: one lesson, one how-to. Comment on five posts a day.
                  </>
                ),
              },
              {
                title: "Week 2: Test openers.",
                body: (
                  <>
                    {" "}Post three times, each with a different style of first line. Note which got the most
                    &quot;...more&quot; taps and comments. Keep commenting daily.
                  </>
                ),
              },
              {
                title: "Week 3: Try a new format.",
                body: (
                  <>
                    {" "}Turn your best how-to into a document post and try one short video. Batch-write next
                    week&apos;s posts and schedule them.
                  </>
                ),
              },
              {
                title: "Week 4: Review and repeat.",
                body: (
                  <>
                    {" "}Compare the month&apos;s posts. Keep the pillar and format that brought profile views and
                    conversations, drop the weakest, and plan next month around what worked.
                  </>
                ),
              },
            ]}
          />
          <p>
            After a month you&apos;ll have a profile that converts, a list of ideas, a rhythm you can keep and real data
            on what your audience wants. From there it is repetition: same pillars, same days, better posts.
          </p>
        </>
      ),
    },
  ],
  sources: [
    {
      label: "LinkedIn Help: Add, edit, or remove the Featured section on your profile",
      href: "https://www.linkedin.com/help/linkedin/answer/111587",
    },
    {
      label: "LinkedIn Help: Combined post analytics",
      href: "https://www.linkedin.com/help/linkedin/answer/a701208",
    },
    {
      label: "LinkedIn Help: Post analytics",
      href: "https://www.linkedin.com/help/linkedin/answer/71493",
    },
    {
      label: "Microsoft Learn: LinkedIn Community Management API overview",
      href: "https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview",
    },
  ],
};
