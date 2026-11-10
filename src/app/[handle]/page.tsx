import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLatestPosts, getPublicBioPage, themeFor } from "@/lib/bioPage";
import { isDbConfigured } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import styles from "./bio-public.module.css";

type Props = { params: Promise<{ handle: string }> };

function handleFromParam(raw: string): string | null {
  if (!raw.startsWith("@")) return null;
  return raw.slice(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const name = handleFromParam(handle);
  const page = name && isDbConfigured() ? await getPublicBioPage(name) : null;
  if (!page) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }
  return {
    title: `${page.display_name} (@${page.handle})`,
    description: page.bio || `Links from ${page.display_name} on Poskoo.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${BRAND.url}/${handle}` },
  };
}

export default async function PublicBioPage({ params }: Props) {
  const { handle } = await params;
  const name = handleFromParam(handle);
  if (!name || !isDbConfigured()) notFound();
  const page = await getPublicBioPage(name);
  if (!page) notFound();

  const theme = themeFor(page.theme);
  const posts = await getLatestPosts(page.user_id, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${page.display_name} (@${page.handle})`,
    url: `${BRAND.url}/@${page.handle}`,
    mainEntity: {
      "@type": "Person",
      name: page.display_name,
      alternateName: `@${page.handle}`,
      url: `${BRAND.url}/@${page.handle}`,
    },
  };

  return (
    <main
      className={styles.page}
      style={{ background: theme.bg, color: theme.ink }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className={styles.shell}>
        <header className={styles.header}>
          {page.avatar_url ? (
            <Image
              className={styles.avatar}
              src={page.avatar_url}
              alt={`${page.display_name} profile picture`}
              width={96}
              height={96}
              unoptimized
            />
          ) : (
            <span className={styles.avatarFallback} style={{ background: theme.accent }} aria-hidden="true">
              {page.display_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <h1 className={styles.name}>{page.display_name}</h1>
          <p className={styles.handle}>@{page.handle}</p>
          {page.bio ? <p className={styles.bio}>{page.bio}</p> : null}
        </header>

        <nav className={styles.links} aria-label="Links">
          {page.links.map((link) => (
            <a
              key={link.id}
              className={styles.link}
              style={{ background: theme.card, color: theme.ink, borderColor: theme.accent }}
              href={link.short_code ? `/l/${link.short_code}` : link.url}
              rel="nofollow noopener"
            >
              <span>{link.label}</span>
              <span className={styles.arrow} style={{ color: theme.accent }} aria-hidden="true">→</span>
            </a>
          ))}
        </nav>

        {posts.length > 0 ? (
          <section className={styles.posts} aria-labelledby="latest-posts">
            <h2 id="latest-posts" className={styles.postsTitle}>Latest posts</h2>
            <div className={styles.grid}>
              {posts.map((post) => (
                <article key={post.id} className={styles.post} style={{ background: theme.card }}>
                  {post.imageUrl ? (
                    <Image
                      className={styles.postImage}
                      src={post.imageUrl}
                      alt={post.caption.slice(0, 120) || "Instagram post"}
                      width={400}
                      height={400}
                      sizes="(max-width: 640px) 45vw, 220px"
                      unoptimized
                    />
                  ) : (
                    <p className={styles.postText}>{post.caption.slice(0, 140)}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <footer className={styles.footer}>
          <Link href="/" className={styles.brand}>Made with Poskoo</Link>
        </footer>
      </div>
    </main>
  );
}
