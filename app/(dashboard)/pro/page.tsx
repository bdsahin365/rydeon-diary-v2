"use client";

import { PageHeader } from "@/components/PageHeader";
import { PricingCard } from "@/components/PricingCard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Suspense } from "react";

function RydeonProContent() {
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("success")) {
            toast({
                title: "Success",
                description: "You have successfully subscribed to Rydeon Pro!",
                className: "bg-green-100",
            });
        }
        if (searchParams.get("canceled")) {
            toast({
                title: "Canceled",
                description: "Subscription process was canceled.",
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

    // Replace these with your actual Stripe Price IDs from your Dashboard
    const PLANS = [
        {
            title: "Free",
            price: "Free",
            description: "Essential tools for individual drivers.",
            features: [
                "Up to 100 Job Entries",
                "Basic Dashboard",
                "Job Usage Indicator",
                "Standard Support"
            ],
            priceId: null, // No ID for free
            buttonText: "Current Plan",
            disabled: true
        },
        {
            title: "Pro",
            price: "£9.99",
            description: "Advanced features for growing businesses.",
            features: [
                "Unlimited Job Entries",
                "Advanced Analytics",
                "Priority Support",
                "Data Export",
                "Calendar View"
            ],
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
            isPopular: true,
            planName: "Pro"
        },
        {
            title: "Business",
            price: "£29.99",
            description: "Complete solution for fleets and teams.",
            features: [
                "Everything in Pro",
                "Team Management",
                "API Access",
                "White labeling",
                "Dedicated Account Manager"
            ],
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || "",
            planName: "Business"
        }
    ];


    const handleSubscribe = async (priceId: string, planName: string) => {
        try {
            // Validate price ID
            if (!priceId || priceId.trim() === "") {
                toast({
                    title: "Configuration Error",
                    description: "Stripe is not configured yet. Please contact support.",
                    variant: "destructive",
                });
                return;
            }

            setLoadingPriceId(priceId);
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId, planName }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to create checkout session");
            }

            const { url } = await response.json();

            if (!url) {
                throw new Error("No checkout URL received");
            }

            window.location.href = url;
        } catch (error) {
            console.error("Subscription error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoadingPriceId(null);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <PageHeader title="Rydeon Pro" subtitle="Choose the plan that fits your needs" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => (
                    <PricingCard
                        key={plan.title}
                        title={plan.title}
                        price={plan.price}
                        description={plan.description}
                        features={plan.features}
                        isPopular={plan.isPopular}
                        buttonText={plan.buttonText || (plan.priceId ? "Upgrade" : "Get Started")}
                        disabled={plan.disabled}
                        isLoading={loadingPriceId === plan.priceId}
                        onButtonClick={() => plan.priceId && handleSubscribe(plan.priceId, plan.planName!)}
                    />
                ))}
            </div>

            <div className="rounded-lg bg-muted p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Need a custom enterprise solution?</h3>
                <p className="text-muted-foreground mb-4">Contact our sales team for tailored packages and volume discounts.</p>
                <button className="text-primary hover:underline font-medium">Contact Sales</button>
            </div>
        </div>
    );
}

export default function RydeonPro() {
    return (
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <RydeonProContent />
        </Suspense>
    );
}
