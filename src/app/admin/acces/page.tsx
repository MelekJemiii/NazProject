import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/shell";
import { AccessQueue } from "@/components/admin/access-queue";
import { GrantAccessForm } from "@/components/admin/grant-access-form";

export const metadata = { title: "Accès premium" };

export default async function AccessPage() {
  const supabase = await createClient();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("*")
    .order("created_at", { ascending: false });

  // Resolve student names + course titles for display.
  const userIds = [...new Set((entitlements ?? []).map((e) => e.user_id))];
  const courseIds = [...new Set((entitlements ?? []).map((e) => e.course_id))];

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    userIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    courseIds.length
      ? supabase.from("courses").select("id, title, price").in("id", courseIds)
      : Promise.resolve({ data: [] as { id: string; title: string; price: number | null }[] }),
  ]);

  const nameById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Sans nom"]),
  );
  const courseById = Object.fromEntries(
    (courses ?? []).map((c) => [c.id, { title: c.title, price: c.price }]),
  );

  const rows = (entitlements ?? []).map((e) => ({
    id: e.id,
    status: e.status,
    note: e.note,
    createdAt: e.created_at,
    studentName: nameById[e.user_id] ?? "Inconnu",
    courseTitle: courseById[e.course_id]?.title ?? "Cours supprimé",
    price: courseById[e.course_id]?.price ?? 0,
  }));

  const [{ data: students }, { data: premiumCourses }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("role", "student").order("full_name"),
    supabase.from("courses").select("id, title, price").eq("is_premium", true).order("title"),
  ]);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Accès premium"
        description="Valide les demandes d'accès et gère les accès accordés. Les paiements par carte accordent l'accès automatiquement."
      />
      <GrantAccessForm
        students={(students ?? []).map((s) => ({ id: s.id, name: s.full_name || "Sans nom" }))}
        courses={(premiumCourses ?? []).map((c) => ({ id: c.id, title: c.title, price: c.price ?? 0 }))}
      />
      <AccessQueue rows={rows} />
    </div>
  );
}
