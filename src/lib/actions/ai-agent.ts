'use server';

import { auth } from '@/lib/auth';
import { getAIAgentContext } from '@/lib/ai-agent';
import type { AgentContext } from '@/types/ai-agent';

/**
 * Get AI agent statistics for current user
 */
export async function getAgentStats(): Promise<AgentContext['stats'] | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const userId = parseInt(session.user.id);
    const role = session.user.role as 'admin' | 'brand';
    const brandId = session.user.brandId
      ? parseInt(session.user.brandId)
      : undefined;

    const context = await getAIAgentContext(userId, role, brandId);
    return context.stats;
  } catch (error) {
    console.error('Get agent stats error:', error);
    return null;
  }
}

/**
 * Get full AI agent context for current user
 */
export async function getAgentContext(): Promise<AgentContext | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const userId = parseInt(session.user.id);
    const role = session.user.role as 'admin' | 'brand';
    const brandId = session.user.brandId
      ? parseInt(session.user.brandId)
      : undefined;

    return await getAIAgentContext(userId, role, brandId);
  } catch (error) {
    console.error('Get agent context error:', error);
    return null;
  }
}
