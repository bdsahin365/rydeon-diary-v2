import { PageHeader } from "@/components/PageHeader";
import { Search } from "lucide-react";
import { FeatureUnderDevelopment } from "@/components/FeatureUnderDevelopment";

export default function FindJobs() {
    return (
        <div className="flex flex-col">
            <PageHeader title="Find Jobs" subtitle="Search for new opportunities" />
            <FeatureUnderDevelopment
                featureName="Job Marketplace"
                description="We are building a unified job feed integrating multiple channels including WhatsApp, Uber, and Bolt with advanced filtering to help you find your next opportunity."
                icon={Search}
            />
        </div>
    );
}
