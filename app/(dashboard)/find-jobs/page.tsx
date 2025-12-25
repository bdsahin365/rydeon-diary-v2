import { PageHeader } from "@/components/PageHeader";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FindJobs() {
    return (
        <div className="min-h-[80vh] flex flex-col">
            <PageHeader title="Find Jobs" subtitle="Search for new opportunities" />

            <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10 mt-6">
                <div className="bg-primary/10 p-6 rounded-full mb-6">
                    <Search className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Job Marketplace Implementation</h3>
                <p className="text-muted-foreground text-center max-w-lg mb-8 text-lg">
                    We are building a unified job feed integrating multiple channels including <span className="font-semibold text-foreground">WhatsApp</span>, <span className="font-semibold text-foreground">Uber</span>, and <span className="font-semibold text-foreground">Bolt</span> with advanced filtering.
                </p>
                <div className="flex gap-4 opacity-50 pointer-events-none">
                    <Button variant="outline">Connect Channels</Button>
                    <Button>Browse Feed (Coming Soon)</Button>
                </div>
            </div>
        </div>
    );
}
