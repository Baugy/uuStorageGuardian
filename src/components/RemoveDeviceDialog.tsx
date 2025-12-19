import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { devicesApi } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

interface RemoveDeviceDialogProps {
  deviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deviceId: string) => void;
}

export const RemoveDeviceDialog = ({
  deviceId,
  open,
  onOpenChange,
  onConfirm,
}: RemoveDeviceDialogProps) => {
  const { data: device, isLoading } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => devicesApi.getById(deviceId!),
    enabled: !!deviceId && open,
  });

  const handleRemove = () => {
    if (deviceId) {
      onConfirm(deviceId);
    }
  };

  if (!deviceId || (!device && !isLoading)) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Device</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this device? The device will stop sending
            measurements to the system.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : device ? (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Device ID:</span>
                <span className="font-mono font-medium">{device.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{device.name}</span>
              </div>
              {device.assignedBox && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Assigned Box:</span>
                  <span className="font-mono">{device.assignedBox}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove Device
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
