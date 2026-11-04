import Link from "next/link";
import Image from "next/image";
import { HeroOwl } from "@/components/brand/hero-owl";
import { OwlMark } from "@/components/brand/owl-logo";
import { illustrations } from "@/lib/illustrations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nz-auth min-h-dvh bg-paper-2">
      {/* Brand panel (hidden on small screens) */}
      <aside className="nz-dark naz-landing nz-auth-panel">
        <div className="nz-auth-panel-inner">
          <Link href="/" aria-label="Naz Académie — accueil" style={{ display: "inline-flex", alignItems: "center", gap: ".6rem" }}>
            <OwlMark size={36} tone="light" />
            <span style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.35rem" }}>
              Naz Académie
            </span>
          </Link>

          <div style={{ display: "grid", placeItems: "center", margin: "2rem 0 1.5rem" }}>
            <HeroOwl size={150} />
          </div>

          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "clamp(1.7rem, 2.6vw, 2.3rem)", lineHeight: 1.1, textWrap: "balance" }}>
            Le français et les maths,{" "}
            <span style={{ color: "var(--l-sun)" }}>à ton rythme.</span>
          </h2>
          <ul className="nz-bullets" style={{ marginTop: "1.2rem" }}>
            <li>Des cours du CP à la Terminale</li>
            <li>Vidéos, fiches PDF et quiz corrigés</li>
            <li>Ta progression enregistrée automatiquement</li>
          </ul>

          <div className="nz-illu" style={{ marginTop: "2rem", borderRadius: 20, maxWidth: 420 }}>
            <Image src={illustrations.study} alt="" fill sizes="420px" />
          </div>
        </div>
      </aside>

      {/* Form side */}
      <div className="nz-auth-form">
        <header className="nz-auth-mobile-head">
          <Link href="/" aria-label="Naz Académie — accueil" style={{ display: "inline-flex", alignItems: "center", gap: ".55rem" }}>
            <OwlMark size={34} tone="ink" />
            <span className="font-display text-xl font-semibold text-ink">Naz Académie</span>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-10">
          {children}
        </main>
        <p className="pb-6 text-center text-xs text-ink-soft">
          <Link href="/" className="font-semibold hover:text-ink">← Retour à l&apos;accueil</Link>
        </p>
      </div>
    </div>
  );
}
