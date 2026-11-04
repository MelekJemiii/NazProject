import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categoryAccent } from "@/lib/ui";
import { PageBand } from "@/components/page-band";
import { illustrations, subjectIllustration } from "@/lib/illustrations";

export const metadata = { title: "Mon espace" };

type CourseRef = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  level: { slug: string; name: string; category: { slug: string; name: string } } | null;
};

export default async function MonEspacePage() {
  const { userId, profile } = await getCurrentUser();
  if (!userId) redirect("/connexion?redirect=/mon-espace");

  const supabase = await createClient();
  const courseSelect =
    "id, title, slug, cover_url, level:levels(slug, name, category:categories(slug, name))";

  const [
    { data: enrollments },
    { data: grants },
    { data: progress },
    { data: lastViewed },
    { data: attempts },
  ] = await Promise.all([
    supabase.from("enrollments").select(`course:courses(${courseSelect})`).eq("user_id", userId),
    supabase
      .from("entitlements")
      .select(`course:courses(${courseSelect})`)
      .eq("user_id", userId)
      .eq("status", "granted"),
    supabase
      .from("lesson_progress")
      .select("lesson_id, lesson:lessons(course_id)")
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("lesson_progress")
      .select(
        "last_viewed, completed, lesson:lessons(title, slug, course:courses(title, slug, level:levels(slug, category:categories(slug))))",
      )
      .eq("user_id", userId)
      .order("last_viewed", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("quiz_attempts").select("score, passed").eq("user_id", userId),
  ]);

  // Merge enrolled + premium-granted courses (dedup by id).
  const map = new Map<string, CourseRef>();
  for (const row of [...(enrollments ?? []), ...(grants ?? [])] as unknown as {
    course: CourseRef | null;
  }[]) {
    if (row.course) map.set(row.course.id, row.course);
  }
  const courses = [...map.values()];

  const completedByCourse: Record<string, number> = {};
  for (const p of (progress ?? []) as unknown as { lesson: { course_id: string } | null }[]) {
    const cid = p.lesson?.course_id;
    if (cid) completedByCourse[cid] = (completedByCourse[cid] ?? 0) + 1;
  }

  const courseIds = courses.map((c) => c.id);
  const totalByCourse: Record<string, number> = {};
  if (courseIds.length) {
    const { data } = await supabase
      .from("lessons")
      .select("course_id")
      .in("course_id", courseIds)
      .eq("status", "published");
    for (const l of data ?? []) totalByCourse[l.course_id] = (totalByCourse[l.course_id] ?? 0) + 1;
  }

  const lessonsDone = (progress ?? []).length;
  const quizPassed = (attempts ?? []).filter((a) => a.passed).length;
  const quizAvg = attempts?.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : null;

  const last = lastViewed as unknown as {
    completed: boolean;
    lesson: {
      title: string;
      slug: string;
      course: { title: string; slug: string; level: { slug: string; category: { slug: string } } | null } | null;
    } | null;
  } | null;
  const lastHref =
    last?.lesson?.course?.level?.category
      ? `/cours/${last.lesson.course.level.category.slug}/${last.lesson.course.level.slug}/${last.lesson.course.slug}/${last.lesson.slug}`
      : null;

  const firstName = (profile?.full_name || "").split(" ")[0];

  const stats = [
    { label: "Cours suivis", value: courses.length },
    { label: "Leçons terminées", value: lessonsDone },
    { label: "Quiz réussis", value: quizPassed },
    { label: "Moyenne aux quiz", value: quizAvg === null ? "—" : `${quizAvg}%` },
  ];

  return (
    <>
      <PageBand
        eyebrow="Mon espace"
        title={firstName ? `Bonjour ${firstName} !` : "Bonjour !"}
        description="Voici où tu en es. Reprends là où tu t'es arrêté, ou commence un nouveau cours."
        illustration={illustrations.quiz}
      >
        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: ".7rem", marginTop: "1.5rem", maxWidth: 560 }}>
          {stats.map((s) => (
            <div key={s.label} className="l-glass" style={{ padding: ".9rem 1rem", borderRadius: 16 }}>
              <dt style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--l-muted)" }}>{s.label}</dt>
              <dd style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "1.7rem", fontVariantNumeric: "tabular-nums" }}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </PageBand>

      <div className="mx-auto max-w-6xl px-5 py-12">
        {last?.lesson && lastHref && (
          <Link
            href={lastHref}
            className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-ink"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-ink-soft">
                {last.completed ? "Dernière leçon terminée" : "Continuer où tu t'es arrêté"}
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-ink">{last.lesson.title}</p>
              <p className="text-sm text-ink-soft">{last.lesson.course?.title}</p>
            </div>
            <span className="rounded-full bg-ink px-5 py-2.5 text-sm font-extrabold text-paper">
              {last.completed ? "Revoir" : "Reprendre"} →
            </span>
          </Link>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-semibold text-ink">Mes cours</h2>
          <Link href="/cours" className="text-sm font-extrabold text-ink underline-offset-4 hover:underline">
            Parcourir le catalogue →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="mt-5 rounded-card border border-dashed border-line bg-card p-10 text-center">
            <p className="font-display text-xl font-semibold text-ink">Aucun cours pour l&apos;instant</p>
            <p className="mt-2 text-ink-soft">Choisis un cours gratuit pour commencer, il apparaîtra ici avec ta progression.</p>
            <Link href="/cours" className="mt-5 inline-block rounded-full bg-ink px-6 py-3 font-bold text-paper hover:opacity-90">
              Parcourir les cours
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="flex flex-col rounded-card border border-line bg-card p-3 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(30,42,82,0.35)]"
                >
                  <div className="nz-cover">
                    <Image
                      src={c.cover_url || subjectIllustration(c.level.category.slug)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      unoptimized={!!c.cover_url}
                    />
                    {pct === 100 && (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-grow px-2.5 py-0.5 text-xs font-extrabold text-white">
                        ✓ Terminé
                      </span>
                    )}
                  </div>
                  <div className="px-2 pb-2 pt-3.5">
                    <span className="text-xs font-extrabold" style={{ color: accent }}>
                      {c.level.category.name} · {c.level.name}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-semibold text-ink">{c.title}</h3>
                    <div className="mt-3 flex justify-between text-sm font-semibold text-ink-soft">
                      <span>{done}/{total} leçons</span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
