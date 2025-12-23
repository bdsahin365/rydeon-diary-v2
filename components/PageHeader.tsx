import React from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children && <div className="mt-4 sm:mt-0 flex items-center space-x-2">{children}</div>}
        </div>
    );
}
