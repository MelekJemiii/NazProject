import { createClient } from "@/lib/supabase/server";
import { AccessQueue } from "@/components/admin/access-queue";

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

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        Accès premium
      </h1>
      <p className="mt-1 text-ink-soft">
        Valide les demandes d'accès et gère les accès accordés. (Les paiements
        par carte via Stripe accordent l'accès automatiquement.)
      </p>
      <div className="mt-8">
        <AccessQueue rows={rows} />
      </div>
    </div>
  );
}
