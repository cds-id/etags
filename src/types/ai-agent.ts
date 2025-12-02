/**
 * AI Agent Type Definitions
 */

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
};

export type FraudAnalytics = {
  totalScans: number;
  uniqueDevices: number;
  flaggedTags: number;
  claimedTags: number;
  suspiciousPatterns: {
    impossibleTravel: number;
    highVolumeDevice: number;
    vpnUsage: number;
    multipleClaims: number;
    locationMismatch: number;
  };
  topScanLocations: Array<{ location: string; count: number }>;
  recentSuspiciousScans: Array<{
    tagCode: string;
    location: string | null;
    reason: string;
    timestamp: Date;
  }>;
};

export type AgentContext = {
  userId: number;
  role: 'admin' | 'brand';
  brandId?: number;
  brandName?: string;
  stats: {
    brands: number;
    products: number;
    tags: number;
    stampedTags: number;
  };
  recentActivity?: {
    products: Array<{
      id: number;
      code: string;
      name: string;
      status: number;
    }>;
    tags: Array<{
      id: number;
      code: string;
      publishStatus: number;
      isStamped: number;
    }>;
  };
  fraudAnalytics?: FraudAnalytics;
};

export type AgentResponse = {
  success: boolean;
  message?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type ChatRequest = {
  messages: Message[];
};
