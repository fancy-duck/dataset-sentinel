import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  vulnerabilityScore: number;
  leakageSeverity: number;
  biasExposure: number;
  robustnessScore: number;
  exploitableFeatures: number;
  summary: string;
  findings: Array<{
    type: string;
    severity: string;
    feature: string;
    description: string;
    accuracy: number;
  }>;
  featureRisks: Array<{
    name: string;
    leakageScore: number;
    biasScore: number;
    spuriousScore: number;
    riskLevel: string;
  }>;
  recommendations: string[];
}

interface AnalyzeDatasetParams {
  datasetName: string;
  features: string[];
  rowCount: number;
  featureCount: number;
  adversarialStrength: number;
  fairnessDefinition: string;
}

export async function analyzeDataset(params: AnalyzeDatasetParams): Promise<AnalysisResult> {
  console.log('Calling analyze-dataset edge function with params:', params);

  const { data, error } = await supabase.functions.invoke('analyze-dataset', {
    body: params,
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to analyze dataset');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  console.log('Analysis result:', data);
  return data as AnalysisResult;
}

export async function saveScanToHistory(
  datasetName: string,
  rowCount: number,
  featureCount: number,
  analysis: AnalysisResult
) {
  console.log('Saving scan to history:', { datasetName, rowCount, featureCount });

  const { data, error } = await supabase
    .from('scan_history')
    .insert({
      dataset_name: datasetName,
      row_count: rowCount,
      feature_count: featureCount,
      vulnerability_score: analysis.vulnerabilityScore,
      leakage_severity: analysis.leakageSeverity,
      bias_exposure: analysis.biasExposure,
      robustness_score: analysis.robustnessScore,
      exploitable_features: analysis.exploitableFeatures,
      ai_analysis: analysis.summary,
      findings: analysis.findings,
      feature_risks: analysis.featureRisks,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving scan to history:', error);
    throw error;
  }

  console.log('Scan saved:', data);
  return data;
}
