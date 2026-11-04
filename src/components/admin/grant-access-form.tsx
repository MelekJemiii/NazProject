"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { grantAccessToStudent } from "@/app/admin/actions";

export function GrantAccessForm({
  students,
  courses,
}: {
  students: { id: string; name: string }[];
  courses: { id: string; title: string; price: number }[];
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!courses.length) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !courseId) return;
    startTransition(async () => {
      const res = await grantAccessToStudent(studentId, courseId);
      const s = students.find((x) => x.id === studentId)?.name;
      const c = courses.find((x) => x.id === courseId)?.title;
      setMsg(
        res.ok
          ? { ok: true, text: `Accès accordé à ${s} pour « ${c} ».` }
          : { ok: false, text: res.error ?? "Impossible d'accorder l'accès." },
      );
      if (res.ok) {
        setStudentId("");
        setCourseId("");
        router.refresh();
      }
    });
  }

  const select =
    "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-ink";

  return (
    <form onSubmit={submit} className="rounded-card border border-line bg-card p-5">
      <h2 className="font-display text-xl font-semibold text-ink">Accorder un accès</h2>
      <p className="mt-0.5 text-sm text-ink-soft">
        Pour un paiement hors ligne, une offre ou un accès offert.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink">Élève</span>
          <select id="grant-student" value={studentId} onChange={(e) => setStudentId(e.target.value)} className={select} required>
            <option value="">Choisir un élève…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink">Cours premium</span>
          <select id="grant-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className={select} required>
            <option value="">Choisir un cours…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title} · {c.price} €</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={pending || !studentId || !courseId}
          className="rounded-full bg-grow px-5 py-2.5 font-extrabold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "…" : "Accorder l'accès"}
        </button>
      </div>
      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className="mt-3 text-sm font-bold"
          style={{ color: msg.ok ? "var(--grow)" : "var(--francais)" }}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
