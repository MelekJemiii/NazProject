import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/shell";
import { QuizEditor } from "@/components/admin/quiz-editor";
import type { QuizPayload } from "@/app/admin/actions";

export const metadata = { title: "Éditeur de quiz" };

export default async function QuizEditorPage(props: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await props.params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, type, course:courses(title)")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) notFound();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, pass_score")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  let initial: QuizPayload = {
    passScore: 60,
    questions: [
      {
        prompt: "",
        explanation: "",
        options: [
          { label: "", isCorrect: true },
          { label: "", isCorrect: false },
        ],
      },
    ],
  };

  if (quiz) {
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("id, prompt, explanation, position")
      .eq("quiz_id", quiz.id)
      .order("position");
    const ids = (questions ?? []).map((q) => q.id);
    const { data: options } = ids.length
      ? await supabase
          .from("quiz_options")
          .select("question_id, label, is_correct, position")
          .in("question_id", ids)
          .order("position")
      : { data: [] };
    if (questions?.length) {
      initial = {
        passScore: quiz.pass_score,
        questions: questions.map((q) => ({
          prompt: q.prompt,
          explanation: q.explanation ?? "",
          options: (options ?? [])
            .filter((o) => o.question_id === q.id)
            .map((o) => ({ label: o.label, isCorrect: o.is_correct })),
        })),
      };
    } else {
      initial.passScore = quiz.pass_score;
    }
  }

  const courseTitle = (lesson.course as unknown as { title: string } | null)?.title;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        back={{ href: "/admin/catalogue", label: "Catalogue" }}
        title={`Quiz : ${lesson.title}`}
        description={
          courseTitle
            ? `Cours « ${courseTitle} ». Les élèves voient la correction et l'explication après validation.`
            : "Les élèves voient la correction et l'explication après validation."
        }
      />
      {lesson.type !== "quiz" && (
        <p className="nz-status nz-status-warning" role="status">
          <span aria-hidden className="nz-status-icon">!</span>
          Cette leçon n&apos;est pas de type « Quiz ». Change son type dans le
          catalogue pour que les élèves voient ces questions.
        </p>
      )}
      <QuizEditor lessonId={lessonId} initial={initial} />
    </div>
  );
}
