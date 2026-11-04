/**
 * Naz owl mark. Pure SVG, inherits currentColor-free explicit tokens.
 * `tone` picks the color treatment so it works on paper / ink / color backgrounds.
 */
export function OwlMark({
  size = 40,
  tone = "ink",
  blink = false,
  className,
}: {
  size?: number;
  tone?: "ink" | "light" | "francais";
  blink?: boolean;
  className?: string;
}) {
  const body = tone === "ink" ? "var(--ink)" : "#ffffff";
  const disc =
    tone === "ink"
      ? "var(--paper)"
      : tone === "francais"
        ? "var(--francais)"
        : "var(--ink)";

  return (
    <svg
      width={size}
      height={(size * 110) / 120}
      viewBox="0 0 120 110"
      className={className}
      role="img"
      aria-label="Naz Académie"
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d="M60 8C88 8 104 28 104 56C104 86 86 104 60 104C34 104 16 86 16 56C16 28 32 8 60 8Z"
        fill={body}
      />
      <path d="M28 20 L40 40 L20 38 Z" fill={body} />
      <path d="M92 20 L80 40 L100 38 Z" fill={body} />
      <ellipse
        cx="60"
        cy="70"
        rx="26"
        ry="28"
        fill="color-mix(in srgb, var(--paper) 90%, var(--sun))"
      />
      <circle cx="44" cy="52" r="18" fill={disc} />
      <circle cx="76" cy="52" r="18" fill={disc} />
      <circle cx="44" cy="52" r="8.5" fill="var(--francais)" />
      <circle cx="76" cy="52" r="8.5" fill="var(--maths)" />
      <circle cx="46" cy="49" r="2.6" fill="#fff" />
      <circle cx="78" cy="49" r="2.6" fill="#fff" />
      {blink && (
        <>
          <path
            className="owl-lid"
            d="M26 52 a18 18 0 0 1 36 0 Z"
            fill={body}
          />
          <path
            className="owl-lid"
            d="M58 52 a18 18 0 0 1 36 0 Z"
            fill={body}
          />
        </>
      )}
      <path d="M60 60 L67 72 L53 72 Z" fill="var(--sun)" />
    </svg>
  );
}

/** Full lockup: owl + "Naz Académie" wordmark with the marker underline. */
export function BrandLockup({
  size = 32,
  showTagline = false,
  blink = true,
}: {
  size?: number;
  showTagline?: boolean;
  blink?: boolean;
}) {
  return (
    <span className="brand-lockup">
      <OwlMark size={size} tone="ink" blink={blink} />
      <span className="brand-text">
        <span className="brand-word">
          Naz<span className="brand-swoosh" aria-hidden />
        </span>
        <span className="brand-sub">Académie</span>
        {showTagline && (
          <span className="brand-tagline">français &amp; maths</span>
        )}
      </span>
    </span>
  );
}
