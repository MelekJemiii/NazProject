import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCourseBySlug,
  getLessons,
  getLessonBySlug,
  hasCourseAccess,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categoryAccent, lessonTypeMeta } from "@/lib/ui";
import { LessonCompleteToggle } from "@/components/lesson-complete-toggle";
import { QuizRunner, type QuizData } from "@/components/quiz-runner";
import { ViewTracker } from "@/components/view-tracker";

type Params = {
  category: string;
  level: string;
  course: string;
  lesson: string;
};

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, level, course, lesson } = await props.params;
  const c = await getCourseBySlug(category, level, course);
  if (!c) return { title: "Leçon introuvable" };
  const l = await getLessonBySlug(c.id, lesson);
  return { title: l ? `${l.title} · ${c.title}` : "Leçon introuvable" };
}

export default async function LessonPage(props: { params: Promise<Params> }) {
  const { category, level, course, lesson } = await props.params;
  const c = await getCourseBySlug(category, level, course);
  if (!c) notFound();

  const [lessons, current, access, { userId }] = await Promise.all([
    getLessons(c.id),
    getLessonBySlug(c.id, lesson),
    hasCourseAccess(c.id),
    getCurrentUser(),
  ]);
  if (!current) notFound();

  const accent = categoryAccent(c.level.category.slug);
  const base = `/cours/${category}/${level}/${course}`;
  const lessonPath = `${base}/${lesson}`;

  const idx = lessons.findIndex((l) => l.id === current.id);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const locked = c.is_premium && current.is_premium && !access;
  const meta = lessonTypeMeta[current.type];

  // Progress for this lesson.
  let isDone = false;
  if (userId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lesson_progress")
      .select("completed")
      .eq("user_id", userId)
      .eq("lesson_id", current.id)
      .maybeSingle();
    isDone = data?.completed ?? false;
  }

  // Quiz data — only fetched when NOT locked. Correct answers resolved here
  // (RLS lets anyone read options, so gating UX relies on the server view).
  let quiz: QuizData | null = null;
  if (!locked && current.type === "quiz") {
    const supabase = await createClient();
    const { data: quizRow } = await supabase
      .from("quizzes")
      .select("id, pass_score")
      .eq("lesson_id", current.id)
      .maybeSingle();
    if (quizRow) {
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("id, prompt, explanation, position")
        .eq("quiz_id", quizRow.id)
        .order("position");
      const qIds = (questions ?? []).map((q) => q.id);
      const { data: options } = await supabase
        .from("quiz_options")
        .select("id, question_id, label, is_correct, position")
        .in("question_id", qIds.length ? qIds : ["none"])
        .order("position");
      quiz = {
        id: quizRow.id,
        passScore: quizRow.pass_score,
        questions: (questions ?? []).map((q) => {
          const opts = (options ?? []).filter((o) => o.question_id === q.id);
          return {
            id: q.id,
            prompt: q.prompt,
            explanation: q.explanation,
            options: opts.map((o) => ({ id: o.id, label: o.label })),
            correctOptionId: opts.find((o) => o.is_correct)?.id ?? "",
          };
        }),
      };
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[260px_1fr]">
      <ViewTracker path={lessonPath} courseId={c.id} lessonId={current.id} />
      {/* Lesson rail -------------------------------------------------- */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Link
          href={base}
          className="mb-4 inline-block text-sm font-bold text-ink-soft hover:text-ink"
        >
          ← {c.title}
        </Link>
        <ol className="space-y-1">
          {lessons.map((l, i) => {
            const activeLesson = l.id === current.id;
            const m = lessonTypeMeta[l.type];
            return (
              <li key={l.id}>
                <Link
                  href={`${base}/${l.slug}`}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold"
                  style={{
                    background: activeLesson ? "var(--paper-2)" : "transparent",
                    color: activeLesson ? "var(--ink)" : "var(--ink-soft)",
                  }}
                >
                  <span aria-hidden>{m.icon}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {i + 1}. {l.title}
                  </span>
                  {c.is_premium && l.is_premium && !access && (
                    <span aria-hidden>🔒</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Content ------------------------------------------------------ */}
      <article className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-soft">
          <span aria-hidden>{meta.icon}</span>
          <span>{meta.label}</span>
          {current.duration_min ? <span>· {current.duration_min} min</span> : null}
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
          {current.title}
        </h1>

        <div className="mt-8">
          {locked ? (
            <LockedNotice courseHref={base} isSignedIn={!!userId} />
          ) : (
            <LessonBody lesson={current} quiz={quiz} accent={accent} />
          )}
        </div>

        {/* Footer actions */}
        {!locked && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            {userId ? (
              <LessonCompleteToggle
                lessonId={current.id}
                initialCompleted={isDone}
                revalidatePath={lessonPath}
                accent={accent}
              />
            ) : (
              <Link
                href={`/connexion?redirect=${encodeURIComponent(lessonPath)}`}
                className="font-bold text-ink underline"
              >
                Connecte-toi pour suivre ta progression
              </Link>
            )}
            <div className="flex gap-2">
              {prev && (
                <Link
                  href={`${base}/${prev.slug}`}
                  className="rounded-full border-2 border-line px-4 py-2 font-bold text-ink hover:border-ink"
                >
                  ← Précédent
                </Link>
              )}
              {next && (
                <Link
                  href={`${base}/${next.slug}`}
                  className="rounded-full px-4 py-2 font-bold text-white hover:opacity-90"
                  style={{ background: accent }}
                >
                  Suivant →
                </Link>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function LessonBody({
  lesson,
  quiz,
  accent,
}: {
  lesson: Awaited<ReturnType<typeof getLessonBySlug>>;
  quiz: QuizData | null;
  accent: string;
}) {
  if (!lesson) return null;

  switch (lesson.type) {
    case "article":
      return (
        <div
          className="prose-lesson"
          dangerouslySetInnerHTML={{ __html: lesson.content ?? "" }}
        />
      );
    case "video":
      return lesson.video_url ? (
        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-black">
            <VideoEmbed url={lesson.video_url} title={lesson.title} />
          </div>
          {lesson.content && (
            <div
              className="prose-lesson"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}
        </div>
      ) : (
        <p className="text-ink-soft">La vidéo sera ajoutée prochainement.</p>
      );
    case "pdf":
      return (
        <div className="space-y-4">
          {lesson.content && (
            <div
              className="prose-lesson"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}
          {lesson.file_url ? (
            <a
              href={lesson.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold text-white hover:opacity-90"
              style={{ background: accent }}
            >
              📄 Télécharger la fiche (PDF)
            </a>
          ) : (
            <p className="text-ink-soft">La fiche sera ajoutée prochainement.</p>
          )}
        </div>
      );
    case "quiz":
      return quiz && quiz.questions.length ? (
        <QuizRunner quiz={quiz} accent={accent} />
      ) : (
        <p className="text-ink-soft">Ce quiz sera disponible bientôt.</p>
      );
    default:
      return null;
  }
}

/** Renders YouTube/Vimeo as an iframe, otherwise a native <video>. */
function VideoEmbed({ url, title }: { url: string; title: string }) {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) {
    return (
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${yt[1]}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return (
      <iframe
        className="h-full w-full"
        src={`https://player.vimeo.com/video/${vimeo[1]}`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <video controls className="h-full w-full" src={url}>
      <track kind="captions" />
    </video>
  );
}

function LockedNotice({
  courseHref,
  isSignedIn,
}: {
  courseHref: string;
  isSignedIn: boolean;
}) {
  return (
    <div className="rounded-card border-2 border-dashed border-sun bg-sun/10 p-8 text-center">
      <p className="text-4xl" aria-hidden>
        🔒
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
        Contenu premium
      </h2>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">
        Cette leçon fait partie d'un cours premium. Demande l'accès depuis la
        page du cours pour la débloquer.
      </p>
      <Link
        href={courseHref}
        className="mt-5 inline-block rounded-full bg-ink px-6 py-3 font-bold text-paper hover:opacity-90"
      >
        {isSignedIn ? "Demander l'accès" : "Voir le cours"}
      </Link>
    </div>
  );
}
