import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; direction: "up" | "down" };
  status?: "safe" | "warning" | "danger";
}

export function MetricCard({ label, value, icon: Icon, trend, status = "safe" }: MetricCardProps) {
  const statusColors = {
    safe: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <div className="metric-card group hover:glow-border transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-md bg-secondary/50 group-hover:bg-primary/10 transition-colors">
          <Icon className={cn("w-4 h-4", statusColors[status])} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-mono",
            trend.direction === "up" ? "text-destructive" : "text-success"
          )}>
            <span>{trend.direction === "up" ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className={cn("stat-value text-2xl", statusColors[status])}>{value}</span>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}
