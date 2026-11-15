import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import { BRAND } from "@/lib/brand";
import { featureReadiness } from "@/lib/featureReadiness";
import { AudienceSchedulerPage, type AudiencePageContent } from "@/components/AudienceSchedulerPage";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-scheduler-for-coaches";
const title = `Social Media Scheduler for Coaches | ${BRAND.name}`;
const description =
  "Schedule LinkedIn and Instagram posts, deliver a free workbook by DM in exchange for an email, and send your booking link to anyone who asks.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
});

const cardPayments = featureReadiness("card_payments", process.env).ready;

const content: AudiencePageContent = {
  path: PATH,
  crumb: "Social media scheduler for coaches",
  description,
  pill: "LinkedIn + Instagram · lead magnets by DM",
  h1Lead: "Social media scheduler for",
  h1Em: "coaches",
  lede:
    "Coaching clients find you through useful posts, then want to talk. Poskoo schedules the posts to LinkedIn and Instagram, hands out your free resource in exchange for an email, and sends your booking link to anyone who asks for it.",
  heroArt: "feat-leads",
  heroArtLabel: "A coach's free workbook turns into a list of email leads with check marks",
  jobsTitle: "From a helpful post to a booked call",
  jobsIntro: "Coaches sell trust, so the job is to stay visible with useful content and make the next step easy for the people who are ready.",
  jobs: [
    { title: "Show up where clients look", text: "Post insights to your personal LinkedIn profile and the same idea as an Instagram carousel, planned on one calendar." },
    { title: "Trade a free resource for an email", text: "“Comment WORKBOOK” posts deliver your PDF by DM after the person shares an email, so every download is a lead you can follow up." },
    { title: "Answer “how do I work with you?”", text: "A DM keyword or a Story reply such as CALL sends your booking link and programme details straight away, without you watching the inbox." },
    { title: "Follow up outside social media", text: "Export contacts as a CSV with the rule that captured them, then import them into your email tool or CRM." },
  ],
  workflowTitle: "A coaching content week",
  workflow: [
    { title: "Monday: a LinkedIn insight", text: "Schedule a text or image post to your LinkedIn profile with one lesson from a client session (with their permission)." },
    { title: "Wednesday: a carousel with a freebie", text: "Schedule an Instagram carousel that ends with “comment WORKBOOK”. Attach the rule, turn on the email gate and pick the lead magnet." },
    { title: "Friday: a Story that invites a call", text: "Schedule a Story asking people to reply CALL. A Story-reply rule sends the booking link to everyone who does." },
    { title: "Weekend: follow up", text: "Open Contacts, filter by the WORKBOOK rule and export the new emails to your newsletter or CRM." },
  ],
  featuresEyebrow: "Built for coaches",
  featuresTitle: "Content that leads",
  featuresEm: "to a conversation.",
  featuresIntro: "Poskoo connects the post to the follow-up, so your best content brings in leads you can reach again.",
  features: [
    { name: "LinkedIn", text: "Schedule posts to your personal LinkedIn profile through LinkedIn's official API." },
    { name: "Instagram", text: "Carousels, Reels, feed posts and Stories on the same calendar." },
    { name: "Lead magnets", text: "Deliver a file or link after the email gate and track how many people received it." },
    { name: "DM and Story-reply keywords", text: "Send the booking link when someone DMs or replies with a keyword." },
    { name: "Contacts export", text: "Every lead with their email and the rule that captured them, exported as a CSV." },
    {
      name: "Digital products",
      text: cardPayments
        ? "Sell a workbook or recorded session with card checkout, or take Direct UPI payments in India."
        : "Sell a workbook or recorded session by Direct UPI if you are in India; card checkout is launching soon.",
    },
  ],
  featuresArt: "card-leads",
  featuresArtLabel: "Two friends high-five next to a board of new coaching leads",
  limitsTitle: "What Poskoo does not do for coaches",
  limits:
    "Poskoo is not a booking calendar or a course platform: you send people to your own booking page and deliver programmes elsewhere. It does not sync with a CRM; you export contacts as a CSV. Posting to LinkedIn company Pages is waiting for LinkedIn's approval, so only personal profiles work today. Auto-DM works on Instagram only, not on LinkedIn.",
  faqs: [
    { q: "Can I schedule LinkedIn posts as a coach?", a: "Yes, to your personal LinkedIn profile. Posting to a LinkedIn company Page is built and waiting for LinkedIn's approval." },
    { q: "How do I deliver a free guide by DM?", a: "Create a lead magnet with your file or link, attach it to a comment or Story-reply rule and turn on the email gate. Poskoo asks for the email, then sends the guide." },
    { q: "Can Poskoo send my booking link automatically?", a: "Yes. Set a keyword such as CALL on a DM or Story-reply rule and put your booking page in the message. Poskoo sends it to everyone who uses the keyword." },
    { q: "Does it connect to my email tool?", a: "Not directly. Export your contacts as a CSV and import them into your email or CRM tool. The export includes the rule that captured each person." },
    { q: "Is there a free plan?", a: "Yes: 2 social accounts, 10 scheduled posts a month and 500 auto-DMs a month, with no credit card. That covers one LinkedIn profile and one Instagram account." },
  ],
  related: [
    { href: "/linkedin-scheduler", label: "LinkedIn scheduler" },
    { href: "/instagram-dm-lead-generation", label: "Instagram DM lead generation" },
    { href: "/help/instagram-story-reply-auto-dm", label: "Story-reply auto-DM" },
    { href: "/tools/linkedin-post-generator", label: "LinkedIn post generator" },
    { href: "/instagram-auto-dm/templates", label: "Auto-DM templates" },
  ],
  ctaTitle: "Turn your next post into",
  ctaEm: "a booked call.",
  ctaText: "Start free, connect LinkedIn and Instagram, and set up your first lead magnet.",
  featureList: [
    "LinkedIn personal profile scheduling",
    "Instagram carousel, Reel and Story scheduling",
    "Lead magnets delivered by DM",
    "Email capture in Instagram DMs",
    "DM and Story-reply keyword automation",
    "Contacts CSV export",
  ],
};

export default function SocialMediaSchedulerForCoachesPage() {
  return <AudienceSchedulerPage c={content} />;
}
