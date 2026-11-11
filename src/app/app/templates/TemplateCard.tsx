import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DmTemplate } from "@/lib/dmTemplates";
import { CATEGORIES, categoriesFor, type GoalCategory } from "./categories";
import guide from "../../../../public/app-art/templates/guide.webp";
import product from "../../../../public/app-art/templates/product.webp";
import discount from "../../../../public/app-art/templates/discount.webp";
import book from "../../../../public/app-art/templates/book.webp";
import story from "../../../../public/app-art/templates/story.webp";
import link from "../../../../public/app-art/templates/link.webp";
import styles from "./templateCard.module.css";

type Art = typeof guide;

// Illustration per template: guide / product / discount / book / story, generic link otherwise.
function artFor(t: DmTemplate): Art {
  const kw = t.keywords.map((k) => k.toUpperCase());
  if (t.slug === "story-freebie" || t.slug === "dm-auto-reply") return story;
  if (kw.includes("CODE") || t.slug === "discount-code") return discount;
  if (kw.some((k) => k === "BOOK" || k === "CALL") || t.slug === "book-a-call" || t.slug === "webinar-signup") return book;
  if (t.useCase === "Lead magnets" || t.slug.includes("guide")) return guide;
  if (t.slug === "product-link" || t.slug === "price-request" || t.slug === "affiliate-links") return product;
  return link;
}

const TINT: Record<GoalCategory, string> = { leads: styles.tintLilac, sell: styles.tintPeach, events: styles.tintMint, content: styles.tintPink };

// What the person receives, for the one-line description.
const OUTCOME: Record<string, string> = {
  "free-guide": "they get your guide",
  "email-checklist": "they share an email and get the checklist",
  "follow-bonus": "followers get your bonus",
  "product-link": "they get the product link",
  "price-request": "they get your prices",
  "discount-code": "they get a discount code",
  "webinar-signup": "they get the signup link",
  "book-a-call": "they get your booking link",
  "course-waitlist": "they join the waitlist",
  "recipe-download": "they get the download",
  "giveaway-entry": "they are entered in the giveaway",
  "story-freebie": "they get your freebie",
  "send-link": "they get your link",
  "dm-auto-reply": "they get an instant reply",
  "affiliate-links": "they get your affiliate links",
  "thank-commenters": "they get a thank-you DM",
  portfolio: "they get your portfolio",
};

export function templateDescription(t: DmTemplate): string {
  const story = t.slug === "story-freebie";
  const dm = t.slug === "dm-auto-reply";
  const kw = t.keywords[0];
  const who = dm
    ? `Someone DMs ${kw ?? "you"}`
    : story
      ? `Someone replies ${kw ?? "to your story"} to your story`
      : t.matchMode === "any" || !kw
        ? "Someone comments anything"
        : `Someone comments ${kw}`;
  return `${who} → ${OUTCOME[t.slug] ?? "they get your DM"}`;
}

function firstLine(message: string): string {
  const line =
    message
      .replace(/\{\{username\}\}/g, "Sam")
      .replace(/\{\{link\}\}/g, "")
      .split("\n")
      .map((part) => part.trim())
      .find(Boolean) ?? "";
  return line.replace(/\s*👉\s*$/, "");
}

/** Automation template card (art panel, category, title, description, keywords, chat preview, Use template). */
export default function TemplateCard({ template: t, href, onClick }: { template: DmTemplate; href: string; onClick?: () => void }) {
  const cat = categoriesFor(t.slug)[0] ?? "content";
  const catLabel = CATEGORIES.find((c) => c.id === cat)?.label ?? t.useCase;
  const art = artFor(t);
  const hasLink = t.dmMessage.includes("{{link}}");
  const kw = t.keywords[0];
  const gate = t.askEmail && t.requireFollow ? "Email + follow gate" : t.askEmail ? "Email gate" : t.requireFollow ? "Follow gate" : null;
  return (
    <Link href={href} onClick={onClick} className={styles.card} aria-label={`Use template: ${t.title}`}>
      <span className={`${styles.art} ${TINT[cat]}`}>
        <Image src={art} alt="" width={art.width} height={art.height} className={styles.artImg} sizes="200px" />
      </span>
      <span className={styles.body}>
        <span className={styles.kicker}>{catLabel}</span>
        <span className={styles.title}>{t.title}</span>
        <span className={styles.desc}>{templateDescription(t)}</span>
        {(t.keywords.length > 0 || gate) && (
          <span className={styles.chips}>
            {t.keywords.map((k) => <span key={k} className={styles.kw}>{k}</span>)}
            {gate && <span className={styles.gate}>{gate}</span>}
          </span>
        )}
        <span className={styles.chat} aria-hidden="true">
          <span className={styles.comment}>
            <span className={styles.avatar}>S</span>
            <span className={styles.commentText}><b>sam.creates</b> · {kw ? `${kw} please!` : "Love this! ❤️"}</span>
          </span>
          <span className={styles.dm}>
            <span className={styles.dmText}>{firstLine(t.dmMessage)}</span>
            {hasLink && <span className={styles.dmBtn}>Open link</span>}
          </span>
        </span>
        <span className={styles.use}>Use template <ArrowRight width={14} height={14} aria-hidden="true" /></span>
      </span>
    </Link>
  );
}
