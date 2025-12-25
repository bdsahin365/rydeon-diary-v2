import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover' as any,
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error("[STRIPE_WEBHOOK] Signature verification failed:", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    console.log("[STRIPE_WEBHOOK] Received event:", event.type);

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            if (!session?.subscription) {
                console.log("[STRIPE_WEBHOOK] No subscription in session");
                return new NextResponse(null, { status: 200 });
            }

            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            ) as Stripe.Subscription;

            if (!session?.metadata?.userId) {
                console.error("[STRIPE_WEBHOOK] User ID missing in metadata");
                return new NextResponse("User ID is missing in metadata", { status: 400 });
            }

            await dbConnect();

            const plan = session.metadata.planName === 'Business' ? 'business' : 'pro';

            await User.findByIdAndUpdate(session.metadata.userId, {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
                plan: plan,
                subscriptionStatus: 'active',
            });

            console.log("[STRIPE_WEBHOOK] User plan updated to:", plan);
        }

        if (event.type === "invoice.payment_succeeded") {
            const invoice = event.data.object as Stripe.Invoice;

            if (!invoice.subscription) {
                console.log("[STRIPE_WEBHOOK] No subscription in invoice");
                return new NextResponse(null, { status: 200 });
            }

            const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription as string
            ) as Stripe.Subscription;

            await dbConnect();

            await User.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                {
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(
                        subscription.current_period_end * 1000
                    ),
                    subscriptionStatus: 'active',
                }
            );

            console.log("[STRIPE_WEBHOOK] Subscription renewed:", subscription.id);
        }

        if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as Stripe.Subscription;

            await dbConnect();

            await User.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                {
                    plan: 'free',
                    subscriptionStatus: 'cancelled',
                }
            );

            console.log("[STRIPE_WEBHOOK] Subscription cancelled:", subscription.id);
        }

        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error("[STRIPE_WEBHOOK] Error processing event:", error);
        return new NextResponse(`Webhook handler error: ${error.message}`, { status: 500 });
    }
}
