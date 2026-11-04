import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categoryAccent } from "@/lib/ui";

export const metadata = { title: "Mon espace" };

export default async function MonEspacePage() {
  const { userId, profile } = await getCurrentUser();
  if (!userId) redirect("/connexion?redirect=/mon-espace");

  const supabase = await createClient();

  // Enrolled courses with their level + category for building URLs.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      "course_id, course:courses(id, title, slug, level:levels(slug, category:categories(slug)))",
    )
    .eq("user_id", userId);

  // Completed-lesson counts per course.
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, lesson:lessons(course_id)")
    .eq("user_id", userId)
    .eq("completed", true);

  const completedByCourse: Record<string, number> = {};
  for (const p of (progress ?? []) as unknown as {
    lesson: { course_id: string } | null;
  }[]) {
    const cid = p.lesson?.course_id;
    if (cid) completedByCourse[cid] = (completedByCourse[cid] ?? 0) + 1;
  }

  // Total lessons per enrolled course.
  const courseIds = (enrollments ?? []).map((e) => e.course_id);
  const { data: lessonCounts } = courseIds.length
    ? await supabase
        .from("lessons")
        .select("course_id")
        .in("course_id", courseIds)
        .eq("status", "published")
    : { data: [] };
  const totalByCourse: Record<string, number> = {};
  for (const l of lessonCounts ?? []) {
    totalByCourse[l.course_id] = (totalByCourse[l.course_id] ?? 0) + 1;
  }

  const courses = (enrollments ?? [])
    .map((e) => e.course as unknown as {
      id: string;
      title: string;
      slug: string;
      level: { slug: string; category: { slug: string } } | null;
    } | null)
    .filter(Boolean) as {
    id: string;
    title: string;
    slug: string;
    level: { slug: string; category: { slug: string } } | null;
  }[];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-4xl font-semibold text-ink">
        Bonjour {profile?.full_name || "👋"}
      </h1>
      <p className="mt-2 text-ink-soft">Reprends là où tu t'es arrêté.</p>

      <h2 className="mt-10 font-display text-2xl font-semibold text-ink">
        Mes cours
      </h2>

      {courses.length === 0 ? (
        <div className="mt-4 rounded-card border border-dashed border-line bg-card p-8 text-center">
          <p className="text-ink-soft">
            Tu n'as pas encore commencé de cours.
          </p>
          <Link
            href="/cours"
            className="mt-4 inline-block rounded-full bg-ink px-6 py-3 font-bold text-paper hover:opacity-90"
          >
            Parcourir les cours
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => {
            if (!c.level?.category) return null;
            const total = totalByCourse[c.id] ?? 0;
            const done = completedByCourse[c.id] ?? 0;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const accent = categoryAccent(c.level.category.slug);
            const href = `/cours/${c.level.category.slug}/${c.level.slug}/${c.slug}`;
            return (
              <Link
                key={c.id}
                href={href}
                className="rounded-card border border-line bg-card p-5 transition-transform hover:-translate-y-1"
              >
                <h3 className="font-display text-lg font-semibold text-ink">
                  {c.title}
                </h3>
                <div className="mt-3 flex justify-between text-sm font-semibold text-ink-soft">
                  <span>
                    {done}/{total} leçons
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: accent }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
