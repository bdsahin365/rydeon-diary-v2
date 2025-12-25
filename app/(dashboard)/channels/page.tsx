import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { PlugZap, Construction } from "lucide-react";

export default function ChannelsPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Intergration Channels" subtitle="Connect with Uber, Bolt, and more." />

            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 h-[60vh]">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <PlugZap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Channels Coming Soon</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    We are building integrations directly with Uber, Bolt, and other platforms to sync your jobs automatically.
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" disabled>
                        Connect Uber
                    </Button>
                    <Button variant="outline" disabled>
                        Connect Bolt
                    </Button>
                </div>
            </div>
        </div>
    );
}
