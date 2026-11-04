"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveQuiz, type QuizPayload } from "@/app/admin/actions";

type Q = QuizPayload["questions"][number];

const emptyQuestion = (): Q => ({
  prompt: "",
  explanation: "",
  options: [
    { label: "", isCorrect: true },
    { label: "", isCorrect: false },
  ],
});

export function QuizEditor({
  lessonId,
  initial,
}: {
  lessonId: string;
  initial: QuizPayload;
}) {
  const router = useRouter();
  const [passScore, setPassScore] = useState(initial.passScore);
  const [questions, setQuestions] = useState<Q[]>(initial.questions);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  function update(fn: (qs: Q[]) => Q[]) {
    setQuestions((qs) => fn(structuredClone(qs)));
    setDirty(true);
    setMessage(null);
  }

  function save() {
    startTransition(async () => {
      const res = await saveQuiz(lessonId, { passScore, questions });
      if (res.ok) {
        setMessage({ tone: "ok", text: "Quiz enregistré." });
        setDirty(false);
        router.refresh();
      } else {
        setMessage({ tone: "err", text: res.error ?? "Erreur lors de l'enregistrement." });
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
      <ol className="grid gap-4">
        {questions.map((q, qi) => (
          <li key={qi} className="rounded-card border border-line bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-paper-2 px-3 py-1 text-xs font-extrabold text-ink">
                Question {qi + 1}
              </span>
              <div className="flex items-center gap-1">
                <IconBtn
                  label="Monter"
                  disabled={qi === 0}
                  onClick={() =>
                    update((qs) => {
                      [qs[qi - 1], qs[qi]] = [qs[qi], qs[qi - 1]];
                      return qs;
                    })
                  }
                >
                  ↑
                </IconBtn>
                <IconBtn
                  label="Descendre"
                  disabled={qi === questions.length - 1}
                  onClick={() =>
                    update((qs) => {
                      [qs[qi + 1], qs[qi]] = [qs[qi], qs[qi + 1]];
                      return qs;
                    })
                  }
                >
                  ↓
                </IconBtn>
                <IconBtn
                  label="Supprimer la question"
                  danger
                  disabled={questions.length === 1}
                  onClick={() => update((qs) => qs.filter((_, i) => i !== qi))}
                >
                  ✕
                </IconBtn>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-bold text-ink">Énoncé</span>
              <textarea
                id={`q-${qi}-prompt`}
                value={q.prompt}
                rows={2}
                placeholder="Ex. : Combien font 7 + 6 ?"
                onChange={(e) => update((qs) => ((qs[qi].prompt = e.target.value), qs))}
                className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
              />
            </label>

            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-bold text-ink">
                Réponses <span className="font-semibold text-ink-soft">(coche la bonne)</span>
              </legend>
              <div className="grid gap-2">
                {q.options.map((o, oi) => (
                  <div
                    key={oi}
                    className="flex items-center gap-2.5 rounded-xl border-2 px-3 py-1.5"
                    style={{
                      borderColor: o.isCorrect ? "var(--grow)" : "var(--line)",
                      background: o.isCorrect
                        ? "color-mix(in srgb, var(--grow) 8%, transparent)"
                        : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      id={`q-${qi}-correct-${oi}`}
                      name={`q-${qi}-correct`}
                      checked={o.isCorrect}
                      onChange={() =>
                        update((qs) => {
                          qs[qi].options.forEach((x, j) => (x.isCorrect = j === oi));
                          return qs;
                        })
                      }
                      className="h-4 w-4 accent-[var(--grow)]"
                      aria-label={`Réponse ${oi + 1} correcte`}
                    />
                    <input
                      type="text"
                      id={`q-${qi}-opt-${oi}`}
                      value={o.label}
                      placeholder={`Réponse ${oi + 1}`}
                      onChange={(e) =>
                        update((qs) => ((qs[qi].options[oi].label = e.target.value), qs))
                      }
                      className="min-w-0 flex-1 bg-transparent py-1.5 text-ink outline-none"
                    />
                    {o.isCorrect && (
                      <span className="shrink-0 text-xs font-extrabold text-grow">Bonne réponse</span>
                    )}
                    <IconBtn
                      label="Retirer la réponse"
                      danger
                      disabled={q.options.length <= 2}
                      onClick={() =>
                        update((qs) => {
                          const wasCorrect = qs[qi].options[oi].isCorrect;
                          qs[qi].options.splice(oi, 1);
                          if (wasCorrect) qs[qi].options[0].isCorrect = true;
                          return qs;
                        })
                      }
                    >
                      ✕
                    </IconBtn>
                  </div>
                ))}
              </div>
              {q.options.length < 6 && (
                <button
                  type="button"
                  onClick={() =>
                    update((qs) => (qs[qi].options.push({ label: "", isCorrect: false }), qs))
                  }
                  className="mt-2 text-sm font-bold text-ink-soft hover:text-ink"
                >
                  + Ajouter une réponse
                </button>
              )}
            </fieldset>

            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-bold text-ink">
                Explication <span className="font-semibold text-ink-soft">(affichée après la réponse)</span>
              </span>
              <input
                type="text"
                id={`q-${qi}-explanation`}
                value={q.explanation}
                placeholder="Ex. : 7 + 6 = 13, car 7 + 3 = 10 puis 10 + 3 = 13."
                onChange={(e) => update((qs) => ((qs[qi].explanation = e.target.value), qs))}
                className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
              />
            </label>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => update((qs) => [...qs, emptyQuestion()])}
            className="w-full rounded-card border-2 border-dashed border-line bg-card px-5 py-4 font-extrabold text-ink-soft hover:border-ink hover:text-ink"
          >
            + Ajouter une question
          </button>
        </li>
      </ol>

      <aside className="grid gap-4 rounded-card border border-line bg-card p-5 lg:sticky lg:top-6">
        <div>
          <label htmlFor="pass-score" className="text-sm font-bold text-ink">
            Score pour réussir
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="pass-score"
              type="range"
              min={0}
              max={100}
              step={5}
              value={passScore}
              onChange={(e) => {
                setPassScore(Number(e.target.value));
                setDirty(true);
              }}
              className="flex-1 accent-[var(--ink)]"
            />
            <span className="w-14 text-right text-lg font-extrabold text-ink tabular-nums">{passScore} %</span>
          </div>
        </div>
        <p className="text-sm text-ink-soft">
          {questions.length} question{questions.length > 1 ? "s" : ""} · il faut{" "}
          {Math.ceil((passScore / 100) * questions.length)} bonne
          {Math.ceil((passScore / 100) * questions.length) > 1 ? "s" : ""} réponse
          {Math.ceil((passScore / 100) * questions.length) > 1 ? "s" : ""} pour réussir.
        </p>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-ink py-3 font-extrabold text-paper hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Enregistrer le quiz"}
        </button>
        {dirty && !message && (
          <p className="text-xs font-semibold text-ink-soft">Modifications non enregistrées.</p>
        )}
        {message && (
          <p
            role={message.tone === "err" ? "alert" : "status"}
            className="rounded-lg px-3 py-2 text-sm font-bold"
            style={{
              background:
                message.tone === "ok"
                  ? "color-mix(in srgb, var(--grow) 12%, transparent)"
                  : "color-mix(in srgb, var(--francais) 12%, transparent)",
              color: message.tone === "ok" ? "var(--grow)" : "var(--francais)",
            }}
          >
            {message.text}
          </p>
        )}
      </aside>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-ink-soft disabled:opacity-30 ${danger ? "hover:text-francais" : "hover:text-ink"} hover:bg-paper-2`}
    >
      {children}
    </button>
  );
}
