import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { OwlMark } from "@/components/brand/owl-logo";
import { NzNavLinks, NzMobileMenu } from "@/components/nz-nav";
import { SignOutButton } from "@/components/sign-out-button";

/** Shared dark header (landing + all public pages). Must sit inside .nz-dark. */
export async function NzHeader({ transparent = false }: { transparent?: boolean }) {
  const { profile } = await getCurrentUser();

  return (
    <header className={`nz-dark nz-header${transparent ? " is-transparent" : ""}`}>
      <div
        className="l-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          paddingTop: transparent ? "1.4rem" : ".85rem",
          paddingBottom: transparent ? "1.4rem" : ".85rem",
          position: "relative",
        }}
      >
        <Link
          href="/"
          aria-label="Naz Académie — accueil"
          style={{ display: "inline-flex", alignItems: "center", gap: ".6rem" }}
        >
          <OwlMark size={36} tone="light" blink />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 600,
                fontSize: "1.4rem",
                color: "var(--l-text)",
              }}
            >
              Naz
            </span>
            <span
              style={{
                fontSize: ".56rem",
                fontWeight: 800,
                letterSpacing: ".16em",
                color: "var(--l-muted)",
              }}
            >
              ACADÉMIE
            </span>
          </span>
        </Link>

        <NzNavLinks />

        <div style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="l-btn-ghost l-hide-mobile"
                  style={{ padding: ".5rem 1rem", fontSize: ".85rem" }}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/mon-espace"
                className="l-btn-primary"
                style={{ padding: ".55rem 1.1rem", fontSize: ".88rem" }}
              >
                Mon espace
              </Link>
              <span className="l-hide-mobile nz-signout">
                <SignOutButton />
              </span>
            </>
          ) : (
            <>
              <Link href="/connexion" className="l-nav-link l-hide-mobile">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="l-btn-primary"
                style={{ padding: ".55rem 1.1rem", fontSize: ".88rem" }}
              >
                S&apos;inscrire
              </Link>
            </>
          )}
          <NzMobileMenu signedIn={!!profile} />
        </div>
      </div>
    </header>
  );
}
