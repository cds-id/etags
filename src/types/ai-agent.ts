/**
 * AI Agent Type Definitions
 */

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
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
