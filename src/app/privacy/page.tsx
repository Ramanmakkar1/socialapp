import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { absolute: `Privacy Policy: How ${BRAND.name} Handles Your Instagram Data` },
  description: "Read how Poskoo stores your Instagram, Facebook, Threads and YouTube data, which cookies we use, and how to export or delete your account at any time.",
  alternates: { canonical: "/privacy" },
};
export default function Page() {
  return (
    <PublicShell>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/">Home</Link> / Privacy
      </nav>
      <header className="hero">
        <p className="eyebrow">Legal</p>
        <h1>Privacy policy</h1>
      </header>
      <section style={{ paddingTop: 20 }}>
        <div className={s.prose}>
          <p>{BRAND.name} ({BRAND.company}) helps you schedule social posts and automatically reply to comments and messages on accounts you connect.</p>
          <h2>What we collect</h2>
          <p>Your account email; the social accounts you connect (through each platform&apos;s official login); the posts, comments and messages needed to run the features you turn on; and the contacts (name, email, phone) your followers choose to share.</p>
          <h2>How we use it</h2>
          <p>Only to provide the service: publishing your posts, sending the replies you set up, and showing you analytics. We never sell your data.</p>
          <h2 id="instagram">Instagram and Meta data</h2>
          <p>When you connect an Instagram professional account through Instagram&apos;s official login, you choose to give {BRAND.name} these permissions. We only use them for the features you turn on:</p>
          <ul>
            <li><strong>Profile</strong> (instagram_business_basic): your username, profile picture, follower and media counts, to show which account is connected.</li>
            <li><strong>Publishing</strong> (instagram_business_content_publish): to publish the posts you schedule, at the time you pick.</li>
            <li><strong>Comments</strong> (instagram_business_manage_comments): to read new comments on your posts, show them in your inbox, run your comment rules and post the replies you write.</li>
            <li><strong>Messages</strong> (instagram_business_manage_messages): to send the auto-DMs you set up to people who commented or messaged you, show your DM threads and send the replies you write. We only message people who contacted you first, inside the time window Instagram allows.</li>
            <li><strong>Insights</strong> (instagram_business_manage_insights): reach, likes, comments, saves and account activity, shown on your analytics page.</li>
          </ul>
          <p><strong>Storage.</strong> Instagram access tokens are encrypted (AES-256-GCM) before they are stored and are never shown to anyone. Comments, messages and contacts are stored only so the features above work.</p>
          <p><strong>Retention.</strong> We keep this data while your account is connected. When you disconnect, we delete your tokens straight away. When you ask for deletion (or remove the app in Instagram), we delete your connected-account tokens, posts, messages and contacts within 30 days.</p>
          <p><strong>No selling or sharing.</strong> We never sell Instagram or Meta data, never use it for advertising and never share it with third parties, except service providers that host the service for us.</p>
          <p><strong>Disconnect and delete.</strong> Disconnect any time in Settings → Connected accounts, or remove {BRAND.name} in Instagram (Settings → Website permissions → Apps and websites). See the <a href="/data-deletion">data deletion page</a> for every option.</p>
          <h2 id="youtube">YouTube API Services</h2>
          <p>When you connect a YouTube channel through Google&apos;s official sign-in, you choose to give {BRAND.name} these permissions. We only use them for the features you turn on:</p>
          <ul>
            <li><strong>Upload</strong> (youtube.upload): to upload the videos you schedule to your channel, at the time you pick, with the title, description, tags and visibility you set.</li>
            <li><strong>Read</strong> (youtube.readonly): to show your channel name and avatar in Settings so you know which channel is connected.</li>
          </ul>
          <p><strong>Storage.</strong> Your YouTube refresh token is encrypted (AES-256-GCM) before it is stored and is never shown to anyone. We do not store your videos; YouTube keeps them on your channel.</p>
          <p><strong>Revoking access.</strong> Disconnect any time in Settings → Connected accounts. You can also revoke {BRAND.name} from Google directly: go to <a href="https://myaccount.google.com/permissions" rel="noopener noreferrer" target="_blank">myaccount.google.com/permissions</a>, find our app under &ldquo;Third-party apps &amp; add-ons&rdquo; and remove it. When you disconnect, we delete your token straight away.</p>
          <p><strong>Google&apos;s policies.</strong> When you sign in, Google&apos;s <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">Privacy Policy</a> and <a href="https://www.youtube.com/intl/en_US/Terms" rel="noopener noreferrer" target="_blank">YouTube Terms of Service</a> apply to how Google and YouTube handle your data. Google does not share your personal data with us except your channel name and avatar and the access you grant above.</p>
          <h2>Deleting your data</h2>
          <p>You can disconnect an account or delete everything at any time — see our <a href="/data-deletion">data deletion page</a>.</p>
          <h2 id="cookies">Cookies</h2>
          <p>
            We use only essential cookies — no advertising or cross-site tracking cookies. Specifically:{" "}
            <strong>pf_session</strong> (httpOnly, about 30 days) keeps you logged in after sign-in; and{" "}
            <strong>ig_oauth_state</strong> (httpOnly, up to about 10 minutes, only while you connect Instagram)
            protects the Instagram OAuth flow by matching the state parameter when Meta redirects back to us; and{" "}
            <strong>yt_oauth</strong> (httpOnly, up to about 10 minutes, only while you connect YouTube)
            protects the YouTube OAuth flow the same way when Google redirects back to us. All three are set by our server when you log in or start
            connecting an account.
          </p>
          <p>
            We do not use third-party advertising cookies. This staging site does not load third-party web analytics scripts today. If we enable
            privacy-friendly, env-driven site analytics before launch, we will describe the provider and what it collects in this section — still without
            selling your data or using your information for ads.
          </p>
          <p>
            You can clear or block cookies anytime in your browser settings (often under Privacy, Security, or Site data). Clearing{" "}
            <strong>pf_session</strong> signs you out; you can sign in again whenever you like.
          </p>
          <p>Questions: {BRAND.supportEmail}</p>
        </div>
      </section>
    </PublicShell>
  );
}
