import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";
import { getStatsSummary, getEarningsHistory, getOperatorStats, getRecentJobs } from "@/app/actions/metricsActions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Overview } from "@/components/dashboard/overview";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { OperatorBreakdown } from "@/components/dashboard/operator-breakdown";

export default async function Dashboard() {
  // Parallel data fetching for performance
  const [
    statsData,
    earningsData,
    operatorData,
    recentJobs
  ] = await Promise.all([
    getStatsSummary(),
    getEarningsHistory('30d'),
    getOperatorStats(),
    getRecentJobs()
  ]);

  // Handle errors gracefully (simple fallback for now)
  const safeStats = "error" in statsData ? {
    revenue: { value: 0, trend: 0 },
    profit: { value: 0 },
    jobs: { value: 0 },
    distance: { value: 0, unit: 'mi' },
    efficiency: { value: 0, unit: '/hr' }
  } : statsData;

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Date Range Picker Could Go Here */}
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* KPI Cards */}
        <StatsCards data={safeStats} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Earnings Chart - Spans 4 columns */}
          <Overview data={earningsData} />

          {/* Operator Breakdown - Spans 3 columns */}
          <OperatorBreakdown data={operatorData} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Jobs - Spans 4 columns (or 3, let's adjust layout) */}
          {/* We can put Recent Jobs on left and maybe Upcoming on right later */}
          <div className="col-span-4">
            <RecentJobs jobs={recentJobs} />
          </div>
          {/* Empty slot for future Goal/Upcoming */}
          <div className="col-span-3">
            {/* Placeholder for Upcoming Schedule or Goals */}
            {/* For now, maybe just extend Recent Jobs or leave as is */}
          </div>
        </div>
      </div>
    </div>
  );
}
