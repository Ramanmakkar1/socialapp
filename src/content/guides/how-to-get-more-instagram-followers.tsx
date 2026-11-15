import Link from "next/link";
import { Callout, DayList, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// General guidance only. No invented statistics: platform behaviour is described as
// what tends to work, not as a guaranteed rule.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          To get more Instagram followers in 2026, post original Reels and carousels on a clear topic 3-5 times a week,
          hook viewers in the first second, reply to every comment and DM, and give people a reason to follow (a series,
          a freebie, a promise).
        </strong>
      </p>
      <p>
        That is the whole strategy in one sentence. The rest of this guide is the detail: what to post, how often, how
        to write an opening line that stops the scroll, what hashtags are still worth doing, and how to turn a busy
        comment section into followers and leads. It ends with a 30-day plan you can start this week.
      </p>
      <p>
        One thing to get out of the way: there is no trick that adds thousands of real followers overnight. Growth comes
        from making something people want to watch, save and send to a friend, then doing it again next week. Everything
        below serves that.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-gets-followers",
      title: "What actually gets you followers on Instagram in 2026?",
      body: (
        <>
          <p>
            Followers are a side effect of three things: <strong>reach</strong> (new people see a post),{" "}
            <strong>resonance</strong> (they watch it, save it or send it) and <strong>reason</strong> (they can tell
            what they get by following you). Miss any one and growth stalls.
          </p>
          <h3>Reach: get in front of people who don&apos;t follow you yet</h3>
          <p>
            As a general guide, short vertical video and carousels are the formats most likely to be shown to people who
            don&apos;t already follow you, because they are easy to consume and easy to share. Reels can travel beyond
            your current audience when they hold attention, and carousels give people a reason to swipe and save. Treat
            that as a starting point to test, not a guarantee: your own Insights will show which format actually reaches
            new accounts for your topic.
          </p>
          <h3>Resonance: make something worth saving or sending</h3>
          <p>
            The posts that grow accounts usually do at least one of these:
          </p>
          <ul>
            <li><strong>Teach</strong> a small, specific thing in under a minute.</li>
            <li><strong>Show</strong> a process or transformation people want to copy.</li>
            <li><strong>Say</strong> something the viewer was already thinking, better than they could.</li>
            <li><strong>Give</strong> a tool, template or checklist they can use right away.</li>
          </ul>
          <p>
            Saves and sends are strong signals that a post was useful. When you plan a post, ask: would someone save
            this, or send it to one person? If the answer is no, the idea probably needs a sharper angle.
          </p>
          <h3>Reason: make following you the obvious next step</h3>
          <p>
            A viewer who likes one post still needs a reason to follow. Give them one in the post and in your profile:
            a series (&quot;part 2 tomorrow&quot;), a freebie (&quot;comment PLAN and I&apos;ll send the checklist&quot;),
            or a clear promise (&quot;one simple recipe every week&quot;). Vague profiles get views, not followers.
          </p>
          <Callout kind="tip" title="The one-question test">
            <p>
              Before you post, finish this sentence: &quot;Follow me and you&apos;ll get ______ every week.&quot; If you
              can&apos;t fill the blank in a few words, your content is probably too broad to convert viewers into
              followers.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "how-often-to-post",
      title: "How often should you post to grow?",
      body: (
        <>
          <p>
            <strong>Three to five posts a week is a realistic target for most accounts.</strong> The right number is the
            one you can keep for three months without burning out. Three good posts you never miss beat a daily plan
            that dies in week two.
          </p>
          <p>
            A simple weekly mix that works for many creators:
          </p>
          <GuideTable
            caption="A repeatable weekly posting mix"
            head={["Format", "How many", "What it does"]}
            rows={[
              ["Reel", "2-3", "Reaches new people and shows your topic fast."],
              ["Carousel", "1-2", "Gets saved and shared; good for teaching."],
              ["Story", "Most days", "Keeps existing followers close and warms them up."],
              ["Live or longer video", "Optional", "Builds trust with your most engaged followers."],
            ]}
          />
          <p>
            Use the{" "}
            <Link href="/tools/instagram-posting-frequency-calculator">Instagram posting frequency calculator</Link> to
            turn your real weekly time budget into a plan you can actually keep. It asks how much time you have and
            which formats you can make, then suggests a range and a sample week.
          </p>
          <h3>Consistency beats volume</h3>
          <p>
            Posting on a predictable rhythm helps people know when to expect you, and it helps you get faster at making
            content. Batch your work: film three Reels in one sitting, write a week of captions, then schedule them so
            publishing doesn&apos;t depend on your mood. A{" "}
            <Link href="/tools/social-media-content-calendar">content calendar</Link> makes the week visible, and{" "}
            <Link href="/instagram-scheduler">Poskoo&apos;s Instagram scheduler</Link> publishes feed posts, Reels,
            carousels and Stories at the times you pick.
          </p>
          <Callout kind="tip" title="Don't confuse posting with growing">
            <p>
              Posting is the input. Growing also needs replies, DMs and a profile that converts. If you post five times
              a week but never answer comments, you are leaving the easiest followers on the table.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "hooks",
      title: "How to write hooks that stop the scroll",
      body: (
        <>
          <p>
            The first second decides whether the rest of your post gets watched. A good hook does two jobs: it tells the
            viewer what the post is about, and it gives them a reason to keep watching. You do not need to be clever;
            you need to be clear and specific.
          </p>
          <h3>Five hook patterns that work</h3>
          <ul>
            <li><strong>The result:</strong> &quot;This is how I got my first 1,000 saves from one carousel.&quot;</li>
            <li><strong>The mistake:</strong> &quot;Stop doing this if you want your Reels watched to the end.&quot;</li>
            <li><strong>The question:</strong> &quot;Why does your reach drop after a viral post?&quot;</li>
            <li><strong>The list:</strong> &quot;Three things I&apos;d do first if I started from zero today.&quot;</li>
            <li><strong>The contrast:</strong> &quot;What I posted vs what actually got followers.&quot;</li>
          </ul>
          <p>
            Say the hook out loud in the first second of a Reel, and put the same words on screen so people watching
            without sound still get it. For carousels, the first slide is the hook: one short line, big text, no clutter.
          </p>
          <p>
            Generate a batch of options with the{" "}
            <Link href="/tools/instagram-hook-generator">Instagram hook generator</Link>, then pick the one that sounds
            like you. A hook that feels fake will hurt trust even if it gets the click.
          </p>
          <Callout kind="example" title="Weak vs strong">
            <p>
              <strong>Weak:</strong> &quot;Some tips for growing on Instagram.&quot;
            </p>
            <p>
              <strong>Strong:</strong> &quot;Your first 3 seconds are why people scroll past. Here&apos;s the fix.&quot;
            </p>
            <p>The second one names the problem and promises a fix, so the viewer knows what they get.</p>
          </Callout>
        </>
      ),
    },
    {
      id: "hashtags",
      title: "Do hashtags still help?",
      body: (
        <>
          <p>
            <strong>Hashtags help label what a post is about, but they are not a reach button.</strong> Treat them as
            keywords, not magic. A handful of specific, relevant tags can help the right people find a post; a wall of
            generic tags mostly adds noise.
          </p>
          <p>
            A practical approach:
          </p>
          <ul>
            <li>Use a small set of tags that describe the exact topic, not the broad category.</li>
            <li>Mix a few niche tags with a few that your audience actually follows.</li>
            <li>Put the clearest keyword in your caption and on-screen text, where it does more work than a tag.</li>
            <li>Skip tags that have nothing to do with the post just to fill space.</li>
          </ul>
          <p>
            Build a set with the{" "}
            <Link href="/tools/instagram-hashtag-generator">Instagram hashtag generator</Link> and save it for reuse.
            Then check your Insights: if a tag set never brings new reach, change it rather than adding more.
          </p>
          <Callout kind="tip" title="Keywords beat hashtags">
            <p>
              People search Instagram with words. Write captions and on-screen text the way your audience would search,
              and hashtags become a small supporting detail instead of the whole strategy.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "comments-to-followers",
      title: "How to turn comments into followers and leads",
      body: (
        <>
          <p>
            Comments are the warmest moment you get. Someone took the time to reply, which means they are interested
            right now. How you respond decides whether they follow, save your post or buy later.
          </p>
          <h3>Reply to every comment, especially early</h3>
          <p>
            Reply with something that continues the conversation, not just a heart emoji. Ask a follow-up question or
            add one useful detail. Early replies also show new viewers that the account is alive and worth following.
          </p>
          <h3>Use a comment-to-DM keyword</h3>
          <p>
            End a post with a clear call to action: &quot;Comment PLAN and I&apos;ll send you the checklist.&quot; When
            someone comments the keyword, an automated DM delivers the link or file. This does three things at once: it
            rewards the comment, moves the conversation into DMs, and gives you a way to capture an email before sending
            the link.
          </p>
          <p>
            <Link href="/instagram-auto-dm">Instagram comment-to-DM automation</Link> in Poskoo sends your link to
            everyone who comments the keyword, can ask for an email first, and works on every post you choose. That
            turns one busy post into a list of contacts instead of a pile of comments you never follow up on.
          </p>
          <h3>Follow up in DMs</h3>
          <p>
            A DM is a conversation, not a broadcast. Answer questions, send the promised resource, and only then mention
            what you offer. People follow and buy from accounts that helped them first.
          </p>
          <InlineCta
            title="Turn your next post into followers and leads"
            text="Schedule the post, add a keyword rule, and auto-DM everyone who comments. Free plan, no credit card."
            tool={{ href: "/instagram-auto-dm", label: "See Instagram auto-DM" }}
          />
        </>
      ),
    },
    {
      id: "optimise-profile",
      title: "Optimise your profile",
      body: (
        <>
          <p>
            Your profile is the landing page for every post. A viewer who likes a Reel taps your name and decides in a
            few seconds whether to follow. Make that decision easy.
          </p>
          <ul>
            <li>
              <strong>Name field:</strong> put what you do next to your name, because people search with words, not
              handles. &quot;Sam · Budget meals&quot; tells a new viewer more than &quot;Sam&quot;.
            </li>
            <li>
              <strong>Bio:</strong> one line on who you help and what they get, then a call to action. Use the{" "}
              <Link href="/tools/instagram-bio-generator">Instagram bio generator</Link> for a starting point.
            </li>
            <li>
              <strong>Profile photo:</strong> a clear face or a simple logo that is readable at small size.
            </li>
            <li>
              <strong>Highlights:</strong> group your best content into a few named highlights so new visitors can
              browse by topic.
            </li>
            <li>
              <strong>Link:</strong> send people to one clear next step, such as a free resource or your link-in-bio
              page.
            </li>
          </ul>
          <p>
            Then look at your grid as a stranger would. Do the last nine posts make it obvious what you post about? If
            not, pin your best three and let the rest fill in over the next few weeks.
          </p>
          <Callout kind="tip" title="Match the promise to the post">
            <p>
              If a Reel is about quick dinners, the profile should say quick dinners. A mismatch between the post that
              brought someone in and the profile they land on is one of the most common reasons views don&apos;t turn
              into followers.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "never-buy-followers",
      title: "Why you should never buy followers",
      body: (
        <>
          <p>
            <strong>Bought followers are not an audience.</strong> They don&apos;t watch, save, comment or buy, and they
            make your account look less credible to the people who matter: real viewers and brands.
          </p>
          <ul>
            <li><strong>They hurt your ratios.</strong> A large following with almost no engagement looks suspicious.</li>
            <li><strong>They don&apos;t help reach.</strong> Reach depends on how people respond to your posts, not on a
              follower number.</li>
            <li><strong>They can put your account at risk.</strong> Services that ask for your password or use
              automation against the platform rules can get an account limited or removed.</li>
            <li><strong>They waste money.</strong> The same budget spent on a tool or a small ad test can bring real
              people.</li>
          </ul>
          <p>
            If you want faster growth, buy time back instead: a scheduler, a batch of templates, or a simple
            comment-to-DM setup. Those help you do more of what already works.
          </p>
        </>
      ),
    },
    {
      id: "30-day-plan",
      title: "A 30-day growth plan",
      body: (
        <>
          <p>
            Here is a four-week plan that turns the advice above into a routine. It assumes three to five posts a week
            and a few minutes a day for replies.
          </p>
          <DayList
            days={[
              {
                title: "Week 1: Set the foundation.",
                body: (
                  <>
                    {" "}Rewrite your name field and bio with the{" "}
                    <Link href="/tools/instagram-bio-generator">bio generator</Link>, pick a profile photo, and write
                    your one-line promise. List 20 post ideas on one topic. Post three times: two Reels and one
                    carousel. Reply to every comment within a few hours.
                  </>
                ),
              },
              {
                title: "Week 2: Find your hook.",
                body: (
                  <>
                    {" "}Keep the same topic and test five different hooks with the{" "}
                    <Link href="/tools/instagram-hook-generator">hook generator</Link>. Post three to four times. Note
                    which opening lines held attention longest in Insights, and reuse the pattern that worked.
                  </>
                ),
              },
              {
                title: "Week 3: Add a reason to follow.",
                body: (
                  <>
                    {" "}Start a simple series (&quot;day 1 of 5&quot;) or offer a freebie. Add a comment keyword to one
                    post and set up{" "}
                    <Link href="/instagram-auto-dm">comment-to-DM automation</Link> so everyone who asks gets the
                    resource. Post four times and answer every DM.
                  </>
                ),
              },
              {
                title: "Week 4: Double down and review.",
                body: (
                  <>
                    {" "}Make more of the format that reached the most new people. Post four to five times, keep
                    replying, and compare your best posts with the{" "}
                    <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link>. Write
                    down what you will repeat next month and what you will drop.
                  </>
                ),
              },
            ]}
          />
          <Callout kind="tip" title="What to measure">
            <p>
              Watch non-follower reach, saves, sends, profile visits and follows, not just likes. A post with fewer likes
              but more saves and profile visits is often the one actually growing your account.
            </p>
          </Callout>
          <p>
            After 30 days you will have data, a repeatable routine and a clearer promise. Growth after that is mostly
            repetition: keep the topic, keep the schedule, keep replying, and improve one thing at a time.
          </p>
        </>
      ),
    },
  ],
  sources: [],
};
