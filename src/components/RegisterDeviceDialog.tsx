import { useState } from "react";
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
import { devicesApi } from "@/lib/api/client";
import { DeviceRegisterDto } from "@/lib/mockData";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RegisterDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterDeviceDialog = ({ open, onOpenChange }: RegisterDeviceDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<DeviceRegisterDto>({
    name: "",
    description: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: DeviceRegisterDto) => devicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Device registered successfully");
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to register device");
    },
  });

  const handleSave = () => {
    if (!formData.deviceId || !formData.name || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      id: formData.deviceId,
      name: formData.name,
      type: formData.type,
      assignedBox: formData.assignedBox || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register Device</DialogTitle>
          <DialogDescription>
            Add a new monitoring device to the system.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Device Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Temperature & Humidity Sensor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter device description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Register Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
