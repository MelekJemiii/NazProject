import Link from "next/link";
import Image from "next/image";

type Crumb = { href?: string; label: string };

/** Dark hero band used at the top of inner public pages. */
export function PageBand({
  crumbs,
  eyebrow,
  title,
  description,
  illustration,
  accent = "var(--l-sun)",
  children,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string | null;
  illustration?: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="nz-dark nz-band">
      <div
        className="l-inner nz-band-grid"
        style={{ paddingTop: "2.2rem", paddingBottom: "2.6rem" }}
      >
        <div style={{ minWidth: 0 }}>
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Fil d'Ariane" style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--l-muted)" }}>
              {crumbs.map((c, i) => (
                <span key={i}>
                  {c.href ? (
                    <Link href={c.href} className="l-nav-link">
                      {c.label}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--l-text)" }}>{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden style={{ margin: "0 .45rem", opacity: .5 }}>/</span>}
                </span>
              ))}
            </nav>
          )}
          {eyebrow && (
            <span className="nz-tag" style={{ marginTop: "1.1rem", color: accent }}>
              {eyebrow}
            </span>
          )}
          <h1
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 600,
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginTop: eyebrow ? ".35rem" : "1rem",
              textWrap: "balance",
            }}
          >
            {title}
          </h1>
          {description && (
            <p style={{ color: "var(--l-muted)", fontSize: "1.05rem", marginTop: ".8rem", maxWidth: "52ch" }}>
              {description}
            </p>
          )}
          {children}
        </div>
        {illustration && (
          <div className="nz-illu nz-band-illu" style={{ borderRadius: 22 }}>
            <Image
              src={illustration}
              alt=""
              fill
              sizes="(max-width: 860px) 100vw, 420px"
              priority
              // Admin-uploaded covers may live on any host; only optimize our own art.
              unoptimized={!illustration.includes("cloudfront.net")}
            />
          </div>
        )}
      </div>
    </section>
  );
}
