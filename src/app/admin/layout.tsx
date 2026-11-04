import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { AdminNav } from "@/components/admin-nav";
import { OwlMark } from "@/components/brand/owl-logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proxy already guards /admin, but re-check here too (defense in depth).
  const { profile } = await getCurrentUser();
  if (!profile) redirect("/connexion?redirect=/admin");
  if (profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { count: pending } = await supabase
    .from("entitlements")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const name = profile.full_name || "Administrateur";

  return (
    <div className="nz-admin min-h-dvh bg-paper-2">
      <aside className="nz-dark nz-band nz-admin-side">
        <div className="nz-admin-brand">
          <Link href="/admin" className="flex items-center gap-2.5">
            <OwlMark size={34} tone="light" blink />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold" style={{ color: "var(--l-text)" }}>
                Naz Académie
              </span>
              <span className="mt-1 text-[10px] font-extrabold tracking-[.16em]" style={{ color: "var(--l-sun)" }}>
                BACK-OFFICE
              </span>
            </span>
          </Link>
        </div>

        <AdminNav pending={pending ?? 0} />

        <div className="nz-admin-user">
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold"
            style={{ background: "var(--l-sun)", color: "#241a53" }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold" style={{ color: "var(--l-text)" }}>{name}</p>
            <div className="flex items-center gap-3 text-xs">
              <Link href="/" className="l-nav-link">Voir le site</Link>
              <span className="nz-signout"><SignOutButton /></span>
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
