import sharp from 'sharp';
import path from 'path';
import { generateQRCodeBuffer } from './qr-generator';
import {
  getTemplateConfig,
  validateConfig,
  type QRTemplateConfig,
} from './qr-template-config';

export type TemplateData = {
  /** The URL/data to encode in the QR code */
  qrData: string;
  /** Tag code for text overlay */
  tagCode?: string;
  /** Product name for text overlay */
  productName?: string;
  /** Brand name for text overlay */
  brandName?: string;
};

export type GenerateResult = {
  success: boolean;
  buffer?: Buffer;
  error?: string;
};

/**
 * Generate a designed tag with QR code composited on template
 */
export async function generateDesignedTag(
  data: TemplateData,
  templateName: string = 'default'
): Promise<GenerateResult> {
  try {
    const config = getTemplateConfig(templateName);

    // Validate configuration
    const errors = validateConfig(config);
    if (errors.length > 0) {
      return {
        success: false,
        error: `Invalid template configuration: ${errors.join(', ')}`,
      };
    }

    // Get template path
    const templatePath = path.join(
      process.cwd(),
      'public',
      config.template.path
    );

    // Generate QR code at the configured size
    const qrBuffer = await generateQRCodeBuffer(data.qrData, {
      width: config.qrCode.width,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#e0e0e2',
      },
    });

    // Resize QR code to exact dimensions (in case it's slightly different)
    const resizedQR = await sharp(qrBuffer)
      .resize(config.qrCode.width, config.qrCode.height, {
        fit: 'fill',
      })
      .png()
      .toBuffer();

    // Build composite layers array
    const compositeInputs: sharp.OverlayOptions[] = [
      {
        input: resizedQR,
        left: config.qrCode.x,
        top: config.qrCode.y,
      },
    ];

    // Add text overlays if configured
    if (config.textOverlays && config.textOverlays.length > 0) {
      const svgTexts = await generateTextOverlaySVG(config, data);
      if (svgTexts) {
        compositeInputs.push({
          input: Buffer.from(svgTexts),
          top: 0,
          left: 0,
        });
      }
    }

    // Load template and composite all layers at once
    const composite = sharp(templatePath).composite(compositeInputs);

    // Output based on format
    let outputBuffer: Buffer;
    if (config.output.format === 'jpeg') {
      outputBuffer = await composite
        .jpeg({ quality: config.output.quality })
        .toBuffer();
    } else {
      outputBuffer = await composite.png().toBuffer();
    }

    return {
      success: true,
      buffer: outputBuffer,
    };
  } catch (error) {
    console.error('Template generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate SVG for text overlays
 */
async function generateTextOverlaySVG(
  config: QRTemplateConfig,
  data: TemplateData
): Promise<string | null> {
  if (!config.textOverlays || config.textOverlays.length === 0) {
    return null;
  }

  const textElements: string[] = [];

  for (const overlay of config.textOverlays) {
    let text = '';

    switch (overlay.content) {
      case 'tag_code':
        text = data.tagCode || '';
        break;
      case 'product_name':
        text = data.productName || '';
        break;
      case 'brand_name':
        text = data.brandName || '';
        break;
      case 'custom':
        text = overlay.customText || '';
        break;
    }

    if (!text) continue;

    // Escape XML special characters
    const escapedText = escapeXML(text);

    // Calculate text anchor based on alignment
    let textAnchor = 'start';
    const x = overlay.x;
    if (overlay.align === 'center') {
      textAnchor = 'middle';
    } else if (overlay.align === 'right') {
      textAnchor = 'end';
    }

    textElements.push(`
      <text
        x="${x}"
        y="${overlay.y}"
        font-family="${overlay.fontFamily}"
        font-size="${overlay.fontSize}px"
        fill="${overlay.color}"
        text-anchor="${textAnchor}"
      >${escapedText}</text>
    `);
  }

  if (textElements.length === 0) {
    return null;
  }

  const svg = `
    <svg width="${config.template.width}" height="${config.template.height}" xmlns="http://www.w3.org/2000/svg">
      ${textElements.join('\n')}
    </svg>
  `;

  return svg;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a preview of the template with placeholder QR
 * Useful for testing configuration
 */
export async function generateTemplatePreview(
  templateName: string = 'default'
): Promise<GenerateResult> {
  return generateDesignedTag(
    {
      qrData: 'https://example.com/preview',
      tagCode: 'PREVIEW-TAG-CODE',
      productName: 'Sample Product Name',
      brandName: 'Sample Brand',
    },
    templateName
  );
}

/**
 * Get the content type for the output format
 */
export function getOutputContentType(templateName: string = 'default'): string {
  const config = getTemplateConfig(templateName);
  return config.output.format === 'jpeg' ? 'image/jpeg' : 'image/png';
}

/**
 * Get the file extension for the output format
 */
export function getOutputExtension(templateName: string = 'default'): string {
  const config = getTemplateConfig(templateName);
  return config.output.format === 'jpeg' ? 'jpg' : 'png';
}
