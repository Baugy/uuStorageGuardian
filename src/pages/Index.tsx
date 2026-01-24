import { Link } from "react-router-dom";
import { Box, Activity, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { boxesApi, devicesApi } from "@/lib/api/client";
import { USE_MOCK_DATA } from "@/lib/api/config";
import { ApiStatus } from "@/components/ApiStatus";

const Index = () => {
  const { data: boxes = [], isLoading: boxesLoading, error: boxesError } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
    refetchInterval: 30000,
  });

  const { data: devices = [], isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getAll(),
    refetchInterval: 30000,
  });

  const okBoxes = boxes.filter((b) => b.status === "OK").length;
  const warningBoxes = boxes.filter((b) => b.status === "Warning").length;
  const alarmBoxes = boxes.filter((b) => b.status === "Alarm").length;
  const onlineDevices = devices.filter((d) => d.status === "online").length;

  const isLoading = boxesLoading || devicesLoading;
  const hasError = boxesError || devicesError;

  // Don't show error immediately - let mock data fallback work
  // Only show error if both API and mock data fail
  if (hasError && !isLoading && boxes.length === 0 && devices.length === 0) {
    const errorMessage = boxesError instanceof Error ? boxesError.message : 'Unknown error';
    const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch');
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <p className="font-medium mb-2">Failed to load data from backend</p>
              {isCorsError && (
                <div className="text-sm space-y-1">
                  <p>CORS error detected. The backend needs to allow requests from this domain.</p>
                  <p className="text-muted-foreground">
                    Using mock data as fallback. Check the API Connection Status below.
                  </p>
                </div>
              )}
              {!isCorsError && (
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              )}
            </AlertDescription>
          </Alert>
          <ApiStatus />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        {USE_MOCK_DATA && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-950/30 backdrop-blur-sm shadow-depth-sm">
            <AlertDescription className="flex items-center gap-2">
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                Mock Mode
              </Badge>
              Using mock data - backend API is disabled
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            IoT Storage Monitoring
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Real-time environmental monitoring for warehouse storage units
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" className="w-full sm:w-auto shadow-depth-md hover:shadow-depth-lg transition-all" asChild>
              <Link to="/boxes">
                <Box className="h-5 w-5 mr-2" />
                View Boxes
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto shadow-depth-sm hover:shadow-depth-md transition-all" asChild>
              <Link to="/devices">
                <Activity className="h-5 w-5 mr-2" />
                Manage Devices
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="relative overflow-hidden border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Boxes
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl sm:text-4xl font-bold">{boxes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Monitored storage units</p>
                </CardContent>
              </Card>

          <Card className="relative overflow-hidden border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                OK Status
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl sm:text-4xl font-bold text-success">{okBoxes}</div>
              <p className="text-xs text-muted-foreground mt-1">Operating normally</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-transparent"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl sm:text-4xl font-bold text-warning">{warningBoxes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Approaching thresholds
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alarms
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl sm:text-4xl font-bold text-destructive">{alarmBoxes}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <ApiStatus />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/boxes">
                    <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all cursor-pointer shadow-depth-sm hover:shadow-depth-md hover:-translate-y-0.5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">Box List</h3>
                          <p className="text-sm text-muted-foreground">
                            View and manage all storage boxes
                          </p>
                        </div>
                        <Box className="h-8 w-8 text-primary flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                  <Link to="/devices">
                    <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all cursor-pointer shadow-depth-sm hover:shadow-depth-md hover:-translate-y-0.5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">Device Management</h3>
                          <p className="text-sm text-muted-foreground">
                            Monitor and configure sensors
                          </p>
                        </div>
                        <Activity className="h-8 w-8 text-primary flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-depth-md hover:shadow-depth-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20 shadow-depth-sm">
                    <div>
                      <p className="font-semibold text-success">Devices Online</p>
                      <p className="text-sm text-muted-foreground">
                        {onlineDevices} of {devices.length} active
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-success">{onlineDevices}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-card/50 shadow-depth-sm">
                    <p className="font-semibold mb-2">System Health</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Database</span>
                        <span className="text-success font-medium">Operational</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">API</span>
                        <span className="text-success font-medium">Operational</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
