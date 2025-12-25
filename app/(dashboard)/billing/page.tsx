"use client";

import { useEffect, useState } from "react";
import { getSubscription, SubscriptionData } from "@/actions/get-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSub = async () => {
            try {
                const sub = await getSubscription();
                setSubscription(sub);
            } finally {
                setLoading(false);
            }
        };
        fetchSub();
    }, []);

    const handleManageSubscription = () => {
        // In a real app, this would create a Stripe Customer Portal session
        window.open("https://billing.stripe.com/p/login/test", "_blank");
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!subscription) {
        return <div className="p-8">Unable to load billing information.</div>;
    }

    return (
        <div className="container max-w-4xl py-10">
            <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>
                            You are currently on the <span className="font-semibold capitalize text-primary">{subscription.plan}</span> plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-medium capitalize ${subscription.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                {subscription.subscriptionStatus}
                            </span>
                        </div>
                        {subscription.stripeCurrentPeriodEnd && (
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Next Billing Date</span>
                                <span className="font-medium">
                                    {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        <div className="pt-4">
                            <h3 className="font-semibold mb-2">Plan Features:</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {subscription.features.canViewHistory ? (
                                    <li>Unlimited History Access</li>
                                ) : (
                                    <li>7-Day History Limit</li>
                                )}
                                {subscription.features.aiSummaryLimit === -1 ? (
                                    <li>Unlimited AI Summaries</li>
                                ) : (
                                    <li>{subscription.features.aiSummaryLimit} AI Summaries / Month</li>
                                )}
                                {subscription.features.canUseMoodAnalytics && <li>Mood Analytics</li>}
                                {subscription.features.canSearchEntries && <li>Search Entries</li>}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-4">
                        {subscription.plan === 'free' ? (
                            <Link href="/pro" className="w-full sm:w-auto">
                                <Button className="w-full">Upgrade to Pro</Button>
                            </Link>
                        ) : (
                            <Button variant="outline" onClick={handleManageSubscription}>
                                Manage Subscription
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
