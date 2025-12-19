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
import { boxesApi, warehousesApi } from "@/lib/api/client";
import { BoxStatus } from "@/lib/mockData";
import { toast } from "sonner";

const BoxList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: boxes = [], isLoading: boxesLoading, error: boxesError } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAll(),
  });

  const filteredBoxes = boxes.filter((box) => {
    const matchesSearch =
      box.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      box.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = warehouseFilter === "all" || box.warehouse === warehouseFilter;
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
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Boxes" }]} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Box List</h1>
          <p className="text-muted-foreground">Manage and monitor all storage boxes</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by box ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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

        <Card>
          {boxesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Box ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Measurement</TableHead>
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
                <TableRow key={box.id}>
                  <TableCell className="font-mono font-medium">{box.id}</TableCell>
                  <TableCell className="font-medium">{box.name}</TableCell>
                  <TableCell>{box.warehouse}</TableCell>
                  <TableCell>{box.currentTemp.toFixed(1)}°C</TableCell>
                  <TableCell>{box.currentHumidity.toFixed(1)}%</TableCell>
                  <TableCell>
                    <StatusBadge status={box.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTimestamp(box.lastMeasurement)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/boxes/${box.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/boxes/${box.id}/history`}>
                          <History className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
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
            Showing {filteredBoxes.length} of {boxes.length} boxes
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoxList;
