"use client";

import { useState, useTransition } from "react";
import { toggleLessonComplete } from "@/app/actions/learning";

export function LessonCompleteToggle({
  lessonId,
  initialCompleted,
  revalidatePath,
  accent,
}: {
  lessonId: string;
  initialCompleted: boolean;
  revalidatePath: string;
  accent: string;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setCompleted(next); // optimistic
    startTransition(async () => {
      const res = await toggleLessonComplete(lessonId, next, revalidatePath);
      if (!res.ok) setCompleted(!next); // revert on failure
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold transition-colors disabled:opacity-60"
      style={{
        background: completed ? "var(--grow)" : "transparent",
        color: completed ? "#fff" : "var(--ink)",
        border: `2px solid ${completed ? "var(--grow)" : accent}`,
      }}
    >
      {completed ? "✅ Leçon terminée" : "Marquer comme terminée"}
    </button>
  );
}
