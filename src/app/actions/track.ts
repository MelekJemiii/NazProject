"use server";

import { createClient } from "@/lib/supabase/server";

/** Fire-and-forget page-view record for analytics. */
export async function trackView(opts: {
  path: string;
  courseId?: string;
  lessonId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("page_views").insert({
    path: opts.path,
    course_id: opts.courseId ?? null,
    lesson_id: opts.lessonId ?? null,
    user_id: user?.id ?? null,
  });
  return { ok: true };
}
