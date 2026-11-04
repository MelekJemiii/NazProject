"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/mon-espace";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          },
        });
        if (error) throw error;
        // If email confirmation is required, no session is returned.
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setNotice(
            "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
          );
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(translateError(message));
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-md rounded-card border border-line bg-card p-8"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <h1 className="font-display text-3xl font-semibold text-ink">
        {mode === "signup" ? "Créer ton compte" : "Bon retour !"}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {mode === "signup"
          ? "Rejoins Naz et commence à apprendre dès aujourd'hui."
          : "Connecte-toi pour continuer tes cours."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <Field
            label="Prénom"
            type="text"
            value={fullName}
            onChange={setFullName}
            autoComplete="given-name"
            required
          />
        )}
        <Field
          label="Adresse e-mail"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label="Mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={6}
          required
          hint={mode === "signup" ? "Au moins 6 caractères." : undefined}
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-francais/10 px-3 py-2 text-sm font-semibold text-francais"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-lg bg-grow/10 px-3 py-2 text-sm font-semibold text-grow"
          >
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink py-3 font-bold text-paper hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? "Un instant…"
            : mode === "signup"
              ? "Créer mon compte"
              : "Me connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "signup" ? (
          <>
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-bold text-ink underline">
              Se connecter
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-bold text-ink underline">
              S'inscrire
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  hint,
  ...rest
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-ink outline-none focus:border-ink"
        {...rest}
      />
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-mail ou mot de passe incorrect.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Cette adresse e-mail est déjà utilisée.";
  if (m.includes("email not confirmed"))
    return "Confirme d'abord ton adresse e-mail (vérifie ta boîte mail).";
  if (m.includes("password"))
    return "Le mot de passe doit contenir au moins 6 caractères.";
  return message;
}
