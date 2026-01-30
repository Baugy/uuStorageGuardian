import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { boxesApi, devicesApi } from "@/lib/api/client";
import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/api/config";

export const ApiStatus = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const { data: boxes, isLoading: boxesLoading, error: boxesError, refetch: refetchBoxes } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
    retry: false,
  });

  const { data: devices, isLoading: devicesLoading, error: devicesError, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getAll(),
    retry: false,
  });


  const testEndpoint = async (name: string, endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json().catch(() => ({ message: 'No JSON response' }));
      
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          data: data,
          timestamp: new Date().toLocaleTimeString(),
        }
      }));
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 0,
          ok: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        }
      }));
    }
  };

  const runAllTests = () => {
    testEndpoint('boxes', '/api/box');
    testEndpoint('devices', '/api/device');
  };

  const getStatusIcon = (loading: boolean, error: any, data: any) => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (error) return <XCircle className="h-4 w-4 text-destructive" />;
    if (data) return <CheckCircle2 className="h-4 w-4 text-success" />;
    return null;
  };

  const getStatusText = (loading: boolean, error: any, data: any) => {
    if (loading) return "Loading...";
    if (error) return "Error";
    if (data) return "Connected";
    return "Not tested";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Backend URL</p>
              <p className="text-sm text-muted-foreground font-mono">{API_BASE_URL}</p>
            </div>
            <Badge variant={USE_MOCK_DATA ? "outline" : "default"}>
              {USE_MOCK_DATA ? "Mock Mode" : "API Mode"}
            </Badge>
          </div>

          {USE_MOCK_DATA && (
            <Alert>
              <AlertDescription>
                Mock data mode is enabled. API calls are disabled.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(boxesLoading, boxesError, boxes)}
                <div>
                  <p className="font-medium">Boxes API</p>
                  <p className="text-sm text-muted-foreground">
                    {getStatusText(boxesLoading, boxesError, boxes)}
                    {boxes && ` (${boxes.length} boxes)`}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchBoxes()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(devicesLoading, devicesError, devices)}
                <div>
                  <p className="font-medium">Devices API</p>
                  <p className="text-sm text-muted-foreground">
                    {getStatusText(devicesLoading, devicesError, devices)}
                    {devices && ` (${devices.length} devices)`}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchDevices()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

          </div>

          <div className="pt-4 border-t">
            <Button onClick={runAllTests} className="w-full">
              Test All Endpoints
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <p className="font-medium text-sm">Test Results:</p>
              {Object.entries(testResults).map(([name, result]) => (
                <div key={name} className="p-2 bg-muted rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{name}</span>
                    <Badge variant={result.ok ? "default" : "destructive"}>
                      {result.status || "Error"}
                    </Badge>
                  </div>
                  {result.error && (
                    <p className="text-destructive text-xs">{result.error}</p>
                  )}
                  {result.data && (
                    <p className="text-muted-foreground text-xs">
                      Response: {JSON.stringify(result.data).substring(0, 100)}...
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">Tested at: {result.timestamp}</p>
                </div>
              ))}
            </div>
          )}

          {(boxesError || devicesError) && (
            <Alert variant="destructive">
              <AlertDescription>
                <p className="font-medium mb-2">Connection Issues:</p>
                {boxesError && (
                  <p className="text-sm">Boxes API: {boxesError instanceof Error ? boxesError.message : 'Unknown error'}</p>
                )}
                {devicesError && (
                  <p className="text-sm">Devices API: {devicesError instanceof Error ? devicesError.message : 'Unknown error'}</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



