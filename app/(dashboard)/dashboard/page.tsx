import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";
import { getStatsSummary, getEarningsHistory, getOperatorStats, getRecentJobs, getReportStats, getVehicleStats } from "@/app/actions/metricsActions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Overview } from "@/components/dashboard/overview";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { OperatorBreakdown } from "@/components/dashboard/operator-breakdown";
import { ReportsView } from "@/components/dashboard/reports-view";
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DateRangeFilter } from "@/components/DateRangeFilter";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const dateFromParam = typeof resolvedSearchParams.dateFrom === 'string' ? resolvedSearchParams.dateFrom : undefined;
  const dateToParam = typeof resolvedSearchParams.dateTo === 'string' ? resolvedSearchParams.dateTo : undefined;

  const parseDateParam = (dateStr?: string) => {
    if (!dateStr) return undefined;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return undefined;
  };

  const now = new Date();
  const defaultDateFrom = startOfMonth(now);
  const defaultDateTo = endOfMonth(now);

  // Use params if available, otherwise default to This Month
  const dateFrom = parseDateParam(dateFromParam) || defaultDateFrom;
  const dateTo = parseDateParam(dateToParam) || defaultDateTo;

  // Parallel data fetching for performance
  const [
    statsData,
    earningsData,
    operatorData,
    recentJobs,
    reportStats,
    vehicleStats
  ] = await Promise.all([
    getStatsSummary(dateFrom, dateTo),
    getEarningsHistory('30d', dateFrom, dateTo),
    getOperatorStats(dateFrom, dateTo),
    getRecentJobs(),
    getReportStats(dateFrom, dateTo),
    getVehicleStats(dateFrom, dateTo)
  ]);

  // Handle errors gracefully (simple fallback for now)
  const safeStats = "error" in statsData ? {
    revenue: { value: 0, trend: 0 },
    profit: { value: 0 },
    jobs: { value: 0 },
    distance: { value: 0, unit: 'mi' },
    efficiency: { value: 0, unit: '/hr' }
  } : statsData;

  const safeReportStats = reportStats || {
    total: 0,
    status: {
      completed: { count: 0, value: 0 },
      cancelled: { count: 0, value: 0 },
      scheduled: { count: 0, value: 0 }
    },
    payment: {
      paid: { count: 0, value: 0 },
      unpaid: { count: 0, value: 0 },
      overdue: { count: 0, value: 0 }
    },
    timeOfDay: {}
  };

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Date Range Picker */}
          <DateRangeFilter
            presetType="dashboard"
            initialDateFrom={defaultDateFrom}
            initialDateTo={defaultDateTo}
            className="h-9 flex-1 sm:w-auto"
          />
          <Button className="h-9">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Download Report</span>
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <StatsCards data={safeStats} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Overview data={earningsData} />
            <RecentJobs jobs={recentJobs} />
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <OperatorBreakdown data={operatorData} />
            <PerformanceMetrics
              stats={safeStats}
              vehicleStats={vehicleStats}
              statusCounts={safeReportStats.status}
              paymentCounts={safeReportStats.payment}
            />
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <ReportsView stats={reportStats} operatorData={operatorData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
