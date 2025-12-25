import { SubscriptionData, UserPlan } from "@/actions/get-subscription";

export const GRACE_PERIOD_DAYS = 3;

interface FeatureLimits {
    canViewHistory: boolean; // True = unlimited, False = 7 days
    aiSummaryLimit: number; // -1 for unlimited
    canUseMoodAnalytics: boolean;
    canSearchEntries: boolean;
    maxEntriesPerDay: number; // -1 for unlimited
}

export const PLAN_LIMITS: Record<UserPlan, FeatureLimits> = {
    free: {
        canViewHistory: false,
        aiSummaryLimit: 5,
        canUseMoodAnalytics: false,
        canSearchEntries: false,
        maxEntriesPerDay: -1,
    },
    pro: {
        canViewHistory: true,
        aiSummaryLimit: -1,
        canUseMoodAnalytics: true,
        canSearchEntries: true,
        maxEntriesPerDay: -1,
    },
    business: {
        canViewHistory: true,
        aiSummaryLimit: -1,
        canUseMoodAnalytics: true,
        canSearchEntries: true,
        maxEntriesPerDay: -1,
    }
};

/**
 * Checks if a subscription is effectively active (including trials and grace periods).
 */
export function isSubscriptionActive(status: string, currentPeriodEnd: Date | null): boolean {
    if (status === 'active' || status === 'trialing') return true;

    // Grace period logic for past_due
    if (status === 'past_due' && currentPeriodEnd) {
        const graceEnd = new Date(currentPeriodEnd);
        graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS);
        return new Date() <= graceEnd;
    }

    return false;
}

/**
 * Returns the effective plan limits based on subscription status.
 * Downgrades to FREE if expired/canceled/past_grace_period.
 */
export function getEffectiveLimits(
    plan: UserPlan,
    status: string,
    currentPeriodEnd: Date | null
): FeatureLimits {
    const isActive = isSubscriptionActive(status, currentPeriodEnd);

    if (isActive) {
        return PLAN_LIMITS[plan];
    }

    return PLAN_LIMITS['free'];
}
