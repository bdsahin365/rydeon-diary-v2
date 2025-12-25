"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Search,
    Briefcase,
    Calendar,
    Wallet,
    Car,
    MessageSquare,
    ShieldCheck,
    LifeBuoy,
    Settings,
    LogOut,
    Share2,

} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Search, label: "Find Jobs", href: "/find-jobs" },

    { icon: Briefcase, label: "My Jobs", href: "/my-jobs" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: Wallet, label: "Earnings", href: "/earnings" },
    { icon: Share2, label: "Channels", href: "/channels" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
];

const bottomItems = [
    { icon: LifeBuoy, label: "Support", href: "/support" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: LogOut, label: "Log Out", href: "#" },
];

import { JobUsageIndicator } from "@/components/JobUsageIndicator";
import { PlanBadge } from "@/components/PlanBadge";

export function SidebarContent() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full justify-between py-4">
            <div className="space-y-2">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Button
                            key={item.label}
                            variant={isActive ? "secondary" : "ghost"}
                            className={`w-full justify-start ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon className="mr-2 h-5 w-5" />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}
            </div>

            <div className="space-y-2">
                <PlanBadge />
                <JobUsageIndicator />
                {bottomItems.map((item) => (
                    <Button
                        key={item.label}
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground relative"
                        asChild
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-5 w-5" />
                            {item.label}
                        </Link>
                    </Button>
                ))}
                <div className="pt-4 mt-4 border-t">
                    <div className="flex items-center text-primary font-bold text-xl">
                        <div className="mr-2">
                            {/* Simple Logo Placeholder */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        Rydeon
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <div className="hidden lg:flex w-64 bg-background border-r h-full flex-col">
            <SidebarContent />
        </div>
    );
}
