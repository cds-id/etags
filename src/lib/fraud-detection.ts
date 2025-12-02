/**
 * AI-powered Fraud Detection
 * Compares tag distribution info with user scan location to detect potential fraud
 */

import { chatCompletion, type ChatMessage } from './kolosal-ai';

export type DistributionInfo = {
  region?: string;
  country?: string;
  channel?: string;
  intended_market?: string;
};

export type ScanLocation = {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  ipAddress?: string;
  country?: string; // Derived from IP or GPS
};

export type FraudAnalysisResult = {
  isSuspicious: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  reasons: string[];
  recommendation: string;
  details: {
    locationMatch: boolean;
    channelMatch: boolean;
    marketMatch: boolean;
  };
};

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  ID: 'Indonesia',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Philippines',
  GLOBAL: 'Global (Worldwide)',
};

// Channel display names
const CHANNEL_NAMES: Record<string, string> = {
  official_store: 'Official Store',
  authorized_retailer: 'Authorized Retailer',
  online_marketplace: 'Online Marketplace',
  distributor: 'Distributor',
  direct_sales: 'Direct Sales',
};

// Market display names
const MARKET_NAMES: Record<string, string> = {
  domestic: 'Domestic',
  export: 'Export',
  global: 'Global',
  southeast_asia: 'Southeast Asia',
};

/**
 * Analyze potential fraud using AI
 */
export async function analyzeFraud(
  distribution: DistributionInfo,
  scanLocation: ScanLocation,
  scanHistory: {
    totalScans: number;
    uniqueScanners: number;
    recentLocations: string[];
  }
): Promise<FraudAnalysisResult> {
  // Build context for AI analysis
  const distributionCountry = distribution.country
    ? COUNTRY_NAMES[distribution.country] || distribution.country
    : 'Not specified';

  const distributionChannel = distribution.channel
    ? CHANNEL_NAMES[distribution.channel] || distribution.channel
    : 'Not specified';

  const distributionMarket = distribution.intended_market
    ? MARKET_NAMES[distribution.intended_market] || distribution.intended_market
    : 'Not specified';

  const systemPrompt = `You are a fraud detection AI for a product authentication system. Your job is to analyze if a product scan location matches the intended distribution area and identify potential counterfeit or gray market products.

IMPORTANT RULES:
- NEVER ask questions or request more information
- NEVER include follow-up queries in your response
- Work ONLY with the data provided - make reasonable assumptions if data is incomplete
- If data is missing, use "Not specified" indicators to adjust your analysis accordingly
- Provide definitive analysis based on available information

You will be given:
1. The intended distribution information (where the product should be sold)
2. The actual scan location (where the product was scanned)
3. Scan history statistics

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "isSuspicious": boolean,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "riskScore": number (0-100),
  "reasons": ["reason1", "reason2"],
  "recommendation": "CONCISE recommendation in Indonesian (max 300 chars). Use **bold** for emphasis. Keep it brief and actionable. NO QUESTIONS.",
  "locationMatch": boolean,
  "channelMatch": boolean,
  "marketMatch": boolean
}

Risk Level Guidelines:
- low (0-25): Location matches or is within expected distribution area
- medium (26-50): Minor discrepancy, could be legitimate (e.g., traveler, gift)
- high (51-75): Significant location mismatch, likely gray market
- critical (76-100): Clear fraud indicators (e.g., wrong continent, excessive scans from different locations)

Consider:
- If distribution is "Global" or "Not specified", be lenient with location matching
- Southeast Asia market includes: Indonesia, Singapore, Malaysia, Thailand, Vietnam, Philippines
- Domestic (Indonesia) products should primarily be scanned in Indonesia
- Multiple scans from vastly different locations could indicate counterfeit tags being duplicated
- High scan count with few unique devices may indicate reselling (not necessarily fraud)`;

  const userPrompt = `Analyze this product scan for potential fraud:

INTENDED DISTRIBUTION:
- Region: ${distribution.region || 'Not specified'}
- Country: ${distributionCountry}
- Channel: ${distributionChannel}
- Intended Market: ${distributionMarket}

ACTUAL SCAN LOCATION:
- Location Name: ${scanLocation.locationName || 'Unknown'}
- Coordinates: ${scanLocation.latitude && scanLocation.longitude ? `${scanLocation.latitude}, ${scanLocation.longitude}` : 'Not available'}
- IP Address: ${scanLocation.ipAddress || 'Unknown'}

SCAN HISTORY:
- Total Scans: ${scanHistory.totalScans}
- Unique Devices: ${scanHistory.uniqueScanners}
- Recent Scan Locations: ${scanHistory.recentLocations.length > 0 ? scanHistory.recentLocations.join(', ') : 'First scan'}

Provide your fraud analysis as JSON.`;

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await chatCompletion(messages, {
      temperature: 0.1, // Low temperature for consistent analysis
      max_tokens: 1024, // Increased to accommodate detailed recommendations
    });

    const aiResponse = response.choices[0]?.message?.content || '';

    // Parse AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', aiResponse);
      return getDefaultResult();
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      isSuspicious: analysis.isSuspicious ?? false,
      riskLevel: analysis.riskLevel ?? 'low',
      riskScore: analysis.riskScore ?? 0,
      reasons: analysis.reasons ?? [],
      recommendation:
        analysis.recommendation ?? 'Tidak ada masalah terdeteksi.',
      details: {
        locationMatch: analysis.locationMatch ?? true,
        channelMatch: analysis.channelMatch ?? true,
        marketMatch: analysis.marketMatch ?? true,
      },
    };
  } catch (error) {
    console.error('Fraud detection error:', error);
    // Return default non-suspicious result on error
    return getDefaultResult();
  }
}

