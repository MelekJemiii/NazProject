import { createClient } from "@/lib/supabase/server";
import { StudentsTable } from "@/components/admin/students-table";
import type { Profile } from "@/lib/supabase/types";

export const metadata = { title: "Étudiants" };

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Enrollment counts per student.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id");
  const enrollCounts: Record<string, number> = {};
  for (const e of enrollments ?? []) {
    enrollCounts[e.user_id] = (enrollCounts[e.user_id] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Étudiants</h1>
      <p className="mt-1 text-ink-soft">
        {(profiles ?? []).length} compte(s). Gère les rôles et consulte
        l'activité.
      </p>
      <div className="mt-8">
        <StudentsTable
          profiles={(profiles ?? []) as Profile[]}
          enrollCounts={enrollCounts}
        />
      </div>
    </div>
  );
}
