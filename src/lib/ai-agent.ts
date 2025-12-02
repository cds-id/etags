/**
 * AI Agent Service
 * Provides intelligent chat assistance with role-based data access
 */

import { prisma } from './db';
import { chatCompletion, type ChatMessage } from './kolosal-ai';
import type { AgentContext } from '@/types/ai-agent';

interface ProductMetadata {
  name?: string;
  [key: string]: unknown;
}

/**
 * Get AI agent context with role-based data filtering
 */
export async function getAIAgentContext(
  userId: number,
  role: 'admin' | 'brand',
  brandId?: number
): Promise<AgentContext> {
  const isAdmin = role === 'admin';

  // Get dashboard statistics
  let stats = {
    brands: 0,
    products: 0,
    tags: 0,
    stampedTags: 0,
  };

  let brandName: string | undefined;

  if (isAdmin) {
    // Admin sees all data
    const [brandsCount, productsCount, tagsCount, stampedTagsCount] =
      await Promise.all([
        prisma.brand.count(),
        prisma.product.count(),
        prisma.tag.count(),
        prisma.tag.count({ where: { is_stamped: 1 } }),
      ]);

    stats = {
      brands: brandsCount,
      products: productsCount,
      tags: tagsCount,
      stampedTags: stampedTagsCount,
    };
  } else if (brandId) {
    // Brand user sees only their data
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { name: true },
    });

    brandName = brand?.name;

    // Get product IDs for this brand
    const brandProducts = await prisma.product.findMany({
      where: { brand_id: brandId },
      select: { id: true },
    });
    const productIds = brandProducts.map((p) => p.id);

    // Count tags that contain any of the brand's products
    const allTags = await prisma.tag.findMany({
      select: { id: true, product_ids: true, is_stamped: true },
    });

    let tagsCount = 0;
    let stampedTagsCount = 0;

    for (const tag of allTags) {
      const tagProductIds = Array.isArray(tag.product_ids)
        ? (tag.product_ids as number[])
        : [];
      const belongsToBrand = tagProductIds.some((id) =>
        productIds.includes(id)
      );
      if (belongsToBrand) {
        tagsCount++;
        if (tag.is_stamped === 1) {
          stampedTagsCount++;
        }
      }
    }

    stats = {
      brands: 1,
      products: productIds.length,
      tags: tagsCount,
      stampedTags: stampedTagsCount,
    };
  }

  // Get recent activity
  let recentActivity;

  if (isAdmin) {
    // Admin: get recent products and tags from all brands
    const [recentProducts, recentTags] = await Promise.all([
      prisma.product.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          metadata: true,
          status: true,
        },
      }),
      prisma.tag.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          publish_status: true,
          is_stamped: true,
        },
      }),
    ]);

    recentActivity = {
      products: recentProducts.map((p) => ({
        id: p.id,
        code: p.code,
        name:
          (p.metadata as unknown as ProductMetadata)?.name || 'Unnamed Product',
        status: p.status,
      })),
      tags: recentTags.map((t) => ({
        id: t.id,
        code: t.code,
        publishStatus: t.publish_status,
        isStamped: t.is_stamped,
      })),
    };
  } else if (brandId) {
    // Brand user: get only their products
    const [recentProducts, allTags] = await Promise.all([
      prisma.product.findMany({
        where: { brand_id: brandId },
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          metadata: true,
          status: true,
        },
      }),
      prisma.tag.findMany({
        take: 20,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          product_ids: true,
          publish_status: true,
          is_stamped: true,
        },
      }),
    ]);

    // Get product IDs for filtering tags
    const productIds = await prisma.product
      .findMany({
        where: { brand_id: brandId },
        select: { id: true },
      })
      .then((products) => products.map((p) => p.id));

    // Filter tags that belong to this brand
    const brandTags = allTags
      .filter((tag) => {
        const tagProductIds = Array.isArray(tag.product_ids)
          ? (tag.product_ids as number[])
          : [];
        return tagProductIds.some((id) => productIds.includes(id));
      })
      .slice(0, 5);

    recentActivity = {
      products: recentProducts.map((p) => ({
        id: p.id,
        code: p.code,
        name:
          (p.metadata as unknown as ProductMetadata)?.name || 'Unnamed Product',
        status: p.status,
      })),
      tags: brandTags.map((t) => ({
        id: t.id,
        code: t.code,
        publishStatus: t.publish_status,
        isStamped: t.is_stamped,
      })),
    };
  }

  return {
    userId,
    role,
    brandId,
    brandName,
    stats,
    recentActivity,
  };
}

