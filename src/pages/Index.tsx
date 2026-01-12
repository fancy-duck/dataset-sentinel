import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { VulnerabilityScore } from "@/components/dashboard/VulnerabilityScore";
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap";
import { BiasRadar } from "@/components/dashboard/BiasRadar";
import { AdversarialFindings } from "@/components/dashboard/AdversarialFindings";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { SpuriousExplorer } from "@/components/dashboard/SpuriousExplorer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DatasetUpload } from "@/components/dashboard/DatasetUpload";
import { FeatureInspector } from "@/components/dashboard/FeatureInspector";
import { LiveScanOverlay } from "@/components/dashboard/LiveScanOverlay";
import { CounterfactualGenerator } from "@/components/dashboard/CounterfactualGenerator";
import { ReportExport } from "@/components/dashboard/ReportExport";
import { ScanHistory } from "@/components/dashboard/ScanHistory";
import { ActiveUsers } from "@/components/dashboard/ActiveUsers";
import { AlertTriangle, Shield, Zap, Target, LogOut, User } from "lucide-react";
import { analyzeDataset, saveScanToHistory } from "@/lib/aiAnalysis";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock data for demonstration
const mockHeatmapData = [
  { feature: "user_id", riskType: "Leakage", score: 92, details: "Direct target leakage via user lookup table" },
  { feature: "user_id", riskType: "Bias", score: 15, details: "Low demographic correlation" },
  { feature: "user_id", riskType: "Spurious", score: 8, details: "No spurious patterns detected" },
  { feature: "timestamp", riskType: "Leakage", score: 78, details: "Temporal leakage - future data accessible" },
  { feature: "timestamp", riskType: "Bias", score: 45, details: "Moderate time-based sampling bias" },
  { feature: "timestamp", riskType: "Spurious", score: 62, details: "Strong correlation with external events" },
  { feature: "zip_code", riskType: "Leakage", score: 12, details: "Minimal leakage risk" },
  { feature: "zip_code", riskType: "Bias", score: 85, details: "Strong demographic proxy detected" },
  { feature: "zip_code", riskType: "Spurious", score: 71, details: "Correlates with socioeconomic factors" },
  { feature: "income", riskType: "Leakage", score: 5, details: "No direct leakage" },
  { feature: "income", riskType: "Bias", score: 67, details: "Disparate impact on protected groups" },
  { feature: "income", riskType: "Spurious", score: 23, details: "Legitimate causal relationship" },
  { feature: "age_bucket", riskType: "Leakage", score: 3, details: "Safe feature" },
  { feature: "age_bucket", riskType: "Bias", score: 58, details: "Age-based disparities present" },
  { feature: "age_bucket", riskType: "Spurious", score: 34, details: "Weak non-causal patterns" },
];

const mockBiasData = [
  { category: "Gender", value: 72, fullMark: 100 },
  { category: "Race", value: 85, fullMark: 100 },
  { category: "Age", value: 58, fullMark: 100 },
  { category: "Income", value: 67, fullMark: 100 },
  { category: "Location", value: 78, fullMark: 100 },
  { category: "Education", value: 45, fullMark: 100 },
];

type Finding = {
  id: string;
  type: "leakage" | "spurious" | "exploit";
  severity: "critical" | "high" | "medium" | "low";
  feature: string;
  description: string;
  accuracy: number;
};

type FeatureRisk = {
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
};

const mockFindings: Finding[] = [
  {
    id: "1",
    type: "leakage",
    severity: "critical",
    feature: "user_id",
    description: "User ID can be used to directly look up the target variable through a join with the users table. This represents a critical data leakage pathway.",
    accuracy: 98,
  },
  {
    id: "2",
    type: "spurious",
    severity: "high",
    feature: "zip_code",
    description: "Zip code acts as a proxy for race/ethnicity with 0.82 correlation. Model may learn discriminatory patterns.",
    accuracy: 87,
  },
  {
    id: "3",
    type: "exploit",
    severity: "high",
    feature: "timestamp",
    description: "Adversarial probe achieved 89% accuracy using only timestamp features, indicating severe temporal leakage.",
    accuracy: 89,
  },
  {
    id: "4",
    type: "spurious",
    severity: "medium",
    feature: "device_type",
    description: "Device type correlates with outcome due to demographic skew in data collection, not causal relationship.",
    accuracy: 71,
  },
];

const mockCorrelationData = [
  { feature: "income", correlation: 0.72, impact: 0.15, isCausal: true },
  { feature: "zip_code", correlation: 0.68, impact: 0.22, isCausal: false },
  { feature: "age_bucket", correlation: 0.45, impact: 0.08, isCausal: true },
  { feature: "device_type", correlation: -0.52, impact: 0.12, isCausal: false },
  { feature: "timestamp", correlation: 0.81, impact: 0.31, isCausal: false },
  { feature: "session_len", correlation: 0.38, impact: 0.05, isCausal: true },
];

