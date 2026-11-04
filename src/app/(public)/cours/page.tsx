import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getCategories,
  getCategoryCourseCounts,
  getLevels,
} from "@/lib/queries";
import { PageBand } from "@/components/page-band";
import { illustrations, subjectIllustration } from "@/lib/illustrations";
import { categoryAccent } from "@/lib/ui";

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
  const levelsByCat = await Promise.all(
    categories.map(async (c) => ({ id: c.id, levels: await getLevels(c.id) })),
  );
  const levelsFor = (id: string) =>
    levelsByCat.find((l) => l.id === id)?.levels ?? [];

  return (
    <>
      <PageBand
        crumbs={[{ href: "/", label: "Accueil" }, { label: "Les cours" }]}
        eyebrow="Catalogue"
        title="Tous les cours"
        description="Deux matières, du CP à la Terminale. Choisis une matière, puis ton niveau."
        illustration={illustrations.study}
      />

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((cat) => {
            const accent = categoryAccent(cat.slug);
            const lvls = levelsFor(cat.id);
            return (
              <article
                key={cat.id}
                className="overflow-hidden rounded-card border border-line bg-card"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <Link href={`/cours/${cat.slug}`} className="block p-3">
                  <div className="nz-cover">
                    <Image
                      src={subjectIllustration(cat.slug)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 560px"
                    />
                  </div>
                </Link>
                <div className="px-6 pb-6 pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      <Link href={`/cours/${cat.slug}`} className="hover:underline">
                        {cat.name}
                      </Link>
                    </h2>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-extrabold"
                      style={{
                        background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                        color: accent,
                      }}
                    >
                      {counts[cat.id] ?? 0} cours
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{cat.description}</p>
                  {lvls.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {lvls.map((l) => (
                        <Link
                          key={l.id}
                          href={`/cours/${cat.slug}#${l.slug}`}
                          className="rounded-full border border-line px-3 py-1 text-sm font-bold text-ink-soft hover:border-ink hover:text-ink"
                        >
                          {l.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/cours/${cat.slug}`}
                    className="mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-extrabold text-white hover:opacity-90"
                    style={{ background: accent }}
                  >
                    Voir les cours de {cat.name.toLowerCase()} →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
