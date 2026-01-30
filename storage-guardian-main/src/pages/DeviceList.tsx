import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Loader2, Edit, ChevronDown, ChevronUp, Filter, ArrowUpDown, Activity, Package, Clock, AlertCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { devicesApi, boxesApi, checkPermission } from "@/lib/api/client";
import { DeviceListDto } from "@/lib/mockData";
import { RegisterDeviceDialog } from "@/components/RegisterDeviceDialog";
import { RemoveDeviceDialog } from "@/components/RemoveDeviceDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SortField = "id" | "name" | "lastMeasurement" | "boxId";
type SortDirection = "asc" | "desc";
type AssignmentFilter = "all" | "assigned" | "unassigned";

const DeviceList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedDevices, setExpandedDevices] = useState<Set<number>>(new Set());
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [removeDialogDevice, setRemoveDialogDevice] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Check if user has operator permissions
  if (!checkPermission('operator')) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive">
            <AlertDescription>
              Access denied. Device management requires operator permissions.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getAll(),
    refetchInterval: 30000,
  });

  const { data: boxes = [] } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = devices.length;
    const assigned = devices.filter(d => d.boxId).length;
    const unassigned = total - assigned;
    const online = devices.filter(d => {
      if (!d.lastMeasurementDate) return false;
      const lastMeas = new Date(d.lastMeasurementDate);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastMeas.getTime()) / (1000 * 60);
      return diffMinutes < 15; // Online if last measurement < 15 minutes ago
    }).length;
    const offline = total - online;
    
    return { total, assigned, unassigned, online, offline };
  }, [devices]);

  // Filter and sort devices
  const filteredAndSortedDevices = useMemo(() => {
    let filtered = devices.filter((device: DeviceListDto) => {
      const matchesSearch =
        device.id.toString().includes(searchQuery.toLowerCase()) ||
        device.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "assigned" && device.boxId) ||
        (assignmentFilter === "unassigned" && !device.boxId);
      
      return matchesSearch && matchesAssignment;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "lastMeasurement":
          aVal = a.lastMeasurementDate ? new Date(a.lastMeasurementDate).getTime() : 0;
          bVal = b.lastMeasurementDate ? new Date(b.lastMeasurementDate).getTime() : 0;
          break;
        case "boxId":
          aVal = a.boxId || 0;
          bVal = b.boxId || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [devices, searchQuery, assignmentFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleExpand = (deviceId: number) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDevices(newExpanded);
  };

  const getDeviceStatus = (device: DeviceListDto) => {
    if (!device.lastMeasurementDate) return { status: "unknown", label: "No data", color: "bg-gray-500" };
    
    const lastMeas = new Date(device.lastMeasurementDate);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastMeas.getTime()) / (1000 * 60);
    
    if (diffMinutes < 15) {
      return { status: "online", label: "Online", color: "bg-green-500" };
    } else if (diffMinutes < 60) {
      return { status: "warning", label: "Warning", color: "bg-yellow-500" };
    } else {
      return { status: "offline", label: "Offline", color: "bg-red-500" };
    }
  };

  const formatTimestamp = (date: Date | string) => {
    if (!date) return "Never";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Device List
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage monitoring devices</p>
          </div>
          <Button 
            onClick={() => setRegisterDialogOpen(true)} 
            className="w-full sm:w-auto shadow-depth-sm hover:shadow-depth-md transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Device
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
              </div>
              <Package className="h-5 w-5 text-green-600" />
            </div>
          </Card>
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unassigned}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
              </div>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </Card>
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
              </div>
              <Activity className="h-5 w-5 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-border/50 shadow-depth-md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by device ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-border/50 bg-card/50"
              />
            </div>
            <Select value={assignmentFilter} onValueChange={(v) => setAssignmentFilter(v as AssignmentFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] border-border/50 bg-card/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Device Table */}
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
                    <TableHead className="w-12"></TableHead>
                    <TableHead 
                      className="hidden sm:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("id")}
                    >
                      <div className="flex items-center gap-2">
                        Device ID
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead 
                      className="hidden md:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("boxId")}
                    >
                      <div className="flex items-center gap-2">
                        Assigned Box
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="hidden lg:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("lastMeasurement")}
                    >
                      <div className="flex items-center gap-2">
                        Last Measurement
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No devices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedDevices.map((device: DeviceListDto) => {
                      const isExpanded = expandedDevices.has(device.id);
                      const deviceStatus = getDeviceStatus(device);
                      const assignedBox = boxes.find(b => b.id === device.boxId);
                      
                      return (
                        <>
                          <TableRow 
                            key={device.id} 
                            className="border-border/30 hover:bg-card/50 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(device.id)}
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(device.id);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-mono font-medium hidden sm:table-cell">
                              {device.id}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="sm:hidden font-mono text-xs text-muted-foreground mb-1">
                                  ID: {device.id}
                                </div>
                                <div className="flex items-center gap-2">
                                  {device.name}
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "h-2 w-2 p-0 rounded-full",
                                      deviceStatus.color
                                    )}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge 
                                variant={deviceStatus.status === "online" ? "default" : "secondary"}
                                className={cn(
                                  "text-xs",
                                  deviceStatus.status === "online" && "bg-green-500/10 text-green-600 border-green-500/20",
                                  deviceStatus.status === "offline" && "bg-red-500/10 text-red-600 border-red-500/20",
                                  deviceStatus.status === "warning" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                )}
                              >
                                {deviceStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {device.boxId ? (
                                <div className="flex items-center gap-2">
                                  <Package className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-mono text-sm">
                                    {assignedBox ? assignedBox.name : `Box ${device.boxId}`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden lg:table-cell">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(device.lastMeasurementDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRemoveDialogDevice(device.id)}
                                  className="hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={7} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium mb-2">Device Details</p>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Device ID:</span>
                                        <span className="font-mono font-medium">{device.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span>{device.name}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge 
                                          variant={deviceStatus.status === "online" ? "default" : "secondary"}
                                          className={cn(
                                            "text-xs",
                                            deviceStatus.status === "online" && "bg-green-500/10 text-green-600 border-green-500/20",
                                            deviceStatus.status === "offline" && "bg-red-500/10 text-red-600 border-red-500/20"
                                          )}
                                        >
                                          {deviceStatus.label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-2">Assignment</p>
                                    <div className="space-y-1 text-sm">
                                      {device.boxId ? (
                                        <>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Assigned to:</span>
                                            <span className="font-medium">
                                              {assignedBox ? assignedBox.name : `Box ${device.boxId}`}
                                            </span>
                                          </div>
                                          {assignedBox && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Warehouse:</span>
                                              <span>{assignedBox.warehouse.name}</span>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <p className="text-muted-foreground">Not assigned to any box</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-2">Last Activity</p>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Measurement:</span>
                                        <span>
                                          {device.lastMeasurementDate 
                                            ? formatTimestamp(device.lastMeasurementDate)
                                            : "Never"}
                                        </span>
                                      </div>
                                      {device.lastMeasurementDate && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Full Date:</span>
                                          <span className="text-xs">
                                            {new Date(device.lastMeasurementDate).toLocaleString()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedDevices.length} of {devices.length} devices
          </p>
          {sortField && (
            <p className="text-sm text-muted-foreground">
              Sorted by {sortField} ({sortDirection})
            </p>
          )}
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
