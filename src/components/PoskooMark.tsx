// The poskoo speech-bubble mark, matching the landing page's #mark symbol.
// Animated by default (pure CSS on the vector, so it stays crisp at any size): the bubble
// bobs gently, the eyes blink and the smile widens now and then. Off for reduced motion.
const css = `
.pkm-bubble{transform-box:fill-box;transform-origin:50% 90%;animation:pkm-bob 4.8s ease-in-out infinite}
.pkm-eye{transform-box:fill-box;transform-origin:50% 50%;animation:pkm-blink 4.8s ease-in-out infinite}
.pkm-smile{transform-box:fill-box;transform-origin:50% 0%;animation:pkm-smile 4.8s ease-in-out infinite}
@keyframes pkm-bob{0%,100%{transform:translateY(0) rotate(0)}18%{transform:translateY(-1.2px) rotate(-4deg)}36%{transform:translateY(0) rotate(0)}52%{transform:translateY(-.8px) rotate(3deg)}68%{transform:translateY(0) rotate(0)}}
@keyframes pkm-blink{0%,40%,46%,100%{transform:scaleY(1)}43%{transform:scaleY(.12)}}
@keyframes pkm-smile{0%,58%,84%,100%{transform:scale(1,1)}66%,76%{transform:scale(1.18,1.45)}}
@media (prefers-reduced-motion:reduce){.pkm-bubble,.pkm-eye,.pkm-smile{animation:none}}
`;

export default function PoskooMark({ size = 30, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ overflow: "visible" }}>
      {animated && <style>{css}</style>}
      <g className={animated ? "pkm-bubble" : undefined}>
        <path
          d="M20 3c9.4 0 17 6.7 17 15.4S29.4 34 20 34c-1.6 0-3.1-.2-4.6-.5L8 37.5l1.7-6.6C5.6 28.1 3 23.6 3 18.4 3 9.7 10.6 3 20 3z"
          fill="var(--poskoo-coral)"
          stroke="var(--poskoo-ink)"
          strokeWidth="2.4"
        />
        <circle className={animated ? "pkm-eye" : undefined} cx="14.5" cy="18.5" r="2.4" fill="var(--poskoo-ink)" />
        <circle className={animated ? "pkm-eye" : undefined} cx="25.5" cy="18.5" r="2.4" fill="var(--poskoo-ink)" />
        <path
          className={animated ? "pkm-smile" : undefined}
          d="M16 24c2.4 2 5.6 2 8 0"
          stroke="var(--poskoo-ink)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
