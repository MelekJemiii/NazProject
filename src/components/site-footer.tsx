import Link from "next/link";
import { BrandLockup } from "@/components/brand/owl-logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLockup size={32} blink={false} />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            Des cours de français et de mathématiques clairs et progressifs,
            pensés pour les enfants et les élèves.
          </p>
        </div>
        <nav className="text-sm">
          <p className="mb-2 font-bold text-ink">Apprendre</p>
          <ul className="space-y-1.5 text-ink-soft">
            <li>
              <Link href="/cours/francais" className="hover:text-ink">
                Français
              </Link>
            </li>
            <li>
              <Link href="/cours/mathematiques" className="hover:text-ink">
                Mathématiques
              </Link>
            </li>
            <li>
              <Link href="/cours" className="hover:text-ink">
                Tous les cours
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="text-sm">
          <p className="mb-2 font-bold text-ink">Compte</p>
          <ul className="space-y-1.5 text-ink-soft">
            <li>
              <Link href="/connexion" className="hover:text-ink">
                Connexion
              </Link>
            </li>
            <li>
              <Link href="/inscription" className="hover:text-ink">
                Créer un compte
              </Link>
            </li>
            <li>
              <Link href="/mon-espace" className="hover:text-ink">
                Mon espace
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-ink-soft">
          © {new Date().getFullYear()} Naz Académie. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
