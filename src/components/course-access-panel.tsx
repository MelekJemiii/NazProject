"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { enrollInCourse, requestPremiumAccess } from "@/app/actions/learning";
import { createCheckoutSession } from "@/app/actions/checkout";

export function CourseAccessPanel({
  courseId,
  isPremium,
  price,
  hasAccess,
  isSignedIn,
  entitlementStatus,
  firstLessonHref,
  revalidatePath,
  accent,
  stripeEnabled,
}: {
  courseId: string;
  isPremium: boolean;
  price: number;
  hasAccess: boolean;
  isSignedIn: boolean;
  entitlementStatus: string | null;
  firstLessonHref?: string;
  revalidatePath: string;
  accent: string;
  stripeEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  function handleCheckout() {
    setCheckoutError(null);
    startTransition(async () => {
      const res = await createCheckoutSession(courseId, revalidatePath);
      if (res.ok && res.url) {
        window.location.href = res.url;
      } else {
        setCheckoutError(
          "Le paiement par carte est momentanément indisponible. Tu peux demander l'accès ci-dessous.",
        );
      }
    });
  }

  function handleEnroll() {
    startTransition(async () => {
      await enrollInCourse(courseId, revalidatePath);
      if (firstLessonHref) router.push(firstLessonHref);
    });
  }

  function handleRequest() {
    startTransition(async () => {
      const res = await requestPremiumAccess(courseId, revalidatePath);
      if (res.ok) setDone("requested");
      router.refresh();
    });
  }

  return (
    <div
      className="rounded-card border border-line bg-card p-6"
      style={{ boxShadow: "var(--shadow)" }}
    >
      {isPremium ? (
        <div className="mb-4">
          <p className="text-sm font-semibold text-ink-soft">Cours premium</p>
          <p className="font-display text-3xl font-semibold text-ink">
            {price > 0 ? `${price} €` : "Sur demande"}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="font-display text-2xl font-semibold text-grow">
            Gratuit
          </p>
          <p className="text-sm text-ink-soft">Accès complet, sans frais.</p>
        </div>
      )}

      {!isSignedIn ? (
        <Link
          href={`/connexion?redirect=${encodeURIComponent(revalidatePath)}`}
          className="block w-full rounded-full bg-ink py-3 text-center font-bold text-paper hover:opacity-90"
        >
          Se connecter pour commencer
        </Link>
      ) : hasAccess ? (
        firstLessonHref ? (
          <Link
            href={firstLessonHref}
            className="block w-full rounded-full py-3 text-center font-bold text-white hover:opacity-90"
            style={{ background: accent }}
          >
            {isPremium ? "Continuer le cours" : "Commencer le cours"}
          </Link>
        ) : null
      ) : isPremium ? (
        entitlementStatus === "pending" || done === "requested" ? (
          <div className="rounded-xl bg-sun/15 p-4 text-sm font-semibold text-ink">
            Ta demande d'accès a bien été envoyée. Nous l'étudions et tu
            recevras l'accès dès validation du paiement.
          </div>
        ) : (
          <div className="space-y-3">
            {stripeEnabled && price > 0 && (
              <button
                onClick={handleCheckout}
                disabled={pending}
                className="w-full rounded-full py-3 font-bold text-white hover:opacity-90 disabled:opacity-60"
                style={{ background: accent }}
              >
                {pending ? "Redirection…" : `Débloquer — ${price} €`}
              </button>
            )}
            {checkoutError && (
              <p className="text-xs font-semibold text-francais">
                {checkoutError}
              </p>
            )}
            <button
              onClick={handleRequest}
              disabled={pending}
              className="w-full rounded-full border-2 border-ink py-3 font-bold text-ink hover:bg-ink hover:text-paper disabled:opacity-60"
            >
              {pending ? "Envoi…" : "Demander l'accès (autre moyen)"}
            </button>
            <p className="text-xs text-ink-soft">
              {stripeEnabled && price > 0
                ? "Paiement sécurisé par carte, ou demande l'accès pour régler autrement (virement, etc.)."
                : "Après ta demande, nous te contactons pour le règlement. L'accès est activé dès réception."}
            </p>
          </div>
        )
      ) : (
        <button
          onClick={handleEnroll}
          disabled={pending}
          className="w-full rounded-full py-3 font-bold text-white hover:opacity-90 disabled:opacity-60"
          style={{ background: accent }}
        >
          {pending ? "Un instant…" : "Commencer le cours"}
        </button>
      )}
    </div>
  );
}
