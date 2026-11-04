"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/supabase/types";
import { setUserRole } from "@/app/admin/actions";

export function StudentsTable({
  profiles,
  enrollCounts,
}: {
  profiles: Profile[];
  enrollCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = profiles.filter((p) =>
    (p.full_name ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  function changeRole(id: string, role: "student" | "admin") {
    setBusyId(id);
    startTransition(async () => {
      await setUserRole(id, role);
      setBusyId(null);
      router.refresh();
    });
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par nom…"
        className="mb-4 w-full max-w-sm rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
      />
      <div className="overflow-x-auto rounded-card border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-bold">Nom</th>
              <th className="px-4 py-3 font-bold">Rôle</th>
              <th className="px-4 py-3 font-bold">Cours suivis</th>
              <th className="px-4 py-3 font-bold">Inscrit le</th>
              <th className="px-4 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-semibold text-ink">
                  {p.full_name || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      background:
                        p.role === "admin"
                          ? "color-mix(in srgb, var(--maths) 15%, transparent)"
                          : "var(--paper-2)",
                      color: p.role === "admin" ? "var(--maths)" : "var(--ink-soft)",
                    }}
                  >
                    {p.role === "admin" ? "Admin" : "Étudiant"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {enrollCounts[p.id] ?? 0}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  {p.role === "admin" ? (
                    <button
                      onClick={() => changeRole(p.id, "student")}
                      disabled={pending && busyId === p.id}
                      className="rounded-full border border-line px-3 py-1 text-xs font-bold text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
                    >
                      Retirer admin
                    </button>
                  ) : (
                    <button
                      onClick={() => changeRole(p.id, "admin")}
                      disabled={pending && busyId === p.id}
                      className="rounded-full border border-line px-3 py-1 text-xs font-bold text-ink hover:border-ink disabled:opacity-50"
                    >
                      Promouvoir admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
                  Aucun étudiant trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
