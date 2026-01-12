import { useState } from "react";
import { Search, ChevronRight, AlertTriangle, Shield, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeatureData {
  name: string;
  type: "numeric" | "categorical" | "temporal" | "identifier";
  riskLevel: "critical" | "high" | "medium" | "low" | "safe";
  leakageScore: number;
  biasScore: number;
  spuriousScore: number;
  importance: number;
  nullPercent: number;
  uniqueValues: number;
  distribution: "normal" | "skewed" | "bimodal" | "uniform";
}

interface FeatureInspectorProps {
  features: FeatureData[];
}

const riskColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-orange-500 text-white",
  medium: "bg-warning text-warning-foreground",
  low: "bg-primary/20 text-primary",
  safe: "bg-success/20 text-success",
};

const typeIcons: Record<string, string> = {
  numeric: "NUM",
  categorical: "CAT",
  temporal: "TIME",
  identifier: "ID",
};

export function FeatureInspector({ features }: FeatureInspectorProps) {
  const [search, setSearch] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<FeatureData | null>(null);

  const filteredFeatures = features.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="metric-card h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Feature Inspector
        </h3>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search features..."
          className="pl-9 h-8 text-sm bg-secondary border-border"
        />
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Feature List */}
        <ScrollArea className="w-1/2 pr-2">
          <div className="space-y-1">
            {filteredFeatures.map((feature) => (
              <button
                key={feature.name}
                onClick={() => setSelectedFeature(feature)}
                className={`
                  w-full text-left p-2 rounded-md transition-all text-xs
                  flex items-center justify-between group
                  ${selectedFeature?.name === feature.name
                    ? "bg-primary/20 border border-primary/40"
                    : "hover:bg-secondary border border-transparent"
                  }
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                    {typeIcons[feature.type]}
                  </span>
                  <span className="font-mono truncate text-foreground">{feature.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${riskColors[feature.riskLevel].split(" ")[0]}`} />
                  <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${selectedFeature?.name === feature.name ? "rotate-90" : ""}`} />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Feature Details */}
        <div className="w-1/2 bg-secondary/50 rounded-lg p-3 overflow-auto">
          {selectedFeature ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-mono text-sm font-semibold text-foreground">{selectedFeature.name}</h4>
                  <Badge className={riskColors[selectedFeature.riskLevel]}>
                    {selectedFeature.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground">
                    {selectedFeature.type}
                  </span>
                  <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground">
                    {selectedFeature.distribution}
                  </span>
                </div>
              </div>

              {/* Risk Scores */}
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Risk Scores
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3 text-destructive" /> Leakage
                    </span>
                    <span className="text-xs font-mono text-foreground">{selectedFeature.leakageScore}%</span>
                  </div>
                  <Progress value={selectedFeature.leakageScore} className="h-1" />
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-warning" /> Bias
                    </span>
                    <span className="text-xs font-mono text-foreground">{selectedFeature.biasScore}%</span>
                  </div>
                  <Progress value={selectedFeature.biasScore} className="h-1" />
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" /> Spurious
                    </span>
                    <span className="text-xs font-mono text-foreground">{selectedFeature.spuriousScore}%</span>
                  </div>
                  <Progress value={selectedFeature.spuriousScore} className="h-1" />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Statistics
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background/50 rounded p-2">
                    <span className="text-muted-foreground block">Importance</span>
                    <span className="font-mono text-foreground flex items-center gap-1">
                      {selectedFeature.importance}%
                      {selectedFeature.importance > 50 ? (
                        <TrendingUp className="w-3 h-3 text-success" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-muted-foreground" />
                      )}
                    </span>
                  </div>
                  <div className="bg-background/50 rounded p-2">
                    <span className="text-muted-foreground block">Null %</span>
                    <span className="font-mono text-foreground">{selectedFeature.nullPercent}%</span>
                  </div>
                  <div className="bg-background/50 rounded p-2 col-span-2">
                    <span className="text-muted-foreground block">Unique Values</span>
                    <span className="font-mono text-foreground">{selectedFeature.uniqueValues.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Select a feature to inspect</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
