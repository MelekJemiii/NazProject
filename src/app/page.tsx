import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getCategoryCourseCounts,
} from "@/lib/queries";
import { HeroOwl } from "@/components/brand/hero-owl";
import { OwlMark } from "@/components/brand/owl-logo";

export default async function LandingPage() {
  const supabase = await createClient();
  const [{ profile }, categories, counts] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getCategoryCourseCounts(),
  ]);

  // Honest live stats + a few featured published courses.
  const [{ count: courseCount }, { count: lessonCount }, { data: featuredRaw }] =
    await Promise.all([
      supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("courses")
        .select(
          "id, title, description, is_premium, price, slug, level:levels!inner(slug, name, category:categories!inner(slug, name))",
        )
        .eq("status", "published")
        .order("position")
        .limit(3),
    ]);

  const featured = (featuredRaw ?? []) as unknown as {
    id: string;
    title: string;
    description: string | null;
    is_premium: boolean;
    price: number | null;
    slug: string;
    level: { slug: string; name: string; category: { slug: string; name: string } };
  }[];

  const stats = [
    { value: "2", label: "matières" },
    { value: `${courseCount ?? 0}`, label: "cours en ligne" },
    { value: `${lessonCount ?? 0}`, label: "leçons & quiz" },
    { value: "3", label: "niveaux (primaire → lycée)" },
  ];

  const subjectAccent = (slug: string) =>
    slug === "mathematiques" ? "var(--l-maths)" : "var(--l-francais)";

  return (
    <div className="naz-landing">
      {/* ---- Header ---- */}
      <header className="l-inner" style={{ paddingTop: "1.4rem", paddingBottom: "1.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <Link href="/" aria-label="Naz Académie" style={{ display: "inline-flex", alignItems: "center", gap: ".6rem" }}>
            <OwlMark size={38} tone="light" />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.45rem", color: "var(--l-text)" }}>
                Naz
              </span>
              <span style={{ fontSize: ".58rem", fontWeight: 800, letterSpacing: ".16em", color: "var(--l-muted)" }}>
                ACADÉMIE
              </span>
            </span>
          </Link>

          <nav className="l-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
            <Link href="/cours" className="l-nav-link">Les cours</Link>
            <Link href="/cours/francais" className="l-nav-link">Français</Link>
            <Link href="/cours/mathematiques" className="l-nav-link">Maths</Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            {profile ? (
              <>
                {profile.role === "admin" && (
                  <Link href="/admin" className="l-btn-ghost" style={{ padding: ".5rem 1rem", fontSize: ".85rem" }}>
                    Admin
                  </Link>
                )}
                <Link href="/mon-espace" className="l-btn-primary" style={{ padding: ".55rem 1.15rem", fontSize: ".9rem" }}>
                  Mon espace
                </Link>
              </>
            ) : (
              <>
                <Link href="/connexion" className="l-nav-link l-hide-mobile">Connexion</Link>
                <Link href="/inscription" className="l-btn-primary" style={{ padding: ".55rem 1.15rem", fontSize: ".9rem" }}>
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="l-inner" style={{ paddingTop: "1.5rem", paddingBottom: "3.5rem" }}>
        <div className="l-hero-grid">
          <div>
            <span className="l-chip a-up d1" style={{ marginBottom: "1.4rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--l-grow)" }} />
              Français &amp; Mathématiques · par niveau
            </span>

            <h1 className="hero-display" style={{ margin: ".4rem 0 0" }}>
              <span className="hero-word">
                <span className="w" style={{ animationDelay: ".45s" }}>Apprendre</span>
                <span className="w" style={{ animationDelay: ".58s" }}>devient</span>
              </span>
              <br />
              <span className="hero-swoosh-bar">
                <span className="w" style={{ animationDelay: ".72s" }}>un</span>{" "}
                <span className="w" style={{ animationDelay: ".84s" }}>vrai</span>{" "}
                <span className="w" style={{ animationDelay: ".96s", color: "var(--l-sun)" }}>plaisir.</span>
                <span className="hero-swoosh" />
              </span>
            </h1>

            <p className="a-up d4" style={{ color: "var(--l-muted)", fontSize: "1.1rem", maxWidth: "34ch", marginTop: "1.3rem" }}>
              Des cours clairs et progressifs pour les enfants et les élèves.
              Lis, regarde des vidéos, télécharge tes fiches et teste-toi avec
              des quiz — à ton rythme.
            </p>

            <div className="a-up d5" style={{ display: "flex", flexWrap: "wrap", gap: ".8rem", marginTop: "1.8rem" }}>
              <Link href="/cours" className="l-btn-primary">Découvrir les cours →</Link>
              <Link href="/inscription" className="l-btn-ghost">Créer un compte gratuit</Link>
            </div>

            <div className="a-up d6" style={{ display: "flex", flexWrap: "wrap", gap: "1.8rem", marginTop: "2.4rem" }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.9rem", color: "var(--l-text)" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: ".82rem", color: "var(--l-muted)", maxWidth: "14ch" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero owl */}
          <div className="l-hero-owl-col">
            <div className="l-owl-ring">
              <HeroOwl size={210} />
            </div>
          </div>
        </div>
      </section>

      {/* ---- Categories ---- */}
      <section className="l-inner" style={{ paddingBottom: "3.5rem" }}>
        <h2 className="sect-title">Choisis ta matière</h2>
        <p style={{ color: "var(--l-muted)", marginTop: ".4rem" }}>
          Chaque matière est organisée par niveau, du primaire au lycée.
        </p>
        <div className="l-cards-2" style={{ marginTop: "1.6rem" }}>
          {categories.map((cat) => {
            const accent = subjectAccent(cat.slug);
            return (
              <Link key={cat.id} href={`/cours/${cat.slug}`} className="l-glass l-cat-card">
                <div
                  aria-hidden
                  style={{
                    width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center",
                    fontSize: "1.8rem", background: accent, color: "#fff",
                  }}
                >
                  {cat.icon ?? "📘"}
                </div>
                <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.5rem", marginTop: "1rem" }}>
                  {cat.name}
                </h3>
                <p style={{ color: "var(--l-muted)", fontSize: ".92rem", marginTop: ".4rem" }}>{cat.description}</p>
                <span style={{ display: "inline-block", marginTop: "1rem", fontWeight: 800, color: accent }}>
                  {counts[cat.id] ?? 0} cours disponibles →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---- Featured courses ---- */}
      {featured.length > 0 && (
        <section className="l-inner" style={{ paddingBottom: "3.5rem" }}>
          <h2 className="sect-title">Cours en vedette</h2>
          <p style={{ color: "var(--l-muted)", marginTop: ".4rem" }}>
            Commence dès maintenant avec l&apos;un de nos cours.
          </p>
          <div className="l-cards-3" style={{ marginTop: "1.6rem" }}>
            {featured.map((c) => {
              const accent = subjectAccent(c.level.category.slug);
              return (
                <Link
                  key={c.id}
                  href={`/cours/${c.level.category.slug}/${c.level.slug}/${c.slug}`}
                  className="l-glass l-course-card"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="l-chip" style={{ padding: ".3rem .8rem", fontSize: ".72rem" }}>
                      {c.level.category.name} · {c.level.name}
                    </span>
                    {c.is_premium ? (
                      <span style={{ background: "var(--l-sun)", color: "#241a53", fontWeight: 800, fontSize: ".72rem", padding: ".2rem .6rem", borderRadius: 999 }}>
                        {c.price}€
                      </span>
                    ) : (
                      <span style={{ color: "var(--l-grow)", fontWeight: 800, fontSize: ".72rem" }}>Gratuit</span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.25rem", marginTop: ".9rem" }}>
                    {c.title}
                  </h3>
                  {c.description && (
                    <p style={{ color: "var(--l-muted)", fontSize: ".9rem", marginTop: ".4rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.description}
                    </p>
                  )}
                  <span style={{ display: "inline-block", marginTop: "1rem", fontWeight: 800, color: accent }}>
                    Voir le cours →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- How it works ---- */}
      <section className="l-inner" style={{ paddingBottom: "3.5rem" }}>
        <h2 className="sect-title">Comment ça marche</h2>
        <div className="l-cards-3" style={{ marginTop: "1.6rem" }}>
          {[
            { n: "1", t: "Choisis ton niveau", d: "Primaire, collège ou lycée — commence là où tu te sens prêt.", c: "var(--l-francais)" },
            { n: "2", t: "Suis les leçons", d: "Articles, vidéos, fiches à télécharger et quiz pour t'entraîner.", c: "var(--l-maths)" },
            { n: "3", t: "Suis tes progrès", d: "Marque les leçons terminées et reviens quand tu veux.", c: "var(--l-grow)" },
          ].map((s) => (
            <div key={s.n} className="l-glass" style={{ padding: "1.6rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: s.c, color: "#fff", fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.4rem" }}>
                {s.n}
              </div>
              <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.2rem", marginTop: ".9rem" }}>{s.t}</h3>
              <p style={{ color: "var(--l-muted)", fontSize: ".92rem", marginTop: ".4rem" }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="l-inner" style={{ paddingBottom: "3.5rem" }}>
        <div className="l-glass" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <OwlMark size={54} tone="light" />
          </div>
          <h2 className="sect-title">Prêt à commencer ton premier cours ?</h2>
          <p style={{ color: "var(--l-muted)", marginTop: ".5rem" }}>C&apos;est gratuit pour créer ton compte.</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/inscription" className="l-btn-primary">Je m&apos;inscris gratuitement →</Link>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="l-inner" style={{ paddingTop: "1.5rem", paddingBottom: "2.5rem", borderTop: "1px solid var(--l-card-border)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <OwlMark size={30} tone="light" />
            <span style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, color: "var(--l-text)" }}>Naz Académie</span>
          </div>
          <nav style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap" }}>
            <Link href="/cours" className="l-nav-link">Les cours</Link>
            <Link href="/connexion" className="l-nav-link">Connexion</Link>
            <Link href="/inscription" className="l-nav-link">Créer un compte</Link>
          </nav>
        </div>
        <p style={{ color: "var(--l-muted)", fontSize: ".82rem", marginTop: "1.2rem" }}>
          © {new Date().getFullYear()} Naz Académie. Français &amp; mathématiques, en s&apos;amusant.
        </p>
      </footer>
    </div>
  );
}
