import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
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

  return (
    <div className="min-h-dvh bg-paper-2 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-r border-line bg-card lg:min-h-dvh">
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <OwlMark size={30} tone="ink" />
            <span className="font-display font-semibold text-ink">
              Naz · Admin
            </span>
          </Link>
        </div>
        <AdminNav />
        <div className="border-t border-line px-5 py-4">
          <p className="truncate text-sm font-semibold text-ink">
            {profile.full_name || "Administrateur"}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Voir le site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  );
}
