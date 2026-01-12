import { Shield, Database, Clock } from "lucide-react";

interface DashboardHeaderProps {
  datasetName: string;
  lastScan: string;
  rowCount: number;
  featureCount: number;
}

export function DashboardHeader({ datasetName, lastScan, rowCount, featureCount }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Autonomous Dataset Red Team
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-Powered Dataset Vulnerability Scanner
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-mono text-foreground">{datasetName}</p>
            <p className="text-[10px] text-muted-foreground">
              {rowCount.toLocaleString()} rows • {featureCount} features
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-6 border-l border-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-mono text-primary">Last Scan</p>
            <p className="text-[10px] text-muted-foreground">{lastScan}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pl-6 border-l border-border">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono text-success">System Active</span>
        </div>
      </div>
    </header>
  );
}
