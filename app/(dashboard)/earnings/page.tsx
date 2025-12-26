import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Download, CircleDollarSign } from "lucide-react";
import { FeatureUnderDevelopment } from "@/components/FeatureUnderDevelopment";

export default function Earnings() {
    return (
        <div className="flex flex-col">
            <PageHeader title="Earnings" subtitle="Track your income">
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-background">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" className="bg-background">
                        This Month
                        <Calendar className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </PageHeader>
            <FeatureUnderDevelopment
                featureName="Earnings Analysis"
                description="Track your revenue, expenses, and profitability reports with detailed insights to help you maximize your income."
                icon={CircleDollarSign}
            />
        </div>
    );
}
