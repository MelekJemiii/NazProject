import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getCategoryCourseCounts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Tous les cours",
  description:
    "Parcours tous les cours de français et de mathématiques, classés par niveau.",
};

export default async function CoursIndexPage() {
  const [categories, counts] = await Promise.all([
    getCategories(),
    getCategoryCourseCounts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-semibold text-ink">
          Les cours
        </h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Deux matières, plusieurs niveaux. Choisis une matière pour voir les
          cours disponibles.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
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
              className="group rounded-card border border-line bg-card p-7 transition-transform hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <div
                aria-hidden
                className="mb-4 grid h-14 w-14 place-items-center rounded-2xl text-3xl"
                style={{ background: accent, color: "#fff" }}
              >
                {cat.icon ?? "📘"}
              </div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                {cat.name}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">{cat.description}</p>
              <p className="mt-5 text-sm font-bold" style={{ color: accent }}>
                {counts[cat.id] ?? 0} cours →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
