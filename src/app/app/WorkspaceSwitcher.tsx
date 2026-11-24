"use client";

// Sidebar workspace switcher (team workspaces, migration 054): current workspace, the ones you can
// switch to, and "+ New client workspace" on the Agency plan.
import { useEffect, useRef, useState } from "react";
import { Briefcase, Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import Link from "next/link";
import { createClientWorkspaceAction, switchWorkspaceAction } from "./workspaceActions";
import ws from "./workspace.module.css";

export type SwitcherWorkspace = { ownerId: string; name: string; role: "owner" | "admin" | "member"; isClient: boolean };

const ROLE: Record<SwitcherWorkspace["role"], string> = { owner: "Owner", admin: "Admin", member: "Member" };

export default function WorkspaceSwitcher({
  current,
  workspaces,
  canCreateClient,
}: {
  current: SwitcherWorkspace;
  workspaces: SwitcherWorkspace[];
  canCreateClient: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={ws.wrap} ref={box}>
      <button type="button" className={ws.trigger} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={ws.mark} aria-hidden="true">{current.isClient ? <Briefcase width={14} height={14} /> : current.name.slice(0, 1).toUpperCase()}</span>
        <span className={ws.label}>
          <b>{current.name}</b>
          <small>{ROLE[current.role]}{current.isClient ? " · client" : ""}</small>
        </span>
        <ChevronsUpDown width={15} height={15} aria-hidden="true" className={ws.chev} />
      </button>
      {open && (
        <div className={ws.menu} role="menu">
          <p className={ws.menuTitle}>Workspaces</p>
          {workspaces.map((w) => (
            <form key={w.ownerId} action={switchWorkspaceAction}>
              <input type="hidden" name="ownerId" value={w.ownerId} />
              <button type="submit" role="menuitem" className={ws.item} aria-current={w.ownerId === current.ownerId ? "true" : undefined}>
                <span className={ws.mark} aria-hidden="true">{w.isClient ? <Briefcase width={13} height={13} /> : w.name.slice(0, 1).toUpperCase()}</span>
                <span className={ws.label}>
                  <b>{w.name}</b>
                  <small>{ROLE[w.role]}{w.isClient ? " · client" : ""}</small>
                </span>
                {w.ownerId === current.ownerId && <Check width={15} height={15} aria-hidden="true" />}
              </button>
            </form>
          ))}
          <div className={ws.sep} />
          <Link href="/app/settings/team" className={ws.item} role="menuitem" onClick={() => setOpen(false)}>
            <Users width={15} height={15} aria-hidden="true" /> Team &amp; invites
          </Link>
          {canCreateClient &&
            (creating ? (
              <form action={createClientWorkspaceAction} className={ws.create}>
                <input name="name" required minLength={2} maxLength={60} placeholder="Client or brand name" aria-label="Client workspace name" autoFocus />
                <button type="submit">Create</button>
              </form>
            ) : (
              <button type="button" className={ws.item} role="menuitem" onClick={() => setCreating(true)}>
                <Plus width={15} height={15} aria-hidden="true" /> New client workspace
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