const defaultFeatureData: FeatureRisk[] = [
  { name: "user_id", type: "identifier", riskLevel: "critical", leakageScore: 92, biasScore: 15, spuriousScore: 8, importance: 12, nullPercent: 0, uniqueValues: 2847293, distribution: "uniform" },
  { name: "timestamp", type: "temporal", riskLevel: "high", leakageScore: 78, biasScore: 45, spuriousScore: 62, importance: 67, nullPercent: 0.1, uniqueValues: 156892, distribution: "skewed" },
  { name: "zip_code", type: "categorical", riskLevel: "high", leakageScore: 12, biasScore: 85, spuriousScore: 71, importance: 45, nullPercent: 2.3, uniqueValues: 4521, distribution: "skewed" },
  { name: "income", type: "numeric", riskLevel: "medium", leakageScore: 5, biasScore: 67, spuriousScore: 23, importance: 78, nullPercent: 5.2, uniqueValues: 89234, distribution: "normal" },
  { name: "age_bucket", type: "categorical", riskLevel: "medium", leakageScore: 3, biasScore: 58, spuriousScore: 34, importance: 52, nullPercent: 0.8, uniqueValues: 8, distribution: "bimodal" },
  { name: "credit_score", type: "numeric", riskLevel: "low", leakageScore: 2, biasScore: 34, spuriousScore: 12, importance: 89, nullPercent: 1.2, uniqueValues: 450, distribution: "normal" },
  { name: "loan_amount", type: "numeric", riskLevel: "safe", leakageScore: 1, biasScore: 22, spuriousScore: 8, importance: 72, nullPercent: 0, uniqueValues: 15678, distribution: "skewed" },
  { name: "device_type", type: "categorical", riskLevel: "medium", leakageScore: 8, biasScore: 48, spuriousScore: 52, importance: 23, nullPercent: 0.5, uniqueValues: 4, distribution: "uniform" },
];

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [adversarialStrength, setAdversarialStrength] = useState(65);
  const [fairnessDefinition, setFairnessDefinition] = useState("demographic_parity");
  const [enableCounterfactual, setEnableCounterfactual] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState({
    name: "credit_risk_v3.parquet",
    rows: 2847293,
    features: ["user_id", "timestamp", "zip_code", "income", "age_bucket", "credit_score", "loan_amount", "device_type"],
  });
  const [lastScan, setLastScan] = useState("2024-01-12 14:32:01 UTC");
  
  // Analysis results state
  const [vulnerabilityScore, setVulnerabilityScore] = useState(73);
  const [leakageSeverity, setLeakageSeverity] = useState(78);
  const [biasExposure, setBiasExposure] = useState(64);
  const [robustnessScore, setRobustnessScore] = useState(42);
  const [exploitableFeatures, setExploitableFeatures] = useState(12);
  const [findings, setFindings] = useState(mockFindings);
  const [featureData, setFeatureData] = useState(defaultFeatureData);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleRunTest = async () => {
    setIsRunning(true);
    setIsScanning(true);

    try {
      // Call real AI analysis
      const analysis = await analyzeDataset({
        datasetName: datasetInfo.name,
        features: datasetInfo.features,
        rowCount: datasetInfo.rows,
        featureCount: datasetInfo.features.length,
        adversarialStrength,
        fairnessDefinition,
      });

      // Update state with AI results
      setVulnerabilityScore(analysis.vulnerabilityScore || 73);
      setLeakageSeverity(analysis.leakageSeverity || 78);
      setBiasExposure(analysis.biasExposure || 64);
      setRobustnessScore(analysis.robustnessScore || 42);
      setExploitableFeatures(analysis.exploitableFeatures || 12);
      setAiSummary(analysis.summary);

      // Update findings if provided
      if (analysis.findings && analysis.findings.length > 0) {
        const mappedFindings = analysis.findings.map((f, i) => ({
          id: String(i + 1),
          type: f.type as "leakage" | "spurious" | "exploit",
          severity: f.severity as "critical" | "high" | "medium" | "low",
          feature: f.feature,
          description: f.description,
          accuracy: f.accuracy,
        }));
        setFindings(mappedFindings);
      }

      // Update feature data if provided
      if (analysis.featureRisks && analysis.featureRisks.length > 0) {
        const mappedFeatures = analysis.featureRisks.map((f) => ({
          name: f.name,
          type: "numeric" as const,
          riskLevel: f.riskLevel as "critical" | "high" | "medium" | "low" | "safe",
          leakageScore: f.leakageScore,
          biasScore: f.biasScore,
          spuriousScore: f.spuriousScore,
          importance: Math.floor(Math.random() * 100),
          nullPercent: Math.random() * 5,
          uniqueValues: Math.floor(Math.random() * 10000),
          distribution: "normal" as const,
        }));
        setFeatureData(mappedFeatures.length > 0 ? mappedFeatures : defaultFeatureData);
      }

      // Save to history
      await saveScanToHistory(
        datasetInfo.name,
        datasetInfo.rows,
        datasetInfo.features.length,
        analysis
      );

      setLastScan(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");
      toast.success("AI analysis complete", {
        description: analysis.summary?.slice(0, 100) + "...",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsScanning(false);
      setIsRunning(false);
    }
  };

  const handleScanComplete = () => {
    // This is now handled in handleRunTest
  };

  const handleReset = () => {
    setAdversarialStrength(50);
    setFairnessDefinition("demographic_parity");
    setEnableCounterfactual(false);
  };

  const handleDatasetLoaded = (data: { name: string; rows: number; features: string[] }) => {
    setDatasetInfo({
      name: data.name,
      rows: data.rows,
      features: data.features,
    });
  };

  const handleLoadScan = (scan: any) => {
    setDatasetInfo({
      name: scan.dataset_name,
      rows: scan.row_count,
      features: datasetInfo.features,
    });
    setVulnerabilityScore(scan.vulnerability_score);
    setLeakageSeverity(scan.leakage_severity);
    setBiasExposure(scan.bias_exposure);
    setRobustnessScore(scan.robustness_score);
    setExploitableFeatures(scan.exploitable_features);
    setAiSummary(scan.ai_analysis);
    setLastScan(new Date(scan.created_at).toISOString().replace("T", " ").slice(0, 19) + " UTC");
    
    if (scan.findings && Array.isArray(scan.findings)) {
      setFindings(scan.findings.map((f: any, i: number) => ({
        id: String(i + 1),
        type: f.type || "leakage",
        severity: f.severity || "medium",
        feature: f.feature || "unknown",
        description: f.description || "",
        accuracy: f.accuracy || 50,
      })));
    }
    
    toast.success("Loaded scan from history");
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-50" />
      
      {/* Radial gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-radial" />

      {/* Live Scan Overlay */}
      <LiveScanOverlay isActive={isScanning} onComplete={handleScanComplete} />

      <div className="relative z-10 p-6 max-w-[1800px] mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <DashboardHeader
            datasetName={datasetInfo.name}
            lastScan={lastScan}
            rowCount={datasetInfo.rows}
            featureCount={datasetInfo.features.length}
          />
          <div className="flex items-center gap-2">
            <ActiveUsers />
            <ScanHistory onLoadScan={handleLoadScan} />
            <ReportExport datasetName={datasetInfo.name} scanDate={lastScan} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* AI Summary Banner */}
        {aiSummary && (
          <div className="mt-4 p-4 glass-panel glow-border">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  AI Analysis Summary
                </h4>
                <p className="text-sm text-foreground/90">{aiSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <MetricCard
            label="Leakage Severity"
            value={`${leakageSeverity}%`}
            icon={Zap}
            status={leakageSeverity >= 70 ? "danger" : leakageSeverity >= 50 ? "warning" : "safe"}
            trend={{ value: 12, direction: "up" }}
          />
          <MetricCard
            label="Bias Exposure"
            value={`${biasExposure}%`}
            icon={AlertTriangle}
            status={biasExposure >= 70 ? "danger" : biasExposure >= 50 ? "warning" : "safe"}
            trend={{ value: 5, direction: "up" }}
          />
          <MetricCard
            label="Robustness Score"
            value={`${robustnessScore}%`}
            icon={Shield}
            status={robustnessScore <= 30 ? "danger" : robustnessScore <= 50 ? "warning" : "safe"}
            trend={{ value: 8, direction: "down" }}
          />
          <MetricCard
            label="Exploitable Features"
            value={String(exploitableFeatures)}
            icon={Target}
            status={exploitableFeatures >= 10 ? "danger" : exploitableFeatures >= 5 ? "warning" : "safe"}
          />
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
          {/* Left column - Upload, Scores, Controls */}
          <div className="lg:col-span-3 space-y-4">
            <DatasetUpload onDatasetLoaded={handleDatasetLoaded} isScanning={isScanning} />
            <VulnerabilityScore
              score={vulnerabilityScore}
              label="Dataset Vulnerability Score"
              trend="up"
            />
            <ControlPanel
              adversarialStrength={adversarialStrength}
              onStrengthChange={setAdversarialStrength}
              fairnessDefinition={fairnessDefinition}
              onFairnessChange={setFairnessDefinition}
              enableCounterfactual={enableCounterfactual}
              onCounterfactualChange={setEnableCounterfactual}
              onRunTest={handleRunTest}
              onReset={handleReset}
              isRunning={isRunning}
            />
          </div>

          {/* Center column - Heatmap & Explorer */}
          <div className="lg:col-span-5 space-y-4">
            <RiskHeatmap
              data={mockHeatmapData}
              features={["user_id", "timestamp", "zip_code", "income", "age_bucket"]}
              riskTypes={["Leakage", "Bias", "Spurious"]}
            />
            <SpuriousExplorer data={mockCorrelationData} />
          </div>

          {/* Right column - Findings & Radar */}
          <div className="lg:col-span-4 space-y-4">
            <AdversarialFindings findings={findings} />
            <BiasRadar data={mockBiasData} />
          </div>
        </div>

        {/* Bottom row - Feature Inspector & Counterfactual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <FeatureInspector features={featureData} />
          <CounterfactualGenerator />
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-border/30 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-mono">
            AUTONOMOUS DATASET RED TEAM v1.0.0 • Powered by AI
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            Last model update: 2024-01-12 • Adversarial probes: 847 • Tests passed: 234/412
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
