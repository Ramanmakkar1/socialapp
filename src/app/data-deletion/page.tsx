import { BRAND } from "@/lib/brand";
export const metadata = { title: "Data deletion" };
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 leading-7 text-ink-2">
      <h1 className="mb-6 text-3xl font-semibold text-ink">Delete your data</h1>
      <ol className="list-decimal space-y-2 pl-5">
        <li>In {BRAND.name}, open Settings → Connected accounts and click Disconnect, or</li>
        <li>Remove {BRAND.name} from your Instagram/Facebook settings (Apps and websites), or</li>
        <li>Email {BRAND.supportEmail} from your account email asking us to delete everything.</li>
      </ol>
      <p className="mt-6">We delete your connected-account tokens, posts, messages and contacts within 30 days of the request.</p>
    </main>
  );
}
