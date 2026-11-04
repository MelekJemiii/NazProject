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
import { PageBand } from "@/components/page-band";
import { subjectIllustration } from "@/lib/illustrations";

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

  const darkAccent =
    c.level.category.slug === "mathematiques" ? "var(--l-maths)" : "var(--l-francais)";
  const totalMinutes = lessons.reduce((s, l) => s + (l.duration_min ?? 0), 0);

  return (
    <>
    <ViewTracker path={base} courseId={c.id} />
    <PageBand
      crumbs={[
        { href: "/cours", label: "Les cours" },
        { href: `/cours/${category}`, label: c.level.category.name },
        { label: c.title },
      ]}
      eyebrow={`${c.level.category.name} · ${c.level.name}`}
      title={c.title}
      description={c.description}
      illustration={c.cover_url || subjectIllustration(c.level.category.slug)}
      accent={darkAccent}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: "1.3rem" }}>
        <span className="l-chip" style={{ fontSize: ".82rem" }}>
          {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
        </span>
        {totalMinutes > 0 && (
          <span className="l-chip" style={{ fontSize: ".82rem" }}>≈ {totalMinutes} min</span>
        )}
        <span
          className="l-chip"
          style={{
            fontSize: ".82rem",
            color: c.is_premium ? "var(--l-sun)" : "var(--l-grow)",
          }}
        >
          {c.is_premium ? `Premium · ${c.price} €` : "Gratuit"}
        </span>
      </div>
      {userId && lessons.length > 0 && (
        <div style={{ marginTop: "1.4rem", maxWidth: 420 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", fontWeight: 700, color: "var(--l-muted)" }}>
            <span>Ta progression</span>
            <span style={{ color: "var(--l-text)", fontVariantNumeric: "tabular-nums" }}>
              {doneCount}/{lessons.length} · {progressPct}%
            </span>
          </div>
          <div style={{ marginTop: ".4rem", height: 10, borderRadius: 999, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--l-grow), var(--l-cyan))" }} />
          </div>
        </div>
      )}
    </PageBand>

    <div className="mx-auto max-w-6xl px-5 py-12">
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
          <h2 className="font-display text-2xl font-semibold text-ink">
            Programme du cours
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Suis les leçons dans l&apos;ordre, ou va directement à celle qui
            t&apos;intéresse.
          </p>

          {/* Lessons list */}
          <ol className="relative mt-6 space-y-2.5">
            {lessons.map((lesson, i) => {
              const meta = lessonTypeMeta[lesson.type];
              const locked = c.is_premium && lesson.is_premium && !access;
              const isDone = completed.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`${base}/${lesson.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_14px_30px_-18px_rgba(30,42,82,0.4)]"
                  >
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-semibold"
                      style={{
                        background: isDone
                          ? "color-mix(in srgb, var(--grow) 16%, transparent)"
                          : "var(--paper-2)",
                        color: isDone ? "var(--grow)" : "var(--ink)",
                      }}
                      aria-hidden
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                        <span aria-hidden>{meta.icon}</span>
                        {meta.label}
                        {lesson.duration_min
                          ? ` · ${lesson.duration_min} min`
                          : ""}
                        {isDone && <span className="text-grow">· Terminée</span>}
                      </span>
                    </span>
                    {locked ? (
                      <span
                        className="shrink-0 rounded-full bg-sun/20 px-2.5 py-1 text-xs font-extrabold text-ink"
                        aria-label="Verrouillé"
                      >
                        🔒 Premium
                      </span>
                    ) : (
                      <span
                        className="shrink-0 text-lg font-bold transition-transform group-hover:translate-x-1"
                        style={{ color: accent }}
                        aria-hidden
                      >
                        →
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
    </>
  );
}
