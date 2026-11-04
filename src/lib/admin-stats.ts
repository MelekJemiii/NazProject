import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { Point } from "@/components/admin/charts";

const TZ = "Europe/Paris";
const DAY = 864e5;

/** YYYY-MM-DD in Paris time. */
function dayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}
const shortDay = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric", month: "short" });
const longDay = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

/** Monday (YYYY-MM-DD) of the week containing the given Paris day key. */
function weekKey(key: string): string {
  const d = new Date(`${key}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = Monday
  return new Date(d.getTime() - dow * DAY).toISOString().slice(0, 10);
}

export type DashboardData = {
  students: number;
  studentsThisWeek: number;
  studentsLastWeek: number;
  coursesPublished: number;
  coursesTotal: number;
  coursesDraft: number;
  lessonsPublished: number;
  pendingAccess: number;
  grantedAccess: number;
  grantedValue: number;
  views30: Point[];
  views30Total: number;
  signups8w: Point[];
  topCourses: { label: string; value: number }[];
  quizAttempts30: number;
  quizPassRate: number | null;
  recentStudents: { id: string; name: string; date: string }[];
};

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
): Promise<DashboardData> {
  const now = new Date();
  const since30 = new Date(now.getTime() - 29 * DAY);
  const since8w = new Date(now.getTime() - 8 * 7 * DAY);

  const [
    { data: students },
    { data: courses },
    { count: lessonsPublished },
    { data: entitlements },
    { data: views },
    { data: attempts },
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, created_at").eq("role", "student").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, title, status, price"),
    supabase.from("lessons").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("entitlements").select("status, course_id"),
    supabase.from("page_views").select("created_at, course_id").gte("created_at", since30.toISOString()),
    supabase.from("quiz_attempts").select("passed").gte("created_at", since30.toISOString()),
  ]);

  const studentList = students ?? [];
  const courseList = courses ?? [];
  const priceById = Object.fromEntries(courseList.map((c) => [c.id, Number(c.price ?? 0)]));
  const titleById = Object.fromEntries(courseList.map((c) => [c.id, c.title]));

  // --- Views per day (30 days, zero-filled) ---
  const viewsByDay: Record<string, number> = {};
  const viewsByCourse: Record<string, number> = {};
  for (const v of views ?? []) {
    const k = dayKey(new Date(v.created_at));
    viewsByDay[k] = (viewsByDay[k] ?? 0) + 1;
    if (v.course_id) viewsByCourse[v.course_id] = (viewsByCourse[v.course_id] ?? 0) + 1;
  }
  const views30: Point[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since30.getTime() + i * DAY);
    const k = dayKey(d);
    views30.push({ label: shortDay.format(d), full: longDay.format(d), value: viewsByDay[k] ?? 0 });
  }

  // --- Sign-ups per week (8 weeks, zero-filled) ---
  const signupsByWeek: Record<string, number> = {};
  for (const s of studentList) {
    const created = new Date(s.created_at);
    if (created < since8w) continue;
    const wk = weekKey(dayKey(created));
    signupsByWeek[wk] = (signupsByWeek[wk] ?? 0) + 1;
  }
  const thisWeek = weekKey(dayKey(now));
  const signups8w: Point[] = [];
  for (let i = 7; i >= 0; i--) {
    const wkDate = new Date(new Date(`${thisWeek}T12:00:00Z`).getTime() - i * 7 * DAY);
    const wk = wkDate.toISOString().slice(0, 10);
    signups8w.push({
      label: shortDay.format(wkDate),
      full: `Semaine du ${longDay.format(wkDate)}`,
      value: signupsByWeek[wk] ?? 0,
    });
  }

  const granted = (entitlements ?? []).filter((e) => e.status === "granted");

  return {
    students: studentList.length,
    studentsThisWeek: signups8w[7]?.value ?? 0,
    studentsLastWeek: signups8w[6]?.value ?? 0,
    coursesPublished: courseList.filter((c) => c.status === "published").length,
    coursesTotal: courseList.length,
    coursesDraft: courseList.filter((c) => c.status === "draft").length,
    lessonsPublished: lessonsPublished ?? 0,
    pendingAccess: (entitlements ?? []).filter((e) => e.status === "pending").length,
    grantedAccess: granted.length,
    grantedValue: granted.reduce((s, e) => s + (priceById[e.course_id] ?? 0), 0),
    views30,
    views30Total: (views ?? []).length,
    signups8w,
    topCourses: Object.entries(viewsByCourse)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, value]) => ({ label: titleById[id] ?? "Cours supprimé", value })),
    quizAttempts30: (attempts ?? []).length,
    quizPassRate: attempts?.length
      ? Math.round((attempts.filter((a) => a.passed).length / attempts.length) * 100)
      : null,
    recentStudents: studentList.slice(0, 6).map((s) => ({
      id: s.id,
      name: s.full_name || "Sans nom",
      date: new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }).format(new Date(s.created_at)),
    })),
  };
}
