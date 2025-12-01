/**
 * Kolosal AI Client
 * OpenAI-compatible API for AI-powered fraud detection
 */

const KOLOSAL_API_URL = 'https://api.kolosal.ai/v1/chat/completions';
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY || '';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
};

export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * Send a chat completion request to Kolosal AI
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<ChatCompletionResponse> {
  const {
    model = 'Claude Sonnet 4.5',
    temperature = 0.3,
    max_tokens = 1024,
  } = options;

  const response = await fetch(KOLOSAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KOLOSAL_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kolosal AI API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get AI response as a simple string
 */
export async function getAIResponse(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await chatCompletion(messages);

  return response.choices[0]?.message?.content || '';
}
