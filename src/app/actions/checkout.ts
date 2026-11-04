"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

/**
 * Creates a Stripe Checkout session for a premium course and returns its URL.
 * The webhook grants the entitlement once payment succeeds.
 */
export async function createCheckoutSession(
  courseId: string,
  returnPath: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "stripe-disabled" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not-authenticated" };

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, price, is_premium")
    .eq("id", courseId)
    .single();
  if (!course || !course.is_premium) {
    return { ok: false, error: "course-not-purchasable" };
  }

  const amount = Math.round((course.price ?? 0) * 100); // cents
  if (amount <= 0) return { ok: false, error: "invalid-price" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: { name: course.title },
          },
        },
      ],
      metadata: { user_id: user.id, course_id: course.id },
      success_url: `${siteUrl}${returnPath}?paiement=reussi`,
      cancel_url: `${siteUrl}${returnPath}?paiement=annule`,
    });
    return { ok: true, url: session.url ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe-error";
    return { ok: false, error: message };
  }
}
