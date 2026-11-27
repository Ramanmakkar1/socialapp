import Link from "next/link";
import { Callout, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";

const SRC = {
  tiktokStudio: "https://www.tiktok.com/creator",
  tiktokHelp: "https://support.tiktok.com/",
  tiktokApi: "https://developers.tiktok.com/doc/content-posting-api-get-started",
};

const TIKTOK_STATE = networkAvailability("tiktok");

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          You can schedule TikTok videos with TikTok&apos;s own web Studio scheduler on a desktop, up to about 10 days
          ahead, or with a scheduler{TIKTOK_STATE === "live" ? (
            <> that uses TikTok&apos;s official Content Posting API, such as Poskoo, which publishes the video at the
            time you set.</>
          ) : (
            <>
              built on TikTok&apos;s official Content Posting API, such as Poskoo, where TikTok publishing is{" "}
              {availabilityPhrase(TIKTOK_STATE, "TikTok")}.
            </>
          )}
        </strong>{" "}
        Both routes are official, so neither one asks for your TikTok password.
      </p>
      <p>
        Below is how each option works, what you can and cannot schedule, when to post, the size and caption limits,
        and the reasons a scheduled TikTok sometimes fails.
      </p>
      <p>
        {TIKTOK_STATE === "live" ? (
          <>
            Ready to plan a week of TikToks? Open the <Link href="/tiktok-scheduler">TikTok scheduler</Link> to queue
            videos on a calendar, and use the{" "}
            <Link href="/tools/tiktok-caption-generator">TikTok caption generator</Link> to write captions and
            hashtags before you schedule.
          </>
        ) : (
          <>
            Ready to plan a week of TikToks? TikTok publishing in the{" "}
            <Link href="/tiktok-scheduler">TikTok scheduler</Link> is {availabilityPhrase(TIKTOK_STATE, "TikTok")};
            until then, use the <Link href="/tools/tiktok-caption-generator">TikTok caption generator</Link> to write
            captions and hashtags, then post from the TikTok app.
          </>
        )}
      </p>
    </>
  ),
  sections: [
    {
      id: "can-you-schedule-tiktok-videos",
      title: "Can you schedule TikTok videos?",
      body: (
        <>
          <p>
            Yes. TikTok has its own scheduler inside TikTok Studio, the web dashboard for creators, and the app&apos;s
            Content Posting API lets approved tools publish on your behalf. You do not need a business account for
            TikTok Studio, and scheduling a post is free.
          </p>
          <p>
            The two routes suit different jobs. TikTok Studio is enough when TikTok is your only channel and you work
            from a computer. An API-based scheduler such as Poskoo is better when you want TikTok beside Instagram,
            Threads and Facebook in one calendar, or you want a queue that keeps retrying and shows what failed.
          </p>
          <p>
            Scheduling does not change how the video is published. TikTok receives the file and the caption at the
            time you choose, exactly as if you had posted it from the app.
          </p>
        </>
      ),
    },
    {
      id: "how-to-schedule-a-tiktok-in-tiktok-studio",
      title: "How to schedule a TikTok in TikTok Studio",
      body: (
        <>
          <p>
            TikTok Studio is the free scheduler built into TikTok. It works in a desktop browser; the posting screen
            is not available in the same way on the mobile app.
          </p>
          <ol>
            <li>
              <strong>Open TikTok Studio.</strong> Sign in on tiktok.com and open Studio, then choose to upload a video.
            </li>
            <li>
              <strong>Upload the video and write the caption.</strong> Add your file, then write the caption and any{" "}
              <Link href="/tools/tiktok-hashtag-generator">hashtags</Link>. Check the preview so you know how the post will look in the feed.
            </li>
            <li>
              <strong>Set who can see it and the post options.</strong> Pick the audience, and turn comments, Duet and
              Stitch on or off where your account allows them. Disclose branded content if it applies.
            </li>
            <li>
              <strong>Choose Schedule instead of Post.</strong> Pick the date and time, then confirm. TikTok Studio
              shows your scheduled videos in a list where you can edit or delete them before they publish.
            </li>
          </ol>
          <p>
            The main limit is the window. At the time of writing, TikTok Studio accepts a schedule up to about 10 days
            ahead, so a month of content cannot be planned there in one session. It is also desktop-only, and it does
            not manage any other network.
          </p>
        </>
      ),
    },
    {
      id: "how-to-schedule-tiktok-videos-with-poskoo",
      title: "How to schedule TikTok videos with Poskoo",
      body: (
        <>
          <p>
            The <Link href="/tiktok-scheduler">Poskoo TikTok scheduler</Link>{" "}
            {TIKTOK_STATE === "live" ? (
              <>connects through TikTok&apos;s official login and publishes with the Content Posting API.</>
            ) : (
              <>
                uses TikTok&apos;s official login and Content Posting API. TikTok publishing is{" "}
                {availabilityPhrase(TIKTOK_STATE, "TikTok")}, so the steps below apply once it is switched on.
              </>
            )}{" "}
            Here is the full flow, or follow the short{" "}
            <Link href="/help/schedule-tiktok-posts">TikTok scheduling help article</Link> inside the app.
          </p>
          <p><strong>Four steps to schedule a TikTok in Poskoo:</strong></p>
          <ol>
            <li>
              <strong>Connect TikTok</strong> through TikTok&apos;s official login and allow publishing access.
            </li>
            <li>
              <strong>Upload the video and caption</strong> in the composer, then pick the visibility and post options.
            </li>
            <li>
              <strong>Choose the date and time in your time zone</strong> so the post goes out when you expect it to.
            </li>
            <li>
              <strong>Confirm on the calendar</strong> and check the queue, where you can edit, reschedule or delete the
              post before it is due.
            </li>
          </ol>

          <h3>1. Connect TikTok through the official login</h3>
          <p>
            Create your Poskoo account, open Settings and choose to connect TikTok. Sign in on TikTok&apos;s own
            screen and allow publishing access. Poskoo never asks for your TikTok password, and you can revoke access
            from your TikTok account at any time.
          </p>

          <h3>2. Upload the video and write the caption</h3>
          <p>
            Open the composer and add one video, or up to 35 photos for a photo post. Write the caption (the free{" "}
            <Link href="/tools/tiktok-caption-generator">TikTok caption generator</Link> gives you six drafts with a
            hook to start from), then choose the visibility plus the comment, Duet and Stitch settings your account
            supports. You can select Instagram,
            Threads and Facebook Pages in the same composer and adjust the caption for each channel.
          </p>

          <h3>3. Pick the date, time and time zone</h3>
          <p>
            Choose the date and time in the composer. Times are shown in your browser&apos;s time zone, so the post goes
            out when you expect it to. The post then appears in your publishing queue and on the week or month
            calendar, where you can edit, reschedule or delete it before it is due.
          </p>

          <h3>4. Check the queue and calendar</h3>
          <p>
            Use the queue to see everything waiting to publish, and the calendar to spot gaps or clashes across
            channels. A post you move on the calendar keeps the same caption and media, so rescheduling is one edit
            rather than a rebuild.
          </p>

          <h3>5. See the published or failed status</h3>
          <p>
            When the scheduled time arrives, Poskoo sends the post through TikTok&apos;s API and records the result.
            Open the queue to see Published or Failed status. A failed post keeps the error, so you can fix the cause
            and retry the same post instead of uploading it again.
          </p>
          <InlineCta
            title="Put your next TikTok on the calendar"
            text="Connect TikTok with the official login and schedule your first video."
            tool={{ href: "/tools/best-time-to-post-on-tiktok", label: "Find a posting time" }}
          />
        </>
      ),
    },
    {
      id: "tiktok-studio-vs-poskoo",
      title: "TikTok Studio vs Poskoo",
      body: (
        <>
          <p>
            Both tools publish through TikTok, so pick based on where you work and how many channels you manage.
          </p>
          <GuideTable
            caption="TikTok Studio and Poskoo compared"
            head={["", "TikTok Studio", "Poskoo"]}
            rows={[
              ["Schedule window", "About 10 days ahead", "Plan ahead on a week or month calendar"],
              ["Mobile or desktop", "Desktop web", "Browser, with the queue and calendar in one place"],
              ["Multiple networks", "TikTok only", "TikTok, Instagram, Threads and Facebook Pages"],
              ["Calendar view", "List of scheduled videos", "Week and month calendar across channels"],
              ["Retries", "Re-schedule or re-upload manually", "Retry a failed post after fixing the cause"],
            ]}
          />
          <p>
            TikTok Studio has no per-post fee and no setup beyond signing in. Poskoo also starts on a free plan; check
            the current plan details on the pricing page before you commit to a long campaign.
          </p>
        </>
      ),
    },
    {
      id: "best-time-to-post-on-tiktok",
      title: "Best time to post on TikTok",
      body: (
        <>
          <p>
            There is no single best time that works for every account. The right time depends on where your audience
            lives, when they open TikTok and what else is happening that day. A time that works for a US audience is
            the middle of the night for viewers in Europe.
          </p>
          <p>
            Start with your own data. TikTok analytics show when your followers are active, so compare that with the
            times you already post. Then test one change at a time: keep the content similar and move the posting time,
            so you can tell whether the time made a difference.
          </p>
          <p>
            A steady schedule of a few good videos a week is easier to keep than a burst followed by a quiet month. If
            you want a starting point, the{" "}
            <Link href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok finder</Link> suggests times
            based on your audience and time zone, and you can adjust them as your analytics grow.
          </p>
        </>
      ),
    },
    {
      id: "tiktok-video-size-and-caption-limits",
      title: "TikTok video size and caption limits",
      body: (
        <>
          <p>
            TikTok accepts MP4 and MOV video. In Poskoo a video must be at least 3 seconds and no longer than 10
            minutes, with a 1 GB limit per file. Vertical 9:16 video, such as 1080 by 1920, fills the screen best, so
            check the file before you upload it.
          </p>
          <p>
            A video post has one caption, which is the title field in TikTok&apos;s API. A photo post is different: the
            first caption line becomes the title, up to 90 characters, and the rest becomes the description, up to
            4,000 characters. A photo post takes up to 35 photos, and each photo can be a JPG up to 20 MB. A post is
            either one video or photos, not both.
          </p>
          <p>
            Use the <Link href="/tools/tiktok-video-size-checker">TikTok video size checker</Link> to confirm the
            resolution and ratio, and the <Link href="/tools/tiktok-caption-counter">TikTok caption counter</Link> to
            keep the caption inside the limit and preview how it truncates. When you add hashtags, build a small,
            relevant set with the <Link href="/tools/tiktok-hashtag-generator">TikTok hashtag generator</Link> rather
            than filling the caption with generic tags.
          </p>
          <Callout kind="tip" title="Check the file before you schedule">
            <p>
              A video that is too long, too large or in the wrong format fails at publish time, not when you upload it.
              Confirm the length, size and 9:16 frame first, then schedule.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "common-reasons-a-scheduled-tiktok-fails",
      title: "Common reasons a scheduled TikTok fails",
      body: (
        <>
          <p>Most failed TikTok posts have a clear cause and a quick fix.</p>
          <ul>
            <li>
              <strong>The connection expired.</strong> Reconnect TikTok in Settings, then retry the post. Access can
              expire or be revoked from your TikTok account.
            </li>
            <li>
              <strong>Posting permission was not granted.</strong> When you connect, allow the publishing scope.
              Without it, TikTok rejects the post even though the account shows as connected.
            </li>
            <li>
              <strong>The video breaks a limit.</strong> A file that is under 3 seconds, over 10 minutes, over 1 GB or
              in the wrong format is rejected. Re-cut it, then retry.
            </li>
            <li>
              <strong>The visibility is not available.</strong> TikTok tells the scheduler which audience options your
              account can use. If the chosen one changes, edit the post, pick a visibility again and retry.
            </li>
            <li>
              <strong>The daily posting limit is reached.</strong> TikTok caps how many posts an account can publish
              through apps in a day. Wait until the next day, then retry.
            </li>
            <li>
              <strong>Photo posts link to the wrong place.</strong> TikTok only pulls photo posts from a verified media
              domain, so upload the photos in the scheduler instead of linking them from another site.
            </li>
          </ul>
          <p>
            After a failure, fix the cause before you retry. Retrying the same post without changing anything usually
            produces the same error.
          </p>
          <Callout kind="tip" title="Keep a simple scheduling routine">
            <p>
              Plan the week in one session, write captions at the same time and leave a gap between videos. Then check
              the queue once a day for failed posts. A short weekly review is enough to keep the calendar moving
              without checking every hour.
            </p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    { label: "TikTok Studio", href: SRC.tiktokStudio },
    { label: "TikTok Help Center", href: SRC.tiktokHelp },
    { label: "TikTok Content Posting API", href: SRC.tiktokApi },
  ],
};
