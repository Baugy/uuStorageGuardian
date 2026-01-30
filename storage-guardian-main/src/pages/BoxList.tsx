import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, History, Settings, Search, Loader2, ChevronDown, ChevronUp, ArrowUpDown, Thermometer, Droplet, Package, Clock, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { boxesApi } from "@/lib/api/client";
import { BoxStatus, BoxListDto } from "@/lib/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SortField = "id" | "name" | "temperature" | "humidity" | "status" | "lastMeasurement" | "warehouse";
type SortDirection = "asc" | "desc";

const BoxList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedBoxes, setExpandedBoxes] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const { data: boxes = [], isLoading: boxesLoading, error: boxesError } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Extract unique warehouses from boxes data
  const warehouses = useMemo(() => {
    return Array.from(
      new Set(boxes.map((box: BoxListDto) => 
        typeof box.warehouse === 'string' ? box.warehouse : box.warehouse.name
      ))
    ).sort();
  }, [boxes]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = boxes.length;
    const ok = boxes.filter(b => b.status === "OK").length;
    const warning = boxes.filter(b => b.status === "WARNING").length;
    const critical = boxes.filter(b => b.status === "CRITICAL").length;
    
    return { total, ok, warning, critical };
  }, [boxes]);

  // Filter and sort boxes
  const filteredAndSortedBoxes = useMemo(() => {
    let filtered = boxes.filter((box: BoxListDto) => {
      const matchesSearch =
        box.id.toString().includes(searchQuery.toLowerCase()) ||
        box.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const warehouseName = typeof box.warehouse === 'string' ? box.warehouse : box.warehouse.name;
      const matchesWarehouse = warehouseFilter === "all" || warehouseName === warehouseFilter;
      const matchesStatus = statusFilter === "all" || box.status === statusFilter;
      
      return matchesSearch && matchesWarehouse && matchesStatus;
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
        case "temperature":
          aVal = a.temperature ?? 0;
          bVal = b.temperature ?? 0;
          break;
        case "humidity":
          aVal = a.humidity ?? 0;
          bVal = b.humidity ?? 0;
          break;
        case "status":
          const statusOrder = { "OK": 0, "WARNING": 1, "CRITICAL": 2 };
          aVal = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
          bVal = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
          break;
        case "lastMeasurement":
          aVal = a.lastMeasurementDate ? new Date(a.lastMeasurementDate).getTime() : 0;
          bVal = b.lastMeasurementDate ? new Date(b.lastMeasurementDate).getTime() : 0;
          break;
        case "warehouse":
          const aWarehouse = typeof a.warehouse === 'string' ? a.warehouse : a.warehouse.name;
          const bWarehouse = typeof b.warehouse === 'string' ? b.warehouse : b.warehouse.name;
          aVal = aWarehouse.toLowerCase();
          bVal = bWarehouse.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [boxes, searchQuery, warehouseFilter, statusFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleExpand = (boxId: number) => {
    const newExpanded = new Set(expandedBoxes);
    if (newExpanded.has(boxId)) {
      newExpanded.delete(boxId);
    } else {
      newExpanded.add(boxId);
    }
    setExpandedBoxes(newExpanded);
  };

  const formatTimestamp = (date: Date | string | undefined) => {
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

  // Don't show error if we have mock data fallback
  if (boxesError && !boxesLoading && boxes.length === 0) {
    const errorMessage = boxesError instanceof Error ? boxesError.message : 'Unknown error';
    const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch');
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <p className="font-medium mb-2">Failed to load boxes</p>
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
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Boxes" }]} />
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Box List
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage and monitor all storage boxes</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Boxes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OK Status</p>
                <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
              </div>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </Card>
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <Activity className="h-5 w-5 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-4 border-border/50 shadow-depth-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <Activity className="h-5 w-5 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-border/50 shadow-depth-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by box ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-border/50 bg-card/50"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="border-border/50 bg-card/50">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse} value={warehouse}>
                    {warehouse}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-border/50 bg-card/50">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Box Table */}
        <Card className="border-border/50 shadow-depth-md overflow-hidden">
          {boxesLoading ? (
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
                        Box ID
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
                    <TableHead 
                      className="hidden md:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("warehouse")}
                    >
                      <div className="flex items-center gap-2">
                        Warehouse
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="hidden lg:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("temperature")}
                    >
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-3 w-3" />
                        Temp
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="hidden lg:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("humidity")}
                    >
                      <div className="flex items-center gap-2">
                        <Droplet className="h-3 w-3" />
                        Humidity
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="hidden xl:table-cell cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("lastMeasurement")}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Last Measurement
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedBoxes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No boxes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedBoxes.map((box: BoxListDto) => {
                      const isExpanded = expandedBoxes.has(box.id);
                      const warehouseName = typeof box.warehouse === 'string' ? box.warehouse : box.warehouse.name;
                      
                      return (
                        <React.Fragment key={box.id}>
                          <TableRow 
                            key={box.id} 
                            className="border-border/30 hover:bg-card/50 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(box.id)}
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(box.id);
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
                              {box.id}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="sm:hidden font-mono text-xs text-muted-foreground mb-1">
                                  ID: {box.id}
                                </div>
                                {box.name}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                {warehouseName}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {box.temperature !== null && box.temperature !== undefined ? (
                                <div className="flex items-center gap-1">
                                  <Thermometer className="h-3 w-3 text-muted-foreground" />
                                  <span>{box.temperature.toFixed(1)}°C</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {box.humidity !== null && box.humidity !== undefined ? (
                                <div className="flex items-center gap-1">
                                  <Droplet className="h-3 w-3 text-muted-foreground" />
                                  <span>{box.humidity.toFixed(1)}%</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={box.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden xl:table-cell">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(box.lastMeasurementDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="hover:bg-primary/10" 
                                  onClick={() => navigate(`/boxes/${box.id}`)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="hover:bg-primary/10" 
                                  onClick={() => navigate(`/boxes/${box.id}/history`)}
                                  title="View History"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={9} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-sm font-medium mb-2">Box Information</p>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Box ID:</span>
                                        <span className="font-mono font-medium">{box.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span>{box.name}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Warehouse:</span>
                                        <span>{warehouseName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <StatusBadge status={box.status} />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-2">Current Conditions</p>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Temperature:</span>
                                        <span className="flex items-center gap-1">
                                          <Thermometer className="h-3 w-3" />
                                          {box.temperature !== null && box.temperature !== undefined 
                                            ? `${box.temperature.toFixed(1)}°C`
                                            : "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Humidity:</span>
                                        <span className="flex items-center gap-1">
                                          <Droplet className="h-3 w-3" />
                                          {box.humidity !== null && box.humidity !== undefined 
                                            ? `${box.humidity.toFixed(1)}%`
                                            : "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Measurement:</span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {formatTimestamp(box.lastMeasurementDate)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-2">Quick Actions</p>
                                    <div className="flex flex-col gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start"
                                        onClick={() => navigate(`/boxes/${box.id}`)}
                                      >
                                        <Eye className="h-3 w-3 mr-2" />
                                        View Full Details
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start"
                                        onClick={() => navigate(`/boxes/${box.id}/history`)}
                                      >
                                        <History className="h-3 w-3 mr-2" />
                                        View History
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
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
            Showing {filteredAndSortedBoxes.length} of {boxes.length} boxes
          </p>
          {sortField && (
            <p className="text-sm text-muted-foreground">
              Sorted by {sortField} ({sortDirection})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoxList;
