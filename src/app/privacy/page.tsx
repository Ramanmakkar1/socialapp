import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = withSocial({
  title: { absolute: `Privacy Policy: How ${BRAND.name} Protects Your Data` },
  description: "Read how Poskoo uses and protects your Google, YouTube, Instagram, Facebook and Threads data, including encryption, access controls and deletion options.",
  alternates: { canonical: "/privacy" },
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": BRAND.canonicalUrl + "/privacy#webpage",
      url: BRAND.canonicalUrl + "/privacy",
      name: "Privacy policy",
      inLanguage: "en",
      isPartOf: { "@id": BRAND.canonicalUrl + "#website" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BRAND.canonicalUrl + "/" },
        { "@type": "ListItem", position: 2, name: "Privacy", item: BRAND.canonicalUrl + "/privacy" },
      ],
    },
  ],
};

export default function Page() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/">Home</Link> / Privacy
      </nav>
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Legal</p>
          <h1>Privacy policy</h1>
        </div>
        <div className="hero-art"><AnimArt name="legal" label="A calm creator holds a shield with a check mark next to a padlock, a key and a neat document" /></div>
      </header>
      <section style={{ paddingTop: 20 }}>
        <div className={s.prose}>
          <p>{BRAND.name} ({BRAND.company}) helps you schedule social posts and automatically reply to comments and messages on accounts you connect.</p>
          <p>Last updated: November 14, 2026.</p>
          <h2>What we collect</h2>
          <p>Your account email; the social accounts you connect (through each platform&apos;s official login); the posts, comments and messages needed to run the features you turn on; and the contacts (name, email, phone) your followers choose to share.</p>
          <h2>How we use it</h2>
          <p>Only to provide the service: publishing your posts, sending the replies you set up, and showing you analytics. We never sell your data.</p>
          <h2 id="google-sign-in">Sign in with Google</h2>
          <p>If you choose Sign in with Google, we receive your Google account identifier, email address, email verification status and name. We use this information to create or identify your {BRAND.name} account and sign you in. Google sign-in does not by itself grant access to your YouTube channel. We never receive or store your Google password.</p>
          <h2 id="data-protection">How we protect Google user data and other sensitive information</h2>
          <p>We use technical safeguards to protect the confidentiality and integrity of Google user data and other sensitive information against unauthorized access, disclosure, alteration and loss. These safeguards apply to Google sign-in information, YouTube channel information, OAuth credentials and the content you provide for publishing:</p>
          <ul>
            <li><strong>Encryption in transit.</strong> Our website uses HTTPS (TLS) to protect data sent between your browser and {BRAND.name}. Requests to Google&apos;s sign-in, token and YouTube API endpoints also use HTTPS.</li>
            <li><strong>Encryption of stored credentials.</strong> We encrypt YouTube OAuth refresh tokens with AES-256-GCM before storing them in our database. The encryption key and OAuth client secrets are held in server environment configuration, separately from the encrypted database records. Tokens are decrypted on the server only when needed to perform the features you authorize and are not displayed in the interface.</li>
            <li><strong>Account access controls.</strong> Protected account pages and actions require an authenticated session, and connected YouTube channel records are accessed using the signed-in user&apos;s account identifier. Session credentials use Secure, HttpOnly and SameSite cookies in production, with only a hash of the session token stored in the database. If you create a password for {BRAND.name}, it is stored as a salted scrypt hash.</li>
            <li><strong>OAuth safeguards.</strong> Google sign-in and YouTube connection use OAuth authorization codes, PKCE and a state parameter to protect the connection process. Temporary OAuth flow cookies are encrypted and expire after about 10 minutes. Google sign-in also validates the returned identity token and nonce.</li>
            <li><strong>Control over access.</strong> We request permissions for the features described in this policy. You can disconnect YouTube in Settings → Connected accounts, which clears the stored refresh token, or revoke our access in your Google account. You can also request deletion using our <Link href="/data-deletion">data deletion page</Link>.</li>
          </ul>
          <p>No method of transmission or storage can guarantee absolute security. For a privacy or data security concern, contact <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.</p>
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
          <p><strong>Disconnect and delete.</strong> Disconnect any time in Settings → Connected accounts, or remove {BRAND.name} in Instagram (Settings → Website permissions → Apps and websites). See the <Link href="/data-deletion">data deletion page</Link> for every option.</p>
          <h2 id="youtube">YouTube API Services</h2>
          <p>When you connect a YouTube channel through Google&apos;s official sign-in, you choose to give {BRAND.name} these permissions. We only use them for the features you turn on:</p>
          <ul>
            <li><strong>Upload</strong> (youtube.upload): to upload the videos you schedule to your channel, at the time you pick, with the title, description, tags and visibility you set.</li>
            <li><strong>Read</strong> (youtube.readonly): to show your channel name and avatar in Settings so you know which channel is connected.</li>
          </ul>
          <p><strong>Storage.</strong> Your YouTube refresh token is encrypted (AES-256-GCM) before it is stored and is never shown to anyone. We do not store your videos; YouTube keeps them on your channel.</p>
          <p><strong>Sharing and retention of Google data.</strong> We do not sell, rent or share Google user data (your channel name, avatar and access token) with anyone, and we never use it for advertising or to train AI or machine-learning models. We keep it only while your YouTube channel is connected; when you disconnect or delete your account it is deleted straight away (backups roll off within 30 days). Video files you upload for a scheduled post are deleted from our server as soon as YouTube has published them.</p>
          <p><strong>Limited Use.</strong> {BRAND.name}&apos;s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener noreferrer" target="_blank">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
          <p><strong>Revoking access.</strong> Disconnect any time in Settings → Connected accounts. You can also revoke {BRAND.name} from Google directly: go to <a href="https://myaccount.google.com/permissions" rel="noopener noreferrer" target="_blank">myaccount.google.com/permissions</a>, find our app under &ldquo;Third-party apps &amp; add-ons&rdquo; and remove it. When you disconnect, we delete your token straight away.</p>
          <p><strong>Google&apos;s policies.</strong> Google&apos;s <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">Privacy Policy</a> and, when you connect YouTube, the <a href="https://www.youtube.com/intl/en_US/Terms" rel="noopener noreferrer" target="_blank">YouTube Terms of Service</a> apply to how Google and YouTube handle your data. We access the Google sign-in and YouTube information described above only when you authorize the corresponding feature.</p>
          <h2>Deleting your data</h2>
          <p>You can disconnect an account or delete everything at any time — see our <Link href="/data-deletion">data deletion page</Link>.</p>
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
