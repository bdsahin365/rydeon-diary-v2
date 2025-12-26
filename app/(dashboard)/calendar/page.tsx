import { PageHeader } from "@/components/PageHeader";
import { Calendar as CalendarIcon } from "lucide-react";
import { FeatureUnderDevelopment } from "@/components/FeatureUnderDevelopment";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
    return (
        <div className="flex flex-col">
            <PageHeader title="Calendar" subtitle="View your schedule">
                <Button variant="outline" className="bg-background">
                    This Month
                    <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
            </PageHeader>
            <FeatureUnderDevelopment
                featureName="Calendar"
                description="Visualize your schedule, upcoming trips, and manage your time efficiently. Comprehensive calendar view is coming soon."
                icon={CalendarIcon}
            />
        </div>
    );
}
