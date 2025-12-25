import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
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

            console.log("[STRIPE_WEBHOOK] Processing checkout.session.completed");
            console.log("[STRIPE_WEBHOOK] Session ID:", session.id);

            if (!session?.subscription) {
                console.log("[STRIPE_WEBHOOK] No subscription in session - likely one-time payment");
                return new NextResponse(null, { status: 200 });
            }

            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            ) as Stripe.Subscription;

            console.log("[STRIPE_WEBHOOK] Subscription retrieved:", subscription.id);

            if (!session?.metadata?.userId) {
                console.error("[STRIPE_WEBHOOK] User ID missing in metadata");
                return new NextResponse("User ID is missing in metadata", { status: 400 });
            }

            console.log("[STRIPE_WEBHOOK] User ID from metadata:", session.metadata.userId);

            // Connect to database
            try {
                await dbConnect();
                console.log("[STRIPE_WEBHOOK] Database connected successfully");
            } catch (dbError: any) {
                console.error("[STRIPE_WEBHOOK] Database connection failed:", dbError);
                return new NextResponse("Database connection failed", { status: 500 });
            }

            const plan = session.metadata.planName === 'Business' ? 'business' : 'pro';
            console.log("[STRIPE_WEBHOOK] Plan determined:", plan);

            // Verify user exists first
            try {
                const existingUser = await User.findById(session.metadata.userId);
                if (!existingUser) {
                    console.error("[STRIPE_WEBHOOK] User not found with ID:", session.metadata.userId);
                    return new NextResponse("User not found", { status: 404 });
                }
                console.log("[STRIPE_WEBHOOK] Found existing user:", existingUser.email);
            } catch (findError: any) {
                console.error("[STRIPE_WEBHOOK] Error finding user:", findError);
                return new NextResponse("Error finding user", { status: 500 });
            }

            // Update user with subscription data
            try {
                const updateData = {
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(
                        (subscription as any).current_period_end * 1000
                    ),
                    plan: plan,
                    subscriptionStatus: 'active',
                };

                console.log("[STRIPE_WEBHOOK] Updating user with data:", JSON.stringify(updateData, null, 2));

                const updateResult = await User.findByIdAndUpdate(
                    session.metadata.userId,
                    { $set: updateData },
                    { new: true, runValidators: true }
                );

                if (!updateResult) {
                    console.error("[STRIPE_WEBHOOK] Update returned null for user ID:", session.metadata.userId);
                    return new NextResponse("Update failed", { status: 500 });
                }

                console.log("[STRIPE_WEBHOOK] ✅ User plan updated successfully!");
                console.log("[STRIPE_WEBHOOK] Updated user email:", updateResult.email);
                console.log("[STRIPE_WEBHOOK] New plan:", updateResult.plan);
                console.log("[STRIPE_WEBHOOK] Subscription ID:", updateResult.stripeSubscriptionId);
            } catch (updateError: any) {
                console.error("[STRIPE_WEBHOOK] Error updating user:", updateError);
                return new NextResponse("Error updating user: " + updateError.message, { status: 500 });
            }
        }

        if (event.type === "invoice.payment_succeeded") {
            const invoice = event.data.object as Stripe.Invoice;

            if (!(invoice as any).subscription) {
                console.log("[STRIPE_WEBHOOK] No subscription in invoice");
                return new NextResponse(null, { status: 200 });
            }

            const subscription = await stripe.subscriptions.retrieve(
                (invoice as any).subscription as string
            ) as Stripe.Subscription;

            await dbConnect();

            await User.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                {
                    $set: {
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeCurrentPeriodEnd: new Date(
                            (subscription as any).current_period_end * 1000
                        ),
                        subscriptionStatus: 'active',
                    }
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
                    $set: {
                        plan: 'free',
                        subscriptionStatus: 'cancelled',
                    }
                }
            );

            console.log("[STRIPE_WEBHOOK] Subscription cancelled:", subscription.id);
        }

        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error("[STRIPE_WEBHOOK] Unhandled error processing event:", error);
        console.error("[STRIPE_WEBHOOK] Error stack:", error.stack);
        return new NextResponse(`Webhook handler error: ${error.message}`, { status: 500 });
    }
}
