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
    updateMutation.mutate({
      ...formData,
      lowerHumidityLimit: Number(formData.lowerHumidityLimit),
      upperHumidityLimit: Number(formData.upperHumidityLimit),
      lowerTemperatureLimit: Number(formData.lowerTemperatureLimit),
      upperTemperatureLimit: Number(formData.upperTemperatureLimit),
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
                value={formData.lowerTemperatureLimit || ""}
                onChange={(e) => setFormData({ ...formData, lowerTemperatureLimit: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upperTemperatureLimit">Max Temperature (°C)</Label>
              <Input
                id="upperTemperatureLimit"
                type="number"
                value={formData.upperTemperatureLimit || ""}
                onChange={(e) => setFormData({ ...formData, upperTemperatureLimit: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lowerHumidityLimit">Min Humidity (%)</Label>
              <Input
                id="lowerHumidityLimit"
                type="number"
                value={formData.lowerHumidityLimit || ""}
                onChange={(e) => setFormData({ ...formData, lowerHumidityLimit: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upperHumidityLimit">Max Humidity (%)</Label>
              <Input
                id="upperHumidityLimit"
                type="number"
                value={formData.upperHumidityLimit || ""}
                onChange={(e) => setFormData({ ...formData, upperHumidityLimit: parseFloat(e.target.value) || 0 })}
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
