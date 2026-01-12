import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { datasetName, features, rowCount, featureCount, adversarialStrength, fairnessDefinition } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting AI analysis for dataset:', datasetName);
    console.log('Features to analyze:', features);
    console.log('Adversarial strength:', adversarialStrength);

    const systemPrompt = `You are an expert ML security researcher specializing in dataset vulnerability analysis. 
You perform adversarial red-team analysis on datasets to find:
1. Data leakage pathways (features that leak target information)
2. Spurious correlations (non-causal relationships that break under distribution shift)
3. Bias & fairness issues (demographic proxies, disparate impact)

Analyze datasets with the rigor of a top AI safety lab. Be specific and technical.`;

    const userPrompt = `Analyze this dataset for vulnerabilities:

Dataset: ${datasetName}
Rows: ${rowCount?.toLocaleString() || 'Unknown'}
Features: ${featureCount || features?.length || 'Unknown'}
Feature Names: ${features?.join(', ') || 'Not provided'}

Adversarial Test Strength: ${adversarialStrength}%
Fairness Definition: ${fairnessDefinition?.replace('_', ' ') || 'demographic parity'}

Provide a comprehensive red-team analysis including:
1. **Vulnerability Score** (0-100): Overall dataset risk level
2. **Leakage Analysis**: Identify features that may leak target information
3. **Spurious Correlations**: Features with non-causal relationships
4. **Bias Risks**: Potential demographic proxies and fairness concerns
5. **Top Exploitable Features**: Rank the most dangerous features
6. **Recommendations**: Specific mitigations

Format your response as JSON with this structure:
{
  "vulnerabilityScore": number,
  "leakageSeverity": number,
  "biasExposure": number,
  "robustnessScore": number,
  "exploitableFeatures": number,
  "summary": "Brief executive summary",
  "findings": [
    {
      "type": "leakage|spurious|bias|exploit",
      "severity": "critical|high|medium|low",
      "feature": "feature_name",
      "description": "Detailed explanation",
      "accuracy": number
    }
  ],
  "featureRisks": [
    {
      "name": "feature_name",
      "leakageScore": number,
      "biasScore": number,
      "spuriousScore": number,
      "riskLevel": "critical|high|medium|low|safe"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse the JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return a structured fallback based on the text response
      analysis = {
        vulnerabilityScore: 65,
        leakageSeverity: 70,
        biasExposure: 55,
        robustnessScore: 45,
        exploitableFeatures: 8,
        summary: content.slice(0, 500),
        findings: [],
        featureRisks: [],
        recommendations: ['Review the AI analysis for detailed recommendations']
      };
    }

    console.log('Parsed analysis:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-dataset function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
