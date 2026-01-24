import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Edit, History, Thermometer, Droplet, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { boxesApi } from "@/lib/api/client";
import { EditBoxDialog } from "@/components/EditBoxDialog";

const BoxDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: box, isLoading, error } = useQuery({
    queryKey: ['box', id],
    queryFn: () => boxesApi.getById(parseInt(id!)),
    enabled: !!id,
    refetchInterval: 30000,
  });

  const { data: recentMeasurements = [] } = useQuery({
    queryKey: ['box-history', id],
    queryFn: () => {
      const dateTo = new Date();
      const dateFrom = new Date(dateTo.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      return boxesApi.getHistory(parseInt(id!), dateFrom, dateTo);
    },
    enabled: !!id,
  });

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Box Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error ? "Failed to load box data" : "The requested box does not exist"}
          </p>
          <Button onClick={() => navigate("/boxes")} asChild>
            <Link to="/boxes">Return to Box List</Link>
          </Button>
        </div>
      </div>
    );
  }

  const chartData = recentMeasurements.slice(-20).map((m) => ({
    timestamp: formatTimestamp(m.timestamp),
    temperature: m.temperature,
    humidity: m.humidity,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Boxes", href: "/" },
            { label: `${box.name}` },
          ]}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Box Detail – {box.name}
            </h1>
            <p className="text-muted-foreground font-mono text-sm sm:text-base">{box.id}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => setEditDialogOpen(true)} className="w-full sm:w-auto shadow-depth-sm hover:shadow-depth-md transition-all">
              <Edit className="h-4 w-4 mr-2" />
              Edit Box
            </Button>
            <Button variant="outline" className="w-full sm:w-auto shadow-depth-sm hover:shadow-depth-md transition-all" asChild>
              <Link to={`/boxes/${box.id}/history`}>
                <History className="h-4 w-4 mr-2" />
                View History
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Box ID</p>
                <p className="font-mono font-medium">{box.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{box.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Warehouse</p>
                <p>{box.warehouse}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tenant</p>
                <p>{box.tenant}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Temperature Range</p>
                <p>
                  {box.minTemp}°C – {box.maxTemp}°C
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Humidity Range</p>
                <p>
                  {box.minHumidity}% – {box.maxHumidity}%
                </p>
              </div>
              {box.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{box.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-4 sm:p-6 rounded-lg bg-primary/10 border border-primary/30 shadow-depth-sm">
                  <Thermometer className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    {box.currentTemp.toFixed(1)}°C
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Temperature</p>
                </div>
                <div className="text-center p-4 sm:p-6 rounded-lg bg-primary/10 border border-primary/30 shadow-depth-sm">
                  <Droplet className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    {box.currentHumidity.toFixed(1)}%
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Humidity</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border/50 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Status</p>
                  <StatusBadge status={box.status} className="text-base px-3 py-1" />
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground mb-1">Last Measurement</p>
                  <p className="text-sm font-medium">{formatTimestamp(box.lastMeasurement)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Temperature Trend (Last 2 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Humidity Trend (Last 2 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditBoxDialog
        box={box}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};

export default BoxDetail;
