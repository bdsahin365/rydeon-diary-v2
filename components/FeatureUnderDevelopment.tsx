import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "./BackButton";

interface FeatureUnderDevelopmentProps {
    featureName: string;
    description: string;
    icon: LucideIcon;
    className?: string;
    showBackButton?: boolean;
}

export function FeatureUnderDevelopment({
    featureName,
    description,
    icon: Icon,
    className,
    showBackButton = true
}: FeatureUnderDevelopmentProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[60vh] animate-in fade-in zoom-in duration-500", className)}>
            <div className="bg-primary/5 p-6 rounded-full ring-4 ring-primary/5 mb-6 shadow-sm">
                <Icon className="h-12 w-12 text-primary" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight mb-3">
                {featureName} is coming soon
            </h2>

            <p className="text-muted-foreground max-w-[400px] mb-8 leading-relaxed">
                {description}
            </p>

            {showBackButton && (
                <div className="flex gap-4">
                    <BackButton />
                </div>
            )}
        </div>
    );
}
