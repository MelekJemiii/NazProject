"use client";

import { useState } from "react";
import { submitQuizAttempt } from "@/app/actions/learning";

export type QuizData = {
  id: string;
  passScore: number;
  questions: {
    id: string;
    prompt: string;
    explanation: string | null;
    options: { id: string; label: string }[];
    correctOptionId: string; // resolved server-side for signed-in users
  }[];
};

export function QuizRunner({ quiz, accent }: { quiz: QuizData; accent: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  function choose(qId: string, optId: string) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qId]: optId }));
  }

  async function handleSubmit() {
    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctOptionId) correct++;
    }
    const pct = total ? Math.round((correct / total) * 100) : 0;
    setScore(pct);
    setSubmitted(true);
    await submitQuizAttempt(quiz.id, pct, pct >= quiz.passScore);
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }

  const passed = score >= quiz.passScore;

  return (
    <div className="space-y-6">
      {quiz.questions.map((q, i) => (
        <fieldset
          key={q.id}
          className="rounded-2xl border border-line bg-card p-5"
        >
          <legend className="sr-only">Question {i + 1}</legend>
          <p className="font-semibold text-ink">
            <span className="text-ink-soft">{i + 1}.</span> {q.prompt}
          </p>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt) => {
              const chosen = answers[q.id] === opt.id;
              const isCorrect = submitted && opt.id === q.correctOptionId;
              const isWrongChoice =
                submitted && chosen && opt.id !== q.correctOptionId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => choose(q.id, opt.id)}
                  disabled={submitted}
                  className="flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left font-semibold transition-colors disabled:cursor-default"
                  style={{
                    borderColor: isCorrect
                      ? "var(--grow)"
                      : isWrongChoice
                        ? "var(--francais)"
                        : chosen
                          ? accent
                          : "var(--line)",
                    background: isCorrect
                      ? "color-mix(in srgb, var(--grow) 12%, transparent)"
                      : isWrongChoice
                        ? "color-mix(in srgb, var(--francais) 12%, transparent)"
                        : "transparent",
                    color: "var(--ink)",
                  }}
                >
                  <span
                    aria-hidden
                    className="grid h-5 w-5 place-items-center rounded-full border-2 text-xs"
                    style={{
                      borderColor: chosen ? accent : "var(--line)",
                    }}
                  >
                    {chosen ? "●" : ""}
                  </span>
                  {opt.label}
                  {isCorrect && <span className="ml-auto">✅</span>}
                  {isWrongChoice && <span className="ml-auto">❌</span>}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="mt-3 rounded-lg bg-paper-2 px-3 py-2 text-sm text-ink-soft">
              💡 {q.explanation}
            </p>
          )}
        </fieldset>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={answeredCount < total}
          className="rounded-full px-6 py-3 font-bold text-white hover:opacity-90 disabled:opacity-50"
          style={{ background: accent }}
        >
          {answeredCount < total
            ? `Réponds à toutes les questions (${answeredCount}/${total})`
            : "Valider mes réponses"}
        </button>
      ) : (
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: passed
              ? "color-mix(in srgb, var(--grow) 12%, transparent)"
              : "color-mix(in srgb, var(--sun) 15%, transparent)",
          }}
        >
          <p className="font-display text-3xl font-semibold text-ink">
            {score}%
          </p>
          <p className="mt-1 font-semibold text-ink">
            {passed
              ? "Bravo, c'est réussi ! 🎉"
              : "Pas encore réussi — réessaie !"}
          </p>
          <button
            onClick={reset}
            className="mt-4 rounded-full border-2 border-ink px-5 py-2 font-bold text-ink hover:bg-ink hover:text-paper"
          >
            Recommencer
          </button>
        </div>
      )}
    </div>
  );
}
