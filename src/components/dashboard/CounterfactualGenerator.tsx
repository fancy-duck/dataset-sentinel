import { useState } from "react";
import { Shuffle, ArrowRight, RefreshCw, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Counterfactual {
  id: string;
  originalPrediction: string;
  counterfactualPrediction: string;
  originalConfidence: number;
  counterfactualConfidence: number;
  changes: { feature: string; original: string; modified: string }[];
  isVulnerable: boolean;
}

interface CounterfactualGeneratorProps {
  onGenerate?: () => void;
}

const mockCounterfactuals: Counterfactual[] = [
  {
    id: "cf1",
    originalPrediction: "HIGH RISK",
    counterfactualPrediction: "LOW RISK",
    originalConfidence: 0.89,
    counterfactualConfidence: 0.76,
    changes: [
      { feature: "zip_code", original: "10001", modified: "94102" },
      { feature: "income", original: "$45,000", modified: "$47,500" },
    ],
    isVulnerable: true,
  },
  {
    id: "cf2",
    originalPrediction: "APPROVED",
    counterfactualPrediction: "DENIED",
    originalConfidence: 0.92,
    counterfactualConfidence: 0.81,
    changes: [
      { feature: "age_bucket", original: "25-34", modified: "55-64" },
    ],
    isVulnerable: true,
  },
  {
    id: "cf3",
    originalPrediction: "LOW RISK",
    counterfactualPrediction: "LOW RISK",
    originalConfidence: 0.95,
    counterfactualConfidence: 0.88,
    changes: [
      { feature: "income", original: "$120,000", modified: "$85,000" },
      { feature: "credit_score", original: "780", modified: "720" },
    ],
    isVulnerable: false,
  },
  {
    id: "cf4",
    originalPrediction: "MEDIUM RISK",
    counterfactualPrediction: "HIGH RISK",
    originalConfidence: 0.67,
    counterfactualConfidence: 0.82,
    changes: [
      { feature: "device_type", original: "desktop", modified: "mobile" },
      { feature: "timestamp", original: "2024-01-10", modified: "2024-01-11" },
    ],
    isVulnerable: true,
  },
];

export function CounterfactualGenerator({ onGenerate }: CounterfactualGeneratorProps) {
  const [counterfactuals, setCounterfactuals] = useState<Counterfactual[]>(mockCounterfactuals);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCf, setSelectedCf] = useState<Counterfactual | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Shuffle and add some variation
      const shuffled = [...mockCounterfactuals].sort(() => Math.random() - 0.5);
      setCounterfactuals(shuffled);
      setIsGenerating(false);
      onGenerate?.();
    }, 1500);
  };

  const vulnerableCount = counterfactuals.filter((cf) => cf.isVulnerable).length;

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Counterfactual Generator
          </h3>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
          className="h-7 px-3 text-xs font-mono"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-1" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="text-lg font-mono font-bold text-foreground">{counterfactuals.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Generated</div>
        </div>
        <div className="bg-destructive/10 rounded p-2 text-center">
          <div className="text-lg font-mono font-bold text-destructive">{vulnerableCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Vulnerable</div>
        </div>
        <div className="bg-success/10 rounded p-2 text-center">
          <div className="text-lg font-mono font-bold text-success">{counterfactuals.length - vulnerableCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Robust</div>
        </div>
      </div>

      {/* Counterfactual list */}
      <ScrollArea className="h-[280px]">
        <div className="space-y-2">
          {counterfactuals.map((cf) => (
            <button
              key={cf.id}
              onClick={() => setSelectedCf(selectedCf?.id === cf.id ? null : cf)}
              className={`
                w-full text-left p-3 rounded-lg transition-all border
                ${selectedCf?.id === cf.id
                  ? "bg-primary/10 border-primary/40"
                  : "bg-secondary/30 border-transparent hover:bg-secondary/50"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {cf.isVulnerable ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  <span className="text-xs font-mono text-muted-foreground">
                    {cf.changes.length} change{cf.changes.length > 1 ? "s" : ""}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cf.isVulnerable ? "border-destructive/50 text-destructive" : "border-success/50 text-success"}
                >
                  {cf.isVulnerable ? "FLIP" : "STABLE"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded font-mono ${
                  cf.originalPrediction.includes("HIGH") || cf.originalPrediction === "DENIED" 
                    ? "bg-destructive/20 text-destructive" 
                    : cf.originalPrediction.includes("LOW") || cf.originalPrediction === "APPROVED"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                }`}>
                  {cf.originalPrediction}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className={`px-2 py-0.5 rounded font-mono ${
                  cf.counterfactualPrediction.includes("HIGH") || cf.counterfactualPrediction === "DENIED"
                    ? "bg-destructive/20 text-destructive"
                    : cf.counterfactualPrediction.includes("LOW") || cf.counterfactualPrediction === "APPROVED"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                }`}>
                  {cf.counterfactualPrediction}
                </span>
              </div>

              {/* Expanded details */}
              {selectedCf?.id === cf.id && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Feature Changes
                  </div>
                  {cf.changes.map((change, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-background/50 rounded p-2">
                      <span className="font-mono text-primary">{change.feature}</span>
                      <span className="text-muted-foreground">:</span>
                      <span className="font-mono text-muted-foreground line-through">{change.original}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-foreground">{change.modified}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>Confidence: {(cf.originalConfidence * 100).toFixed(0)}%</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{(cf.counterfactualConfidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
