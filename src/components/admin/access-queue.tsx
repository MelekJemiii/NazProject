"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEntitlementStatus } from "@/app/admin/actions";

type Row = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  studentName: string;
  courseTitle: string;
  price: number;
};

export function AccessQueue({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingRows = rows.filter((r) => r.status === "pending");
  const grantedRows = rows.filter((r) => r.status === "granted");

  function act(id: string, status: "granted" | "revoked") {
    setBusyId(id);
    startTransition(async () => {
      await setEntitlementStatus(id, status);
      setBusyId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Demandes en attente
          {pendingRows.length > 0 && (
            <span className="ml-2 rounded-full bg-francais px-2 py-0.5 text-sm font-bold text-white">
              {pendingRows.length}
            </span>
          )}
        </h2>
        {pendingRows.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-card p-6 text-ink-soft">
            Aucune demande en attente.
          </p>
        ) : (
          <ul className="space-y-2">
            {pendingRows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{r.studentName}</p>
                  <p className="text-sm text-ink-soft">
                    {r.courseTitle} · {r.price}€ ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <button
                  onClick={() => act(r.id, "granted")}
                  disabled={pending && busyId === r.id}
                  className="rounded-full bg-grow px-4 py-1.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  Accorder l'accès
                </button>
                <button
                  onClick={() => act(r.id, "revoked")}
                  disabled={pending && busyId === r.id}
                  className="rounded-full border border-line px-4 py-1.5 text-sm font-bold text-ink-soft hover:border-francais hover:text-francais disabled:opacity-50"
                >
                  Refuser
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Accès accordés
        </h2>
        {grantedRows.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-card p-6 text-ink-soft">
            Aucun accès accordé pour l'instant.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-bold">Étudiant</th>
                  <th className="px-4 py-3 font-bold">Cours</th>
                  <th className="px-4 py-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {grantedRows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {r.studentName}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{r.courseTitle}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => act(r.id, "revoked")}
                        disabled={pending && busyId === r.id}
                        className="rounded-full border border-line px-3 py-1 text-xs font-bold text-ink-soft hover:border-francais hover:text-francais disabled:opacity-50"
                      >
                        Révoquer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
