import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Stripe webhook. On `checkout.session.completed`, grants the premium
 * entitlement for the (user_id, course_id) stored in the session metadata.
 *
 * Set STRIPE_WEBHOOK_SECRET and point your Stripe webhook at:
 *   https://YOUR_DOMAIN/api/stripe/webhook
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "stripe-not-configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing-signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid-signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;

    if (userId && courseId) {
      const admin = createAdminClient();
      const { error } = await admin.from("entitlements").upsert(
        {
          user_id: userId,
          course_id: courseId,
          status: "granted",
          note: `Stripe · ${session.id}`,
          granted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" },
      );
      if (error) {
        // Returning 500 tells Stripe to retry the webhook.
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
