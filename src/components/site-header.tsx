import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { BrandLockup } from "@/components/brand/owl-logo";

export async function SiteHeader() {
  const { profile } = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" aria-label="Naz Académie — accueil">
          <BrandLockup size={34} />
        </Link>

        <nav className="hidden items-center gap-6 text-[0.95rem] font-semibold text-ink-soft sm:flex">
          <Link href="/cours" className="hover:text-ink">
            Les cours
          </Link>
          <Link href="/cours/francais" className="hover:text-ink">
            Français
          </Link>
          <Link href="/cours/mathematiques" className="hover:text-ink">
            Mathématiques
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full border border-ink px-3.5 py-1.5 text-sm font-bold text-ink hover:bg-ink hover:text-paper"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/mon-espace"
                className="rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-paper hover:opacity-90"
              >
                Mon espace
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="rounded-full px-3.5 py-1.5 text-sm font-bold text-ink hover:bg-paper-2"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-full bg-sun px-4 py-1.5 text-sm font-extrabold text-ink hover:brightness-95"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
