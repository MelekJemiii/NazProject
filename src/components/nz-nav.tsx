"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/cours", label: "Les cours", match: (p: string) => p === "/cours" },
  { href: "/cours/francais", label: "Français", match: (p: string) => p.startsWith("/cours/francais") },
  { href: "/cours/mathematiques", label: "Maths", match: (p: string) => p.startsWith("/cours/mathematiques") },
];

/** Desktop nav links with active state. */
export function NzNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="l-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`l-nav-link${l.match(pathname) ? " is-active" : ""}`}
          aria-current={l.match(pathname) ? "page" : undefined}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

/** Mobile menu: burger button + slide-down panel (shown under 860px). */
export function NzMobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="nz-mobile-only">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="l-btn-ghost"
        style={{ padding: ".55rem .75rem", lineHeight: 0 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <div className="nz-mobile-panel">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nz-mobile-link" onClick={close}>
              {l.label}
            </Link>
          ))}
          {!signedIn && (
            <Link href="/connexion" className="nz-mobile-link" onClick={close}>
              Connexion
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
