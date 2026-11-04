import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/** Current auth user + profile (or nulls if signed out). */
export async function getCurrentUser(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { userId: user.id, profile: profile ?? null };
}

export async function isAdmin(): Promise<boolean> {
  const { profile } = await getCurrentUser();
  return profile?.role === "admin";
}
