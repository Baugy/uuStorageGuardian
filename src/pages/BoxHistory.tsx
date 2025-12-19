import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Download, Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { boxesApi } from "@/lib/api/client";
import { toast } from "sonner";

const BoxHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("24");
  const [aggregation, setAggregation] = useState("hour");

  const { data: box, isLoading: boxLoading, error: boxError } = useQuery({
    queryKey: ['box', id],
    queryFn: () => boxesApi.getById(id!),
    enabled: !!id,
  });

  const { data: measurements = [], isLoading: measurementsLoading } = useQuery({
    queryKey: ['box-history', id, timeRange],
    queryFn: () => boxesApi.getHistory(id!, parseInt(timeRange)),
    enabled: !!id,
    refetchInterval: 60000,
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

  const formatChartTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const chartData = measurements.map((m) => ({
    time: formatChartTime(m.timestamp),
    temperature: m.temperature,
    humidity: m.humidity,
  }));

  if (boxLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (boxError || !box) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Box Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {boxError ? "Failed to load box data" : "The requested box does not exist"}
          </p>
          <Button onClick={() => navigate("/boxes")} asChild>
            <Link to="/boxes">Return to Box List</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    toast.success("CSV export started");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Boxes", href: "/" },
            { label: box.name, href: `/boxes/${box.id}` },
            { label: "History" },
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Box History – {box.name}
            </h1>
            <p className="text-muted-foreground font-mono">{box.id}</p>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">Last 24 Hours</SelectItem>
                    <SelectItem value="72">Last 3 Days</SelectItem>
                    <SelectItem value="168">Last Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aggregation</label>
                <Select value={aggregation} onValueChange={setAggregation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Hourly</SelectItem>
                    <SelectItem value="day">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Temperature & Humidity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--primary))"
                  label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--primary))"
                  label={{ value: "Humidity (%)", angle: 90, position: "insideRight" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Temperature (°C)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  stroke="hsl(195 85% 65%)"
                  strokeWidth={2}
                  dot={false}
                  name="Humidity (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Measurement Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurementsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : measurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No measurements found
                    </TableCell>
                  </TableRow>
                ) : (
                  measurements.slice(0, 20).map((measurement, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatTimestamp(measurement.timestamp)}
                      </TableCell>
                      <TableCell>{measurement.temperature.toFixed(1)}°C</TableCell>
                      <TableCell>{measurement.humidity.toFixed(1)}%</TableCell>
                      <TableCell>
                        <StatusBadge status={measurement.status} />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {measurement.deviceId}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BoxHistory;
