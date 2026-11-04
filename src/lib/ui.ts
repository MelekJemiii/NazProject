import type { LessonType } from "@/lib/supabase/types";

/** Accent color for a category slug. */
export function categoryAccent(slug: string | undefined): string {
  if (slug === "mathematiques") return "var(--maths)";
  if (slug === "francais") return "var(--francais)";
  return "var(--ink)";
}

/** Emoji + French label for each lesson type. */
export const lessonTypeMeta: Record<
  LessonType,
  { icon: string; label: string }
> = {
  article: { icon: "📖", label: "Leçon" },
  video: { icon: "▶️", label: "Vidéo" },
  pdf: { icon: "📄", label: "Fiche PDF" },
  quiz: { icon: "✏️", label: "Quiz" },
};
