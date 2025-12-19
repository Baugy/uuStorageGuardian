import { useState } from "react";
import { Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { devicesApi } from "@/lib/api/client";
import { DeviceStatus } from "@/lib/mockData";
import { RegisterDeviceDialog } from "@/components/RegisterDeviceDialog";
import { RemoveDeviceDialog } from "@/components/RemoveDeviceDialog";
import { toast } from "sonner";

const DeviceList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [removeDialogDevice, setRemoveDialogDevice] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getAll(),
    refetchInterval: 30000,
  });

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || device.type === typeFilter;
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
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

  const getBatteryColor = (level: number) => {
    if (level > 60) return "bg-success";
    if (level > 30) return "bg-warning";
    return "bg-destructive";
  };

  const deleteDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => devicesApi.delete(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Device removed successfully");
      setRemoveDialogDevice(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove device");
    },
  });

  const handleRemoveDevice = (deviceId: string) => {
    deleteDeviceMutation.mutate(deviceId);
  };

  // Don't show error if we have mock data fallback
  if (error && !isLoading && devices.length === 0) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch');
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <p className="font-medium mb-2">Failed to load devices</p>
              {isCorsError && (
                <p className="text-sm text-muted-foreground">
                  CORS error: Backend needs to allow requests from this domain. 
                  Using mock data as fallback.
                </p>
              )}
              {!isCorsError && (
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Devices" }]} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Device List</h1>
            <p className="text-muted-foreground">Manage monitoring devices</p>
          </div>
          <Button onClick={() => setRegisterDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Device
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by device ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Device Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Device Types</SelectItem>
                <SelectItem value="Temperature">Temperature Only</SelectItem>
                <SelectItem value="Temperature + Humidity">Temperature + Humidity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="no_data">No Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Assigned Box</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Last Signal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No devices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-mono font-medium">{device.id}</TableCell>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>
                    {device.assignedBox ? (
                      <span className="font-mono text-sm">{device.assignedBox}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>{device.warehouse}</TableCell>
                  <TableCell>
                    <StatusBadge status={device.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={device.batteryLevel}
                        className="w-20"
                        indicatorClassName={getBatteryColor(device.batteryLevel)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {device.batteryLevel}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTimestamp(device.lastSignal)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemoveDialogDevice(device.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDevices.length} of {devices.length} devices
          </p>
        </div>
      </div>

      <RegisterDeviceDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
      />

      <RemoveDeviceDialog
        deviceId={removeDialogDevice}
        open={removeDialogDevice !== null}
        onOpenChange={(open) => !open && setRemoveDialogDevice(null)}
        onConfirm={handleRemoveDevice}
      />
    </div>
  );
};

export default DeviceList;
