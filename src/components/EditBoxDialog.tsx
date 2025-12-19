import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box } from "@/lib/mockData";
import { boxesApi, warehousesApi } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditBoxDialogProps {
  box: Box;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditBoxDialog = ({ box, open, onOpenChange }: EditBoxDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: box.name,
    description: box.description || "",
    warehouse: box.warehouse,
    minTemp: box.minTemp.toString(),
    maxTemp: box.maxTemp.toString(),
    minHumidity: box.minHumidity.toString(),
    maxHumidity: box.maxHumidity.toString(),
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Box>) => boxesApi.update(box.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['box', box.id] });
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
      toast.success("Box settings updated successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update box");
    },
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: box.name,
        description: box.description || "",
        warehouse: box.warehouse,
        minTemp: box.minTemp.toString(),
        maxTemp: box.maxTemp.toString(),
        minHumidity: box.minHumidity.toString(),
        maxHumidity: box.maxHumidity.toString(),
      });
    }
  }, [box, open]);

  const handleSave = () => {
    updateMutation.mutate({
      name: formData.name,
      description: formData.description,
      warehouse: formData.warehouse,
      minTemp: parseFloat(formData.minTemp),
      maxTemp: parseFloat(formData.maxTemp),
      minHumidity: parseFloat(formData.minHumidity),
      maxHumidity: parseFloat(formData.maxHumidity),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Box – {box.id}</DialogTitle>
          <DialogDescription>
            Update the configuration and settings for this storage box.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Box Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="warehouse">Warehouse</Label>
            <Select value={formData.warehouse} onValueChange={(value) => setFormData({ ...formData, warehouse: value })}>
              <SelectTrigger id="warehouse">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse} value={warehouse}>
                    {warehouse}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minTemp">Min Temperature (°C)</Label>
              <Input
                id="minTemp"
                type="number"
                value={formData.minTemp}
                onChange={(e) => setFormData({ ...formData, minTemp: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxTemp">Max Temperature (°C)</Label>
              <Input
                id="maxTemp"
                type="number"
                value={formData.maxTemp}
                onChange={(e) => setFormData({ ...formData, maxTemp: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minHumidity">Min Humidity (%)</Label>
              <Input
                id="minHumidity"
                type="number"
                value={formData.minHumidity}
                onChange={(e) => setFormData({ ...formData, minHumidity: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxHumidity">Max Humidity (%)</Label>
              <Input
                id="maxHumidity"
                type="number"
                value={formData.maxHumidity}
                onChange={(e) => setFormData({ ...formData, maxHumidity: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
