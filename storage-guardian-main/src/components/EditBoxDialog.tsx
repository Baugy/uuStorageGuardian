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
import { BoxDto, BoxUpdateDto } from "@/lib/mockData";
import { boxesApi } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditBoxDialogProps {
  box: BoxDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditBoxDialog = ({ box, open, onOpenChange }: EditBoxDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<BoxUpdateDto>({
    name: box.name,
    description: box.description,
    renterId: box.renterId,
    lowerHumidityLimit: box.lowerHumidityLimit,
    upperHumidityLimit: box.upperHumidityLimit,
    lowerTemperatureLimit: box.lowerTemperatureLimit,
    upperTemperatureLimit: box.upperTemperatureLimit,
  });

  const updateMutation = useMutation({
    mutationFn: (data: BoxUpdateDto) => boxesApi.update(box.id, data),
    onSuccess: (updatedBox) => {
      // Invalidate and refetch queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['box', box.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['box', String(box.id)] });
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
      // Also set the query data directly to ensure immediate update
      queryClient.setQueryData(['box', box.id.toString()], updatedBox);
      queryClient.setQueryData(['box', String(box.id)], updatedBox);
      toast.success("Box settings updated successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Box update error:', error);
      toast.error(error.message || "Failed to update box");
    },
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: box.name,
        description: box.description,
        renterId: box.renterId,
        lowerHumidityLimit: box.lowerHumidityLimit,
        upperHumidityLimit: box.upperHumidityLimit,
        lowerTemperatureLimit: box.lowerTemperatureLimit,
        upperTemperatureLimit: box.upperTemperatureLimit,
      });
    }
  }, [box, open]);

  const handleSave = () => {
    // Always send all fields that are defined, converting to numbers for numeric fields
    const updateData: BoxUpdateDto = {
      name: formData.name,
      description: formData.description,
      renterId: formData.renterId,
      lowerHumidityLimit: formData.lowerHumidityLimit !== undefined && formData.lowerHumidityLimit !== null 
        ? Number(formData.lowerHumidityLimit) 
        : undefined,
      upperHumidityLimit: formData.upperHumidityLimit !== undefined && formData.upperHumidityLimit !== null 
        ? Number(formData.upperHumidityLimit) 
        : undefined,
      lowerTemperatureLimit: formData.lowerTemperatureLimit !== undefined && formData.lowerTemperatureLimit !== null 
        ? Number(formData.lowerTemperatureLimit) 
        : undefined,
      upperTemperatureLimit: formData.upperTemperatureLimit !== undefined && formData.upperTemperatureLimit !== null 
        ? Number(formData.upperTemperatureLimit) 
        : undefined,
    };
    
    console.log('Saving box update:', updateData);
    updateMutation.mutate(updateData);
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
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="renterId">Renter ID</Label>
            <Input
              id="renterId"
              value={formData.renterId || ""}
              onChange={(e) => setFormData({ ...formData, renterId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lowerTemperatureLimit">Min Temperature (°C)</Label>
              <Input
                id="lowerTemperatureLimit"
                type="number"
                step="0.1"
                value={formData.lowerTemperatureLimit !== null && formData.lowerTemperatureLimit !== undefined ? formData.lowerTemperatureLimit : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    lowerTemperatureLimit: value === "" ? undefined : parseFloat(value) 
                  });
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upperTemperatureLimit">Max Temperature (°C)</Label>
              <Input
                id="upperTemperatureLimit"
                type="number"
                step="0.1"
                value={formData.upperTemperatureLimit !== null && formData.upperTemperatureLimit !== undefined ? formData.upperTemperatureLimit : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    upperTemperatureLimit: value === "" ? undefined : parseFloat(value) 
                  });
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lowerHumidityLimit">Min Humidity (%)</Label>
              <Input
                id="lowerHumidityLimit"
                type="number"
                step="0.1"
                value={formData.lowerHumidityLimit !== null && formData.lowerHumidityLimit !== undefined ? formData.lowerHumidityLimit : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    lowerHumidityLimit: value === "" ? undefined : parseFloat(value) 
                  });
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upperHumidityLimit">Max Humidity (%)</Label>
              <Input
                id="upperHumidityLimit"
                type="number"
                step="0.1"
                value={formData.upperHumidityLimit !== null && formData.upperHumidityLimit !== undefined ? formData.upperHumidityLimit : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    upperHumidityLimit: value === "" ? undefined : parseFloat(value) 
                  });
                }}
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
