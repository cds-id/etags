import { NextRequest, NextResponse } from 'next/server';
import {
  generateTemplatePreview,
  getOutputContentType,
} from '@/lib/qr-template-generator';

/**
 * GET /api/tags/template-preview
 *
 * Generate a preview of the tag template with placeholder data
 * Useful for testing template configuration
 *
 * Query params:
 * - template: Template name (default: 'default')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const templateName = searchParams.get('template') || 'default';

    const result = await generateTemplatePreview(templateName);

    if (!result.success || !result.buffer) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate preview' },
        { status: 500 }
      );
    }

    const contentType = getOutputContentType(templateName);

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Template preview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
