'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getEffectiveLimits, isSubscriptionActive } from "@/lib/feature-gate";

export type UserPlan = 'free' | 'pro' | 'business';

export interface SubscriptionData {
    plan: UserPlan;
    subscriptionStatus: string;
    stripeCurrentPeriodEnd: Date | null;
    isActive: boolean;
    features: {
        unlimitedJobs: boolean;
        advancedAnalytics: boolean;
        prioritySupport: boolean;
        dataExport: boolean;
        teamManagement: boolean;
        apiAccess: boolean;

        // Diary Features
        canViewHistory: boolean;
        aiSummaryLimit: number;
        canUseMoodAnalytics: boolean;
        canSearchEntries: boolean;
        maxEntriesPerDay: number;
    };
}

export async function getSubscription(): Promise<SubscriptionData | null> {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    try {
        await dbConnect();

        const user = await User.findById(session.user.id);

        if (!user) {
            return null;
        }

        const plan: UserPlan = user.plan || 'free';
        const subscriptionStatus = user.subscriptionStatus || 'active';
        const stripeCurrentPeriodEnd = user.stripeCurrentPeriodEnd || null;

        // Calculate effective limits (handling grace periods, etc.)
        const diaryLimits = getEffectiveLimits(plan, subscriptionStatus, stripeCurrentPeriodEnd);
        const isActive = isSubscriptionActive(subscriptionStatus, stripeCurrentPeriodEnd);

        // Define feature access based on plan (Legacy + New Diary features)
        const features = {
            // Legacy Job Features
            unlimitedJobs: plan === 'pro' || plan === 'business',
            advancedAnalytics: plan === 'pro' || plan === 'business',
            prioritySupport: plan === 'pro' || plan === 'business',
            dataExport: plan === 'pro' || plan === 'business',
            teamManagement: plan === 'business',
            apiAccess: plan === 'business',

            // New Diary Features
            ...diaryLimits
        };

        return {
            plan,
            subscriptionStatus,
            stripeCurrentPeriodEnd,
            isActive,
            features,
        };
    } catch (error) {
        console.error("Error fetching subscription:", error);
        return null;
    }
}

export async function hasFeatureAccess(feature: string): Promise<boolean> {
    const subscription = await getSubscription();

    if (!subscription) {
        return false;
    }

    switch (feature) {
        case 'unlimited_jobs':
            return subscription.features.unlimitedJobs;
        case 'advanced_analytics':
            return subscription.features.advancedAnalytics;
        case 'priority_support':
            return subscription.features.prioritySupport;
        case 'data_export':
            return subscription.features.dataExport;
        case 'team_management':
            return subscription.features.teamManagement;
        case 'api_access':
            return subscription.features.apiAccess;
        default:
            return false;
    }
}
