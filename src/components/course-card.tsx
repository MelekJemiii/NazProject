import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/lib/supabase/types";
import { subjectIllustration } from "@/lib/illustrations";

export function CourseCard({
  course,
  href,
  accent,
  categorySlug,
  levelName,
  lessonCount,
}: {
  course: Course;
  href: string;
  accent: string;
  categorySlug?: string;
  levelName?: string;
  lessonCount?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-card border border-line bg-card p-3 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(30,42,82,0.35)]"
    >
      <div className="nz-cover">
        <Image
          src={course.cover_url || subjectIllustration(categorySlug)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          unoptimized={!!course.cover_url}
        />
        <span
          className="absolute right-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold"
          style={{
            background: course.is_premium ? "var(--sun)" : "var(--grow)",
            color: course.is_premium ? "var(--ink)" : "#fff",
          }}
        >
          {course.is_premium ? `Premium · ${course.price} €` : "Gratuit"}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3.5">
        {levelName && (
          <span className="text-xs font-extrabold" style={{ color: accent }}>
            {levelName}
          </span>
        )}
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          {typeof lessonCount === "number" ? (
            <span className="font-semibold text-ink-soft">
              {lessonCount} leçon{lessonCount > 1 ? "s" : ""}
            </span>
          ) : (
            <span />
          )}
          <span className="font-bold" style={{ color: accent }}>
            Voir le cours →
          </span>
        </div>
      </div>
    </Link>
  );
}
