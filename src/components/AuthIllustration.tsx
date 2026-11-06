import Image from "next/image";
import a from "@/app/login/auth.module.css";

// Right-hand panel of /login and /signup: the landing's doodle art on a tilted
// coloured card (peach for log in, lilac for sign up), like the landing's cards.
export default function AuthIllustration({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  return (
    <aside className={`${a.panel} ${signup ? a.panelLilac : a.panelPeach}`}>
      <div className={a.art}>
        <Image
          src={signup ? "/illustrations/auth-signup.webp" : "/illustrations/auth-login.webp"}
          alt=""
          width={1122}
          height={1402}
          sizes="(max-width: 1100px) 340px, 400px"
          priority
        />
      </div>
      <h2 className={a.panelTitle}>
        {signup ? (
          <>Start posting and replying <em className="s">on autopilot.</em></>
        ) : (
          <>Welcome back to your <em className="s">calendar and inbox.</em></>
        )}
      </h2>
      <ul className={a.points}>
        <li>Schedule posts on a week or month calendar</li>
        <li>Auto-DM people who comment a keyword</li>
        <li>Capture leads from your DMs</li>
      </ul>
    </aside>
  );
}
