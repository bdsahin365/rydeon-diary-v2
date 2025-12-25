import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function PricingCard({
    title,
    price,
    description,
    features,
    isPopular,
    buttonText = "Get Started",
    onButtonClick,
    isLoading,
    disabled
}: PricingCardProps) {
    return (
        <Card className={cn("relative flex flex-col h-full", isPopular && "border-primary shadow-lg scale-105 z-10")}>
            {isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        Most Popular
                    </div>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <div className="mt-2">
                    <span className="text-3xl font-bold">{price}</span>
                    {price !== "Free" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    onClick={onButtonClick}
                    disabled={isLoading || disabled}
                >
                    {isLoading ? "Processing..." : buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
}
