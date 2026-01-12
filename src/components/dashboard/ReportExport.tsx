import { useState } from "react";
import { FileDown, FileText, FileJson, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReportSection {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

interface ReportExportProps {
  datasetName: string;
  scanDate: string;
}

export function ReportExport({ datasetName, scanDate }: ReportExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "json">("pdf");
  const [sections, setSections] = useState<ReportSection[]>([
    { id: "summary", name: "Executive Summary", description: "High-level risk overview and recommendations", checked: true },
    { id: "leakage", name: "Leakage Analysis", description: "Detailed leakage pathways and severity", checked: true },
    { id: "bias", name: "Bias & Fairness Report", description: "Demographic disparities and proxy detection", checked: true },
    { id: "spurious", name: "Spurious Correlations", description: "Non-causal feature relationships", checked: true },
    { id: "adversarial", name: "Adversarial Findings", description: "Exploit attempts and attack vectors", checked: true },
    { id: "counterfactual", name: "Counterfactual Analysis", description: "Decision boundary robustness tests", checked: false },
    { id: "recommendations", name: "Remediation Steps", description: "Actionable fixes and mitigations", checked: true },
  ]);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportComplete(false);

    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);

      // Create mock download
      const selectedSections = sections.filter((s) => s.checked).map((s) => s.name);
      const reportData = {
        dataset: datasetName,
        scanDate: scanDate,
        format: exportFormat,
        sections: selectedSections,
        generatedAt: new Date().toISOString(),
        summary: {
          vulnerabilityScore: 73,
          leakageSeverity: "High",
          biasExposure: "Medium",
          exploitableFeatures: 12,
        },
      };

      if (exportFormat === "json") {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `redteam-report-${datasetName.replace(/\.[^/.]+$/, "")}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For PDF, we'd normally use a library - showing as text for demo
        const content = `
AUTONOMOUS DATASET RED TEAM REPORT
===================================
Dataset: ${datasetName}
Scan Date: ${scanDate}
Generated: ${new Date().toISOString()}

VULNERABILITY SCORE: 73/100 (HIGH RISK)

EXECUTIVE SUMMARY
-----------------
This dataset exhibits significant vulnerability to adversarial exploitation,
with critical leakage pathways and multiple bias indicators detected.

INCLUDED SECTIONS:
${selectedSections.map((s) => `• ${s}`).join("\n")}

[Full report would contain detailed analysis...]
        `;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `redteam-report-${datasetName.replace(/\.[^/.]+$/, "")}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // Reset after delay
      setTimeout(() => {
        setExportComplete(false);
      }, 2000);
    }, 2000);
  };

  const selectedCount = sections.filter((s) => s.checked).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-mono border-border">
          <FileDown className="w-3 h-3 mr-1.5" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileDown className="w-5 h-5 text-primary" />
            Export Analysis Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Format selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Export Format</Label>
            <div className="flex gap-2">
              <Button
                variant={exportFormat === "pdf" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportFormat("pdf")}
                className="flex-1 h-9"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
              <Button
                variant={exportFormat === "json" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportFormat("json")}
                className="flex-1 h-9"
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON Data
              </Button>
            </div>
          </div>

          {/* Section selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Include Sections ({selectedCount}/{sections.length})
            </Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`
                    flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors
                    ${section.checked ? "bg-primary/10" : "hover:bg-secondary/50"}
                  `}
                  onClick={() => toggleSection(section.id)}
                >
                  <Checkbox
                    checked={section.checked}
                    onCheckedChange={() => toggleSection(section.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{section.name}</div>
                    <div className="text-xs text-muted-foreground">{section.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset info */}
          <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dataset</span>
              <span className="font-mono text-foreground">{datasetName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scan Date</span>
              <span className="font-mono text-foreground">{scanDate}</span>
            </div>
          </div>

          {/* Export button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedCount === 0}
            className="w-full h-10"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : exportComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Download Started!
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Export {exportFormat.toUpperCase()} Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
