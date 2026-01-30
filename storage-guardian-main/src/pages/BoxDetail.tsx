import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Edit, History, Thermometer, Droplet, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
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
    enabled: !!id && !!box,
  });

  const formatTimestamp = (date: Date | string | undefined) => {
    if (!date) return "Never";
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
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Box Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error ? (error instanceof Error ? error.message : "Failed to load box data") : "The requested box does not exist"}
          </p>
          <Button onClick={() => navigate("/boxes")}>
            Return to Box List
          </Button>
        </div>
      </div>
    );
  }

  const warehouseName = typeof box.warehouse === 'string' ? box.warehouse : box.warehouse.name;
  const warehouseLocation = typeof box.warehouse === 'string' ? '' : box.warehouse.location;

  const chartData = recentMeasurements.slice(-20).map((m) => ({
    timestamp: formatTimestamp(m.measurementDate),
    temperature: m.temperature,
    humidity: m.humidity,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Boxes", href: "/boxes" },
            { label: box.name },
          ]}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {box.name}
            </h1>
            <p className="text-muted-foreground font-mono text-sm sm:text-base">Box ID: {box.id}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setEditDialogOpen(true)} 
              className="w-full sm:w-auto shadow-depth-sm hover:shadow-depth-md transition-all"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Box
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto shadow-depth-sm hover:shadow-depth-md transition-all" 
              onClick={() => navigate(`/boxes/${box.id}/history`)}
            >
              <History className="h-4 w-4 mr-2" />
              View History
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
              {box.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{box.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Warehouse</p>
                <p>{warehouseName}</p>
                {warehouseLocation && (
                  <p className="text-xs text-muted-foreground mt-1">{warehouseLocation}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Renter ID</p>
                <p className="font-mono text-sm">{box.renterId}</p>
              </div>
              {box.deviceId && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assigned Device</p>
                  <p className="font-mono text-sm">Device {box.deviceId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Temperature & Humidity Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Temperature Range</p>
                <p className="font-medium">
                  {box.lowerTemperatureLimit !== null && box.lowerTemperatureLimit !== undefined
                    ? `${box.lowerTemperatureLimit}°C`
                    : 'N/A'} – {box.upperTemperatureLimit !== null && box.upperTemperatureLimit !== undefined
                    ? `${box.upperTemperatureLimit}°C`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Humidity Range</p>
                <p className="font-medium">
                  {box.lowerHumidityLimit !== null && box.lowerHumidityLimit !== undefined
                    ? `${box.lowerHumidityLimit}%`
                    : 'N/A'} – {box.upperHumidityLimit !== null && box.upperHumidityLimit !== undefined
                    ? `${box.upperHumidityLimit}%`
                    : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-4 sm:p-6 rounded-lg bg-primary/10 border border-primary/30 shadow-depth-sm">
                  <Thermometer className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    {box.temperature !== null && box.temperature !== undefined 
                      ? `${box.temperature.toFixed(1)}°C`
                      : 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Temperature</p>
                </div>
                <div className="text-center p-4 sm:p-6 rounded-lg bg-primary/10 border border-primary/30 shadow-depth-sm">
                  <Droplet className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    {box.humidity !== null && box.humidity !== undefined 
                      ? `${box.humidity.toFixed(1)}%`
                      : 'N/A'}
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
                  <p className="text-sm font-medium">
                    {box.lastMeasurementDate 
                      ? formatTimestamp(box.lastMeasurementDate)
                      : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                <StatusBadge status={box.status} className="text-base px-3 py-1" />
              </div>
              {box.temperature !== null && box.temperature !== undefined && 
               box.lowerTemperatureLimit !== null && box.upperTemperatureLimit !== null && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Temperature Status</p>
                  <p className="text-sm">
                    {box.temperature < box.lowerTemperatureLimit || box.temperature > box.upperTemperatureLimit
                      ? '⚠️ Out of range'
                      : '✓ Within range'}
                  </p>
                </div>
              )}
              {box.humidity !== null && box.humidity !== undefined && 
               box.lowerHumidityLimit !== null && box.upperHumidityLimit !== null && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Humidity Status</p>
                  <p className="text-sm">
                    {box.humidity < box.lowerHumidityLimit || box.humidity > box.upperHumidityLimit
                      ? '⚠️ Out of range'
                      : '✓ Within range'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {recentMeasurements.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Temperature Trend (Last 2 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
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
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
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
        )}

        {recentMeasurements.length === 0 && (
          <Card className="border-border/50 shadow-depth-md">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No measurement history available for the last 2 hours</p>
            </CardContent>
          </Card>
        )}
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
