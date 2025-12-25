import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover', // Using latest as of current knowledge, adjust if needed
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { priceId, planName } = await req.json();

        if (!priceId) {
            return new NextResponse("Price ID is required", { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const billingUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
                planName: planName
            },
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
