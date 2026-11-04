import { BRAND } from "@/lib/brand";
export const metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 leading-7 text-ink-2">
      <h1 className="mb-6 text-3xl font-semibold text-ink">Privacy policy</h1>
      <p>{BRAND.name} ({BRAND.company}) helps you schedule social posts and automatically reply to comments and messages on accounts you connect.</p>
      <h2 className="mt-8 text-xl font-semibold text-ink">What we collect</h2>
      <p>Your account email; the social accounts you connect (through each platform&apos;s official login); the posts, comments and messages needed to run the features you turn on; and the contacts (name, email, phone) your followers choose to share.</p>
      <h2 className="mt-8 text-xl font-semibold text-ink">How we use it</h2>
      <p>Only to provide the service: publishing your posts, sending the replies you set up, and showing you analytics. We never sell your data.</p>
      <h2 id="instagram" className="mt-8 text-xl font-semibold text-ink">Instagram and Meta data</h2>
      <p>When you connect an Instagram professional account through Instagram&apos;s official login, you choose to give {BRAND.name} these permissions. We only use them for the features you turn on:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li><strong>Profile</strong> (instagram_business_basic): your username, profile picture, follower and media counts, to show which account is connected.</li>
        <li><strong>Publishing</strong> (instagram_business_content_publish): to publish the posts you schedule, at the time you pick.</li>
        <li><strong>Comments</strong> (instagram_business_manage_comments): to read new comments on your posts, show them in your inbox, run your comment rules and post the replies you write.</li>
        <li><strong>Messages</strong> (instagram_business_manage_messages): to send the auto-DMs you set up to people who commented or messaged you, show your DM threads and send the replies you write. We only message people who contacted you first, inside the time window Instagram allows.</li>
        <li><strong>Insights</strong> (instagram_business_manage_insights): reach, likes, comments, saves and account activity, shown on your analytics page.</li>
      </ul>
      <p className="mt-3"><strong>Storage.</strong> Instagram access tokens are encrypted (AES-256-GCM) before they are stored and are never shown to anyone. Comments, messages and contacts are stored only so the features above work.</p>
      <p className="mt-3"><strong>Retention.</strong> We keep this data while your account is connected. When you disconnect, we delete your tokens straight away. When you ask for deletion (or remove the app in Instagram), we delete your connected-account tokens, posts, messages and contacts within 30 days.</p>
      <p className="mt-3"><strong>No selling or sharing.</strong> We never sell Instagram or Meta data, never use it for advertising and never share it with third parties, except service providers that host the service for us.</p>
      <p className="mt-3"><strong>Disconnect and delete.</strong> Disconnect any time in Settings → Connected accounts, or remove {BRAND.name} in Instagram (Settings → Website permissions → Apps and websites). See the <a className="underline" href="/data-deletion">data deletion page</a> for every option.</p>
      <h2 className="mt-8 text-xl font-semibold text-ink">Deleting your data</h2>
      <p>You can disconnect an account or delete everything at any time — see our <a className="underline" href="/data-deletion">data deletion page</a>.</p>
      <p className="mt-8">Questions: {BRAND.supportEmail}</p>
    </main>
  );
}
