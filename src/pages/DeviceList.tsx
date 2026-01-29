import { useState } from "react";
import { Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { devicesApi } from "@/lib/api/client";
import { DeviceListDto } from "@/lib/mockData";
import { RegisterDeviceDialog } from "@/components/RegisterDeviceDialog";
import { RemoveDeviceDialog } from "@/components/RemoveDeviceDialog";
import { toast } from "sonner";

const DeviceList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [removeDialogDevice, setRemoveDialogDevice] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getAll(),
  });

  const filteredDevices = devices.filter((device: DeviceListDto) => {
    const matchesSearch =
      device.id.toString().includes(searchQuery.toLowerCase()) ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const deleteDeviceMutation = useMutation({
    mutationFn: (deviceId: number) => devicesApi.delete(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Device removed successfully");
      setRemoveDialogDevice(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove device");
    },
  });

  const handleRemoveDevice = (deviceId: number) => {
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
      <div className="container mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Devices" }]} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Device List</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage monitoring devices</p>
          </div>
          <Button onClick={() => setRegisterDialogOpen(true)} className="w-full sm:w-auto shadow-depth-sm hover:shadow-depth-md transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Register Device
          </Button>
        </div>

        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-border/50 shadow-depth-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by device ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border/50 bg-card/50"
            />
          </div>
        </Card>

        <Card className="border-border/50 shadow-depth-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="hidden sm:table-cell">Device ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Assigned Box</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Measurement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No devices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevices.map((device: DeviceListDto) => (
                <TableRow key={device.id} className="border-border/30 hover:bg-card/50 transition-colors">
                  <TableCell className="font-mono font-medium hidden sm:table-cell">{device.id}</TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div className="sm:hidden font-mono text-xs text-muted-foreground mb-1">{device.id}</div>
                      {device.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {device.boxId ? (
                      <span className="font-mono text-sm">Box {device.boxId}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {new Date(device.lastMeasurementDate).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemoveDialogDevice(device.id)}
                      className="hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
