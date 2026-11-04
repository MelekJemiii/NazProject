import { createClient } from "@/lib/supabase/server";
import { CatalogueManager } from "@/components/admin/catalogue-manager";
import type { Category, Level, Course, Lesson } from "@/lib/supabase/types";

export const metadata = { title: "Catalogue" };

export default async function CataloguePage() {
  const supabase = await createClient();

  // Admin sees everything (drafts included) thanks to RLS is_admin().
  const [{ data: categories }, { data: levels }, { data: courses }, { data: lessons }] =
    await Promise.all([
      supabase.from("categories").select("*").order("position"),
      supabase.from("levels").select("*").order("position"),
      supabase.from("courses").select("*").order("position"),
      supabase.from("lessons").select("*").order("position"),
    ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Catalogue</h1>
      <p className="mt-1 text-ink-soft">
        Gère tes matières, niveaux, cours et leçons.
      </p>
      <div className="mt-8">
        <CatalogueManager
          categories={(categories ?? []) as Category[]}
          levels={(levels ?? []) as Level[]}
          courses={(courses ?? []) as Course[]}
          lessons={(lessons ?? []) as Lesson[]}
        />
      </div>
    </div>
  );
}
