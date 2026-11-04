"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Mark a lesson complete / incomplete for the current user. */
export async function toggleLessonComplete(
  lessonId: string,
  completed: boolean,
  pathToRevalidate: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not-authenticated" };

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed,
      last_viewed: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathToRevalidate);
  return { ok: true };
}

/** Enroll the current user in a (free) course. */
export async function enrollInCourse(courseId: string, pathToRevalidate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not-authenticated" };

  const { error } = await supabase
    .from("enrollments")
    .upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: "user_id,course_id" },
    );

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathToRevalidate);
  return { ok: true };
}

/**
 * Request access to a premium course (Phase 1 payment flow).
 * Creates a 'pending' entitlement the admin reviews and grants.
 */
export async function requestPremiumAccess(
  courseId: string,
  pathToRevalidate: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not-authenticated" };

  const { error } = await supabase.from("entitlements").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      status: "pending",
    },
    { onConflict: "user_id,course_id", ignoreDuplicates: true },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathToRevalidate);
  return { ok: true };
}

/** Record a quiz attempt. */
export async function submitQuizAttempt(
  quizId: string,
  score: number,
  passed: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not-authenticated" };

  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    passed,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
