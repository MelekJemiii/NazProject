"use client";

import { useEffect, useRef } from "react";
import { trackView } from "@/app/actions/track";

/** Records one page view on mount (per path). Rendered on course/lesson pages. */
export function ViewTracker({
  path,
  courseId,
  lessonId,
}: {
  path: string;
  courseId?: string;
  lessonId?: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void trackView({ path, courseId, lessonId });
  }, [path, courseId, lessonId]);
  return null;
}
