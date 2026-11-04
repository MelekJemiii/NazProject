import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/shell";
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
      <AdminPageHeader
        title="Élèves"
        description={`${(profiles ?? []).length} compte${(profiles ?? []).length > 1 ? "s" : ""}. Recherche un élève, consulte son activité et gère les rôles.`}
      />
      <div className="mt-6">
        <StudentsTable
          profiles={(profiles ?? []) as Profile[]}
          enrollCounts={enrollCounts}
        />
      </div>
    </div>
  );
}
