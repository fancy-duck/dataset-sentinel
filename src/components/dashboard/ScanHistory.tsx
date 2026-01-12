import { useState, useEffect } from "react";
import { History, Trash2, Eye, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ScanRecord {
  id: string;
  dataset_name: string;
  row_count: number;
  feature_count: number;
  vulnerability_score: number;
  leakage_severity: number;
  bias_exposure: number;
  robustness_score: number;
  exploitable_features: number;
  ai_analysis: string | null;
  findings: unknown;
  feature_risks: unknown;
  created_at: string;
}

interface ScanHistoryProps {
  onLoadScan?: (scan: ScanRecord) => void;
}

export function ScanHistory({ onLoadScan }: ScanHistoryProps) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  const fetchScans = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching scans:', error);
    } else {
      setScans(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchScans();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('scan-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scan_history'
        },
        () => {
          fetchScans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scan:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-destructive";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { label: "CRITICAL", class: "bg-destructive text-destructive-foreground" };
    if (score >= 60) return { label: "HIGH", class: "bg-orange-500 text-white" };
    if (score >= 40) return { label: "MEDIUM", class: "bg-warning text-warning-foreground" };
    return { label: "LOW", class: "bg-success text-success-foreground" };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-mono border-border">
          <History className="w-3 h-3 mr-1.5" />
          Scan History ({scans.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <History className="w-5 h-5 text-primary" />
            Scan History
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No scan history yet</p>
              <p className="text-xs mt-1">Run your first analysis to see results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => {
                const risk = getRiskBadge(scan.vulnerability_score);
                return (
                  <div
                    key={scan.id}
                    className="p-4 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-mono text-sm font-medium text-foreground truncate">
                            {scan.dataset_name}
                          </h4>
                          <Badge className={risk.class}>{risk.label}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(scan.created_at)}
                          </span>
                          <span>{scan.row_count.toLocaleString()} rows</span>
                          <span>{scan.feature_count} features</span>
                        </div>

                        {/* Metrics row */}
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="bg-background/50 rounded p-1.5 text-center">
                            <div className={`font-mono font-bold ${getRiskColor(scan.vulnerability_score)}`}>
                              {scan.vulnerability_score}%
                            </div>
                            <div className="text-[9px] text-muted-foreground">Vulnerability</div>
                          </div>
                          <div className="bg-background/50 rounded p-1.5 text-center">
                            <div className={`font-mono font-bold ${getRiskColor(scan.leakage_severity)}`}>
                              {scan.leakage_severity}%
                            </div>
                            <div className="text-[9px] text-muted-foreground">Leakage</div>
                          </div>
                          <div className="bg-background/50 rounded p-1.5 text-center">
                            <div className={`font-mono font-bold ${getRiskColor(scan.bias_exposure)}`}>
                              {scan.bias_exposure}%
                            </div>
                            <div className="text-[9px] text-muted-foreground">Bias</div>
                          </div>
                          <div className="bg-background/50 rounded p-1.5 text-center">
                            <div className="font-mono font-bold text-foreground">
                              {scan.exploitable_features}
                            </div>
                            <div className="text-[9px] text-muted-foreground">Exploits</div>
                          </div>
                        </div>

                        {/* AI Summary */}
                        {scan.ai_analysis && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {scan.ai_analysis}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedScan(scan);
                            onLoadScan?.(scan);
                          }}
                          className="h-7 px-2"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(scan.id)}
                          className="h-7 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
