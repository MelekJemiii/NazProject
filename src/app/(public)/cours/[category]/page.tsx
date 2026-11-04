import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getLevels,
  getCoursesByLevel,
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/course-card";
import { PageBand } from "@/components/page-band";
import { categoryAccent } from "@/lib/ui";
import { subjectIllustration } from "@/lib/illustrations";

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
  const darkAccent = cat.slug === "mathematiques" ? "var(--l-maths)" : "var(--l-francais)";
  const levels = await getLevels(cat.id);
  const levelsWithCourses = await Promise.all(
    levels.map(async (lvl) => ({
      level: lvl,
      courses: await getCoursesByLevel(lvl.id),
    })),
  );

  // Lesson counts per course (published only, via RLS).
  const courseIds = levelsWithCourses.flatMap((l) => l.courses.map((c) => c.id));
  const lessonCounts: Record<string, number> = {};
  if (courseIds.length) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lessons")
      .select("course_id")
      .in("course_id", courseIds)
      .eq("status", "published");
    for (const row of data ?? []) {
      lessonCounts[row.course_id] = (lessonCounts[row.course_id] ?? 0) + 1;
    }
  }

  const nonEmpty = levelsWithCourses.filter((l) => l.courses.length > 0);
  const totalCourses = courseIds.length;

  return (
    <>
      <PageBand
        crumbs={[
          { href: "/", label: "Accueil" },
          { href: "/cours", label: "Les cours" },
          { label: cat.name },
        ]}
        eyebrow={`${totalCourses} cours · ${nonEmpty.length} niveau${nonEmpty.length > 1 ? "x" : ""}`}
        title={cat.name}
        description={cat.description}
        illustration={subjectIllustration(cat.slug)}
        accent={darkAccent}
      >
        {nonEmpty.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: "1.4rem" }}>
            {nonEmpty.map(({ level }) => (
              <a key={level.id} href={`#${level.slug}`} className="l-chip" style={{ fontSize: ".85rem" }}>
                {level.name}
              </a>
            ))}
          </div>
        )}
      </PageBand>

      <div className="mx-auto max-w-6xl px-5 py-12">
        {nonEmpty.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-card p-10 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              Bientôt disponible
            </p>
            <p className="mt-2 text-ink-soft">
              Les cours de cette matière arrivent très prochainement.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {nonEmpty.map(({ level, courses }) => (
              <section key={level.id} id={level.slug} className="scroll-mt-24">
                <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-3xl font-semibold text-ink">
                    {level.name}
                  </h2>
                  <span className="text-sm font-semibold text-ink-soft">
                    {courses.length} cours
                  </span>
                </div>
                {level.description && (
                  <p className="-mt-3 mb-5 max-w-2xl text-sm text-ink-soft">
                    {level.description}
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      accent={accent}
                      categorySlug={cat.slug}
                      levelName={level.name}
                      lessonCount={lessonCounts[course.id] ?? 0}
                      href={`/cours/${cat.slug}/${level.slug}/${course.slug}`}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
