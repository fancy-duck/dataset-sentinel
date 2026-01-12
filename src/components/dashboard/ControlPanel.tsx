import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Settings2 } from "lucide-react";

interface ControlPanelProps {
  adversarialStrength: number;
  onStrengthChange: (value: number) => void;
  fairnessDefinition: string;
  onFairnessChange: (value: string) => void;
  enableCounterfactual: boolean;
  onCounterfactualChange: (value: boolean) => void;
  onRunTest: () => void;
  onReset: () => void;
  isRunning?: boolean;
}

export function ControlPanel({
  adversarialStrength,
  onStrengthChange,
  fairnessDefinition,
  onFairnessChange,
  enableCounterfactual,
  onCounterfactualChange,
  onRunTest,
  onReset,
  isRunning = false,
}: ControlPanelProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Test Controls
        </h3>
      </div>

      <div className="space-y-5">
        {/* Adversarial Strength */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Adversarial Strength</Label>
            <span className="text-xs font-mono text-primary">{adversarialStrength}%</span>
          </div>
          <Slider
            value={[adversarialStrength]}
            onValueChange={(v) => onStrengthChange(v[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Passive</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Fairness Definition */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Fairness Definition</Label>
          <Select value={fairnessDefinition} onValueChange={onFairnessChange}>
            <SelectTrigger className="h-8 text-xs bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="demographic_parity">Demographic Parity</SelectItem>
              <SelectItem value="equalized_odds">Equalized Odds</SelectItem>
              <SelectItem value="equal_opportunity">Equal Opportunity</SelectItem>
              <SelectItem value="predictive_parity">Predictive Parity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Counterfactual Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Counterfactual Tests</Label>
            <p className="text-[10px] text-muted-foreground/70">Generate synthetic counterexamples</p>
          </div>
          <Switch
            checked={enableCounterfactual}
            onCheckedChange={onCounterfactualChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onRunTest}
            disabled={isRunning}
            className="flex-1 h-9 text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-3 h-3 mr-1.5" />
            {isRunning ? "Running..." : "Run Test"}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="h-9 px-3 text-xs font-mono border-border hover:bg-secondary"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
