import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import { BRAND } from "@/lib/brand";
import { AudienceSchedulerPage, type AudiencePageContent } from "@/components/AudienceSchedulerPage";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import { getPlatformCopy, pendingNetworksText } from "@/lib/platform-support";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-scheduler-for-ecommerce";
const title = `Social Media Scheduler for Ecommerce Brands | ${BRAND.name}`;
const description =
  "Schedule product drops to Instagram, Facebook and Threads, DM the product link to every “link?” comment, and see which posts send clicks to your store.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
});

const pinterestLive = getPlatformCopy().catalog.find((e) => e.id === "pinterest")?.live ?? false;

const content: AudiencePageContent = {
  path: PATH,
  crumb: "Social media scheduler for ecommerce",
  description,
  pill: "Product drops · link-by-DM · click tracking",
  h1Lead: "Social media scheduler for",
  h1Em: "ecommerce brands",
  lede:
    "Launches live or die on timing and on how fast you answer “link?”. Poskoo publishes your product posts on time, DMs the product link to everyone who comments, and counts the clicks each post sends to your store.",
  heroArt: "card-schedule",
  heroArtLabel: "A shop owner pins product launch posts to a weekly calendar beside a friendly alarm clock",
  jobsTitle: "What an online store needs from social",
  jobsIntro: "For a store, a post is only worth it if it sends shoppers to a product page. These are the jobs Poskoo takes off your plate.",
  jobs: [
    { title: "Launch on the minute", text: "Queue the teaser, the drop and the reminder for Instagram, Facebook Pages and Threads so every post goes out at the time you announced." },
    { title: "Answer “link?” and “price?” instantly", text: "A keyword rule DMs the product link to every commenter, so nobody waits for you to reply and nobody goes cold." },
    { title: "See which posts sell", text: "Links sent in DMs are tracked, so you see the clicks each rule earned instead of guessing." },
    { title: "Build a launch list", text: "Ask for an email before sending the early-access link, then export the list for your next drop." },
  ],
  workflowTitle: "A product launch week",
  workflow: [
    { title: "Monday: tease it", text: "Schedule a Story and a Threads post with a close-up and the launch date. No link yet." },
    { title: "Wednesday: the drop", text: "Schedule an Instagram carousel and a Facebook Page album of 2 to 10 photos. Ask people to comment SIZE or LINK." },
    { title: "Wednesday: the DM does the selling", text: "The rule sends the size guide and the product page link (add UTM tags with the free UTM builder) to every commenter." },
    { title: "Friday: remind and review", text: "Duplicate the drop post as a “last sizes” reminder, then compare clicks for each rule to plan the next launch." },
  ],
  featuresEyebrow: "Built for stores",
  featuresTitle: "From the feed",
  featuresEm: "to the product page.",
  featuresIntro: "Poskoo is not a storefront. It is the part between your post and your product page, done automatically.",
  features: [
    { name: "Instagram", text: "Carousels, Reels, feed posts and Stories, with a first comment on feed posts if you want one." },
    { name: "Facebook Pages", text: "Text, one photo, an album of 2 to 10 photos, or a video." },
    { name: "Threads", text: "Text up to 500 characters with one image or video." },
    { name: "Comment-to-DM", text: "Keyword rules that DM the product link to every commenter through Instagram's official API." },
    { name: "Tracked links", text: "Clicks on links sent in DMs, counted for each rule." },
    { name: "Inbox", text: "Reply to comments and DMs that need a human, in one place." },
  ],
  featuresArt: "analytics",
  featuresArtLabel: "A shop owner waters a growing bar chart of product link clicks",
  limitsTitle: "What Poskoo does not do for stores",
  limits:
    "Poskoo does not sync your product catalogue, tag products in posts or run ads. Its own checkout is for digital products only, so physical goods are sold on your store and Poskoo sends people there. Auto-DM works on Instagram only.",
  faqs: [
    { q: "Can Poskoo send the product link when someone comments?", a: "Yes. Set a keyword such as LINK on the post. When someone comments it, Poskoo sends your DM with the product page link through Instagram's official API." },
    { q: "Does Poskoo connect to Shopify or WooCommerce?", a: "No. Poskoo does not read your catalogue. Paste the product page link into the DM and the post; Poskoo tracks the clicks." },
    { q: "Can I schedule carousels and Facebook albums?", a: "Yes. Instagram carousels and Facebook Page albums of 2 to 10 photos can both be scheduled from the same calendar." },
    { q: "Can I schedule Pinterest Pins?", a: pinterestLive ? "Yes. Connect Pinterest with its official login, pick a board, add the image, title and link, and schedule the Pin on the same calendar." : "Not yet. Pinterest publishing is built and waiting for Pinterest to approve Poskoo's API access." },
    { q: "How do I know which post sold?", a: "Poskoo counts clicks on the links it sends in DMs for each rule, and each rule belongs to a post. Add UTM tags to the link so your store analytics shows the sales from each post too." },
  ],
  related: [
    { href: "/instagram-scheduler", label: "Instagram scheduler" },
    { href: "/facebook-scheduler", label: "Facebook Page scheduler" },
    { href: "/instagram-dm-automation", label: "Instagram DM automation" },
    { href: "/tools/instagram-utm-builder", label: "UTM builder" },
    { href: "/tools/instagram-carousel-maker", label: "Carousel maker" },
    { href: "/social-media-scheduler-for-small-business", label: "Scheduler for small business" },
  ],
  ctaTitle: "Plan the next drop",
  ctaEm: "on one calendar.",
  ctaText: "Start free, connect Instagram and your Facebook Page, and set your first link-by-DM rule.",
  featureList: [
    "Instagram carousel, Reel and Story scheduling",
    "Facebook Page album scheduling",
    "Threads scheduling",
    "Instagram comment-to-DM with product links",
    "Link click tracking",
    "Email capture in DMs",
  ],
};

export default function SocialMediaSchedulerForEcommercePage() {
  const c: AudiencePageContent = {
    ...content,
    limits: [pendingNetworksText(["pinterest", "gbp"]), content.limits].filter(Boolean).join(" "),
    faqs: content.faqs.map((faq) => {
      if (faq.q === "Can I schedule Pinterest Pins?") {
        const pin = networkAvailability("pinterest");
        if (pin === "live") {
          return {
            ...faq,
            a: "Yes. Connect Pinterest, pick a board, add the product image and link, and choose a time; Poskoo creates the Pin through the official Pinterest API.",
          };
        }
        return {
          ...faq,
          a: `Not yet. Pinterest publishing is ${availabilityPhrase(pin, "Pinterest")}.`,
        };
      }
      return faq;
    }),
  };
  return <AudienceSchedulerPage c={c} />;
}
