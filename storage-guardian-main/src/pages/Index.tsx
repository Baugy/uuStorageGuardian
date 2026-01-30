import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Activity, Loader2, Search, Calendar, AlertTriangle, CheckCircle2, Clock, Cpu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { boxesApi, devicesApi, authManager } from "@/lib/api/client";
import { USE_MOCK_DATA } from "@/lib/api/config";
import { ApiStatus } from "@/components/ApiStatus";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const currentUserType = authManager.getCurrentUserType();
  const isOperator = currentUserType === 'operator';

  const { data: boxes = [], isLoading: boxesLoading, error: boxesError } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
    refetchInterval: 30000,
  });

  const { data: devices = [], isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getAll(),
    refetchInterval: 30000,
    enabled: isOperator,
  });

  const okBoxes = boxes.filter((b) => b.status === "OK").length;
  const warningBoxes = boxes.filter((b) => b.status === "WARNING").length;
  const alarmBoxes = boxes.filter((b) => b.status === "CRITICAL").length;
  const onlineDevices = isOperator ? devices.filter((d) => d.status === "online").length : 0;

  const isLoading = boxesLoading || (isOperator && devicesLoading);
  const hasError = boxesError || (isOperator && devicesError);

  // Get active alerts (boxes with warnings or critical status)
  const activeAlerts = boxes
    .filter((b) => b.status === "WARNING" || b.status === "CRITICAL")
    .slice(0, 5)
    .map((box) => ({
      id: box.id,
      name: box.name,
      status: box.status,
      warehouse: typeof box.warehouse === 'string' ? box.warehouse : box.warehouse.name,
      lastMeasurement: box.lastMeasurementDate,
    }));

  // Don't show error immediately - let mock data fallback work
  const deviceCount = isOperator ? devices.length : 0;
  if (hasError && !isLoading && boxes.length === 0 && deviceCount === 0) {
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
    <div className="flex gap-6">
      {/* Main Content Area */}
      <div className="flex-1">
        {USE_MOCK_DATA && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-950/30 backdrop-blur-sm">
            <AlertDescription className="flex items-center gap-2">
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                Mock Mode
              </Badge>
              Using mock data - backend API is disabled
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-card/50 border border-border/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="browse" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search className="h-4 w-4 mr-2" />
                Browse Boxes
              </TabsTrigger>
            </TabsList>
            <Button 
              onClick={() => navigate('/boxes')}
              className="bg-primary hover:bg-primary/90"
            >
              <Box className="h-4 w-4 mr-2" />
              View All Boxes
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Boxes
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">{boxes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Monitored units</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    OK Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-success">{okBoxes}</div>
                  <p className="text-xs text-muted-foreground mt-1">Operating normally</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-transparent"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-warning">{warningBoxes}</div>
                  <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Alarms
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-destructive">{alarmBoxes}</div>
                  <p className="text-xs text-muted-foreground mt-1">Critical issues</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/boxes">
                      <Box className="h-4 w-4 mr-2" />
                      View All Boxes
                    </Link>
                  </Button>
                  {isOperator && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/devices">
                        <Activity className="h-4 w-4 mr-2" />
                        Manage Devices
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOperator && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                      <div>
                        <p className="font-semibold text-success text-sm">Devices Online</p>
                        <p className="text-xs text-muted-foreground">
                          {onlineDevices} of {devices.length} active
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-success">{onlineDevices}</div>
                    </div>
                  )}
                  <div className="p-3 rounded-lg border border-border/50 bg-card/50">
                    <p className="font-semibold text-sm mb-2">System Health</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Database</span>
                        <span className="text-success font-medium">Operational</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">API</span>
                        <span className="text-success font-medium">Operational</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ApiStatus />
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle>Browse Storage Boxes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Search and filter through all monitored storage boxes
                  </p>
                  <Button asChild className="w-full sm:w-auto">
                    <Link to="/boxes">
                      <Search className="h-4 w-4 mr-2" />
                      Open Box Browser
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {isOperator && (
                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle>Browse Devices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Manage and monitor all IoT devices and sensors
                    </p>
                    <Button asChild className="w-full sm:w-auto">
                      <Link to="/devices">
                        <Cpu className="h-4 w-4 mr-2" />
                        Open Device Browser
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="w-80 hidden lg:block space-y-6">
        {/* Quick Stats */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Boxes</span>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                {boxes.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">OK Status</span>
              <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                {okBoxes}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Warnings</span>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                {warningBoxes}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical</span>
              <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20">
                {alarmBoxes}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <CardTitle className="text-base">Active Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No alerts</p>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors cursor-pointer"
                      onClick={() => navigate(`/boxes/${alert.id}`)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={alert.status === 'CRITICAL' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}>
                          {alert.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{alert.name}</p>
                          {alert.status === 'CRITICAL' ? (
                            <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
                          ) : (
                            <Clock className="h-3 w-3 text-warning flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{alert.warehouse}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.lastMeasurement).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
