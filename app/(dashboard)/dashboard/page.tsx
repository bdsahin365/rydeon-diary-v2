import { Button } from "@/components/ui/button";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import { FeatureUnderDevelopment } from "@/components/FeatureUnderDevelopment";

export default function Dashboard() {
  return (
    <>
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your driving summary for this month</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <Button variant="outline" className="text-muted-foreground">
            This month <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <FeatureUnderDevelopment
        featureName="Dashboard"
        description="Your central hub for tracking jobs, earnings, and business insights is currently under construction."
        icon={LayoutDashboard}
        showBackButton={false}
      />
    </>
  );
}
