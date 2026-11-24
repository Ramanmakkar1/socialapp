// Team invite landing page (migration 054). Public (logged-out invitees land here from the e-mail),
// never indexed. Accepting needs the invite's own e-mail address to be signed in.
import type { Metadata } from "next";
import Link from "next/link";
import AuthFrame from "@/app/login/AuthFrame";
import a from "@/app/login/auth.module.css";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";
import { getCurrentUser } from "@/lib/auth";
import { normalizeEmail } from "@/lib/password";
import { previewInvite } from "@/lib/team";
import { acceptInviteAction } from "./actions";

export const metadata: Metadata = { title: "Team invite", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function InvitePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { token } = await params;
  const { error } = await searchParams;
  const [inv, user] = await Promise.all([previewInvite(token), getCurrentUser()]);

  if (!inv.ok) {
    return (
      <AuthFrame title="Invite not available" lede={inv.error}>
        <div className={a.stack}><Link className="btn btn-dark" href={user ? "/app" : "/login"}>{user ? "Open my dashboard" : "Log in"}</Link></div>
      </AuthFrame>
    );
  }

  const roleText = inv.role === "admin" ? "an admin" : inv.publishMode === "approval" ? "a member (your posts wait for approval)" : "a member";
  const lede = <>You were invited to join <b>{inv.workspace}</b> on Poskoo as {roleText}.</>;
  const wrongAccount = user && normalizeEmail(user.email) !== normalizeEmail(inv.email);

  return (
    <AuthFrame title={`Join ${inv.workspace}`} lede={lede}>
      {typeof error === "string" && <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>{error.slice(0, 300)}</p>}
      {!user ? (
        <div className={a.stack} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p className={ui.hint}>The invite was sent to <b>{inv.email}</b>. Log in or create a Poskoo account with that email to accept it.</p>
          <a className="btn btn-dark" href={`/invite/${encodeURIComponent(token)}/start?to=login`}>Log in to accept</a>
          <a className="btn btn-line" href={`/invite/${encodeURIComponent(token)}/start?to=signup`}>Create an account</a>
        </div>
      ) : wrongAccount ? (
        <div className={a.stack} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p className={ui.hint}>
            You are signed in as <b>{user.email}</b>, but this invite was sent to <b>{inv.email}</b>. Log out and log in with that email to accept it.
          </p>
          <Link className="btn btn-line" href="/app">Open my dashboard</Link>
        </div>
      ) : (
        <form action={acceptInviteAction} className={a.stack} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="token" value={token} />
          <p className={ui.hint}>Signed in as <b>{user.email}</b>.</p>
          <SubmitButton label="Accept invite" pendingLabel="Joining…" />
        </form>
      )}
    </AuthFrame>
  );
}
