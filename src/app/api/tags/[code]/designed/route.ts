import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  generateDesignedTag,
  getOutputContentType,
  getOutputExtension,
} from '@/lib/qr-template-generator';
import type { ProductMetadata } from '@/lib/product-templates';

type RouteParams = {
  params: Promise<{ code: string }>;
};

/**
 * GET /api/tags/[code]/designed
 *
 * Generate and download a designed tag image with QR code on template
 *
 * Query params:
 * - template: Template name (default: 'default')
 * - download: If 'true', sets Content-Disposition to attachment
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const searchParams = request.nextUrl.searchParams;
    const templateName = searchParams.get('template') || 'default';
    const shouldDownload = searchParams.get('download') === 'true';

    // Find tag with product info
    const tag = await prisma.tag.findUnique({
      where: { code },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Get first product for text overlay
    const productIds = tag.product_ids as number[];
    let productName = '';
    let brandName = '';

    if (productIds.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: productIds[0] },
        include: { brand: true },
      });

      if (product) {
        const metadata = product.metadata as ProductMetadata;
        productName = metadata.name || product.code;
        brandName = product.brand.name;
      }
    }

    // Generate verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://etags.app';
    const verifyUrl = `${baseUrl}/verify/${code}`;

    // Generate designed tag
    const result = await generateDesignedTag(
      {
        qrData: verifyUrl,
        tagCode: code,
        productName,
        brandName,
      },
      templateName
    );

    if (!result.success || !result.buffer) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate designed tag' },
        { status: 500 }
      );
    }

    // Prepare response headers
    const contentType = getOutputContentType(templateName);
    const extension = getOutputExtension(templateName);
    const filename = `${code}-designed.${extension}`;

    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    };

    if (shouldDownload) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(new Uint8Array(result.buffer), { headers });
  } catch (error) {
    console.error('Designed tag generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
