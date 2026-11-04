import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AuthForm mode="signin" />
    </Suspense>
  );
}

function FormSkeleton() {
  return (
    <div className="h-96 w-full max-w-md animate-pulse rounded-card border border-line bg-card" />
  );
}
