import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PoundSterling,
  BarChart3,
  Car,
  Clock,
  ChevronDown,
  ArrowRight,
  Calendar,
  MapPin,
  MoreVertical,
  Plane,
  TrendingUp
} from "lucide-react";

async function getStats() {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.id) {
    return {
      earnings: 0,
      profit: 0,
      trips: 0,
      hourly: 0
    };
  }

  const stats = await Job.aggregate([
    { $match: { userId: session.user.id } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$earnings" },
        totalProfit: { $sum: "$profit" },
        totalTrips: { $sum: 1 },
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      earnings: 0,
      profit: 0,
      trips: 0,
      hourly: 0
    };
  }

  return {
    earnings: stats[0].totalEarnings || 0,
    profit: stats[0].totalProfit || 0,
    trips: stats[0].totalTrips || 0,
    hourly: 0
  };
}

export default async function Dashboard() {
  const stats = await getStats();

  // Mock data for upcoming rides
  const upcomingRides = [
    {
      id: 1,
      name: "John Doe",
      status: "scheduled",
      date: "29 Jul 2025 at 04:30 PM",
      pickup: "Bistol Airport",
      dropoff: "SE2 0DW",
      vehicle: "MPV 6",
      distance: "50 mi",
      price: 65.00,
      profit: 54.00,
      type: "Airport"
    },
    {
      id: 2,
      name: "John Doe",
      status: "scheduled",
      date: "29 Jul 2025 at 04:30 PM",
      pickup: "Bistol Airport",
      dropoff: "SE2 0DW",
      vehicle: "MPV 6",
      distance: "50 mi",
      price: 65.00,
      profit: 54.00,
      type: "Airport"
    }
  ];

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

      {/* This Month Summary Card */}
      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-foreground">This Month</h2>
            <p className="text-sm text-muted-foreground">Aug 10 - Aug 17, 2025</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-sm text-muted-foreground">Total Rides</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Earnings */}
        <Card className="bg-green-500/10 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-green-500/20 p-1.5 rounded-full">
                <PoundSterling className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">Earnings</span>
            </div>
            <div className="text-2xl font-bold text-green-500">£{stats.earnings.toFixed(2)}</div>
            <p className="text-xs text-green-600">£36 avg</p>
          </CardContent>
        </Card>

        {/* Profit */}
        <Card className="bg-purple-500/10 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-purple-500/20 p-1.5 rounded-full">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">Profit</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">£{stats.profit.toFixed(2)}</div>
            <p className="text-xs text-purple-600">47.87% margin</p>
          </CardContent>
        </Card>

        {/* Total Trips */}
        <Card className="bg-yellow-500/10 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-yellow-500/20 p-1.5 rounded-full">
                <Car className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-yellow-600">Total Trips</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">{stats.trips}</div>
            <p className="text-xs text-yellow-600">34 completed</p>
          </CardContent>
        </Card>

        {/* Hourly */}
        <Card className="bg-blue-500/10 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-blue-500/20 p-1.5 rounded-full">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">Hourly</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">£{stats.hourly.toFixed(2)}</div>
            <p className="text-xs text-blue-600">£0 avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Awaiting Payment */}
      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-foreground">Awaiting Payment</h3>
            <p className="text-sm text-muted-foreground">Earnings waiting to be paid.</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-foreground">£1278.00</div>
            <div className="flex items-center justify-end text-blue-500 text-sm font-medium cursor-pointer hover:underline">
              23 trips <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Rides */}
      <Card className="mb-6 border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg font-bold text-foreground">Upcoming Rides</CardTitle>
          </div>
          <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 border-none">0</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Your scheduled pickups</p>
          <div className="space-y-4">
            {upcomingRides.map((ride) => (
              <div key={ride.id} className="border rounded-lg p-4 bg-card">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground">{ride.name}</span>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 text-xs font-normal">
                      {ride.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">£{ride.profit.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">profit</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground mb-3">{ride.date}</div>

                <div className="flex items-center space-x-2 text-sm text-foreground mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ride.pickup}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>{ride.dropoff}</div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Car className="h-4 w-4 mr-2" /> {ride.vehicle} • {ride.distance}
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-none flex w-fit items-center">
                      <Plane className="h-3 w-3 mr-1" /> {ride.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">£{ride.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">fare (unpaid)</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-full mt-4 bg-muted text-muted-foreground hover:bg-muted/80">
            See all upcoming trips
          </Button>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">Performance Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Your metrics for this month</p>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Completed Trips */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-foreground">
                <Car className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Completed Trips</span>
              </div>
              <span className="font-bold text-foreground">40</span>
            </div>
            <Progress value={40} className="h-2 bg-muted" indicatorClassName="bg-blue-500" />
          </div>

          {/* Airport Trips */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-foreground">
                <Plane className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Airport Trips</span>
              </div>
              <span className="font-bold text-foreground">10</span>
            </div>
            <Progress value={25} className="h-2 bg-muted" indicatorClassName="bg-orange-500" />
          </div>

          {/* Profit Margin */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="font-medium">Profit Margin</span>
              </div>
              <span className="font-bold text-foreground">47.87%</span>
            </div>
            <Progress value={47.87} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Costs</div>
              <div className="font-bold text-red-500">£365.03</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Net Profit</div>
              <div className="font-bold text-green-600">£1,235</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Avg/Trip</div>
              <div className="font-bold text-blue-500">£45.14</div>
            </div>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
