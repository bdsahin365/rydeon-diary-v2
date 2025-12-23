import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
    return (
        <PageHeader title="Calendar" subtitle="View your schedule">
            <Button variant="outline" className="bg-background">
                This Month
                <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
        </PageHeader>
    );
}
