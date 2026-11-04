export type LoadError = { message: string; reloadHref: string };

export default function LoadFailed({
  message,
  reloadHref,
  className = "",
}: {
  message: string;
  reloadHref: string;
  className?: string;
}) {
  return (
    <div className={`${className} rounded-2xl border border-line bg-surface-2 p-4`}>
      <p role="alert" className="text-sm text-brand-2">
        {message}
      </p>
      <a
        href={reloadHref}
        className="mt-3 inline-block rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-2"
      >
        Reload
      </a>
    </div>
  );
}
