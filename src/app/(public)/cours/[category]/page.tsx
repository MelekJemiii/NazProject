import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategoryBySlug,
  getLevels,
  getCoursesByLevel,
} from "@/lib/queries";
import { CourseCard } from "@/components/course-card";
import { categoryAccent } from "@/lib/ui";

export async function generateMetadata(props: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await props.params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Matière introuvable" };
  return { title: cat.name, description: cat.description ?? undefined };
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await props.params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const accent = categoryAccent(cat.slug);
  const levels = await getLevels(cat.id);
  const levelsWithCourses = await Promise.all(
    levels.map(async (lvl) => ({
      level: lvl,
      courses: await getCoursesByLevel(lvl.id),
    })),
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <nav className="mb-6 text-sm font-semibold text-ink-soft">
        <Link href="/cours" className="hover:text-ink">
          Les cours
        </Link>{" "}
        <span aria-hidden>/</span> <span className="text-ink">{cat.name}</span>
      </nav>

      <header className="mb-10 flex items-center gap-4">
        <div
          aria-hidden
          className="grid h-16 w-16 place-items-center rounded-2xl text-4xl"
          style={{ background: accent, color: "#fff" }}
        >
          {cat.icon ?? "📘"}
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink">
            {cat.name}
          </h1>
          {cat.description && (
            <p className="mt-1 text-ink-soft">{cat.description}</p>
          )}
        </div>
      </header>

      {levelsWithCourses.every((l) => l.courses.length === 0) ? (
        <EmptyState />
      ) : (
        <div className="space-y-12">
          {levelsWithCourses.map(({ level, courses }) =>
            courses.length === 0 ? null : (
              <section key={level.id}>
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 className="font-display text-2xl font-semibold text-ink">
                    {level.name}
                  </h2>
                  <span className="text-sm text-ink-soft">
                    {courses.length} cours
                  </span>
                </div>
                {level.description && (
                  <p className="mb-4 max-w-2xl text-sm text-ink-soft">
                    {level.description}
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      accent={accent}
                      href={`/cours/${cat.slug}/${level.slug}/${course.slug}`}
                    />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-line bg-card p-10 text-center">
      <p className="font-display text-xl font-semibold text-ink">
        Bientôt disponible
      </p>
      <p className="mt-2 text-ink-soft">
        Les cours de cette matière arrivent très prochainement.
      </p>
    </div>
  );
}
