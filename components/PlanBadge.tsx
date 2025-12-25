'use client';

import { useEffect, useState } from 'react';
import { getSubscription, type UserPlan } from '@/actions/get-subscription';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap } from 'lucide-react';
import Link from 'next/link';

export function PlanBadge() {
    const [plan, setPlan] = useState<UserPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSubscription()
            .then((sub) => setPlan(sub?.plan || 'free'))
            .catch(() => setPlan('free'))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !plan) {
        return null;
    }

    if (plan === 'free') {
        return (
            <Link href="/pro" className="block">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3 hover:from-primary/20 hover:to-primary/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">Free Plan</span>
                        <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Upgrade to unlock all features</p>
                </div>
            </Link>
        );
    }

    const planConfig = {
        pro: {
            label: 'Pro',
            icon: Crown,
            gradient: 'from-blue-500/10 to-purple-500/10',
            border: 'border-blue-500/20',
            iconColor: 'text-blue-500'
        },
        business: {
            label: 'Business',
            icon: Crown,
            gradient: 'from-amber-500/10 to-orange-500/10',
            border: 'border-amber-500/20',
            iconColor: 'text-amber-500'
        }
    };

    const config = planConfig[plan as 'pro' | 'business'];

    return (
        <div className={`bg-gradient-to-r ${config.gradient} border ${config.border} rounded-lg p-3`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <config.icon className={`h-4 w-4 ${config.iconColor}`} />
                    <span className="text-sm font-semibold">{config.label} Plan</span>
                </div>
                <Link href="/pro">
                    <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        Manage
                    </span>
                </Link>
            </div>
        </div>
    );
}
