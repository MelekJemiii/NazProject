"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

type Result = { ok: boolean; error?: string; id?: string };

/** Guard: every admin action re-checks the role (defense in depth). */
async function requireAdmin(): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; error: string }
> {
  if (!(await isAdmin())) return { ok: false, error: "forbidden" };
  const supabase = await createClient();
  return { ok: true, supabase };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// ---- Categories -----------------------------------------------------------
export async function saveCategory(
  form: FormData,
  id?: string,
): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Le nom est requis." };
  const payload = {
    name,
    slug: String(form.get("slug") || slugify(name)),
    description: String(form.get("description") ?? "") || null,
    icon: String(form.get("icon") ?? "") || null,
    color: String(form.get("color") ?? "") || null,
    position: Number(form.get("position") ?? 0),
  };
  const { data, error } = id
    ? await guard.supabase
        .from("categories")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single()
    : await guard.supabase
        .from("categories")
        .insert(payload)
        .select("id")
        .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true, id: data?.id };
}

export async function deleteCategory(id: string): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const { error } = await guard.supabase
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true };
}

// ---- Levels ---------------------------------------------------------------
export async function saveLevel(form: FormData, id?: string): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const name = String(form.get("name") ?? "").trim();
  const categoryId = String(form.get("category_id") ?? "");
  if (!name || !categoryId)
    return { ok: false, error: "Nom et matière requis." };
  const payload = {
    category_id: categoryId,
    name,
    slug: String(form.get("slug") || slugify(name)),
    description: String(form.get("description") ?? "") || null,
    position: Number(form.get("position") ?? 0),
  };
  const { data, error } = id
    ? await guard.supabase
        .from("levels")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single()
    : await guard.supabase.from("levels").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true, id: data?.id };
}

export async function deleteLevel(id: string): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const { error } = await guard.supabase.from("levels").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true };
}

// ---- Courses --------------------------------------------------------------
export async function saveCourse(form: FormData, id?: string): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const title = String(form.get("title") ?? "").trim();
  const levelId = String(form.get("level_id") ?? "");
  if (!title || !levelId)
    return { ok: false, error: "Titre et niveau requis." };
  const payload = {
    level_id: levelId,
    title,
    slug: String(form.get("slug") || slugify(title)),
    description: String(form.get("description") ?? "") || null,
    cover_url: String(form.get("cover_url") ?? "") || null,
    is_premium: form.get("is_premium") === "on",
    price: Number(form.get("price") ?? 0),
    status:
      form.get("status") === "published"
        ? ("published" as const)
        : ("draft" as const),
    position: Number(form.get("position") ?? 0),
  };
  const { data, error } = id
    ? await guard.supabase
        .from("courses")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single()
    : await guard.supabase
        .from("courses")
        .insert(payload)
        .select("id")
        .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true, id: data?.id };
}

export async function deleteCourse(id: string): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const { error } = await guard.supabase.from("courses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true };
}

// ---- Lessons --------------------------------------------------------------
export async function saveLesson(form: FormData, id?: string): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const title = String(form.get("title") ?? "").trim();
  const courseId = String(form.get("course_id") ?? "");
  if (!title || !courseId)
    return { ok: false, error: "Titre et cours requis." };
  const type = String(form.get("type") ?? "article") as
    | "article"
    | "video"
    | "pdf"
    | "quiz";
  const payload = {
    course_id: courseId,
    title,
    slug: String(form.get("slug") || slugify(title)),
    type,
    content: String(form.get("content") ?? "") || null,
    video_url: String(form.get("video_url") ?? "") || null,
    file_url: String(form.get("file_url") ?? "") || null,
    duration_min: form.get("duration_min")
      ? Number(form.get("duration_min"))
      : null,
    is_premium: form.get("is_premium") === "on",
    status:
      form.get("status") === "published"
        ? ("published" as const)
        : ("draft" as const),
    position: Number(form.get("position") ?? 0),
  };
  const { data, error } = id
    ? await guard.supabase
        .from("lessons")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single()
    : await guard.supabase
        .from("lessons")
        .insert(payload)
        .select("id")
        .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true, id: data?.id };
}

export async function deleteLesson(id: string): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const { error } = await guard.supabase.from("lessons").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalogue");
  return { ok: true };
}

// ---- Entitlements (premium approval queue) --------------------------------
export async function setEntitlementStatus(
  id: string,
  status: "granted" | "revoked",
): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const {
    data: { user },
  } = await guard.supabase.auth.getUser();
  const { error } = await guard.supabase
    .from("entitlements")
    .update({
      status,
      granted_by: user?.id ?? null,
      granted_at: status === "granted" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/acces");
  return { ok: true };
}

/** Grant premium access to a specific student + course (admin convenience). */
export async function grantAccessToStudent(
  userId: string,
  courseId: string,
): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const {
    data: { user },
  } = await guard.supabase.auth.getUser();
  const { error } = await guard.supabase.from("entitlements").upsert(
    {
      user_id: userId,
      course_id: courseId,
      status: "granted",
      granted_by: user?.id ?? null,
      granted_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/acces");
  return { ok: true };
}

// ---- Student role management ----------------------------------------------
export async function setUserRole(
  userId: string,
  role: "student" | "admin",
): Promise<Result> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  const { error } = await guard.supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/etudiants");
  return { ok: true };
}
