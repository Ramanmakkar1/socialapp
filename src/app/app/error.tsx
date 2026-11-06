"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-10 sm:px-6">
      <section className={`${ui.card} w-full p-6 text-center sm:p-8`} role="alert">
        <Image
          src="/landing/problem.webp"
          alt=""
          width={900}
          height={900}
          sizes="200px"
          className="mx-auto h-36 w-36 object-contain"
        />
        <p className={ui.eyebrow}>A quick pause</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--poskoo-ink)]" style={{ letterSpacing: "var(--poskoo-type-heading-ls)", lineHeight: "var(--poskoo-type-heading-lh)" }}>
          This dashboard didn&apos;t load
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--poskoo-muted)]">
          Something interrupted this page. Try loading it again, or head back to your dashboard for a fresh start.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Btn type="button" onClick={reset}>
            Try again
          </Btn>
          <Btn type="button" variant="line" onClick={() => router.push("/app")}>
            Back to dashboard
          </Btn>
        </div>
        <p className="mt-5 text-sm text-[var(--poskoo-muted)]">
          Need a hand? <Link href="/help" className={`min-h-11 inline-flex items-center ${ui.link}`}>Visit help</Link>
        </p>
      </section>
    </main>
  );
}
