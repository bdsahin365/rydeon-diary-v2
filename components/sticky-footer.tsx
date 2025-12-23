"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StickyFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function StickyFooter({ className, children, ...props }: StickyFooterProps) {
    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 md:static md:p-0 md:bg-transparent md:border-t-0",
                className
            )}
            {...props}
        >
            <div className="max-w-2xl mx-auto flex gap-4">
                {children}
            </div>
        </div>
    );
}
