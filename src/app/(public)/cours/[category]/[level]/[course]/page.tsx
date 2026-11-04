import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug, getLessons, hasCourseAccess } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categoryAccent, lessonTypeMeta } from "@/lib/ui";
import { CourseAccessPanel } from "@/components/course-access-panel";
import { stripeEnabled } from "@/lib/stripe";
import { ViewTracker } from "@/components/view-tracker";

type Params = {
  category: string;
  level: string;
  course: string;
};

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, level, course } = await props.params;
  const c = await getCourseBySlug(category, level, course);
  if (!c) return { title: "Cours introuvable" };
  return { title: c.title, description: c.description ?? undefined };
}

export default async function CoursePage(props: {
  params: Promise<Params>;
  searchParams: Promise<{ paiement?: string }>;
}) {
  const { category, level, course } = await props.params;
  const { paiement } = await props.searchParams;
  const c = await getCourseBySlug(category, level, course);
  if (!c) notFound();

  const accent = categoryAccent(c.level.category.slug);
  const [lessons, access, { userId }] = await Promise.all([
    getLessons(c.id),
    hasCourseAccess(c.id),
    getCurrentUser(),
  ]);

  // Pull the user's completed lesson ids + entitlement status (if signed in).
  let completed = new Set<string>();
  let entitlementStatus: string | null = null;
  if (userId) {
    const supabase = await createClient();
    const [{ data: progress }, { data: ent }] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId),
      supabase
        .from("entitlements")
        .select("status")
        .eq("user_id", userId)
        .eq("course_id", c.id)
        .maybeSingle(),
    ]);
    completed = new Set(
      (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id),
    );
    entitlementStatus = ent?.status ?? null;
  }

  const base = `/cours/${category}/${level}/${course}`;
  const doneCount = lessons.filter((l) => completed.has(l.id)).length;
  const progressPct = lessons.length
    ? Math.round((doneCount / lessons.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <ViewTracker path={base} courseId={c.id} />
      <nav className="mb-6 text-sm font-semibold text-ink-soft">
        <Link href="/cours" className="hover:text-ink">
          Les cours
        </Link>{" "}
        /{" "}
        <Link href={`/cours/${category}`} className="hover:text-ink">
          {c.level.category.name}
        </Link>{" "}
        / <span className="text-ink">{c.title}</span>
      </nav>

      {paiement === "reussi" && (
        <div className="mb-6 rounded-card border border-grow bg-grow/10 p-4 font-semibold text-grow">
          🎉 Paiement réussi ! Ton accès est en cours d'activation. Recharge la
          page si le cours n'est pas encore débloqué.
        </div>
      )}
      {paiement === "annule" && (
        <div className="mb-6 rounded-card border border-line bg-paper-2 p-4 font-semibold text-ink-soft">
          Paiement annulé. Tu peux réessayer quand tu veux.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Main --------------------------------------------------------- */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: accent }}
            >
              {c.level.category.name} · {c.level.name}
            </span>
            {c.is_premium ? (
              <span className="rounded-full bg-sun px-3 py-1 text-xs font-extrabold text-ink">
                Premium
              </span>
            ) : (
              <span className="rounded-full bg-grow/15 px-3 py-1 text-xs font-bold text-grow">
                Gratuit
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
            {c.title}
          </h1>
          {c.description && (
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">
              {c.description}
            </p>
          )}

          {userId && lessons.length > 0 && (
            <div className="mt-6">
              <div className="mb-1 flex justify-between text-sm font-semibold text-ink-soft">
                <span>Ta progression</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-paper-2">
                <div
                  className="h-full rounded-full bg-grow transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Lessons list */}
          <ol className="mt-8 space-y-2.5">
            {lessons.map((lesson, i) => {
              const meta = lessonTypeMeta[lesson.type];
              const locked = c.is_premium && lesson.is_premium && !access;
              const isDone = completed.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`${base}/${lesson.slug}`}
                    className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-ink"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                      style={{ background: "var(--paper-2)" }}
                      aria-hidden
                    >
                      {isDone ? "✅" : meta.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">
                        <span className="text-ink-soft">{i + 1}.</span>{" "}
                        {lesson.title}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {meta.label}
                        {lesson.duration_min
                          ? ` · ${lesson.duration_min} min`
                          : ""}
                      </span>
                    </span>
                    {locked && (
                      <span className="shrink-0 text-ink-soft" aria-label="Verrouillé">
                        🔒
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            {lessons.length === 0 && (
              <li className="rounded-2xl border border-dashed border-line bg-card p-6 text-center text-ink-soft">
                Les leçons de ce cours arrivent bientôt.
              </li>
            )}
          </ol>
        </div>

        {/* Sidebar: access panel --------------------------------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CourseAccessPanel
            courseId={c.id}
            isPremium={c.is_premium}
            price={c.price ?? 0}
            hasAccess={access}
            isSignedIn={!!userId}
            entitlementStatus={entitlementStatus}
            firstLessonHref={
              lessons.length ? `${base}/${lessons[0].slug}` : undefined
            }
            revalidatePath={base}
            accent={accent}
            stripeEnabled={stripeEnabled()}
          />
        </aside>
      </div>
    </div>
  );
}
