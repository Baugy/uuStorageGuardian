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
    queryFn: () => boxesApi.getById(id!),
    enabled: !!id,
    refetchInterval: 30000,
  });

  const { data: recentMeasurements = [] } = useQuery({
    queryKey: ['box-history', id, 2],
    queryFn: () => boxesApi.getHistory(id!, 2),
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
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Boxes", href: "/" },
            { label: `${box.name}` },
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Box Detail – {box.name}
            </h1>
            <p className="text-muted-foreground font-mono">{box.id}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Box
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/boxes/${box.id}/history`}>
                <History className="h-4 w-4 mr-2" />
                View History
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
                  <Thermometer className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-4xl font-bold text-foreground">
                    {box.currentTemp.toFixed(1)}°C
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Temperature</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
                  <Droplet className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-4xl font-bold text-foreground">
                    {box.currentHumidity.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Humidity</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Status</p>
                  <StatusBadge status={box.status} className="text-base px-3 py-1" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Last Measurement</p>
                  <p className="text-sm font-medium">{formatTimestamp(box.lastMeasurement)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
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

          <Card>
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
