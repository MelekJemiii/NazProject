import Link from "next/link";
import { getCategories, getCategoryCourseCounts } from "@/lib/queries";

export default async function HomePage() {
  const [categories, counts] = await Promise.all([
    getCategories(),
    getCategoryCourseCounts(),
  ]);

  return (
    <>
      {/* Hero ----------------------------------------------------------- */}
      <section className="cahier-lines border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card px-3.5 py-1.5 text-sm font-bold text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-grow" />
            Français &amp; Mathématiques · par niveau
          </p>
          <h1 className="max-w-3xl font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Apprendre devient{" "}
            <span className="ink-underline">un vrai plaisir.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Des cours clairs et progressifs pour les enfants et les élèves.
            Lis, regarde, télécharge tes fiches et teste-toi avec des quiz — à
            ton rythme.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cours"
              className="rounded-full bg-ink px-6 py-3 font-bold text-paper hover:opacity-90"
            >
              Découvrir les cours
            </Link>
            <Link
              href="/inscription"
              className="rounded-full border-2 border-ink px-6 py-3 font-bold text-ink hover:bg-ink hover:text-paper"
            >
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Subjects ------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Choisis ta matière
        </h2>
        <p className="mt-2 text-ink-soft">
          Chaque matière est organisée par niveau, du primaire au lycée.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {categories.map((cat) => {
            const accent =
              cat.slug === "mathematiques"
                ? "var(--maths)"
                : cat.slug === "francais"
                  ? "var(--francais)"
                  : (cat.color ?? "var(--ink)");
            return (
              <Link
                key={cat.id}
                href={`/cours/${cat.slug}`}
                className="group relative overflow-hidden rounded-card border border-line bg-card p-7 transition-transform hover:-translate-y-1"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <div
                  aria-hidden
                  className="absolute right-5 top-5 grid h-14 w-14 place-items-center rounded-2xl text-3xl"
                  style={{ background: accent, color: "#fff" }}
                >
                  {cat.icon ?? "📘"}
                </div>
                <div
                  className="mb-3 h-1.5 w-12 rounded-full"
                  style={{ background: accent }}
                />
                <h3 className="font-display text-2xl font-semibold text-ink">
                  {cat.name}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">
                  {cat.description}
                </p>
                <p className="mt-5 text-sm font-bold" style={{ color: accent }}>
                  {counts[cat.id] ?? 0} cours disponibles →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works -------------------------------------------------- */}
      <section className="border-y border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Comment ça marche
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                t: "Choisis ton niveau",
                d: "Primaire, collège ou lycée — commence là où tu te sens prêt.",
              },
              {
                t: "Suis les leçons",
                d: "Articles, vidéos, fiches à télécharger et quiz pour t'entraîner.",
              },
              {
                t: "Suis tes progrès",
                d: "Marque les leçons terminées et reviens quand tu veux.",
              },
            ].map((step, i) => (
              <li key={step.t} className="rounded-card bg-card p-6 border border-line">
                <span className="font-display text-4xl font-semibold text-sun">
                  {i + 1}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                  {step.t}
                </h3>
                <p className="mt-1.5 text-sm text-ink-soft">{step.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA ------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-tight text-ink">
          Prêt à commencer ton premier cours&nbsp;?
        </h2>
        <Link
          href="/inscription"
          className="mt-7 inline-block rounded-full bg-ink px-8 py-3.5 font-bold text-paper hover:opacity-90"
        >
          Je m'inscris gratuitement
        </Link>
      </section>
    </>
  );
}
