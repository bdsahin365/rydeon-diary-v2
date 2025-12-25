import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[STRIPE_CONFIG] STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2024-11-20.acacia' as any,
});

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        // Validate Stripe configuration
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("[STRIPE_CHECKOUT] Stripe secret key not configured");
            return NextResponse.json(
                { error: "Payment system is not configured. Please contact support." },
                { status: 500 }
            );
        }

        const { priceId, planName } = await req.json();

        if (!priceId) {
            return NextResponse.json(
                { error: "Price ID is required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const billingUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        console.log("[STRIPE_CHECKOUT] Creating session for user:", session.user.id, "plan:", planName);

        // Create Checkout Session
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${billingUrl}/pro?success=true`,
            cancel_url: `${billingUrl}/pro?canceled=true`,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: session.user.id,
                planName: planName || "Pro"
            },
        });

        console.log("[STRIPE_CHECKOUT] Session created successfully:", stripeSession.id);

        return NextResponse.json({ url: stripeSession.url });
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT] Error:", error);

        // Provide more specific error messages
        if (error.type === 'StripeInvalidRequestError') {
            return NextResponse.json(
                { error: `Invalid request: ${error.message}` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
