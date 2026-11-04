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
      <h2 className="mt-8 text-xl font-semibold text-ink">Deleting your data</h2>
      <p>You can disconnect an account or delete everything at any time — see our <a className="underline" href="/data-deletion">data deletion page</a>.</p>
      <p className="mt-8">Questions: {BRAND.supportEmail}</p>
    </main>
  );
}
