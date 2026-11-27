import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Facts are limited to what Meta, Bluesky and Poskoo's own tool pages state. No invented audience
// statistics: the only user number is Threads' 400M monthly actives, as reported by TechCrunch.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          If your customers already find you on Instagram, start with Threads: it shares your Instagram identity and
          has the bigger audience. If your buyers are developers, journalists, researchers or people who left X, start
          with Bluesky. If you can schedule both from one place, post to both and let 30 days of replies decide which one
          gets more of your time.
        </strong>
      </p>
      <p>
        That is the short answer. Both apps are text-first, both reward replies more than broadcasts, and both are still
        young enough that a small brand can stand out. They differ in who is there, how people find posts and how much
        control you get over your identity.
      </p>
      <p>
        This guide compares them side by side, shows which kinds of business fit each one, gives sample posts you can
        adapt, and ends with a 30-day plan to test both without doubling your workload.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-they-are",
      title: "What are Threads and Bluesky?",
      body: (
        <>
          <h3>Threads: Meta&apos;s text app, tied to Instagram</h3>
          <p>
            Threads is Meta&apos;s conversation app. You sign in with your Instagram account, your handle carries over,
            and people who follow you on Instagram can follow you on Threads in a tap. That shared login is its biggest
            advantage for brands: you are not starting from zero.
          </p>
          <p>
            It is also large. In August 2025, Instagram head Adam Mosseri said Threads had passed{" "}
            <Ext href="https://techcrunch.com/2025/08/12/threads-now-has-more-than-400-million-monthly-active-users">
              400 million monthly active users
            </Ext>
            , as reported by TechCrunch. Threads can also share your public posts to the fediverse (Mastodon and other
            servers) if you switch on fediverse sharing in your account settings. Meta explains how that works in its{" "}
            <Ext href="https://about.fb.com/news/2024/06/what-is-the-fediverse/">fediverse explainer</Ext>.
          </p>
          <h3>Bluesky: an open network you can take with you</h3>
          <p>
            Bluesky runs on the AT Protocol, an open standard. In practice that means three things matter for a brand:
          </p>
          <ul>
            <li>
              <strong>Domain handles.</strong> You can use your own website as your handle, such as @yourbrand.com, by
              adding a DNS record. Bluesky{" "}
              <Ext href="https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial">
                recommends this for official organisations
              </Ext>{" "}
              because it works as a form of verification.
            </li>
            <li>
              <strong>Custom feeds.</strong> Anyone can build a feed around a topic, and users pin the feeds they like.
              Getting into a popular topic feed can matter more than your follower count.
            </li>
            <li>
              <strong>Starter packs.</strong> A{" "}
              <Ext href="https://bsky.social/about/blog/06-26-2024-starter-packs">starter pack</Ext> recommends up to
              150 accounts and up to 3 custom feeds. Being included in a good pack for your niche is one of the fastest
              ways to get found.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "side-by-side",
      title: "Threads vs Bluesky side by side",
      body: (
        <>
          <p>
            Here is how the two compare on the things a brand actually has to plan around. Character limits come from
            Poskoo&apos;s{" "}
            <Link href="/tools/threads-character-counter">Threads character counter</Link> and{" "}
            <Link href="/tools/bluesky-character-counter">Bluesky character counter</Link>, which track each
            platform&apos;s published limits.
          </p>
          <GuideTable
            caption="Threads and Bluesky compared for brands"
            head={["", "Threads", "Bluesky"]}
            rows={[
              ["Sign-up", "Uses your Instagram account and handle", "Separate account; handle can be your own domain"],
              ["Post length", "Up to 500 characters, up to 5 links", "Up to 300 characters (counted as graphemes)"],
              ["Tone", "Casual, conversational, lots of lifestyle and creator talk", "Direct, nerdy, newsy; low tolerance for marketing speak"],
              ["Discovery", "Algorithmic For You feed plus topic tags", "Following feed plus custom topic feeds and starter packs"],
              ["Links", "Allowed in posts", "Allowed in posts, with link cards"],
              ["Brand fit", "Consumer brands, creators, local businesses already on Instagram", "Tech, media, B2B, research, communities that value openness"],
              ["Portability", "Tied to Meta; optional fediverse sharing", "Open protocol; your domain handle moves with you"],
              ["Schedule with Poskoo", "Yes", "Yes"],
            ]}
          />
          <Callout kind="tip" title="Write to the shorter limit">
            <p>
              If you plan to post the same idea on both, draft it at 300 characters first. A post that fits Bluesky
              will always fit Threads, and short posts tend to read better on both.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "who-should-be-where",
      title: "Which one should your brand be on?",
      body: (
        <>
          <p>
            Ask one question: where do the people who buy from you already talk? Your answer matters more than either
            app&apos;s size. A smaller network full of your customers beats a huge one where nobody cares about your
            topic.
          </p>
          <GuideTable
            caption="A starting point by business type"
            head={["Business type", "Start with", "Why"]}
            rows={[
              ["Local shop, salon, cafe", "Threads", "Your Instagram followers can follow you in one tap."],
              ["Coach, creator, personal brand", "Threads first, then Bluesky", "Threads borrows your Instagram audience; Bluesky rewards expertise in niche feeds."],
              ["SaaS or developer tool", "Bluesky", "Developer and tech communities are active, and custom feeds group them by topic."],
              ["Newsletter, publisher, journalist", "Both", "Bluesky link cards drive clicks; Threads brings reach from Instagram."],
              ["E-commerce brand", "Threads", "Product audiences already follow you on Instagram."],
              ["Agency or consultant (B2B)", "Bluesky, plus LinkedIn", "Professional, opinion-led posts fit Bluesky's tone."],
            ]}
          />
          <p>
            Treat the table as a starting point, not a verdict. Your own replies, profile visits and link clicks over a
            month will tell you more than any comparison.
          </p>
        </>
      ),
    },
    {
      id: "what-to-post",
      title: "What to post on Threads and Bluesky",
      body: (
        <>
          <p>
            Both apps punish the same thing: posts that read like ads. What works is the stuff you would say out loud to
            a customer. Short opinions, quick tips, behind-the-scenes notes and questions that people can actually
            answer.
          </p>
          <h3>Post types that work on both</h3>
          <ul>
            <li><strong>The opinion:</strong> one clear take on something in your field, with a reason.</li>
            <li><strong>The tip:</strong> one useful thing in two or three sentences.</li>
            <li><strong>The question:</strong> something specific enough that people can answer in one line.</li>
            <li><strong>The build note:</strong> what you are working on this week, including what went wrong.</li>
            <li><strong>The link with context:</strong> a link plus one sentence on why it is worth the click.</li>
          </ul>
          <h3>Sample posts for a small bakery</h3>
          <Callout kind="example" title="Threads">
            <p>
              Hot take: sourdough doesn&apos;t need to be sour. Ours rests 18 hours in the fridge and tastes mild and
              nutty. Do you like yours tangy or mellow? Honest answers only.
            </p>
          </Callout>
          <Callout kind="example" title="Bluesky">
            <p>
              We tested three flours for our weekend loaf. The cheapest one won on crumb, lost on flavour. Writing up the
              full comparison this week. Bakers here: what flour do you swear by?
            </p>
          </Callout>
          <h3>Sample posts for a SaaS founder</h3>
          <Callout kind="example" title="Threads">
            <p>
              We shipped a feature nobody asked for and nobody used. Lesson learned: talk to five customers before you
              write a line of code. What&apos;s the feature you regret building?
            </p>
          </Callout>
          <Callout kind="example" title="Bluesky">
            <p>
              Small win: cutting our onboarding from 7 steps to 3 doubled the share of trials that finished setup this
              month. Wrote up what we removed and why: [link]
            </p>
          </Callout>
          <p>
            Need more starting points? The{" "}
            <Link href="/tools/threads-post-generator">Threads post generator</Link> gives you post ideas you can trim to
            300 characters for Bluesky, and the{" "}
            <Link href="/tools/threads-tools">free Threads tools</Link> cover bios, hashtags and previews.
          </p>
        </>
      ),
    },
    {
      id: "replies",
      title: "Why replies matter more than posts",
      body: (
        <>
          <p>
            On both apps, a brand that only posts and never replies looks like a bot. Conversation is the product. Plan
            your time so that replying takes at least as long as posting.
          </p>
          <ul>
            <li>Reply to every reply on your own posts within the first few hours.</li>
            <li>Spend ten minutes a day replying to other people in your niche with something useful, not &quot;great post&quot;.</li>
            <li>On Bluesky, find the custom feeds and starter packs for your topic and follow the people in them.</li>
            <li>On Threads, look at who already comments on your Instagram posts and talk to them there too.</li>
          </ul>
          <Callout kind="warning" title="Don't paste your Instagram captions">
            <p>
              A caption written for a photo, with a wall of hashtags at the end, looks out of place on both apps. Rewrite
              it as something you would say in a conversation.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "run-both",
      title: "How to run both without doubling the work",
      body: (
        <>
          <p>
            You do not need two content plans. You need one idea list and a habit of adapting each idea to the room it
            lands in. The full method is in our guide to{" "}
            <Link href="/guides/how-to-cross-post-on-social-media">cross-posting without looking lazy</Link>; here is the
            short version:
          </p>
          <ol>
            <li>Write the idea once at 300 characters or less.</li>
            <li>For Threads, loosen the tone and end with a question.</li>
            <li>For Bluesky, keep it direct and add the link or the detail.</li>
            <li>Schedule both, then spend the saved time replying.</li>
          </ol>
          <p>
            Poskoo publishes to both. Connect Threads through Meta&apos;s official login and Bluesky with an app password,
            write the post, tick the networks and pick a time. The composer has a <em>Customize</em> tab for each
            network, so the Threads and Bluesky versions can say different things in the same scheduled post. The{" "}
            <Link href="/threads-scheduler">Threads scheduler</Link> and{" "}
            <Link href="/bluesky-scheduler">Bluesky scheduler</Link> pages explain what each supports, and the help
            articles walk through{" "}
            <Link href="/help/schedule-threads-posts">scheduling Threads posts</Link> and{" "}
            <Link href="/help/schedule-bluesky-posts">scheduling Bluesky posts</Link> step by step. Poskoo also
            publishes to Mastodon if you want the fediverse covered directly.
          </p>
          <InlineCta
            title="Schedule Threads and Bluesky from one calendar"
            text="Write once, adjust each version, and publish to both on time. The Free plan covers 2 social accounts and 10 scheduled posts a month."
            tool={{ href: "/tools/threads-character-counter", label: "Check Threads length" }}
          />
        </>
      ),
    },
    {
      id: "30-day-plan",
      title: "A 30-day plan to test both",
      body: (
        <>
          <p>
            Run both apps for a month with the same effort, then keep the one that brings you conversations and clicks.
            Three posts a week on each is enough.
          </p>
          <DayList
            days={[
              {
                title: "Week 1: Set up properly.",
                body: (
                  <>
                    {" "}Claim the same name on both. On Bluesky, set your domain as your handle. Write a <Link href="/tools/threads-bio-generator">bio</Link> that says
                    who you help in one line. Follow 50 relevant accounts on each, using starter packs on Bluesky and
                    your Instagram community on Threads. Post three times on each.
                  </>
                ),
              },
              {
                title: "Week 2: Find your voice.",
                body: (
                  <>
                    {" "}Try each post type from the list above once. Reply to every reply. Spend ten minutes a day
                    replying to other accounts in your niche.
                  </>
                ),
              },
              {
                title: "Week 3: Add links and asks.",
                body: (
                  <>
                    {" "}Share one useful link with context on each app and one post that asks people to do something:
                    answer a question, try a tip, reply with their take. Note which app gives more replies.
                  </>
                ),
              },
              {
                title: "Week 4: Review and decide.",
                body: (
                  <>
                    {" "}Compare the numbers in the next section. Keep the app that wins as your main one and the other
                    as a lighter schedule, or drop it if nothing happened.
                  </>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Mistakes brands make on Threads and Bluesky",
      body: (
        <>
          <p>
            Most brands that give up on these apps make the same few mistakes in their first month. Avoid them and you
            are already ahead of most accounts in your niche.
          </p>
          <h3>Posting like a press release</h3>
          <p>
            &quot;We&apos;re excited to announce&quot; is the fastest way to be ignored. Say what changed and why a
            customer should care, in the words you would use on the phone. &quot;Our shop now opens at 7am on weekdays,
            because half of you asked for coffee before the school run&quot; works better than any announcement.
          </p>
          <h3>Joining only to drop links</h3>
          <p>
            An account that posts nothing but links to its own site gets scrolled past on both apps. A good rule of
            thumb is that most of your posts should be useful on their own, with a link only when it adds something
            the post can&apos;t hold.
          </p>
          <h3>Using a faceless brand voice</h3>
          <p>
            People talk to people. Many small brands do better when the founder or a named team member posts, and the
            bio says who is behind the account. If several people share the account, sign posts with initials so
            replies feel personal.
          </p>
          <h3>Ignoring the room you are in</h3>
          <p>
            Bluesky users often push back on obvious marketing, hype and engagement bait. Threads users are used to
            lifestyle content and creator chatter. A joke that lands on one may fall flat on the other. Read the feeds
            for a week before you post much, and copy the tone, not the content.
          </p>
          <h3>Quitting after two weeks</h3>
          <p>
            Text apps build slowly. Your first posts may get a handful of replies. That is normal. The accounts that grow
            are the ones still replying in month three, when the people they talked to in month one start sharing their
            posts.
          </p>
        </>
      ),
    },
    {
      id: "measure",
      title: "How to tell which one is working",
      body: (
        <>
          <p>
            Follower counts move slowly on text apps. Watch the signals that lead to business instead:
          </p>
          <GuideTable
            caption="What to track during your test"
            head={["Signal", "Why it matters", "Where to find it"]}
            rows={[
              ["Replies per post", "Shows whether people want to talk to you", "Count on each post"],
              ["Profile visits or new follows", "Shows whether a post made people curious", "Threads Insights; follower list on Bluesky"],
              ["Link clicks", "Shows real interest in your offer", "A UTM-tagged link in your analytics"],
              ["Conversations that turn into DMs or leads", "The only signal that pays", "Your inbox and lead list"],
            ]}
          />
          <p>
            Tag every link with a UTM parameter that names the app, so your website analytics shows which one sends
            visitors. The{" "}
            <Link href="/tools/instagram-utm-builder">UTM builder</Link> works for any network: set the source to
            threads or bluesky.
          </p>
          <Callout kind="tip" title="Give it a fair test">
            <p>
              A month of three posts a week is a fair test. A week of one post is not. Decide the test length before you
              start, so a slow first few days don&apos;t make you quit early.
            </p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    {
      label: "TechCrunch: Threads now has more than 400 million monthly active users (August 2025)",
      href: "https://techcrunch.com/2025/08/12/threads-now-has-more-than-400-million-monthly-active-users",
    },
    { label: "Meta: What is the fediverse?", href: "https://about.fb.com/news/2024/06/what-is-the-fediverse/" },
    {
      label: "Bluesky: How to set your domain as your handle",
      href: "https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial",
    },
    { label: "Bluesky: Introducing starter packs", href: "https://bsky.social/about/blog/06-26-2024-starter-packs" },
  ],
};
