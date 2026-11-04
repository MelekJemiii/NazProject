"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icon = {
  dash: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zm2 14h13v2H6a1 1 0 0 1 0-2z",
  users: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 1c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4zM8 14c-.3 0-.7 0-1.1.1A4.7 4.7 0 0 1 9 17v3H1v-2.5C1 15.3 5.6 14 8 14z",
  key: "M7 14a5 5 0 1 1 4.6-7H22v4h-2v3h-3v-3h-5.4A5 5 0 0 1 7 14zm0-3a2 2 0 1 0-2-2 2 2 0 0 0 2 2z",
};

const items = [
  { href: "/admin", label: "Tableau de bord", d: icon.dash, exact: true },
  { href: "/admin/catalogue", label: "Catalogue", d: icon.book },
  { href: "/admin/etudiants", label: "Élèves", d: icon.users },
  { href: "/admin/acces", label: "Accès premium", d: icon.key },
];

export function AdminNav({ pending = 0 }: { pending?: number }) {
  const pathname = usePathname();
  return (
    <nav className="nz-admin-nav" aria-label="Administration">
      <ul>
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nz-admin-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
                  <path d={item.d} />
                </svg>
                <span>{item.label}</span>
                {item.href === "/admin/acces" && pending > 0 && (
                  <span className="nz-admin-badge" aria-label={`${pending} en attente`}>
                    {pending}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
