import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import styles from "../app-page.module.css";

export const metadata = { title: "App review guide", robots: { index: false, follow: false } };

const STEPS: { title: string; permission: string; href: string; cta: string; body: string[] }[] = [
  {
    title: "Connect an Instagram professional account",
    permission: "instagram_business_basic",
    href: "/app/settings",
    cta: "Open Settings",
    body: [
      "Click Connect Instagram and log in with Instagram's official login screen. Approve the requested permissions.",
      "Back in Settings, the connected-account card shows the username, profile picture, follower count and post count read from the Instagram API.",
    ],
  },
  {
    title: "Schedule and publish a post",
    permission: "instagram_business_content_publish",
    href: "/app/calendar#new",
    cta: "Open Calendar",
    body: [
      "Click New post, add an image URL and a caption, pick Instagram and choose a time a few minutes from now. Save it as scheduled.",
      "The post appears on the week/month calendar and in the queue. At the scheduled time the background job publishes it and the status turns to Published (or Failed with the reason and a Retry button).",
    ],
  },
  {
    title: "Create a comment rule and see comments",
    permission: "instagram_business_manage_comments",
    href: "/app/auto-dm",
    cta: "Open Auto-DM rules",
    body: [
      "Create a rule with a keyword (for example LINK) and a message. Comment that keyword on the published post from another Instagram account.",
      "Open Inbox → Comments: the comment is listed with its auto-DM status, and you can post a public reply under it.",
    ],
  },
  {
    title: "Auto-DM and DM inbox",
    permission: "instagram_business_manage_messages",
    href: "/app/inbox?tab=messages",
    cta: "Open Inbox → Messages",
    body: [
      "The matching comment gets one private reply (Instagram's private-reply flow, within 7 days of the comment). Send a DM to the business account from the test account.",
      "Inbox → Messages shows the thread. You can reply inside Instagram's 24-hour window; outside the window the reply box is hidden and the app explains why.",
    ],
  },
  {
    title: "View insights",
    permission: "instagram_business_manage_insights",
    href: "/app/analytics",
    cta: "Open Analytics",
    body: [
      "Analytics shows account insights for the last 7 days (reach, accounts engaged, interactions, profile views) and, for each published post, reach, likes, comments and saves.",
    ],
  },
  {
    title: "Disconnect and delete data",
    permission: "Deauthorize + data deletion callbacks",
    href: "/data-deletion",
    cta: "Data deletion page",
    body: [
      "Settings → Disconnect wipes the stored token. Removing the app in Instagram calls our deauthorize callback; a data-deletion request deletes tokens, posts, messages and contacts and returns a status link (/data-deletion/status).",
    ],
  },
];

export default async function ReviewGuidePage() {
  await requireUser();
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}><p className={styles.eyebrow}>A clear path through the product</p><h1 className={styles.title}>App review guide</h1><p className={styles.subtitle}>
          A 5-minute walkthrough of every Instagram permission {BRAND.name} uses. See the{" "}
          <Link href="/privacy#instagram" className="text-brand hover:underline">privacy policy</Link> for how this data is stored.
        </p></div>
        <div className={styles.heroArt}><Image src="/landing/card-dm.webp" width={900} height={900} alt="A creator sending automatic direct messages" /></div>
      </header>
      <ol className={styles.steps}>
        {STEPS.map((s) => (
          <li key={s.title} className={styles.step}>
            <div className={styles.stepTop}>
              <h2 className={styles.stepTitle}>{s.title}</h2>
              <code className={styles.permission}>{s.permission}</code>
            </div>
            <ul className={styles.body}>
              {s.body.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Link href={s.href} className={`btn-primary ${styles.stepAction}`}>{s.cta}</Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
