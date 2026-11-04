/** Large animated owl for the landing hero. White body on dark, colored eyes.
 *  Animation (pop-in, float, blink) is driven by CSS under .naz-landing. */
export function HeroOwl({ size = 190 }: { size?: number }) {
  return (
    <svg
      className="hero-owl"
      width={size}
      height={(size * 110) / 120}
      viewBox="0 0 120 110"
      role="img"
      aria-label="Naz Académie"
      style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 18px 40px rgba(0,0,0,.35))" }}
    >
      <g className="owl-float">
        {/* soft halo */}
        <ellipse cx="60" cy="58" rx="52" ry="52" fill="rgba(255,255,255,0.06)" />
        {/* body */}
        <path
          d="M60 8C88 8 104 28 104 56C104 86 86 104 60 104C34 104 16 86 16 56C16 28 32 8 60 8Z"
          fill="#ffffff"
        />
        <path d="M28 20 L40 40 L20 38 Z" fill="#ffffff" />
        <path d="M92 20 L80 40 L100 38 Z" fill="#ffffff" />
        {/* belly */}
        <ellipse cx="60" cy="72" rx="26" ry="27" fill="#eef0ff" />
        {/* eye discs */}
        <circle cx="44" cy="52" r="18" fill="#241a53" />
        <circle cx="76" cy="52" r="18" fill="#241a53" />
        {/* pupils = the two subjects */}
        <circle cx="44" cy="52" r="8.5" fill="#ff7a66" />
        <circle cx="76" cy="52" r="8.5" fill="#5a8cff" />
        <circle cx="46.5" cy="49" r="2.8" fill="#fff" />
        <circle cx="78.5" cy="49" r="2.8" fill="#fff" />
        {/* blink lids */}
        <path className="owl-lid" d="M26 52 a18 18 0 0 1 36 0 Z" fill="#ffffff" />
        <path className="owl-lid" d="M58 52 a18 18 0 0 1 36 0 Z" fill="#ffffff" />
        {/* beak */}
        <path d="M60 60 L68 73 L52 73 Z" fill="#f8c24c" />
        {/* little feet */}
        <path d="M50 101 l-4 6 M54 102 l0 6 M58 102 l3 6" stroke="#f8c24c" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M70 101 l4 6 M66 102 l0 6 M62 102 l-3 6" stroke="#f8c24c" stroke-width="3" stroke-linecap="round" fill="none" />
      </g>
    </svg>
  );
}
