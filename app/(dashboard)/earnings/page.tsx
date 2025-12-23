import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

export default function Earnings() {
    return (
        <PageHeader title="Earnings" subtitle="Track your income">
            <Button variant="outline" className="bg-background">
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
            <Button variant="outline" className="bg-background">
                This Month
                <Calendar className="ml-2 h-4 w-4" />
            </Button>
        </PageHeader>
    );
}
