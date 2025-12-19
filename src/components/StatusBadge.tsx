import { cn } from "@/lib/utils";
import { BoxStatus, DeviceStatus } from "@/lib/mockData";

interface StatusBadgeProps {
  status: BoxStatus | DeviceStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "OK":
      case "online":
        return "bg-success/10 text-success border-success/20";
      case "Warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "Alarm":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "offline":
        return "bg-muted text-muted-foreground border-border";
      case "no_data":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const displayText = status === "no_data" ? "No Data" : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(),
        className
      )}
    >
      {displayText}
    </span>
  );
};
