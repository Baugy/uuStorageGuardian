import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, History, Settings, Search, Loader2 } from "lucide-react";
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
import { boxesApi } from "@/lib/api/client";
import { BoxStatus, BoxListDto } from "@/lib/mockData";
import { toast } from "sonner";

const BoxList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: boxes = [], isLoading: boxesLoading, error: boxesError } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Extract unique warehouses from boxes data
  const warehouses = Array.from(
    new Set(boxes.map((box: BoxListDto) => box.warehouse.name))
  ).sort();

  const filteredBoxes = boxes.filter((box: BoxListDto) => {
    const matchesSearch =
      box.id.toString().includes(searchQuery.toLowerCase()) ||
      box.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = warehouseFilter === "all" || box.warehouse.name === warehouseFilter;
    const matchesStatus = statusFilter === "all" || box.status === statusFilter;
    return matchesSearch && matchesWarehouse && matchesStatus;
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

  // Don't show error if we have mock data fallback
  // Only show error if we have no data at all
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Box List</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage and monitor all storage boxes</p>
        </div>

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
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Alarm">Alarm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

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
                    <TableHead className="hidden sm:table-cell">Box ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Warehouse</TableHead>
                    <TableHead className="hidden lg:table-cell">Temperature</TableHead>
                    <TableHead className="hidden lg:table-cell">Humidity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Last Measurement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBoxes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No boxes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBoxes.map((box) => (
                  <TableRow key={box.id} className="border-border/30 hover:bg-card/50 transition-colors">
                    <TableCell className="font-mono font-medium hidden sm:table-cell">{box.id}</TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="sm:hidden font-mono text-xs text-muted-foreground mb-1">{box.id}</div>
                        {box.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{box.warehouse}</TableCell>
                    <TableCell className="hidden lg:table-cell">{box.currentTemp.toFixed(1)}°C</TableCell>
                    <TableCell className="hidden lg:table-cell">{box.currentHumidity.toFixed(1)}%</TableCell>
                    <TableCell>
                      <StatusBadge status={box.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">
                      {formatTimestamp(box.lastMeasurement)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10" asChild>
                          <Link to={`/boxes/${box.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10" asChild>
                          <Link to={`/boxes/${box.id}/history`}>
                            <History className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
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
            Showing {filteredBoxes.length} of {boxes.length} boxes
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoxList;
