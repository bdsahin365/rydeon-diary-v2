import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";
import { getStatsSummary, getEarningsHistory, getOperatorStats, getRecentJobs, getReportStats } from "@/app/actions/metricsActions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Overview } from "@/components/dashboard/overview";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { OperatorBreakdown } from "@/components/dashboard/operator-breakdown";
import { ReportsView } from "@/components/dashboard/reports-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Dashboard() {
  // Parallel data fetching for performance
  const [
    statsData,
    earningsData,
    operatorData,
    recentJobs,
    reportStats
  ] = await Promise.all([
    getStatsSummary(),
    getEarningsHistory('30d'),
    getOperatorStats(),
    getRecentJobs(),
    getReportStats()
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
          {/* Date Range Picker Placeholder */}
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Report
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
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Detailed breakdown of your performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  More analytics coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <ReportsView stats={reportStats} operatorData={operatorData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
