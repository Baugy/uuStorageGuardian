import { cn } from "@/lib/utils";
import { BoxStatus } from "@/lib/mockData";

interface StatusBadgeProps {
  status: BoxStatus | string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "OK":
        return "bg-success/10 text-success border-success/20";
      case "WARNING":
        return "bg-warning/10 text-warning border-warning/20";
      case "CRITICAL":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const displayText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

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
