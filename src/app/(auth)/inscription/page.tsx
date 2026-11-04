import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}

function FormSkeleton() {
  return (
    <div className="h-[28rem] w-full max-w-md animate-pulse rounded-card border border-line bg-card" />
  );
}
