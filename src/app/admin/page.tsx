import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Tableau de bord" };

type TableName =
  | "profiles"
  | "courses"
  | "lessons"
  | "entitlements"
  | "enrollments";

async function count(table: TableName, filter?: [string, string]) {
  const supabase = await createClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    students,
    courses,
    publishedCourses,
    lessons,
    pendingAccess,
    grantedAccess,
  ] = await Promise.all([
    count("profiles", ["role", "student"]),
    count("courses"),
    count("courses", ["status", "published"]),
    count("lessons"),
    count("entitlements", ["status", "pending"]),
    count("entitlements", ["status", "granted"]),
  ]);

  // Recent signups
  const { data: recentStudents } = await supabase
    .from("profiles")
    .select("id, full_name, created_at, role")
    .order("created_at", { ascending: false })
    .limit(5);

  // Most-viewed courses (last 30 days) via page_views.
  // Server Component data fetch — reading the clock here is intentional.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data: views } = await supabase
    .from("page_views")
    .select("course_id")
    .gte("created_at", since)
    .not("course_id", "is", null);
  const viewCounts: Record<string, number> = {};
  for (const v of views ?? []) {
    if (v.course_id) viewCounts[v.course_id] = (viewCounts[v.course_id] ?? 0) + 1;
  }
  const topCourseIds = Object.entries(viewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const { data: topCourses } = topCourseIds.length
    ? await supabase.from("courses").select("id, title").in("id", topCourseIds)
    : { data: [] };

  const stats = [
    { label: "Étudiants inscrits", value: students, href: "/admin/etudiants" },
    { label: "Cours (publiés)", value: `${publishedCourses}/${courses}`, href: "/admin/catalogue" },
    { label: "Leçons", value: lessons, href: "/admin/catalogue" },
    { label: "Demandes d'accès", value: pendingAccess, href: "/admin/acces", alert: pendingAccess > 0 },
    { label: "Accès premium actifs", value: grantedAccess, href: "/admin/acces" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        Tableau de bord
      </h1>
      <p className="mt-1 text-ink-soft">Vue d'ensemble de ta plateforme.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-card border border-line bg-card p-5 transition-transform hover:-translate-y-0.5"
          >
            <p className="text-sm font-semibold text-ink-soft">{s.label}</p>
            <p
              className="mt-1 font-display text-4xl font-semibold"
              style={{ color: s.alert ? "var(--francais)" : "var(--ink)" }}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            Derniers inscrits
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {(recentStudents ?? []).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="font-semibold text-ink">
                  {s.full_name || "Sans nom"}
                </span>
                <span className="text-ink-soft">
                  {new Date(s.created_at).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
            {!recentStudents?.length && (
              <li className="py-3 text-sm text-ink-soft">
                Aucun inscrit pour le moment.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-card border border-line bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            Cours les plus consultés (30 j)
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {(topCourses ?? []).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="font-semibold text-ink">{c.title}</span>
                <span className="text-ink-soft">{viewCounts[c.id]} vues</span>
              </li>
            ))}
            {!topCourses?.length && (
              <li className="py-3 text-sm text-ink-soft">
                Pas encore de données de consultation.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
