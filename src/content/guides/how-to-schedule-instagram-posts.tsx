import Link from "next/link";
import { Callout, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Platform steps and limits come from Meta's own help pages, opened November 13, 2026.
const SRC = {
  instagramHelp: "https://help.instagram.com/",
  metaSuite: "https://www.facebook.com/business/tools/meta-business-suite",
  metaHelp: "https://www.facebook.com/business/help/",
};

/* ---------- Article ---------- */

export const body: GuideBody = {
  intro: (
    <>
      <p>
        You can schedule Instagram posts for free in the Instagram app (Professional accounts), in Meta Business Suite,
        or with a scheduler like Poskoo that also auto-publishes Reels, carousels and Stories. All three use Meta&apos;s
        official tools, so none of them needs your password.
      </p>
      <p>
        The method you pick depends on how much you post and where you work. The in-app option is quickest for one
        post on your phone. Meta Business Suite is free and good for Facebook plus Instagram. A dedicated scheduler
        adds a queue, a calendar and automation, which matters once you post several times a week or manage more than
        one account.
      </p>
      <p>
        Scheduling is not the same as drafting. A draft stays unpublished until you finish it, while a scheduled post
        has a date and time and goes out automatically. That difference matters when you batch a week of content on
        Sunday and want it to publish without opening the app every day.
      </p>
      <Callout kind="tip" title="The short version">
        <p>
          Switch to a Professional account, then use <strong>Advanced settings &gt; Schedule</strong> in the Instagram
          app, or the Planner in Meta Business Suite. For Reels, carousels, Stories and comment-to-DM in one place, use
          a scheduler such as Poskoo.
        </p>
      </Callout>
    </>
  ),
  sections: [
    {
      id: "instagram-app",
      title: "Can you schedule Instagram posts in the Instagram app?",
      body: (
        <>
          <p>
            Yes. Instagram lets Professional accounts schedule feed posts, Reels and carousels from the app. The option
            sits inside the post composer, so you create the post as usual and then choose a future date instead of
            tapping Share straight away.
          </p>
          <ol>
            <li>Open Instagram and start a new post, then add your photo or video and edit it.</li>
            <li>Write your caption, add tags and choose any other settings you normally use.</li>
            <li>On the final screen, open <strong>Advanced settings</strong> and turn on <strong>Schedule</strong>.</li>
            <li>Pick the date and time, then confirm. The post moves to your scheduled posts list.</li>
          </ol>
          <p>
            The exact labels can move between app versions, so look for the scheduling toggle on the last screen
            before you publish. You can review or reschedule a post from your scheduled content before it goes live.
          </p>
          <Callout kind="warning" title="Professional account required">
            <p>
              Scheduling in the app is only offered on Instagram Business and Creator accounts. If you cannot see the
              option, switch your account type in settings first. Switching is free.
            </p>
          </Callout>
          <p>
            The in-app scheduler is fine for a single post, but it is slow for a week of content and it does not cover
            other networks. That is where the next two methods help.
          </p>
          <p>
            One practical limit: the app is built for posting from your phone, so you cannot easily prepare a month of
            content on a laptop and send it to the app. If your media already lives on your computer, a desktop tool
            saves a lot of transferring. The app also does not replace a content calendar, so you still need to
            remember what you planned for next week.
          </p>
        </>
      ),
    },
    {
      id: "meta-business-suite",
      title: "How to schedule with Meta Business Suite",
      body: (
        <>
          <p>
            <Ext href={SRC.metaSuite}>Meta Business Suite</Ext> is free and works on desktop and mobile. It schedules
            to your Facebook Page and any Instagram Professional account linked to it, and it keeps everything in one
            planner.
          </p>
          <ol>
            <li>Go to Meta Business Suite and choose the Facebook Page and Instagram account you want to post to.</li>
            <li>Open <strong>Planner</strong> or <strong>Create post</strong>, then select Instagram as the destination.</li>
            <li>Add your media, caption and any tags. Check the preview for each network before you continue.</li>
            <li>Choose <strong>Schedule</strong>, set the date and time, and confirm.</li>
            <li>Open the calendar to check the post is in the right slot, and edit it there if you need to.</li>
          </ol>
          <p>
            Business Suite is a solid free choice if Facebook and Instagram are your only channels. It is less useful
            when you also post to <Link href="/linkedin-scheduler">LinkedIn</Link>,{" "}
            <Link href="/youtube-scheduler">YouTube</Link>,{" "}
            <Link href="/threads-scheduler">Threads</Link>{" "}
            or <Link href="/bluesky-scheduler">Bluesky</Link>, because you would need a second tool for those.
          </p>
          <p>
            It also works well for a small team. You can leave a post scheduled and let someone else review the
            calendar, which is harder to do when the post only exists on one person&apos;s phone. For a local business
            that posts the same offer to Facebook and Instagram, this is often all the tooling you need.
          </p>
          <Callout kind="tip" title="Check the time zone">
            <p>
              Business Suite shows times in the time zone set on the account or device. If you plan posts for an
              audience in another country, confirm the zone before you save, or the post can go out hours early or
              late.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "poskoo",
      title: "How to schedule Instagram posts with Poskoo",
      body: (
        <>
          <p>
            Poskoo is a scheduler built for Instagram-first creators. It publishes feed posts, Reels, carousels and
            Stories, and it can attach a comment-to-DM rule to the same post. Setup takes a few minutes.
          </p>
          <ol>
            <li>
              <strong>Connect Instagram through the official Meta login.</strong> You sign in on Meta&apos;s own
              screen and approve access. Poskoo never asks for your Instagram password.
            </li>
            <li>
              <strong>Create a post and add your media and caption.</strong> Upload the image or video, write the
              caption, and choose the format: feed post, Reel, carousel or Story.
            </li>
            <li>
              <strong>Pick a date and time in your time zone.</strong> The calendar shows the slot in the zone you
              selected, so you can plan around your audience rather than guess.
            </li>
            <li>
              <strong>Optionally attach a comment-to-DM keyword rule.</strong> Choose a keyword and the message or link
              to send, and the rule starts when the post publishes.
            </li>
            <li>
              <strong>Check the queue and calendar.</strong> Confirm the post sits in the right slot, then leave it.
              Poskoo publishes it at the scheduled time and shows a clear success or failure status.
            </li>
          </ol>
          <p>
            The free plan covers 2 social accounts and 10 scheduled posts a month, plus 500 auto-DMs, so you can test
            the whole flow before paying. See <Link href="/pricing">Poskoo pricing</Link> for the paid limits.
          </p>
          <p>
            After a post is in the queue you can still edit, reschedule or delete it. If publishing fails, the post
            shows a clear failure status instead of disappearing, so you can fix the media or caption and try again.
            That feedback loop is the main reason to use a scheduler rather than a reminder on your phone. For
            screenshots-free click-by-click steps and fixes for failed posts, see the{" "}
            <Link href="/help/schedule-instagram-posts">Instagram post scheduling help article</Link>.
          </p>
          <InlineCta
            title="Schedule your first Instagram post free"
            text="Connect Instagram with Meta's official login, add a caption and pick a time. No credit card needed."
            tool={{ href: "/tools/instagram-scheduling-checklist", label: "Open the scheduling checklist" }}
          />
        </>
      ),
    },
    {
      id: "which-method",
      title: "Which method should you use?",
      body: (
        <>
          <p>
            All three methods are free to start. The right one depends on whether you need Stories, carousels, other
            networks or comment-to-DM automation.
          </p>
          <GuideTable
            caption="Instagram scheduling methods compared (November 2026)"
            head={["Method", "Cost", "Stories", "Carousels", "Multiple platforms", "Auto-DM"]}
            rows={[
              ["Instagram app", "Free", "Limited", "Yes", "No", "No"],
              ["Meta Business Suite", "Free", "Yes", "Yes", "Facebook and Instagram only", "No"],
              ["Poskoo", "Free plan, then paid", "Yes", "Yes", "Yes", "Yes"],
            ]}
          />
          <p>
            Use the Instagram app for a one-off post you are already composing on your phone. Use Meta Business Suite
            if you only manage Facebook and Instagram and want a free desktop planner. Use Poskoo when you want one
            queue for several networks, reliable Reels and Story publishing, or a keyword rule that DMs everyone who
            comments.
          </p>
          <p>
            If you are still choosing a tool, our{" "}
            <Link href="/guides/cheapest-social-media-scheduling-tools-2026">
              comparison of the cheapest social media scheduling tools
            </Link>{" "}
            breaks down real monthly costs.
          </p>
        </>
      ),
    },
    {
      id: "best-time",
      title: "Best time to schedule Instagram posts",
      body: (
        <>
          <p>
            There is no single best time for every account. Your audience&apos;s habits, your time zone and the format
            all change the answer. A sensible starting point is to post when your followers are usually active, then
            adjust using your own results after a few weeks.
          </p>
          <p>
            Use the <Link href="/tools/best-time-to-post-on-instagram">best time to post on Instagram tool</Link> to
            get a starting window for your niche and time zone. Then schedule a small batch, compare reach and
            engagement across slots, and keep the times that work for you.
          </p>
          <Callout kind="tip" title="Consistency beats a perfect slot">
            <p>
              Posting three good posts at a reasonable time each week usually beats chasing a perfect hour. A queue
              makes that consistency easy.
            </p>
          </Callout>
          <p>
            Treat any suggested time as a test, not a rule. Feed posts, Reels and Stories are consumed differently, so
            a slot that works for a carousel may be wrong for a Reel. Run one change at a time for a couple of weeks
            and keep a simple note of what you posted and when. If a time consistently underperforms, move it rather
            than adding more posts to compensate.
          </p>
        </>
      ),
    },
    {
      id: "common-mistakes",
      title: "Common mistakes to avoid",
      body: (
        <>
          <h3>Getting the time zone wrong</h3>
          <p>
            A post scheduled for 9am in the wrong zone can publish at 3am for your audience. Check the zone in the
            tool before you save, especially if you travel or manage accounts in another country.
          </p>
          <h3>Using the wrong aspect ratio</h3>
          <p>
            Instagram crops or letterboxes media that does not match the format. Check the{" "}
            <Link href="/tools/instagram-image-size">Instagram image size guide</Link> for feed posts, carousels and
            Stories, and confirm Reels use a vertical 9:16 frame before you upload. The{" "}
            <Link href="/tools/social-media-image-sizes">social media image sizes reference</Link> covers the other
            networks too.
          </p>
          <h3>Scheduling from a personal account</h3>
          <p>
            Personal accounts cannot use the in-app scheduler or most third-party tools. Switch to a Professional
            account first; it is free and you can switch back later.
          </p>
          <h3>Forgetting to check the queue</h3>
          <p>
            A scheduled post is not a published post. Open the calendar after you batch your content and confirm every
            slot is filled, especially around holidays and launches.
          </p>
          <h3>Reusing the same caption everywhere</h3>
          <p>
            A caption written for Facebook often reads oddly on Instagram, and a Story needs shorter text than a feed
            post. Write for the format first, then adapt. The{" "}
            <Link href="/tools/instagram-caption-generator">Instagram caption generator</Link> can give you a starting
            point without copying the same text to every network.
          </p>
          <InlineCta
            title="Plan a week of Instagram posts"
            text="Use the free checklist to prepare media, captions and times, then load them into your scheduler."
            tool={{ href: "/tools/instagram-caption-generator", label: "Write a caption" }}
          />
        </>
      ),
    },
  ],
  sources: [
    { label: "Instagram Help Center", href: SRC.instagramHelp },
    { label: "Meta Business Suite", href: SRC.metaSuite },
    { label: "Meta Business Help Center", href: SRC.metaHelp },
  ],
};
