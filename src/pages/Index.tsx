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
import { AlertTriangle, Shield, Zap, Target } from "lucide-react";

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

const mockFindings = [
  {
    id: "1",
    type: "leakage" as const,
    severity: "critical" as const,
    feature: "user_id",
    description: "User ID can be used to directly look up the target variable through a join with the users table. This represents a critical data leakage pathway.",
    accuracy: 98,
  },
  {
    id: "2",
    type: "spurious" as const,
    severity: "high" as const,
    feature: "zip_code",
    description: "Zip code acts as a proxy for race/ethnicity with 0.82 correlation. Model may learn discriminatory patterns.",
    accuracy: 87,
  },
  {
    id: "3",
    type: "exploit" as const,
    severity: "high" as const,
    feature: "timestamp",
    description: "Adversarial probe achieved 89% accuracy using only timestamp features, indicating severe temporal leakage.",
    accuracy: 89,
  },
  {
    id: "4",
    type: "spurious" as const,
    severity: "medium" as const,
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

const mockFeatureData = [
  { name: "user_id", type: "identifier" as const, riskLevel: "critical" as const, leakageScore: 92, biasScore: 15, spuriousScore: 8, importance: 12, nullPercent: 0, uniqueValues: 2847293, distribution: "uniform" as const },
  { name: "timestamp", type: "temporal" as const, riskLevel: "high" as const, leakageScore: 78, biasScore: 45, spuriousScore: 62, importance: 67, nullPercent: 0.1, uniqueValues: 156892, distribution: "skewed" as const },
  { name: "zip_code", type: "categorical" as const, riskLevel: "high" as const, leakageScore: 12, biasScore: 85, spuriousScore: 71, importance: 45, nullPercent: 2.3, uniqueValues: 4521, distribution: "skewed" as const },
  { name: "income", type: "numeric" as const, riskLevel: "medium" as const, leakageScore: 5, biasScore: 67, spuriousScore: 23, importance: 78, nullPercent: 5.2, uniqueValues: 89234, distribution: "normal" as const },
  { name: "age_bucket", type: "categorical" as const, riskLevel: "medium" as const, leakageScore: 3, biasScore: 58, spuriousScore: 34, importance: 52, nullPercent: 0.8, uniqueValues: 8, distribution: "bimodal" as const },
  { name: "credit_score", type: "numeric" as const, riskLevel: "low" as const, leakageScore: 2, biasScore: 34, spuriousScore: 12, importance: 89, nullPercent: 1.2, uniqueValues: 450, distribution: "normal" as const },
  { name: "loan_amount", type: "numeric" as const, riskLevel: "safe" as const, leakageScore: 1, biasScore: 22, spuriousScore: 8, importance: 72, nullPercent: 0, uniqueValues: 15678, distribution: "skewed" as const },
  { name: "device_type", type: "categorical" as const, riskLevel: "medium" as const, leakageScore: 8, biasScore: 48, spuriousScore: 52, importance: 23, nullPercent: 0.5, uniqueValues: 4, distribution: "uniform" as const },
];

const Index = () => {
  const [adversarialStrength, setAdversarialStrength] = useState(65);
  const [fairnessDefinition, setFairnessDefinition] = useState("demographic_parity");
  const [enableCounterfactual, setEnableCounterfactual] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState({
    name: "credit_risk_v3.parquet",
    rows: 2847293,
    features: 47,
  });
  const [lastScan, setLastScan] = useState("2024-01-12 14:32:01 UTC");

  const handleRunTest = () => {
    setIsRunning(true);
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    setIsRunning(false);
    setLastScan(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");
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
      features: data.features.length,
    });
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
            featureCount={datasetInfo.features}
          />
          <ReportExport datasetName={datasetInfo.name} scanDate={lastScan} />
        </div>

        {/* Top metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <MetricCard
            label="Leakage Severity"
            value="78%"
            icon={Zap}
            status="danger"
            trend={{ value: 12, direction: "up" }}
          />
          <MetricCard
            label="Bias Exposure"
            value="64%"
            icon={AlertTriangle}
            status="warning"
            trend={{ value: 5, direction: "up" }}
          />
          <MetricCard
            label="Robustness Score"
            value="42%"
            icon={Shield}
            status="warning"
            trend={{ value: 8, direction: "down" }}
          />
          <MetricCard
            label="Exploitable Features"
            value="12"
            icon={Target}
            status="danger"
          />
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
          {/* Left column - Upload, Scores, Controls */}
          <div className="lg:col-span-3 space-y-4">
            <DatasetUpload onDatasetLoaded={handleDatasetLoaded} isScanning={isScanning} />
            <VulnerabilityScore
              score={73}
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
            <AdversarialFindings findings={mockFindings} />
            <BiasRadar data={mockBiasData} />
          </div>
        </div>

        {/* Bottom row - Feature Inspector & Counterfactual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <FeatureInspector features={mockFeatureData} />
          <CounterfactualGenerator />
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-border/30 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-mono">
            AUTONOMOUS DATASET RED TEAM v1.0.0
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
