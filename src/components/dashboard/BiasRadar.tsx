import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface BiasCategory {
  category: string;
  value: number;
  fullMark: number;
}

interface BiasRadarProps {
  data: BiasCategory[];
}

export function BiasRadar({ data }: BiasRadarProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Bias Radar
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          Subgroup Risk Analysis
        </span>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.5}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 10,
                fontFamily: "JetBrains Mono"
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 8 
              }}
              tickCount={5}
            />
            <Radar
              name="Risk Score"
              dataKey="value"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.slice(0, 4).map(item => (
          <div key={item.category} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${item.value >= 60 ? 'bg-destructive' : item.value >= 40 ? 'bg-warning' : 'bg-success'}`} />
            <span className="text-[10px] font-mono text-muted-foreground">
              {item.category}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
