import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { chatWithAgent } from '@/lib/ai-agent';
import type { ChatMessage } from '@/lib/kolosal-ai';
import type { ChatRequest, AgentResponse } from '@/types/ai-agent';

/**
 * POST /api/ai-agent
 *
 * AI Agent chat endpoint with role-based access control
 *
 * @swagger
 * /api/ai-agent:
 *   post:
 *     summary: Chat with AI Agent
 *     description: Send messages to AI agent and get intelligent responses based on user role and permissions
 *     tags: [AI Agent]
 *     security:
 *       - session: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant, system]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ChatRequest = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get user context
    const userId = parseInt(session.user.id);
    const role = session.user.role as 'admin' | 'brand';
    const brandId = session.user.brandId
      ? parseInt(session.user.brandId)
      : undefined;

    // Filter messages to only include user and assistant roles
    const chatMessages: ChatMessage[] = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    if (chatMessages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid messages to process' },
        { status: 400 }
      );
    }

    // Chat with agent
    const result = await chatWithAgent(chatMessages, userId, role, brandId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const response: AgentResponse = {
      success: true,
      message: result.message,
      usage: result.usage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Agent API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
