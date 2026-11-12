"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BIO_MAX_BIO, BIO_MAX_LABEL, BIO_MAX_LINKS, BIO_MAX_NAME, BIO_THEMES, themeFor, type BioPage } from "@/lib/bioPageShared";
import { Btn } from "@/components/ui/kit";
import SubmitButton from "@/components/ui/SubmitButton";
import { saveBioPageAction } from "./actions";
import styles from "./bio.module.css";

type DraftLink = { id: string; label: string; url: string };

export default function BioEditor({ page }: { page: BioPage | null }) {
  const [links, setLinks] = useState<DraftLink[]>(
    page?.links.map((link) => ({ id: link.id, label: link.label, url: link.url })) ?? [
      { id: "", label: "", url: "" },
    ],
  );

  // Live preview state for the uncontrolled profile fields (read from the form on every change).
  const [profile, setProfile] = useState({
    handle: page?.handle ?? "",
    name: page?.display_name ?? "",
    bio: page?.bio ?? "",
    avatar: page?.avatar_url ?? "",
    theme: page?.theme ?? "sunrise",
  });

  function readForm(form: HTMLFormElement) {
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "");
    setProfile({ handle: get("handle"), name: get("display_name"), bio: get("bio"), avatar: get("avatar_url"), theme: get("theme") || "sunrise" });
  }

  function update(index: number, field: "label" | "url", value: string) {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  function add() {
    if (links.length >= BIO_MAX_LINKS) return;
    setLinks((prev) => [...prev, { id: "", label: "", url: "" }]);
  }

  function remove(index: number) {
    setLinks((prev) => (prev.length === 1 ? [{ id: "", label: "", url: "" }] : prev.filter((_, i) => i !== index)));
  }

  return (
    <div className={styles.editorLayout}>
    <form action={saveBioPageAction} className={styles.form} onChange={(e) => readForm(e.currentTarget)}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Profile</h2>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Handle</span>
            <div className={styles.handleWrap}>
              <span aria-hidden="true">poskoo.com/@</span>
              <input name="handle" defaultValue={page?.handle ?? ""} placeholder="yourname" maxLength={30} required />
            </div>
          </label>
          <label className={styles.field}>
            <span>Display name</span>
            <input name="display_name" defaultValue={page?.display_name ?? ""} maxLength={BIO_MAX_NAME} required />
          </label>
        </div>
        <label className={styles.field}>
          <span>Bio</span>
          <textarea name="bio" defaultValue={page?.bio ?? ""} maxLength={BIO_MAX_BIO} rows={3} placeholder="One line about you or your business" />
        </label>
        <label className={styles.field}>
          <span>Avatar image URL (optional)</span>
          <input name="avatar_url" type="url" defaultValue={page?.avatar_url ?? ""} placeholder="https://…" />
        </label>
        <fieldset className={styles.field}>
          <legend>Colour theme</legend>
          <div className={styles.themes}>
            {BIO_THEMES.map((theme) => (
              <label key={theme.id} className={styles.themeOption} style={{ background: theme.bg, color: theme.ink }}>
                <input type="radio" name="theme" value={theme.id} defaultChecked={(page?.theme ?? "sunrise") === theme.id} />
                <span className={styles.themeDot} style={{ background: theme.accent }} aria-hidden="true" />
                {theme.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className={styles.check}>
          <input type="checkbox" name="published" defaultChecked={page?.published ?? true} />
          Publish my page
        </label>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Links</h2>
          <span className={styles.muted}>{links.length}/{BIO_MAX_LINKS}</span>
        </div>
        <p className={styles.muted}>Each link gets a tracked short link, so you can see clicks on this page.</p>
        <div className={styles.links}>
          {links.map((link, index) => (
            <div key={link.id || `new-${index}`} className={styles.linkRow}>
              <input type="hidden" name="link_id" value={link.id} />
              <label className={styles.field}>
                <span>Label</span>
                <input
                  name="link_label"
                  value={link.label}
                  onChange={(e) => update(index, "label", e.target.value)}
                  maxLength={BIO_MAX_LABEL}
                  placeholder="Shop the collection"
                />
              </label>
              <label className={styles.field}>
                <span>Link</span>
                <input
                  name="link_url"
                  value={link.url}
                  onChange={(e) => update(index, "url", e.target.value)}
                  type="url"
                  placeholder="https://…"
                />
              </label>
              <button type="button" className={styles.remove} onClick={() => remove(index)} aria-label={`Remove ${link.label || "link"}`}>
                <Trash2 width={16} height={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <Btn type="button" variant="line" size="sm" onClick={add} disabled={links.length >= BIO_MAX_LINKS}>
          <Plus width={16} height={16} aria-hidden="true" /> Add link
        </Btn>
      </section>

      <div className={styles.actions}>
        <SubmitButton label="Save page" pendingLabel="Saving…" />
      </div>
    </form>
    <BioPreview profile={profile} links={links} />
    </div>
  );
}

function BioPreview({
  profile,
  links,
}: {
  profile: { handle: string; name: string; bio: string; avatar: string; theme: string };
  links: DraftLink[];
}) {
  const theme = themeFor(profile.theme);
  const shown = links.filter((l) => l.label.trim() || l.url.trim());
  const name = profile.name.trim() || "Your name";
  const safeAvatar = /^https:\/\//.test(profile.avatar.trim()) ? profile.avatar.trim() : "";
  return (
    <aside className={styles.previewCol} aria-label="Live preview of your link-in-bio page">
      <p className={styles.previewLabel}>Live preview</p>
      <div className={styles.previewPhone}>
        <div className={styles.previewScreen} style={{ background: theme.bg, color: theme.ink }}>
          <p className={styles.previewUrl}>poskoo.com/@{profile.handle.trim() || "yourname"}</p>
          {safeAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-provided avatar URL from any host
            <img src={safeAvatar} alt="" className={styles.previewAvatar} />
          ) : (
            <span className={styles.previewAvatar} style={{ background: theme.accent, color: theme.bg }} aria-hidden="true">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <p className={styles.previewName}>{name}</p>
          {profile.bio.trim() ? <p className={styles.previewBio}>{profile.bio}</p> : null}
          <div className={styles.previewLinks}>
            {shown.length === 0 ? (
              <span className={styles.previewLink} style={{ background: theme.card, color: theme.ink, opacity: 0.6 }}>Your first link</span>
            ) : (
              shown.map((l, i) => (
                <span key={l.id || `p-${i}`} className={styles.previewLink} style={{ background: theme.card, color: theme.ink, borderColor: theme.accent }}>
                  {l.label.trim() || l.url.trim()}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
