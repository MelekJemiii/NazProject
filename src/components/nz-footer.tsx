import Link from "next/link";
import { OwlMark } from "@/components/brand/owl-logo";

/** Shared dark footer. Must sit inside .nz-dark. */
export function NzFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: "1px solid var(--l-card-border)" }}>
      <div className="l-inner nz-footer-grid" style={{ paddingTop: "2.75rem", paddingBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <OwlMark size={34} tone="light" />
            <span
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 600,
                fontSize: "1.2rem",
                color: "var(--l-text)",
              }}
            >
              Naz Académie
            </span>
          </div>
          <p style={{ color: "var(--l-muted)", fontSize: ".92rem", marginTop: ".8rem", maxWidth: "34ch" }}>
            Des cours de français et de mathématiques clairs et progressifs,
            du primaire au lycée.
          </p>
        </div>
        <FooterCol
          title="Apprendre"
          links={[
            { href: "/cours/francais", label: "Français" },
            { href: "/cours/mathematiques", label: "Mathématiques" },
            { href: "/cours", label: "Tous les cours" },
          ]}
        />
        <FooterCol
          title="Mon compte"
          links={[
            { href: "/inscription", label: "Créer un compte" },
            { href: "/connexion", label: "Connexion" },
            { href: "/mon-espace", label: "Mon espace" },
          ]}
        />
      </div>
      <div className="l-inner" style={{ paddingBottom: "2rem" }}>
        <p style={{ color: "var(--l-muted)", fontSize: ".82rem", borderTop: "1px solid var(--l-card-border)", paddingTop: "1.2rem" }}>
          © {year} Naz Académie · Français &amp; mathématiques, en s&apos;amusant.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p style={{ fontWeight: 800, color: "var(--l-text)", marginBottom: ".7rem" }}>{title}</p>
      <ul style={{ display: "grid", gap: ".5rem" }}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="l-nav-link" style={{ fontSize: ".92rem" }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
