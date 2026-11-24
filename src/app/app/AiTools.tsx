import Link from "next/link";
import { ArrowRight, Bot, Megaphone, MessageSquareText, PenLine, Shuffle } from "lucide-react";
import AiOffNote, { AI_SETTINGS_HREF } from "@/components/AiOffNote";
import home from "./home.module.css";

type Tool = { title: string; text: string; where: string; href: string; icon: typeof Bot; state: "on" | "off" | "hold" };

/**
 * Dashboard "AI tools": one entry point for every AI feature (docs/FEATURE-MAP.md), shown whether or
 * not AI is switched on. Off: each card says so; admins get the link to paste the API key.
 * `ready` = featureReadiness "ai" (env or stored key), `repliesReady` = "ai_replies" (also needs
 * the separate AI_REPLIES_ENABLED=1 switch).
 */
export default function AiTools({ ready, repliesReady, isAdmin }: { ready: boolean; repliesReady: boolean; isAdmin: boolean }) {
  const base = ready ? "on" : "off";
  const tools: Tool[] = [
    { title: "Caption ideas", text: "Three caption ideas with hashtags from a one-line topic, in your brand voice.", where: "Composer → Write with AI", href: "/app/publish?compose=1", icon: PenLine, state: base },
    { title: "Tailor per network", text: "Rewrite one caption for each network's length and style.", where: "Composer → Tailor per network", href: "/app/publish?compose=1", icon: Shuffle, state: base },
    { title: "Campaign from a brief", text: "Describe a launch or offer; get a sequence of draft posts on your calendar.", where: "Calendar → Campaign from brief", href: "/app/publish?campaign=1", icon: Megaphone, state: base },
    { title: "DM message ideas", text: "Three friendly Auto-DM messages with your link, ready to edit.", where: "Auto-DM → Write with AI", href: "/app/auto-dm", icon: MessageSquareText, state: base },
    { title: "AI DM replies", text: "Answer incoming Instagram DMs automatically, with your booking link.", where: "Settings → AI DM replies", href: "/app/settings#ai-replies", icon: Bot, state: repliesReady ? "on" : ready ? "hold" : "off" },
  ];
  const pill = (state: Tool["state"]) =>
    state === "on" ? <span className={home.live}>On</span> : <span className={home.paused}>{state === "hold" ? "On hold" : isAdmin ? "Not switched on" : "Coming soon"}</span>;

  return (
    <section className={home.section} aria-labelledby="ai-tools">
      <div className={home.sectionHead}>
        <div>
          <h2 id="ai-tools" className={home.sectionTitle}>AI tools</h2>
          <p className={home.sectionSub}>Every AI feature in one place. Ideas and drafts are always yours to edit before anything is posted.</p>
        </div>
        {isAdmin && (
          <Link href={AI_SETTINGS_HREF} className={home.textLink}>AI settings <ArrowRight width={14} height={14} aria-hidden="true" /></Link>
        )}
      </div>
      {!ready && <AiOffNote isAdmin={isAdmin}>The tools below start working as soon as it is.</AiOffNote>}
      <ul className={home.aiGrid}>
        {tools.map((t) => (
          <li key={t.title} className={`${home.card} ${home.aiCard}`}>
            <div className={home.aiCardHead}>
              <span className={home.statIcon} aria-hidden="true"><t.icon width={15} height={15} /></span>
              <strong className={home.aiCardTitle}>{t.title}</strong>
              {pill(t.state)}
            </div>
            <p className={home.aiCardText}>{t.text}</p>
            {t.state === "hold" && (
              <p className={home.aiCardText}>
                {isAdmin ? <>Sends DMs without a human, so it has its own switch: <code>AI_REPLIES_ENABLED=1</code> on the server.</> : <>Coming soon. Your saved instructions are kept.</>}
              </p>
            )}
            <Link href={t.href} className={home.textLink}>{t.where} <ArrowRight width={14} height={14} aria-hidden="true" /></Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
