"use client";

import { useId, useRef, useState } from "react";

/* ==========================================================================
   Admin charts — single-series, one validated hue (--chart), hairline grid,
   2px lines, ≤24px columns with 4px rounded data-ends, hover/focus tooltips,
   and a data table under each chart so no value is hover-only.
   ========================================================================== */

export type Point = { label: string; full: string; value: number };

function niceMax(v: number): number {
  if (v <= 4) return 4;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return step * exp;
}
const fmt = (n: number) => n.toLocaleString("fr-FR");

/* ---------------- Area trend (line + 10% wash, crosshair) ---------------- */
export function AreaTrend({
  points,
  unit,
  title,
}: {
  points: Point[];
  unit: string;
  title: string;
}) {
  const W = 640, H = 230, L = 40, R = 18, T = 14, B = 28;
  const iw = W - L - R, ih = H - T - B;
  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max];
  const x = (i: number) => L + (points.length <= 1 ? iw / 2 : (i * iw) / (points.length - 1));
  const y = (v: number) => T + ih - (v / max) * ih;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${T + ih} L${x(0).toFixed(1)},${T + ih} Z`;

  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tableId = useId();
  const last = points.length - 1;
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  function onMove(e: React.PointerEvent) {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - L) / iw) * (points.length - 1));
    setHover(Math.min(last, Math.max(0, i)));
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") setHover((h) => Math.min(last, (h ?? -1) + 1));
    else if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? last + 1) - 1));
    else if (e.key === "Escape") setHover(null);
  }

  const hp = hover !== null ? points[hover] : null;
  const total = points.reduce((s, p) => s + p.value, 0);

  return (
    <figure className="nz-chart">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-none outline-none"
          role="img"
          aria-label={`${title} : ${fmt(total)} ${unit} au total. Utilise les flèches pour parcourir les jours.`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-soft)" style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(t)}
              </text>
            </g>
          ))}
          {points.map((p, i) =>
            i % labelEvery === 0 || i === last ? (
              <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"} fontSize="11" fill="var(--ink-soft)">
                {p.label}
              </text>
            ) : null,
          )}
          <path d={area} fill="var(--chart)" opacity={0.1} />
          <path d={line} fill="none" stroke="var(--chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {/* end marker + selective end label */}
          {points.length > 0 && (
            <>
              <circle cx={x(last)} cy={y(points[last].value)} r={6} fill="var(--card)" />
              <circle cx={x(last)} cy={y(points[last].value)} r={4} fill="var(--chart)" />
            </>
          )}
          {hp && hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={T} y2={T + ih} stroke="var(--ink-soft)" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(hp.value)} r={6} fill="var(--card)" />
              <circle cx={x(hover)} cy={y(hp.value)} r={4} fill="var(--chart)" />
            </g>
          )}
        </svg>
        {hp && hover !== null && (
          <div
            className="nz-tooltip"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              transform: `translateX(${hover > last * 0.7 ? "-105%" : "8px"})`,
            }}
          >
            <span className="nz-tooltip-value">{fmt(hp.value)} {unit}</span>
            <span className="nz-tooltip-label">{hp.full}</span>
          </div>
        )}
      </div>
      <DataTable id={tableId} head={["Jour", unit]} rows={points.map((p) => [p.full, fmt(p.value)])} />
    </figure>
  );
}

/* ---------------- Column trend (≤24px columns, per-bar hover) ---------------- */
export function ColumnTrend({
  points,
  unit,
  title,
}: {
  points: Point[];
  unit: string;
  title: string;
}) {
  const W = 640, H = 230, L = 40, R = 12, T = 22, B = 28;
  const iw = W - L - R, ih = H - T - B;
  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const ticks = [0, max / 2, max];
  const band = iw / Math.max(points.length, 1);
  const bw = Math.min(24, band * 0.6);
  const y = (v: number) => T + ih - (v / max) * ih;
  const [hover, setHover] = useState<number | null>(null);
  const tableId = useId();
  const last = points.length - 1;

  function colPath(cx: number, v: number) {
    const top = y(v), base = T + ih, x0 = cx - bw / 2, x1 = cx + bw / 2;
    const h = base - top;
    if (h <= 0) return "";
    const r = Math.min(4, h, bw / 2);
    return `M${x0},${base} L${x0},${top + r} Q${x0},${top} ${x0 + r},${top} L${x1 - r},${top} Q${x1},${top} ${x1},${top + r} L${x1},${base} Z`;
  }

  return (
    <figure className="nz-chart">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="group" aria-label={title}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-soft)" style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(t)}
              </text>
            </g>
          ))}
          {points.map((p, i) => {
            const cx = L + band * i + band / 2;
            const active = hover === i;
            return (
              <g
                key={i}
                tabIndex={0}
                role="img"
                aria-label={`${p.full} : ${fmt(p.value)} ${unit}`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="outline-none"
              >
                {/* hit target: the whole band */}
                <rect x={L + band * i} y={T} width={band} height={ih} fill="transparent" />
                <path d={colPath(cx, p.value)} fill="var(--chart)" opacity={hover === null || active ? 1 : 0.55} />
                {(i === last || active) && p.value > 0 && (
                  <text x={cx} y={y(p.value) - 7} textAnchor="middle" fontSize="12" fontWeight={700} fill="var(--ink)">
                    {fmt(p.value)}
                  </text>
                )}
                <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
                  {p.label}
                </text>
              </g>
            );
          })}
          <line x1={L} x2={W - R} y1={T + ih} y2={T + ih} stroke="var(--line)" strokeWidth={1} />
        </svg>
        {hover !== null && (
          <div
            className="nz-tooltip"
            style={{
              left: `${((L + band * hover + band / 2) / W) * 100}%`,
              transform: `translateX(${hover > last * 0.7 ? "-105%" : "12px"})`,
            }}
          >
            <span className="nz-tooltip-value">{fmt(points[hover].value)} {unit}</span>
            <span className="nz-tooltip-label">{points[hover].full}</span>
          </div>
        )}
      </div>
      <DataTable id={tableId} head={["Semaine", unit]} rows={points.map((p) => [p.full, fmt(p.value)])} />
    </figure>
  );
}

/* ---------------- Horizontal bar list (value at the tip) ---------------- */
export function BarList({
  items,
  unit,
  empty,
}: {
  items: { label: string; value: number; href?: string }[];
  unit: string;
  empty: string;
}) {
  if (!items.length) return <p className="py-6 text-sm text-ink-soft">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className="grid gap-3.5">
      {items.map((it) => (
        <li key={it.label} aria-label={`${it.label} : ${fmt(it.value)} ${unit}`}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-ink">{it.label}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="h-3.5 rounded-r-[4px]"
              style={{ width: `${Math.max(2, (it.value / max) * 82)}%`, background: "var(--chart)" }}
            />
            <span className="shrink-0 text-sm font-bold text-ink tabular-nums">
              {fmt(it.value)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Data table (accessible fallback) ---------------- */
function DataTable({ id, head, rows }: { id: string; head: string[]; rows: string[][] }) {
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-xs font-bold text-ink-soft hover:text-ink">
        Voir les données
      </summary>
      <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-line">
        <table id={id} className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-paper-2 text-ink-soft">
            <tr>
              {head.map((h) => (
                <th key={h} className="px-3 py-2 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={`px-3 py-1.5 ${j ? "text-right tabular-nums" : ""}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
