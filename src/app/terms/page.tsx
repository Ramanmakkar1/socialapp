import { BRAND } from "@/lib/brand";
export const metadata = { title: "Terms of service", alternates: { canonical: "/terms" } };
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 leading-7 text-ink-2">
      <h1 className="mb-6 text-3xl font-semibold text-ink">Terms of service</h1>
      <p>By using {BRAND.name} you agree to follow the rules of every platform you connect (Instagram, Facebook, Threads and others) and to only send messages people have asked for, for example by commenting a keyword.</p>
      <p className="mt-4">You keep ownership of your content. You can cancel at any time. We may suspend accounts that send spam or break platform rules.</p>
      <p className="mt-8">Contact: {BRAND.supportEmail}</p>
    </main>
  );
}
