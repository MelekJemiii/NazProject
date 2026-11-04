import Link from "next/link";

/** Page header used at the top of every admin page. */
export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm font-bold text-ink-soft hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-3xl font-semibold text-ink" style={{ textWrap: "balance" }}>
          {title}
        </h1>
        {description && <p className="mt-1 text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Stat tile: label · value · optional delta/sub. Sans figures, proportional. */
export function StatTile({
  label,
  value,
  sub,
  delta,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: { text: string; tone: "good" | "neutral" };
  href?: string;
}) {
  const body = (
    <>
      <p className="text-sm font-bold text-ink-soft">{label}</p>
      <p className="mt-1.5 text-4xl font-extrabold tracking-tight text-ink">{value}</p>
      {delta && (
        <p
          className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold"
          style={{
            background:
              delta.tone === "good"
                ? "color-mix(in srgb, var(--grow) 14%, transparent)"
                : "var(--paper-2)",
            color: delta.tone === "good" ? "var(--grow)" : "var(--ink-soft)",
          }}
        >
          {delta.tone === "good" ? "▲" : "•"} {delta.text}
        </p>
      )}
      {sub && <p className="mt-2 text-xs font-semibold text-ink-soft">{sub}</p>}
    </>
  );
  const cls =
    "block rounded-card border border-line bg-card p-5 transition-all";
  return href ? (
    <Link href={href} className={`${cls} hover:-translate-y-0.5 hover:border-ink`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Card container for charts / lists. */
export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-card border border-line bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs font-semibold text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
