import { useEffect, useState } from "react";
import { Shield, Zap, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface ScanPhase {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "active" | "complete";
  detail?: string;
}

interface LiveScanOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
}

const initialPhases: ScanPhase[] = [
  { id: "profile", name: "Dataset Profiling", icon: Shield, status: "pending" },
  { id: "leakage", name: "Leakage Detection", icon: Zap, status: "pending" },
  { id: "adversarial", name: "Adversarial Probing", icon: AlertTriangle, status: "pending" },
  { id: "bias", name: "Bias Analysis", icon: AlertTriangle, status: "pending" },
  { id: "spurious", name: "Spurious Correlation Scan", icon: Zap, status: "pending" },
  { id: "counterfactual", name: "Counterfactual Generation", icon: Shield, status: "pending" },
];

export function LiveScanOverlay({ isActive, onComplete }: LiveScanOverlayProps) {
  const [phases, setPhases] = useState<ScanPhase[]>(initialPhases);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [scanLines, setScanLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhases(initialPhases);
      setCurrentPhaseIndex(0);
      setScanLines([]);
      setProgress(0);
      return;
    }

    const phaseDetails = [
      ["Analyzing 2.8M rows...", "Detecting 47 features...", "Schema validated"],
      ["Checking temporal patterns...", "Testing ID correlations...", "Found 3 leakage paths"],
      ["Training adversarial probes...", "Running 847 attack vectors...", "Exploit accuracy: 89%"],
      ["Computing fairness metrics...", "Scanning demographic proxies...", "6 bias indicators found"],
      ["Permutation testing...", "Causal vs correlational analysis...", "12 spurious features"],
      ["Generating synthetic samples...", "Testing decision boundaries...", "Complete"],
    ];

    let phaseIdx = 0;
    let lineIdx = 0;

    const interval = setInterval(() => {
      if (phaseIdx >= phases.length) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      // Update current phase to active
      setPhases((prev) =>
        prev.map((p, i) => ({
          ...p,
          status: i < phaseIdx ? "complete" : i === phaseIdx ? "active" : "pending",
        }))
      );
      setCurrentPhaseIndex(phaseIdx);
      setProgress(((phaseIdx + 1) / phases.length) * 100);

      // Add scan lines for current phase
      if (lineIdx < phaseDetails[phaseIdx].length) {
        const line = phaseDetails[phaseIdx][lineIdx];
        setScanLines((prev) => [...prev.slice(-8), `[${phases[phaseIdx].name}] ${line}`]);
        lineIdx++;
      } else {
        // Move to next phase
        setPhases((prev) =>
          prev.map((p, i) => ({
            ...p,
            status: i <= phaseIdx ? "complete" : "pending",
          }))
        );
        phaseIdx++;
        lineIdx = 0;
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      {/* Animated scan lines background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-full"
            style={{
              top: `${10 + i * 10}%`,
              animation: `scanHorizontal ${2 + i * 0.2}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Main scan panel */}
      <div className="relative w-full max-w-2xl mx-4">
        <div className="glass-panel glow-border p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Shield className="w-8 h-8 text-primary opacity-30" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Adversarial Scan Active</h2>
                <p className="text-xs text-muted-foreground font-mono">Autonomous red team analysis in progress</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-secondary rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary to-cyan-300 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Phase list */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {phases.map((phase) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.id}
                  className={`
                    flex items-center gap-2 p-2 rounded-md transition-all text-sm
                    ${phase.status === "active" 
                      ? "bg-primary/20 border border-primary/40" 
                      : phase.status === "complete"
                        ? "bg-success/10 border border-success/30"
                        : "bg-secondary/50 border border-transparent"
                    }
                  `}
                >
                  {phase.status === "active" ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : phase.status === "complete" ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`text-xs ${phase.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                    {phase.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live log */}
          <div className="bg-background/80 rounded-lg p-3 font-mono text-xs border border-border">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Live Output</span>
            </div>
            <div className="space-y-1 h-32 overflow-hidden">
              {scanLines.map((line, i) => (
                <div
                  key={i}
                  className={`transition-opacity ${i === scanLines.length - 1 ? "text-primary" : "text-muted-foreground"}`}
                  style={{ opacity: 1 - (scanLines.length - 1 - i) * 0.12 }}
                >
                  <span className="text-muted-foreground/50">{"> "}</span>
                  {line}
                </div>
              ))}
              <div className="text-primary animate-pulse">
                <span className="text-muted-foreground/50">{"> "}</span>
                <span className="inline-block w-2 h-3 bg-primary/70 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanHorizontal {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
