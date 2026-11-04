"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/catalogue", label: "Catalogue" },
  { href: "/admin/etudiants", label: "Étudiants" },
  { href: "/admin/acces", label: "Accès premium" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="px-3 py-4">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
                style={{
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink-soft)",
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