/**
 * Format agent context for AI consumption
 */
function formatContextForAI(context: AgentContext): string {
  const lines: string[] = [];

  lines.push('=== USER CONTEXT ===');
  lines.push(
    `Role: ${context.role === 'admin' ? 'Administrator' : 'Brand User'}`
  );
  if (context.brandName) {
    lines.push(`Brand: ${context.brandName}`);
  }

  lines.push('\n=== DASHBOARD STATISTICS ===');
  lines.push(`Total Brands: ${context.stats.brands}`);
  lines.push(`Total Products: ${context.stats.products}`);
  lines.push(`Total Tags: ${context.stats.tags}`);
  lines.push(`Stamped Tags (on blockchain): ${context.stats.stampedTags}`);

  if (context.recentActivity) {
    lines.push('\n=== RECENT PRODUCTS ===');
    context.recentActivity.products.forEach((p, i) => {
      lines.push(
        `${i + 1}. ${p.name} (Code: ${p.code}, Status: ${p.status === 1 ? 'Active' : 'Inactive'})`
      );
    });

    lines.push('\n=== RECENT TAGS ===');
    context.recentActivity.tags.forEach((t, i) => {
      const status =
        t.isStamped === 1
          ? 'Stamped'
          : t.publishStatus === 1
            ? 'Published'
            : 'Draft';
      lines.push(`${i + 1}. ${t.code} (Status: ${status})`);
    });
  }

  return lines.join('\n');
}

/**
 * Get system prompt based on user role
 */
function getSystemPrompt(role: 'admin' | 'brand', brandName?: string): string {
  if (role === 'admin') {
    return `You are an AI assistant for an administrator of the eTag product authentication system.

You have access to ALL system data across all brands, including:
- All brands registered in the system
- All products from all brands
- All authentication tags
- Blockchain stamping statistics
- Tag scan analytics

Your role is to:
1. Provide comprehensive insights about the entire platform
2. Help with administrative tasks and decision-making
3. Analyze trends across multiple brands
4. Suggest improvements and optimizations
5. Answer questions about any brand or product in the system

Be professional, data-driven, and provide actionable insights. Use a mix of Indonesian and English as appropriate for technical terms. When presenting statistics, be clear and precise.`;
  }

  return `You are an AI assistant for a brand user${brandName ? ` of ${brandName}` : ''} in the eTag product authentication system.

You have access to ONLY this brand's data, including:
- Their products
- Their authentication tags
- Blockchain stamping statistics for their tags
- Scan analytics for their tags

Your role is to:
1. Help manage their products and tags
2. Provide insights about their brand's performance
3. Explain blockchain authentication features
4. Suggest ways to improve product authenticity
5. Answer questions about tag scans and consumer engagement

IMPORTANT: You can ONLY see and discuss data for this specific brand. If asked about other brands or system-wide data, politely explain that you only have access to this brand's information.

Be helpful, concise, and provide actionable insights. Use a mix of Indonesian and English as appropriate. When presenting statistics, be clear and accurate.`;
}

/**
 * Chat with AI agent
 */
export async function chatWithAgent(
  messages: ChatMessage[],
  userId: number,
  role: 'admin' | 'brand',
  brandId?: number
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  try {
    // Get user context
    const context = await getAIAgentContext(userId, role, brandId);

    // Build context string
    const contextString = formatContextForAI(context);

    // Prepare messages with system prompt and context
    const systemPrompt = getSystemPrompt(role, context.brandName);

    const aiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: contextString },
      ...messages,
    ];

    // Get AI response
    const response = await chatCompletion(aiMessages, {
      model: 'Claude Sonnet 4.5',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiMessage = response.choices[0]?.message?.content;

    if (!aiMessage) {
      return {
        success: false,
        error: 'No response from AI',
      };
    }

    return {
      success: true,
      message: aiMessage,
      usage: response.usage,
    };
  } catch (error) {
    console.error('AI Agent error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get AI response',
    };
  }
}
