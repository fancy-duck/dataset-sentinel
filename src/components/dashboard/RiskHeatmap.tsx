import { cn } from "@/lib/utils";
import { useState } from "react";

interface HeatmapCell {
  feature: string;
  riskType: string;
  score: number;
  details?: string;
}

interface RiskHeatmapProps {
  data: HeatmapCell[];
  features: string[];
  riskTypes: string[];
}

export function RiskHeatmap({ data, features, riskTypes }: RiskHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const getScore = (feature: string, riskType: string) => {
    const cell = data.find(d => d.feature === feature && d.riskType === riskType);
    return cell?.score ?? 0;
  };

  const getCellColor = (score: number) => {
    if (score >= 80) return "bg-risk-critical/90";
    if (score >= 60) return "bg-risk-high/80";
    if (score >= 40) return "bg-warning/70";
    if (score >= 20) return "bg-risk-low/40";
    return "bg-success/30";
  };

  const getCellDetails = (feature: string, riskType: string) => {
    return data.find(d => d.feature === feature && d.riskType === riskType);
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Risk Heatmap
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          Features × Risk Types
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Header row */}
          <div className="flex gap-1 mb-1">
            <div className="w-24 shrink-0" />
            {riskTypes.map(type => (
              <div
                key={type}
                className="flex-1 text-[10px] font-mono text-muted-foreground text-center uppercase tracking-wider py-1"
              >
                {type}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {features.map((feature, idx) => (
            <div key={feature} className="flex gap-1 mb-1" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="w-24 shrink-0 text-xs font-mono text-muted-foreground truncate pr-2 flex items-center">
                {feature}
              </div>
              {riskTypes.map(type => {
                const score = getScore(feature, type);
                const cellData = getCellDetails(feature, type);
                return (
                  <div
                    key={`${feature}-${type}`}
                    className={cn(
                      "flex-1 h-8 rounded-sm cursor-pointer transition-all duration-200",
                      getCellColor(score),
                      "hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background",
                      "flex items-center justify-center"
                    )}
                    onMouseEnter={() => setHoveredCell(cellData || null)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <span className="text-[10px] font-mono font-bold text-foreground/90">
                      {score > 0 ? score : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="mt-4 p-3 bg-secondary/50 rounded-md border border-border/50 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-primary">{hoveredCell.feature}</span>
            <span className={cn(
              "text-xs font-mono font-bold",
              hoveredCell.score >= 60 ? "text-destructive" : "text-warning"
            )}>
              {hoveredCell.score}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {hoveredCell.details || `Risk type: ${hoveredCell.riskType}`}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-success/30" />
          <span className="text-[10px] text-muted-foreground">Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-risk-low/40" />
          <span className="text-[10px] text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-warning/70" />
          <span className="text-[10px] text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-risk-high/80" />
          <span className="text-[10px] text-muted-foreground">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-risk-critical/90" />
          <span className="text-[10px] text-muted-foreground">Critical</span>
        </div>
      </div>
    </div>
  );
}
