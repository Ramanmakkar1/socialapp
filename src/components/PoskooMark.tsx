// The poskoo speech-bubble mark, matching the landing page's #mark symbol.
export default function PoskooMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 3c9.4 0 17 6.7 17 15.4S29.4 34 20 34c-1.6 0-3.1-.2-4.6-.5L8 37.5l1.7-6.6C5.6 28.1 3 23.6 3 18.4 3 9.7 10.6 3 20 3z"
        fill="var(--poskoo-coral)"
        stroke="var(--poskoo-ink)"
        strokeWidth="2.4"
      />
      <circle cx="14.5" cy="18.5" r="2.4" fill="var(--poskoo-ink)" />
      <circle cx="25.5" cy="18.5" r="2.4" fill="var(--poskoo-ink)" />
      <path
        d="M16 24c2.4 2 5.6 2 8 0"
        stroke="var(--poskoo-ink)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
