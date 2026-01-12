import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CorrelationData {
  feature: string;
  correlation: number;
  impact: number;
  isCausal: boolean;
}

interface SpuriousExplorerProps {
  data: CorrelationData[];
}

export function SpuriousExplorer({ data }: SpuriousExplorerProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const sortedData = [...data].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  const getBarColor = (item: CorrelationData) => {
    if (item.isCausal) return "hsl(var(--success))";
    if (Math.abs(item.correlation) >= 0.7) return "hsl(var(--destructive))";
    if (Math.abs(item.correlation) >= 0.5) return "hsl(var(--warning))";
    return "hsl(var(--primary))";
  };

  const selectedData = data.find(d => d.feature === selectedFeature);

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Spurious Correlation Explorer
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">Causal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-[10px] text-muted-foreground">Spurious</span>
          </div>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={sortedData} 
            layout="vertical" 
            margin={{ left: 60, right: 20 }}
            onClick={(data) => {
              if (data?.activePayload?.[0]) {
                setSelectedFeature(data.activePayload[0].payload.feature);
              }
            }}
          >
            <XAxis
              type="number"
              domain={[-1, 1]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "JetBrains Mono",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Correlation"]}
            />
            <Bar dataKey="correlation" radius={[0, 4, 4, 0]} cursor="pointer">
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry)}
                  opacity={selectedFeature === entry.feature ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedData && (
        <div className="mt-4 p-3 bg-secondary/50 rounded-md border border-border/50 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-primary font-semibold">{selectedData.feature}</span>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded uppercase",
              selectedData.isCausal ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
            )}>
              {selectedData.isCausal ? "Causal" : "Spurious"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <span className="text-[10px] text-muted-foreground block">Correlation</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {(selectedData.correlation * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Performance Impact</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {selectedData.impact > 0 ? '+' : ''}{(selectedData.impact * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
