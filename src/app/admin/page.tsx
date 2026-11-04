import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/admin-stats";
import { AreaTrend, ColumnTrend, BarList } from "@/components/admin/charts";
import { AdminPageHeader, StatTile, Panel } from "@/components/admin/shell";

export const metadata = { title: "Tableau de bord" };

const fmt = (n: number) => n.toLocaleString("fr-FR");

export default async function AdminDashboard() {
  const supabase = await createClient();
  const d = await getDashboardData(supabase);

  const weekDelta = d.studentsThisWeek - d.studentsLastWeek;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Tableau de bord"
        description="L'activité de Naz Académie en un coup d'œil."
        actions={
          <>
            <Link href="/" className="nz-admin-btn-ghost">Voir le site</Link>
            <Link href="/admin/catalogue" className="nz-admin-btn">+ Nouveau contenu</Link>
          </>
        }
      />

      {d.pendingAccess > 0 && (
        <Link href="/admin/acces" className="nz-status nz-status-warning" role="status">
          <span aria-hidden className="nz-status-icon">!</span>
          <span className="min-w-0 flex-1">
            <strong>
              {d.pendingAccess} demande{d.pendingAccess > 1 ? "s" : ""} d&apos;accès premium
            </strong>{" "}
            en attente de validation.
          </span>
          <span className="font-extrabold">Traiter →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Élèves inscrits"
          value={fmt(d.students)}
          delta={
            d.studentsThisWeek > 0 || d.studentsLastWeek > 0
              ? {
                  text: `${d.studentsThisWeek >= 0 ? "+" : ""}${d.studentsThisWeek} cette semaine`,
                  tone: weekDelta >= 0 ? "good" : "neutral",
                }
              : undefined
          }
          href="/admin/etudiants"
        />
        <StatTile label="Vues des cours (30 j)" value={fmt(d.views30Total)} />
        <StatTile
          label="Cours publiés"
          value={`${d.coursesPublished}`}
          sub={`${d.coursesDraft} brouillon${d.coursesDraft > 1 ? "s" : ""} · ${d.lessonsPublished} leçons en ligne`}
          href="/admin/catalogue"
        />
        <StatTile
          label="Accès premium actifs"
          value={fmt(d.grantedAccess)}
          sub={`${fmt(d.grantedValue)} € de cours débloqués`}
          href="/admin/acces"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Vues des pages de cours"
          subtitle="30 derniers jours · un point par jour"
        >
          <AreaTrend points={d.views30} unit="vues" title="Vues des pages de cours sur 30 jours" />
        </Panel>
        <Panel title="Cours les plus consultés" subtitle="30 derniers jours">
          <BarList
            items={d.topCourses}
            unit="vues"
            empty="Pas encore de vues. Les consultations apparaîtront ici dès que des élèves ouvrent des cours."
          />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel title="Nouveaux élèves" subtitle="Inscriptions par semaine · 8 dernières semaines">
          <ColumnTrend points={d.signups8w} unit="inscriptions" title="Inscriptions par semaine sur 8 semaines" />
        </Panel>
        <div className="grid gap-6">
          <Panel title="Quiz" subtitle="30 derniers jours">
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-paper-2 p-4">
                <dt className="text-xs font-bold text-ink-soft">Tentatives</dt>
                <dd className="mt-1 text-3xl font-extrabold text-ink">{fmt(d.quizAttempts30)}</dd>
              </div>
              <div className="rounded-2xl bg-paper-2 p-4">
                <dt className="text-xs font-bold text-ink-soft">Taux de réussite</dt>
                <dd className="mt-1 text-3xl font-extrabold text-ink">
                  {d.quizPassRate === null ? "—" : `${d.quizPassRate} %`}
                </dd>
              </div>
            </dl>
          </Panel>
          <Panel
            title="Derniers inscrits"
            action={<Link href="/admin/etudiants" className="text-sm font-bold text-ink-soft hover:text-ink">Tout voir</Link>}
          >
            {d.recentStudents.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucun élève inscrit pour le moment.</p>
            ) : (
              <ul className="divide-y divide-line">
                {d.recentStudents.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2.5">
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper-2 text-sm font-extrabold text-ink"
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{s.name}</span>
                    <span className="shrink-0 text-xs text-ink-soft">{s.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
