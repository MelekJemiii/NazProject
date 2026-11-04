import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Level,
  Course,
  Lesson,
} from "@/lib/supabase/types";

/** All categories, ordered. */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("position");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data ?? null;
}

/** Levels for a category, ordered. */
export async function getLevels(categoryId: string): Promise<Level[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("levels")
    .select("*")
    .eq("category_id", categoryId)
    .order("position");
  return data ?? [];
}

/** Published courses in a level (RLS already hides drafts from the public). */
export async function getCoursesByLevel(levelId: string): Promise<Course[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("level_id", levelId)
    .order("position");
  return data ?? [];
}

export type CourseWithContext = Course & {
  level: Level & { category: Category };
};

export async function getCourseBySlug(
  categorySlug: string,
  levelSlug: string,
  courseSlug: string,
): Promise<CourseWithContext | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, level:levels!inner(*, category:categories!inner(*))")
    .eq("slug", courseSlug)
    .eq("level.slug", levelSlug)
    .eq("level.category.slug", categorySlug)
    .single();
  return (data as unknown as CourseWithContext) ?? null;
}

/** Published lessons of a course, ordered. */
export async function getLessons(courseId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position");
  return data ?? [];
}

export async function getLessonBySlug(
  courseId: string,
  lessonSlug: string,
): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("slug", lessonSlug)
    .single();
  return data ?? null;
}

/** Does the current user have access to this course's premium content? */
export async function hasCourseAccess(courseId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_course_access", {
    p_course_id: courseId,
  });
  return data === true;
}

/** Count of published courses per category (for landing cards). */
export async function getCategoryCourseCounts(): Promise<
  Record<string, number>
> {
  const supabase = await createClient();
  // levels -> courses join; count published courses grouped by category.
  const { data } = await supabase
    .from("courses")
    .select("id, level:levels!inner(category_id)")
    .eq("status", "published");
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as unknown as {
    level: { category_id: string };
  }[]) {
    const cid = row.level.category_id;
    counts[cid] = (counts[cid] ?? 0) + 1;
  }
  return counts;
}
