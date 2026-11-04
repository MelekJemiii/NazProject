import Link from "next/link";
import type { Course } from "@/lib/supabase/types";

export function CourseCard({
  course,
  href,
  accent,
}: {
  course: Course;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-card border border-line bg-card p-5 transition-transform hover:-translate-y-1"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div
          className="h-1.5 w-10 rounded-full"
          style={{ background: accent }}
        />
        {course.is_premium ? (
          <span className="rounded-full bg-sun px-2.5 py-0.5 text-xs font-extrabold text-ink">
            Premium
          </span>
        ) : (
          <span className="rounded-full bg-grow/15 px-2.5 py-0.5 text-xs font-bold text-grow">
            Gratuit
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug text-ink">
        {course.title}
      </h3>
      {course.description && (
        <p className="mt-1.5 line-clamp-3 text-sm text-ink-soft">
          {course.description}
        </p>
      )}
      <span
        className="mt-4 text-sm font-bold"
        style={{ color: accent }}
      >
        Voir le cours →
      </span>
    </Link>
  );
}
