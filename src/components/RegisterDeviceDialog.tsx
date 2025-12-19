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
import { devicesApi, boxesApi } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RegisterDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterDeviceDialog = ({ open, onOpenChange }: RegisterDeviceDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    deviceId: "",
    name: "",
    type: "",
    assignedBox: "",
    note: "",
  });

  const { data: boxes = [] } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => devicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Device registered successfully");
      onOpenChange(false);
      setFormData({
        deviceId: "",
        name: "",
        type: "",
        assignedBox: "",
        note: "",
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
            <Label htmlFor="deviceId">
              Device ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deviceId"
              placeholder="DEV-TH-001"
              value={formData.deviceId}
              onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deviceName">
              Device Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deviceName"
              placeholder="Temperature & Humidity Sensor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deviceType">
              Device Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="deviceType">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Temperature">Temperature Only</SelectItem>
                <SelectItem value="Temperature + Humidity">
                  Temperature + Humidity
                </SelectItem>
                <SelectItem value="Humidity">Humidity Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignedBox">Assigned Box (Optional)</Label>
            <Select
              value={formData.assignedBox}
              onValueChange={(value) => setFormData({ ...formData, assignedBox: value })}
            >
              <SelectTrigger id="assignedBox">
                <SelectValue placeholder="Select a box" />
              </SelectTrigger>
              <SelectContent>
                {boxes.map((box) => (
                  <SelectItem key={box.id} value={box.id}>
                    {box.id} - {box.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Additional notes about this device..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
