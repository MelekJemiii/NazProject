import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getCategoryCourseCounts } from "@/lib/queries";
import { HeroOwl } from "@/components/brand/hero-owl";
import { OwlMark } from "@/components/brand/owl-logo";
import { NzHeader } from "@/components/nz-header";
import { NzFooter } from "@/components/nz-footer";
import { illustrations, subjectIllustration } from "@/lib/illustrations";

const LEVELS = [
  "CP", "CE1", "CE2", "CM1", "CM2", "6e", "5e", "4e", "3e", "2nde", "1re", "Terminale",
];

const FAQ = [
  {
    q: "Naz Académie, c'est pour qui ?",
    a: "Pour les enfants et les élèves du primaire au lycée qui veulent progresser en français et en mathématiques, à leur rythme, à la maison.",
  },
  {
    q: "Est-ce que c'est gratuit ?",
    a: "Créer un compte est gratuit et de nombreux cours sont entièrement gratuits. Certains cours premium sont payants, à l'unité : tu ne paies que ce que tu suis.",
  },
  {
    q: "Comment débloquer un cours premium ?",
    a: "Depuis la page du cours : paiement par carte quand il est proposé, ou demande d'accès pour régler autrement (virement, par exemple). L'accès est activé dès réception.",
  },
  {
    q: "Comment suivre la progression ?",
    a: "Dans « Mon espace », chaque cours affiche les leçons terminées et un pourcentage de progression. Les résultats des quiz sont enregistrés automatiquement.",
  },
  {
    q: "Sur quels appareils fonctionne Naz Académie ?",
    a: "Sur ordinateur, tablette et téléphone, directement dans le navigateur. Rien à installer.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const [categories, counts] = await Promise.all([
    getCategories(),
    getCategoryCourseCounts(),
  ]);

  const [{ count: courseCount }, { count: lessonCount }, { data: featuredRaw }] =
    await Promise.all([
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase
        .from("courses")
        .select(
          "id, title, description, is_premium, price, slug, cover_url, level:levels!inner(slug, name, category:categories!inner(slug, name))",
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
    cover_url: string | null;
    level: { slug: string; name: string; category: { slug: string; name: string } };
  }[];

  const stats = [
    { value: "2", label: "matières" },
    { value: `${courseCount ?? 0}`, label: "cours en ligne" },
    { value: `${lessonCount ?? 0}`, label: "leçons & quiz" },
    { value: "12", label: "classes, du CP à la Terminale" },
  ];

  const accent = (slug: string) =>
    slug === "mathematiques" ? "var(--l-maths)" : "var(--l-francais)";

  return (
    <div className="naz-landing nz-dark">
      <NzHeader transparent />

      {/* ---- Hero ---- */}
      <section className="l-inner" style={{ paddingTop: "1rem", paddingBottom: "3rem" }}>
        <div className="l-hero-grid">
          <div>
            <span className="l-chip a-up d1" style={{ marginBottom: "1.4rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--l-grow)" }} />
              Français &amp; Mathématiques · du CP à la Terminale
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

            <p className="a-up d4" style={{ color: "var(--l-muted)", fontSize: "1.1rem", maxWidth: "38ch", marginTop: "1.3rem" }}>
              Des cours clairs et progressifs pour les enfants et les élèves.
              Lis, regarde des vidéos, télécharge tes fiches et teste-toi avec
              des quiz, à ton rythme.
            </p>

            <div className="a-up d5" style={{ display: "flex", flexWrap: "wrap", gap: ".8rem", marginTop: "1.8rem" }}>
              <Link href="/cours" className="l-btn-primary">Découvrir les cours →</Link>
              <Link href="/inscription" className="l-btn-ghost">Créer un compte gratuit</Link>
            </div>

            <dl className="a-up d6 nz-stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.9rem", color: "var(--l-text)", fontVariantNumeric: "tabular-nums" }}>
                    {s.value}
                  </dd>
                  <dd style={{ fontSize: ".82rem", color: "var(--l-muted)", maxWidth: "15ch" }}>{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="l-hero-owl-col">
            <div className="l-owl-ring">
              <HeroOwl size={210} />
            </div>
          </div>
        </div>
      </section>

      {/* ---- Levels marquee ---- */}
      <section aria-label="Niveaux couverts" style={{ paddingBottom: "3.5rem" }}>
        <div className="nz-marquee">
          <div className="nz-marquee-track">
            {[...LEVELS, ...LEVELS].map((lvl, i) => (
              <span key={`${lvl}-${i}`} className="l-chip" aria-hidden={i >= LEVELS.length}>
                <span style={{ color: i % 2 ? "var(--l-maths)" : "var(--l-francais)" }}>●</span>
                {lvl}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Subjects ---- */}
      <section className="l-inner" style={{ paddingBottom: "4.5rem" }}>
        <span className="nz-tag">Deux matières essentielles</span>
        <h2 className="sect-title" style={{ marginTop: ".4rem" }}>Choisis ta matière</h2>
        <p style={{ color: "var(--l-muted)", marginTop: ".4rem" }}>
          Chaque matière est organisée par niveau, du primaire au lycée.
        </p>
        <div className="l-cards-2" style={{ marginTop: "1.8rem" }}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/cours/${cat.slug}`} className="l-glass l-cat-card" style={{ padding: "1rem" }}>
              <div className="nz-illu">
                <Image
                  src={subjectIllustration(cat.slug)}
                  alt=""
                  fill
                  sizes="(max-width: 560px) 100vw, 540px"
                />
              </div>
              <div style={{ padding: ".9rem .6rem .5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.6rem" }}>
                    {cat.name}
                  </h3>
                  <span
                    style={{
                      fontWeight: 800, fontSize: ".8rem", padding: ".3rem .7rem", borderRadius: 999,
                      background: `color-mix(in srgb, ${accent(cat.slug)} 22%, transparent)`, color: accent(cat.slug),
                    }}
                  >
                    {counts[cat.id] ?? 0} cours
                  </span>
                </div>
                <p style={{ color: "var(--l-muted)", fontSize: ".95rem", marginTop: ".4rem" }}>{cat.description}</p>
                <span style={{ display: "inline-block", marginTop: ".9rem", fontWeight: 800, color: accent(cat.slug) }}>
                  Explorer {cat.name.toLowerCase() === "français" ? "le français" : "les maths"} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Feature rows ---- */}
      <section className="l-inner" style={{ paddingBottom: "4.5rem", display: "grid", gap: "4rem" }}>
        <div className="nz-feature">
          <div className="nz-illu" style={{ borderRadius: 24 }}>
            <Image src={illustrations.study} alt="" fill sizes="(max-width: 860px) 100vw, 540px" />
          </div>
          <div>
            <span className="nz-tag">Leçons & vidéos</span>
            <h3 style={{ marginTop: ".4rem" }}>Des leçons claires, à lire ou à regarder</h3>
            <p style={{ color: "var(--l-muted)", marginTop: ".8rem", maxWidth: "46ch" }}>
              Chaque notion est expliquée simplement, avec des exemples. Les
              leçons en vidéo permettent de revoir un passage autant de fois que
              nécessaire.
            </p>
            <ul className="nz-bullets">
              <li>Articles illustrés et vidéos courtes</li>
              <li>Une notion à la fois, du plus simple au plus avancé</li>
              <li>Reprends exactement là où tu t&apos;es arrêté</li>
            </ul>
          </div>
        </div>

        <div className="nz-feature reverse">
          <div className="nz-illu" style={{ borderRadius: 24 }}>
            <Image src={illustrations.fiches} alt="" fill sizes="(max-width: 860px) 100vw, 540px" />
          </div>
          <div>
            <span className="nz-tag">Fiches PDF</span>
            <h3 style={{ marginTop: ".4rem" }}>Des fiches à télécharger et à imprimer</h3>
            <p style={{ color: "var(--l-muted)", marginTop: ".8rem", maxWidth: "46ch" }}>
              Les fiches de révision et d&apos;exercices s&apos;impriment en un
              clic, pour travailler sur papier, à la maison ou en classe.
            </p>
            <ul className="nz-bullets">
              <li>Fiches de révision synthétiques</li>
              <li>Exercices d&apos;entraînement</li>
              <li>Format A4, prêt à imprimer</li>
            </ul>
          </div>
        </div>

        <div className="nz-feature">
          <div className="nz-illu" style={{ borderRadius: 24 }}>
            <Image src={illustrations.quiz} alt="" fill sizes="(max-width: 860px) 100vw, 540px" />
          </div>
          <div>
            <span className="nz-tag">Quiz & progression</span>
            <h3 style={{ marginTop: ".4rem" }}>Des quiz pour vérifier ce que tu as compris</h3>
            <p style={{ color: "var(--l-muted)", marginTop: ".8rem", maxWidth: "46ch" }}>
              Les quiz sont corrigés immédiatement, avec une explication pour
              chaque réponse. Ta progression s&apos;affiche cours par cours.
            </p>
            <ul className="nz-bullets">
              <li>Correction instantanée et explications</li>
              <li>Score et seuil de réussite pour chaque quiz</li>
              <li>Suivi des leçons terminées dans « Mon espace »</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---- Featured courses ---- */}
      {featured.length > 0 && (
        <section className="l-inner" style={{ paddingBottom: "4.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <span className="nz-tag">Pour bien démarrer</span>
              <h2 className="sect-title" style={{ marginTop: ".4rem" }}>Cours en vedette</h2>
            </div>
            <Link href="/cours" className="l-btn-ghost" style={{ padding: ".6rem 1.2rem", fontSize: ".9rem" }}>
              Voir tous les cours
            </Link>
          </div>
          <div className="l-cards-3" style={{ marginTop: "1.8rem" }}>
            {featured.map((c) => (
              <Link
                key={c.id}
                href={`/cours/${c.level.category.slug}/${c.level.slug}/${c.slug}`}
                className="l-glass l-course-card"
                style={{ padding: ".9rem" }}
              >
                <div className="nz-illu" style={{ aspectRatio: "16 / 10" }}>
                  <Image
                    src={c.cover_url || subjectIllustration(c.level.category.slug)}
                    alt=""
                    fill
                    sizes="(max-width: 860px) 100vw, 360px"
                    unoptimized={!!c.cover_url}
                  />
                  <span
                    style={{
                      position: "absolute", top: 10, right: 10, fontWeight: 800, fontSize: ".72rem",
                      padding: ".25rem .65rem", borderRadius: 999,
                      background: c.is_premium ? "var(--l-sun)" : "var(--l-grow)",
                      color: "#1b1440",
                    }}
                  >
                    {c.is_premium ? `${c.price} €` : "Gratuit"}
                  </span>
                </div>
                <div style={{ padding: ".9rem .4rem .3rem" }}>
                  <span style={{ fontSize: ".78rem", fontWeight: 800, color: accent(c.level.category.slug) }}>
                    {c.level.category.name} · {c.level.name}
                  </span>
                  <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.25rem", marginTop: ".3rem" }}>
                    {c.title}
                  </h3>
                  {c.description && (
                    <p style={{ color: "var(--l-muted)", fontSize: ".9rem", marginTop: ".35rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---- How it works ---- */}
      <section className="l-inner" style={{ paddingBottom: "4.5rem" }}>
        <span className="nz-tag">En trois étapes</span>
        <h2 className="sect-title" style={{ marginTop: ".4rem" }}>Comment ça marche</h2>
        <ol className="l-cards-3" style={{ marginTop: "1.8rem" }}>
          {[
            { n: "1", t: "Choisis ton niveau", d: "Primaire, collège ou lycée : commence là où tu te sens prêt.", c: "var(--l-francais)" },
            { n: "2", t: "Suis les leçons", d: "Articles, vidéos, fiches à télécharger et quiz pour t'entraîner.", c: "var(--l-maths)" },
            { n: "3", t: "Suis tes progrès", d: "Marque les leçons terminées et reviens quand tu veux.", c: "var(--l-grow)" },
          ].map((s) => (
            <li key={s.n} className="l-glass" style={{ padding: "1.6rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: s.c, color: "#fff", fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.4rem" }}>
                {s.n}
              </div>
              <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.2rem", marginTop: ".9rem" }}>{s.t}</h3>
              <p style={{ color: "var(--l-muted)", fontSize: ".92rem", marginTop: ".4rem" }}>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- FAQ ---- */}
      <section className="l-inner" style={{ paddingBottom: "4.5rem" }}>
        <div className="nz-feature" style={{ alignItems: "start" }}>
          <div>
            <span className="nz-tag">Questions fréquentes</span>
            <h2 className="sect-title" style={{ marginTop: ".4rem" }}>Tout ce que les parents nous demandent</h2>
            <p style={{ color: "var(--l-muted)", marginTop: ".6rem", maxWidth: "40ch" }}>
              Une autre question ? Crée ton compte gratuit et explore les cours
              librement.
            </p>
          </div>
          <div className="nz-faq">
            {FAQ.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="l-inner" style={{ paddingBottom: "4rem" }}>
        <div className="l-glass" style={{ padding: "3rem 1.5rem", textAlign: "center", borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <OwlMark size={60} tone="light" blink />
          </div>
          <h2 className="sect-title">Prêt à commencer ton premier cours ?</h2>
          <p style={{ color: "var(--l-muted)", marginTop: ".5rem" }}>La création de compte est gratuite.</p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/inscription" className="l-btn-primary">Je m&apos;inscris gratuitement →</Link>
            <Link href="/cours" className="l-btn-ghost">Voir les cours</Link>
          </div>
        </div>
      </section>

      <NzFooter />
    </div>
  );
}
