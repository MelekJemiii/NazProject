import Link from "next/link";
import { BrandLockup } from "@/components/brand/owl-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper-2">
      <header className="px-5 py-5">
        <Link href="/" aria-label="Naz Académie — accueil">
          <BrandLockup size={34} />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        {children}
      </main>
    </div>
  );
}
