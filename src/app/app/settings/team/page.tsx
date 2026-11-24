// Settings → Team (migration 054): invite people, choose who publishes directly and who needs
// approval, manage pending invites, rename the workspace, or leave a workspace you were invited to.
import { Users } from "lucide-react";
import { BtnLink, PageHero } from "@/components/ui/kit";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";
import { listTeam, teamLimitsFor } from "@/lib/team";
import { roleAtLeast, requireWorkspace, workspaceLabel } from "@/lib/workspace";
import styles from "../../app-page.module.css";
import team from "./team.module.css";
import {
  inviteAction,
  leaveWorkspaceAction,
  removeMemberAction,
  renameWorkspaceAction,
  resendInviteAction,
  revokeInviteAction,
  updateMemberAction,
} from "./actions";

export const metadata = { title: "Team" };

const DONE: Record<string, string> = {
  invited: "Invite sent. It expires in 7 days.",
  resent: "Invite sent again with a fresh link.",
  revoked: "Invite revoked.",
  updated: "Member updated.",
  removed: "Member removed. Their posts waiting for approval went back to drafts.",
  renamed: "Workspace renamed.",
};

function RoleFields({ role, mode, idSuffix }: { role: "admin" | "member"; mode: "direct" | "approval"; idSuffix: string }) {
  return (
    <>
      <label className={ui.field}>
        <span className={ui.hint}>Role</span>
        <select name="role" defaultValue={role} className={ui.input} id={`role-${idSuffix}`}>
          <option value="member">Member: creates and schedules posts</option>
          <option value="admin">Admin: also manages channels, settings and the team</option>
        </select>
      </label>
      <label className={ui.field}>
        <span className={ui.hint}>Publishing</span>
        <select name="publishMode" defaultValue={mode} className={ui.input} id={`mode-${idSuffix}`}>
          <option value="direct">Publishes directly</option>
          <option value="approval">Needs approval (members only)</option>
        </select>
      </label>
    </>
  );
}

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ done?: string; error?: string }> }) {
  const ctx = await requireWorkspace();
  const canManage = roleAtLeast(ctx.role, "admin");
  const sp = await searchParams;
  const [{ members, invites }, limits] = await Promise.all([listTeam(ctx.ownerId), teamLimitsFor(ctx.ownerId)]);
  const name = workspaceLabel({ workspace_name: ctx.owner.workspaceName, name: ctx.owner.name, email: ctx.owner.email });
  const seatsUsed = members.length + invites.length;
  const seatsLeft = Math.max(0, limits.members - seatsUsed);
  const done = typeof sp.done === "string" ? DONE[sp.done] : undefined;
  const error = typeof sp.error === "string" ? sp.error.slice(0, 300) : undefined;

  return (
    <div className={styles.page}>
      <PageHero
        title="Team"
        lede={`Who can work in ${name}. Members create and schedule posts; admins also manage channels, settings and the team.`}
        icon={<Users width={20} height={20} />}
        action={canManage ? <BtnLink href="/app/settings" variant="line" size="sm">Back to settings</BtnLink> : undefined}
      />
      {done && <p role="status" className={ui.notice}>{done}</p>}
      {error && <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>{error}</p>}

      {ctx.role === "owner" && (
        <section className={styles.section} aria-labelledby="ws-name-heading">
          <h2 id="ws-name-heading" className={styles.sectionTitle}>Workspace name</h2>
          <form action={renameWorkspaceAction} className={team.inline}>
            <label className={`${ui.field} ${team.grow}`}>
              <span className="sr-only">Workspace name</span>
              <input className={ui.input} name="name" maxLength={60} defaultValue={ctx.owner.workspaceName ?? ""} placeholder={name} />
            </label>
            <SubmitButton label="Save" size="sm" variant="line" />
          </form>
          <p className={ui.hint}>Shown in the workspace switcher and in invite e-mails.</p>
        </section>
      )}

      {canManage && (
        <section className={styles.section} aria-labelledby="invite-heading">
          <div className={styles.sectionHeader}>
            <h2 id="invite-heading" className={styles.sectionTitle}>Invite someone</h2>
            <span className={ui.hint}>
              {limits.enforced ? `${seatsUsed} of ${limits.members} seats used on the ${limits.plan} plan` : `${seatsUsed} ${seatsUsed === 1 ? "seat" : "seats"} used`}
            </span>
          </div>
          {limits.members <= 0 ? (
            <p className={ui.hint}>
              Team members are part of the Pro (2 seats) and Agency (10 seats) plans.{" "}
              {ctx.isOwnWorkspace && <BtnLink href="/app/settings/billing" size="sm">See plans</BtnLink>}
            </p>
          ) : seatsLeft === 0 ? (
            <p className={ui.hint}>Every seat is taken. Remove someone or revoke an invite to add another person.</p>
          ) : (
            <form action={inviteAction} className={team.inviteForm}>
              <label className={`${ui.field} ${team.grow}`}>
                <span className={ui.hint}>Email</span>
                <input className={ui.input} type="email" name="email" required maxLength={254} placeholder="teammate@company.com" autoComplete="off" />
              </label>
              <RoleFields role="member" mode="direct" idSuffix="new" />
              <SubmitButton label="Send invite" pendingLabel="Sending…" />
            </form>
          )}
        </section>
      )}

      <section className={styles.section} aria-labelledby="members-heading">
        <h2 id="members-heading" className={styles.sectionTitle}>Members</h2>
        <ul className={team.list}>
          <li className={team.row}>
            <div className={team.who}>
              <span className={team.avatar} aria-hidden="true">{(ctx.owner.name || ctx.owner.email).slice(0, 1).toUpperCase()}</span>
              <div>
                <b>{ctx.isClient ? name : ctx.owner.name || ctx.owner.email}</b>
                <span className={ui.hint}>{ctx.isClient ? "Client workspace" : ctx.owner.email}</span>
              </div>
            </div>
            <span className={`${ui.pill} ${team.ownerPill}`}>Owner</span>
          </li>
          {members.map((m) => (
            <li key={m.userId} className={team.row}>
              <div className={team.who}>
                <span className={team.avatar} aria-hidden="true">{(m.name || m.email).slice(0, 1).toUpperCase()}</span>
                <div>
                  <b>{m.name || m.email}{m.userId === ctx.user.id ? " (you)" : ""}</b>
                  <span className={ui.hint}>{m.email}</span>
                </div>
              </div>
              {canManage ? (
                <div className={team.manage}>
                  <form action={updateMemberAction} className={team.inline}>
                    <input type="hidden" name="memberId" value={m.userId} />
                    <RoleFields role={m.role} mode={m.publishMode} idSuffix={m.userId} />
                    <SubmitButton label="Save" size="sm" variant="line" />
                  </form>
                  <form action={removeMemberAction}>
                    <input type="hidden" name="memberId" value={m.userId} />
                    <SubmitButton label={m.userId === ctx.user.id ? "Leave" : "Remove"} pendingLabel="Removing…" size="sm" variant="ghost" />
                  </form>
                </div>
              ) : (
                <span className={ui.pill}>{m.role === "admin" ? "Admin" : m.publishMode === "approval" ? "Member · needs approval" : "Member"}</span>
              )}
            </li>
          ))}
        </ul>
        {members.length === 0 && <p className={ui.hint}>No one else is in this workspace yet.</p>}
      </section>

      {canManage && invites.length > 0 && (
        <section className={styles.section} aria-labelledby="invites-heading">
          <h2 id="invites-heading" className={styles.sectionTitle}>Pending invites</h2>
          <ul className={team.list}>
            {invites.map((i) => (
              <li key={i.id} className={team.row}>
                <div className={team.who}>
                  <span className={team.avatar} aria-hidden="true">{i.email.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <b>{i.email}</b>
                    <span className={ui.hint}>
                      {i.role === "admin" ? "Admin" : i.publishMode === "approval" ? "Member · needs approval" : "Member"} · expires {new Date(i.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={team.manage}>
                  <form action={resendInviteAction}>
                    <input type="hidden" name="inviteId" value={i.id} />
                    <SubmitButton label="Resend" pendingLabel="Sending…" size="sm" variant="line" />
                  </form>
                  <form action={revokeInviteAction}>
                    <input type="hidden" name="inviteId" value={i.id} />
                    <SubmitButton label="Revoke" pendingLabel="Revoking…" size="sm" variant="ghost" />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!ctx.isOwnWorkspace && !ctx.isClient && (
        <section className={styles.section} aria-labelledby="leave-heading">
          <h2 id="leave-heading" className={styles.sectionTitle}>Leave {name}</h2>
          <p className={ui.hint}>You lose access to this workspace. Your posts here stay with the workspace.</p>
          <form action={leaveWorkspaceAction}>
            <SubmitButton label="Leave workspace" pendingLabel="Leaving…" size="sm" variant="line" />
          </form>
        </section>
      )}
    </div>
  );
}
