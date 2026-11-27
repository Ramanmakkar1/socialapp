import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import { BRAND } from "@/lib/brand";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { AudienceSchedulerPage, type AudiencePageContent } from "@/components/AudienceSchedulerPage";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-scheduler-for-creators";
const title = `Social Media Scheduler for Creators | ${BRAND.name}`;
const description =
  "Schedule Reels, Shorts and Stories, auto-DM everyone who comments your keyword, and grow an email list with lead magnets. Free plan for creators.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
});

function contentFor(tiktok: ReturnType<typeof networkAvailability>, ai: boolean): AudiencePageContent {
  const limits = tiktok === "live"
    ? `TikTok videos schedule from the same calendar. Auto-DM works on Instagram only. Poskoo has no brand-deal, media-kit or sponsorship tools.${ai ? "" : " AI caption ideas are built and launching soon, so for now you write the captions yourself."}`
    : `TikTok publishing is ${availabilityPhrase(tiktok, "TikTok")}, so you cannot schedule TikToks from Poskoo today. Auto-DM works on Instagram only. Poskoo has no brand-deal, media-kit or sponsorship tools.${ai ? "" : " AI caption ideas are built and launching soon, so for now you write the captions yourself."}`;

  return {
    path: PATH,
    crumb: "Social media scheduler for creators",
    description,
    pill: "Reels, Shorts and Stories · comment-to-DM",
    h1Lead: "Social media scheduler for",
    h1Em: "creators",
    lede:
      "Film in batches, schedule Reels, Shorts and Stories for the week, and let Poskoo send the link to everyone who comments your keyword. The people who asked for your freebie end up on a list you own.",
    heroArt: "card-dm",
    heroArtLabel: "A relaxed creator on a beanbag while DMs fly out of his phone to followers",
    jobsTitle: "What a creator needs from a scheduler",
    jobsIntro: "Posting on time is only half the job. The other half is following up with the people your content reached.",
    jobs: [
      { title: "Keep posting through a filming week", text: "Batch-record on one day, then queue Reels, carousels, Stories and YouTube Shorts so your channels stay active while you edit the next set." },
      { title: "Deliver the freebie you promised", text: "“Comment PRESET and I’ll send it” only works if you actually send it. A keyword rule DMs the link to every commenter, even at 3 a.m." },
      { title: "Catch a Reel that took off", text: "Set the rule late? Send the DM to people who commented in the past 7 days, so a Reel that went viral before you were ready still pays off." },
      { title: "Own your audience", text: "Ask for an email before the link, require a follow if you want one, and export the list to your newsletter tool as a CSV." },
    ],
    workflowTitle: "A filming week, start to finish",
    workflow: [
      { title: "Batch and upload", text: "Upload the week’s Reels and Shorts, write the captions and pick a time for each, or drop them into the next free slots from your posting schedule." },
      { title: "Spread one idea across channels", text: "Send the same video to Instagram and YouTube Shorts, and a text version to Threads, Bluesky or Mastodon from the same calendar." },
      { title: "Attach a keyword rule", text: "On the Reel that offers a freebie, add the keyword and the DM. Turn on the email gate or a follow requirement if you want one." },
      { title: "Review clicks and leads", text: "See who got the DM, who clicked and which emails came in, then export the contacts or hand out a lead magnet file automatically." },
    ],
    featuresEyebrow: "Built for creators",
    featuresTitle: "Everything after the post",
    featuresEm: "goes out on its own.",
    featuresIntro: "These are the parts of Poskoo creators use most. Every plan limit is listed on the pricing page.",
    features: [
      { name: "Instagram", text: "Reels, feed posts, carousels and Stories, published through Meta's official API." },
      { name: "YouTube", text: "Videos and Shorts with title, description, tags and privacy settings." },
      { name: "Comment-to-DM", text: "Keyword rules for comments, Story replies and DMs, with a 7-day replay for past comments." },
      { name: "Lead magnets", text: "Hand out a file or link after the email gate and see how many people got it." },
      { name: "Link in bio", text: "A link-in-bio page with 5 links on Free and 20 on Pro." },
      { name: "Refer and earn", text: "500 bonus auto-DMs a month for each creator you refer who connects an account." },
    ],
    featuresArt: "feat-linkbio",
    featuresArtLabel: "A link-in-bio page with buttons for a creator's freebie, newsletter and latest video",
    limitsTitle: "What Poskoo does not do for creators (yet)",
    limits,
    faqs: [
      { q: "Is the Free plan enough for a creator?", a: "It is enough to test the workflow: 2 social accounts, 10 scheduled posts a month, 500 auto-DMs a month and a link-in-bio page with 5 links. Daily posters usually move to Pro for unlimited scheduling and 2,500 auto-DMs." },
      { q: "Is comment-to-DM allowed on Instagram?", a: "Yes. Poskoo uses Instagram's official messaging API, only messages people who commented or replied first, and never asks for your password." },
      { q: "Can I DM people who commented before I set up the rule?", a: "Yes, for comments from the past 7 days. Use “Send to past comments” on the rule, and Poskoo sends the DM to those commenters once." },
      { q: "Can I schedule TikToks?", a: tiktok === "live" ? "Yes. Poskoo publishes TikTok videos through TikTok's official Content Posting API, next to Instagram, YouTube, Threads, Facebook Pages, LinkedIn, Bluesky and Mastodon." : "Not yet. TikTok publishing is built and waiting for TikTok's API approval. Instagram, YouTube, Threads, Facebook Pages, LinkedIn, Bluesky and Mastodon publish today." },
      { q: "Can I make people follow me before they get the link?", a: "Yes. A rule can ask the person to follow your account first, and Poskoo checks the follow before it sends the link." },
    ],
    related: [
      { href: "/features/instagram-comment-to-dm", label: "Instagram comment-to-DM" },
      { href: "/instagram-link-in-bio", label: "Instagram link in bio" },
      { href: "/youtube-scheduler", label: "YouTube scheduler" },
      { href: "/tools/instagram-hook-generator", label: "Instagram hook generator" },
      { href: "/manychat-alternative", label: "ManyChat alternative" },
      { href: "/linktree-alternative", label: "Linktree alternative" },
    ],
    ctaTitle: "Queue the week.",
    ctaEm: "Send every freebie.",
    ctaText: "Start free, connect Instagram and schedule your first Reel in a few minutes.",
    featureList: [
      "Instagram Reels, carousel and Story scheduling",
      "YouTube video and Shorts scheduling",
      "Instagram comment-to-DM automation",
      "Replay DMs to past comments (7 days)",
      "Email capture and follow requirement in DMs",
      "Lead magnets",
      "Link-in-bio page",
    ],
  };
}

export default async function SocialMediaSchedulerForCreatorsPage() {
  const tiktok = networkAvailability("tiktok");
  const ai = await isFeatureReadyNow("ai");
  return <AudienceSchedulerPage c={contentFor(tiktok, ai)} />;
}
