import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// General guidance only. No invented statistics: tactics are described as things to test,
// and the 2-week plan asks readers to judge results from their own Insights.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          To get more comments on Instagram, give people something easy and worth saying: ask one specific question,
          share an opinion they can agree or disagree with, or offer something by DM when they comment a keyword. Then
          reply to every comment quickly, so each post turns into a conversation instead of a one-way broadcast.
        </strong>
      </p>
      <p>
        Most posts get few comments for a simple reason: they don&apos;t ask for any, or they ask in a way that takes
        effort to answer. &quot;Thoughts?&quot; is hard. &quot;Which one would you pick, A or B?&quot; is easy.
      </p>
      <p>
        Below are 12 tactics that work for creators and small businesses, sample captions you can adapt, a reply
        routine, and a two-week plan to find out which ones work for your audience. The last part shows how to turn
        those comments into DMs and leads, so the conversation doesn&apos;t end in the comment section.
      </p>
    </>
  ),
  sections: [
    {
      id: "why-comments-matter",
      title: "Why do comments matter on Instagram?",
      body: (
        <>
          <p>
            A comment is the strongest sign that someone cared enough to stop and type. It matters for three reasons:
          </p>
          <ul>
            <li>
              <strong>It shows interest.</strong> A post people talk about is usually a post they found useful, funny or
              relatable. That is the kind of content worth making more of.
            </li>
            <li>
              <strong>It builds the relationship.</strong> Every comment is a chance to reply, and a reply is often the
              first real contact between you and a future customer.
            </li>
            <li>
              <strong>It is social proof.</strong> New viewers scroll the comments to decide whether an account is
              worth following. An active, friendly comment section makes that decision easy.
            </li>
          </ul>
          <p>
            Comments are not the only thing to aim for. Saves and shares also show a post was useful. But comments are
            the one engagement that opens a two-way conversation, and conversations are where followers turn into
            buyers.
          </p>
          <h3>Count good comments, not just comments</h3>
          <p>
            Ten thoughtful replies from people in your niche are worth more than fifty emoji from strangers. When you
            review a post, read the comments and ask: did people share their own situation, ask a follow-up question or
            tag a friend who needs it? Those are the comments that lead to followers, DMs and sales. A post full of
            one-word replies may look busy, but it tells you little about what your audience wants next.
          </p>
        </>
      ),
    },
    {
      id: "12-tactics",
      title: "12 ways to get more comments on Instagram",
      body: (
        <>
          <h3>1. Ask one specific question</h3>
          <p>
            Ask something people can answer in a few words. &quot;What&apos;s your biggest challenge?&quot; is broad.
            &quot;What&apos;s the one room in your house you&apos;d redo first?&quot; is easy and fun to answer.
          </p>
          <h3>2. Give them two options</h3>
          <p>
            &quot;A or B?&quot; posts work because choosing takes a second. Show two outfits, two logo drafts, two
            recipes or two ways to solve a problem, and ask which one they would pick.
          </p>
          <h3>3. Share an opinion</h3>
          <p>
            A clear point of view invites people to agree, add to it or push back. &quot;Unpopular opinion: you
            don&apos;t need a content calendar until you post three times a week.&quot; Keep it honest and respectful;
            the goal is a discussion, not a fight.
          </p>
          <h3>4. Ask for their tip</h3>
          <p>
            End a tips post with &quot;What would you add?&quot; People like sharing what they know, and the answers
            often become ideas for your next post.
          </p>
          <h3>5. Use a keyword call to action</h3>
          <p>
            &quot;Comment GUIDE and I&apos;ll send you the checklist&quot; gives a concrete reason to comment. Pair it
            with <Link href="/instagram-auto-dm">comment-to-DM automation</Link> so every commenter gets the link
            straight away, even when you are offline.
          </p>
          <h3>6. Fill in the blank</h3>
          <p>
            &quot;My go-to weeknight dinner is ____.&quot; Blanks are quick to finish and the replies are fun to read,
            which brings people back to the comment section.
          </p>
          <h3>7. Ask for feedback before you make something</h3>
          <p>
            &quot;I&apos;m making a guide on pricing your services. What should it cover?&quot; People comment when
            they can shape what you make, and you get a ready-made outline.
          </p>
          <h3>8. Put the question on screen</h3>
          <p>
            Many people watch Reels without reading the caption. Put the question in the last frame or as text on the
            video, and say it out loud. A strong opening line matters too: write a few with the{" "}
            <Link href="/tools/instagram-hook-generator">Instagram hook generator</Link>.
          </p>
          <h3>9. Pin a good comment</h3>
          <p>
            Pin a thoughtful comment, or your own comment with the question, at the top. It shows newcomers what kind of
            replies you are hoping for.
          </p>
          <h3>10. Reply with a question</h3>
          <p>
            When someone comments, answer and ask something back. A single comment can become a short thread, and
            threads make the post look lively.
          </p>
          <h3>11. Run a simple series</h3>
          <p>
            &quot;Part 3 of 5: comment which tool you want covered next.&quot; A series gives people a reason to come
            back and a reason to vote.
          </p>
          <h3>12. Hold a giveaway, carefully</h3>
          <p>
            A giveaway that asks people to comment can bring a burst of activity. Keep the prize related to your topic
            so you attract the right people, follow Instagram&apos;s promotion rules, and don&apos;t rely on it every
            week. Use the free <Link href="/tools/instagram-comment-picker">comment picker</Link> to choose a winner
            fairly.
          </p>
        </>
      ),
    },
    {
      id: "sample-captions",
      title: "Sample captions that invite comments",
      body: (
        <>
          <p>
            Adapt these to your niche. Each one ends with an ask that takes seconds to answer.
          </p>
          <Callout kind="example" title="Caption examples">
            <p>
              <strong>Bakery:</strong> &quot;Two new flavours drop on Friday and we can only make one this week.
              Pistachio rose or salted honey? Tell us below.&quot;
            </p>
            <p>
              <strong>Fitness coach:</strong> &quot;Three exercises I&apos;d keep if I could only do three. What&apos;s
              your one non-negotiable move?&quot;
            </p>
            <p>
              <strong>Real estate agent:</strong> &quot;Open kitchen or a separate dining room? This listing has both,
              and buyers always split on it.&quot;
            </p>
            <p>
              <strong>Freelance designer:</strong> &quot;I made a free brand checklist I use with every client. Comment
              CHECKLIST and I&apos;ll send it to you.&quot;
            </p>
            <p>
              <strong>Plant shop:</strong> &quot;Finish the sentence: the plant I keep killing is ____. We&apos;ll
              reply with a fix.&quot;
            </p>
          </Callout>
          <p>
            Need more starting points? The <Link href="/tools/instagram-caption-generator">Instagram caption
            generator</Link> gives you drafts to edit in your own voice.
          </p>
        </>
      ),
    },
    {
      id: "question-vs-keyword",
      title: "Question or keyword: which call to action should you use?",
      body: (
        <>
          <p>
            Both get comments, but they do different jobs. Use each on purpose.
          </p>
          <GuideTable
            caption="Question prompts vs keyword prompts"
            head={["", "Question prompt", "Keyword prompt"]}
            rows={[
              ["Example", "\"Which one would you pick?\"", "\"Comment GUIDE for the checklist\""],
              ["Best for", "Conversation, ideas, community", "Delivering a link, file or offer"],
              ["What you get", "Varied replies you can learn from", "A list of interested people"],
              ["Follow-up", "Reply in the comments", "An automatic DM with the link"],
              ["Use it", "On most posts", "On posts tied to a resource or product"],
            ]}
          />
          <p>
            A good rhythm is mostly question posts, with a keyword post when you have something worth sending. If every
            post asks for a keyword, the comment section turns into a wall of one-word replies and loses the
            conversation that makes people stay.
          </p>
        </>
      ),
    },
    {
      id: "reply-strategy",
      title: "How to reply to comments so people come back",
      body: (
        <>
          <p>
            Getting comments is half the job. How you reply decides whether people comment again next time.
          </p>
          <ul>
            <li>
              <strong>Reply early.</strong> Set aside the first half hour after posting to answer. Early replies keep
              the thread moving while the post is being shown to people.
            </li>
            <li>
              <strong>Write real replies.</strong> &quot;Thanks!&quot; ends the conversation. &quot;Thanks! Did you try
              it with oat milk?&quot; continues it.
            </li>
            <li>
              <strong>Use their name and details.</strong> Mention what they said, so the reply could only be for them.
            </li>
            <li>
              <strong>Answer questions fully.</strong> If the answer is long, reply briefly and offer to send more by
              DM.
            </li>
            <li>
              <strong>Handle criticism calmly.</strong> Thank people for honest feedback, fix what is fair and move on.
              Remove spam and abuse without arguing.
            </li>
          </ul>
          <Callout kind="tip" title="Block out reply time">
            <p>
              Scheduling your posts frees up the time to reply. Plan the week with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link>, then spend the minutes after each post goes
              live in the comments instead of on the upload screen.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "avoid-engagement-bait",
      title: "What to avoid: engagement bait and comment pods",
      body: (
        <>
          <p>
            Some tactics raise comment counts without raising anything that matters. Skip them.
          </p>
          <ul>
            <li>
              <strong>Engagement bait.</strong> &quot;Comment YES if you agree&quot; on posts that have nothing to do
              with the ask. It trains people to comment without reading and fills your posts with noise.
            </li>
            <li>
              <strong>Comment pods.</strong> Groups that agree to comment on each other&apos;s posts give you comments
              from people who will never buy from you, and they make your real audience harder to read in Insights.
            </li>
            <li>
              <strong>Bought comments.</strong> Fake comments look fake. They can also trigger your automations and
              waste your monthly DM allowance.
            </li>
            <li>
              <strong>Reposting other people&apos;s content.</strong> Instagram&apos;s{" "}
              <Ext href="https://creators.instagram.com/recommendations-and-Originality">originality update</Ext>, posted
              on April 30, 2024, says accounts that mostly repost others&apos; content can lose eligibility for
              recommendations. Original posts give people something new to talk about.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "comments-to-leads",
      title: "Turn comments into DMs and leads",
      body: (
        <>
          <p>
            A comment is public and short. A DM is private and personal, which is where questions about prices,
            bookings and products actually get answered. Moving the right comments into DMs is how comments become
            customers.
          </p>
          <p>
            Comment-to-DM automation does this for you. Someone comments your keyword, and they get a private message
            with the link, file or answer you set up. It uses Meta&apos;s official{" "}
            <Ext href="https://developers.facebook.com/docs/instagram-platform/private-replies/">private replies</Ext>{" "}
            feature, which allows one message per comment within 7 days of it.
          </p>
          <p>
            In Poskoo you add up to 10 keywords to a rule, write the DM once, and attach it to any post or Reel. You can
            ask for an email before the link is sent, so each comment can become a contact in your Leads list. The full
            setup, with keyword lists and DM templates, is in our{" "}
            <Link href="/guides/instagram-comment-to-dm-automation-guide">comment-to-DM automation playbook</Link>.
          </p>
          <InlineCta
            title="Reply to every keyword comment automatically"
            text="Add a keyword to your next post and Poskoo sends the link to everyone who comments it. The Free plan includes 500 auto-DMs a month."
            tool={{ href: "/instagram-auto-dm", label: "See Instagram auto-DM" }}
          />
        </>
      ),
    },
    {
      id: "two-week-plan",
      title: "A 2-week plan to get more comments",
      body: (
        <>
          <p>
            Test a few tactics on purpose instead of changing everything at once. This plan assumes three or four posts
            a week.
          </p>
          <DayList
            days={[
              {
                title: "Days 1-2: Get a baseline.",
                body: (
                  <>
                    {" "}Note the comments on your last 10 posts and run them through the{" "}
                    <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link>. This is
                    your starting point.
                  </>
                ),
              },
              {
                title: "Days 3-7: Test question posts.",
                body: (
                  <>
                    {" "}Publish two or three posts that each end with one specific question (tactics 1, 2 and 6). Put
                    the question on screen as well as in the caption. Reply to every comment within the first hour.
                  </>
                ),
              },
              {
                title: "Days 8-10: Test a keyword post.",
                body: (
                  <>
                    {" "}Make one post that offers a useful resource by DM and set up a comment-to-DM rule for it. Track
                    comments, DMs sent and link clicks.
                  </>
                ),
              },
              {
                title: "Days 11-13: Test an opinion or series post.",
                body: (
                  <>
                    {" "}Share a clear opinion or start a short series and ask what people want next.
                  </>
                ),
              },
              {
                title: "Day 14: Review.",
                body: (
                  <>
                    {" "}Compare comments per post and engagement rate with your baseline. Keep the two tactics that
                    worked best and drop the rest.
                  </>
                ),
              },
            ]}
          />
          <p>
            Instagram Insights lets you look back over a period of up to 90 days, according to{" "}
            <Ext href="https://help.instagram.com/iphone-app/788388387972460">Instagram&apos;s Help Center</Ext>, so
            note your numbers each week if you want a longer record. For the bigger picture on growth, read{" "}
            <Link href="/guides/how-to-get-more-instagram-followers">how to get more Instagram followers</Link>.
          </p>
        </>
      ),
    },
  ],
  sources: [
    { label: "Instagram Creators: Recommendations and originality", href: "https://creators.instagram.com/recommendations-and-Originality" },
    { label: "Meta for Developers: Instagram private replies", href: "https://developers.facebook.com/docs/instagram-platform/private-replies/" },
    { label: "Instagram Help Center: Insights for professional accounts", href: "https://help.instagram.com/iphone-app/788388387972460" },
  ],
};