/**
 * Quick fraud check without AI (rule-based)
 * Use this as fallback or for quick preliminary check
 */
export function quickFraudCheck(
  distribution: DistributionInfo,
  scanLocation: ScanLocation
): { isSuspicious: boolean; reason?: string } {
  // If no distribution info, can't check
  if (!distribution.country && !distribution.intended_market) {
    return { isSuspicious: false };
  }

  // Global distribution - always ok
  if (
    distribution.country === 'GLOBAL' ||
    distribution.intended_market === 'global'
  ) {
    return { isSuspicious: false };
  }

  // Check if location name contains country indicators
  const locationLower = (scanLocation.locationName || '').toLowerCase();

  // Indonesia domestic check
  if (
    distribution.country === 'ID' ||
    distribution.intended_market === 'domestic'
  ) {
    const indonesiaIndicators = [
      'indonesia',
      'jakarta',
      'surabaya',
      'bandung',
      'medan',
      'jawa',
      'sumatra',
      'kalimantan',
      'sulawesi',
      'bali',
    ];
    const isInIndonesia = indonesiaIndicators.some((ind) =>
      locationLower.includes(ind)
    );

    if (!isInIndonesia && scanLocation.locationName) {
      return {
        isSuspicious: true,
        reason:
          'Produk ini ditujukan untuk pasar Indonesia, namun dipindai di luar Indonesia.',
      };
    }
  }

  // Southeast Asia market check
  if (distribution.intended_market === 'southeast_asia') {
    const seaIndicators = [
      'indonesia',
      'singapore',
      'malaysia',
      'thailand',
      'vietnam',
      'philippines',
      'jakarta',
      'kuala lumpur',
      'bangkok',
      'manila',
      'ho chi minh',
    ];
    const isInSEA = seaIndicators.some((ind) => locationLower.includes(ind));

    if (!isInSEA && scanLocation.locationName) {
      return {
        isSuspicious: true,
        reason:
          'Produk ini ditujukan untuk pasar Asia Tenggara, namun dipindai di luar wilayah tersebut.',
      };
    }
  }

  return { isSuspicious: false };
}

/**
 * Default result when AI analysis fails
 */
function getDefaultResult(): FraudAnalysisResult {
  return {
    isSuspicious: false,
    riskLevel: 'low',
    riskScore: 0,
    reasons: [],
    recommendation:
      'Analisis tidak dapat dilakukan. Silakan periksa secara manual jika diperlukan.',
    details: {
      locationMatch: true,
      channelMatch: true,
      marketMatch: true,
    },
  };
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(
  level: FraudAnalysisResult['riskLevel']
): string {
  switch (level) {
    case 'low':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'orange';
    case 'critical':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Get risk level label in Indonesian
 */
export function getRiskLevelLabel(
  level: FraudAnalysisResult['riskLevel']
): string {
  switch (level) {
    case 'low':
      return 'Risiko Rendah';
    case 'medium':
      return 'Risiko Sedang';
    case 'high':
      return 'Risiko Tinggi';
    case 'critical':
      return 'Risiko Kritis';
    default:
      return 'Tidak Diketahui';
  }
}
