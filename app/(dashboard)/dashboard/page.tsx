import { Button } from "@/components/ui/button";
import { ChevronDown, LayoutDashboard } from "lucide-react";

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

      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 h-[50vh]">
        <div className="bg-muted p-4 rounded-full mb-4">
          <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Dashboard Empty</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Your dashboard summary will appear here once you have active jobs and earnings data.
        </p>
      </div>
    </>
  );
}
