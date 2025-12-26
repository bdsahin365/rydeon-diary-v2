import { PageHeader } from "@/components/PageHeader";
import { MessageSquare } from "lucide-react";
import { FeatureUnderDevelopment } from "@/components/FeatureUnderDevelopment";

export default function Messages() {
    return (
        <div className="flex flex-col">
            <PageHeader title="Messages" subtitle="Your conversations" />
            <FeatureUnderDevelopment
                featureName="Messages"
                description="Stay connected with clients and other drivers directly within the app. Real-time messaging system is currently being built."
                icon={MessageSquare}
            />
        </div>
    );
}
