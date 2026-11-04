import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of service for the Poskoo app",
  description: "Review the rules for using Poskoo to schedule posts and send auto-DMs, retain ownership of your content, and cancel your account at any time.",
  alternates: { canonical: "/terms" },
};
export default function Page() {
  return (
    <>
    <main className="mx-auto max-w-3xl px-4 py-16 leading-7 text-ink-2">
      <h1 className="mb-6 text-3xl font-semibold text-ink">Terms of service</h1>
      <p>By using {BRAND.name} you agree to follow the rules of every platform you connect (Instagram, Facebook, Threads and others) and to only send messages people have asked for, for example by commenting a keyword.</p>
      <h2 className="mt-8 text-xl font-semibold text-ink">Instagram and Meta</h2>
      <p>When you connect Instagram, you allow {BRAND.name} to read your profile, posts, comments, messages and insights and to publish posts and send replies on your behalf, only for the features you turn on. Auto-DMs only go to people who commented or messaged you, inside the time window Instagram allows. You must follow Meta&apos;s Platform Terms and Instagram&apos;s Community Guidelines. See our <a className="underline" href="/privacy#instagram">privacy policy</a> for how we store this data, and the <a className="underline" href="/data-deletion">data deletion page</a> to disconnect and delete it.</p>
      <p className="mt-4">You keep ownership of your content. You can cancel at any time. We may suspend accounts that send spam or break platform rules.</p>
      <p className="mt-8">Contact: {BRAND.supportEmail}</p>
    </main>
    <SiteFooter />
    </>
  );
}
