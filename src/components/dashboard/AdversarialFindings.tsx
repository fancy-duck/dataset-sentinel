import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Zap } from "lucide-react";

interface Finding {
  id: string;
  type: "leakage" | "spurious" | "exploit";
  severity: "critical" | "high" | "medium" | "low";
  feature: string;
  description: string;
  accuracy?: number;
}

interface AdversarialFindingsProps {
  findings: Finding[];
}

export function AdversarialFindings({ findings }: AdversarialFindingsProps) {
  const getIcon = (type: Finding["type"]) => {
    switch (type) {
      case "leakage": return <Zap className="w-4 h-4" />;
      case "spurious": return <AlertTriangle className="w-4 h-4" />;
      case "exploit": return <Shield className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: Finding["severity"]) => {
    switch (severity) {
      case "critical": return "border-risk-critical bg-risk-critical/10 text-risk-critical";
      case "high": return "border-risk-high bg-risk-high/10 text-risk-high";
      case "medium": return "border-warning bg-warning/10 text-warning";
      case "low": return "border-risk-low bg-risk-low/10 text-risk-low";
    }
  };

  const getTypeLabel = (type: Finding["type"]) => {
    switch (type) {
      case "leakage": return "DATA LEAKAGE";
      case "spurious": return "SPURIOUS CORR";
      case "exploit": return "EXPLOIT PATH";
    }
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Adversarial Findings
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">
            {findings.length} detected
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {findings.map((finding, idx) => (
          <div
            key={finding.id}
            className={cn(
              "p-3 rounded-md border-l-2 bg-secondary/30",
              getSeverityColor(finding.severity),
              "animate-slide-in-right"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {getIcon(finding.type)}
                <span className="text-xs font-mono font-semibold uppercase">
                  {getTypeLabel(finding.type)}
                </span>
              </div>
              <span className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded uppercase",
                finding.severity === "critical" ? "bg-risk-critical text-background" :
                finding.severity === "high" ? "bg-risk-high text-background" :
                "bg-muted text-muted-foreground"
              )}>
                {finding.severity}
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs font-mono text-primary">
                {finding.feature}
              </span>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {finding.description}
              </p>
            </div>

            {finding.accuracy && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Exploit accuracy:</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full transition-all duration-500"
                    style={{ width: `${finding.accuracy}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-destructive font-bold">
                  {finding.accuracy}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
