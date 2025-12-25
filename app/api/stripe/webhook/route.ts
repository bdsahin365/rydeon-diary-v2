import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover' as any, // Cast to any to avoid version mismatch errors until package update
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
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as Stripe.Subscription;

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID is missing in metadata", { status: 400 });
        }

        await dbConnect();

        // Update user to PRO
        // Determine plan from metadata or price. For now assuming any subscription via this flow is Pro/Business upgradable logic
        // But let's use metadata passed from checkout
        const plan = session.metadata.planName === 'Business' ? 'business' : 'pro';

        await User.findByIdAndUpdate(session.metadata.userId, {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
            ),
            plan: plan,
        });
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as Stripe.Subscription;

        await dbConnect();

        await User.findOneAndUpdate(
            { stripeSubscriptionId: subscription.id },
            {
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    (subscription as any).current_period_end * 1000
                ),
            }
        );
    }

    return new NextResponse(null, { status: 200 });
}
