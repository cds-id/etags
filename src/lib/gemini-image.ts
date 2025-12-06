/**
 * Gemini API Image Generation
 * Uses Google's Gemini SDK for generating NFT collectible art
 */

import { GoogleGenAI } from '@google/genai';

export interface ProductInfo {
  name: string;
  brand: string;
  description?: string;
  images?: string[];
}

export interface GenerateImageResult {
  success: boolean;
  imageBuffer?: Buffer;
  mimeType?: string;
  error?: string;
}

/**
 * Generate NFT collectible art using Gemini API
 */
export async function generateNFTImage(
  tagCode: string,
  productInfo: ProductInfo
): Promise<GenerateImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY environment variable is not set',
    };
  }

  const prompt = buildNFTPrompt(tagCode, productInfo);

  try {
    const ai = new GoogleGenAI({ apiKey });

    const config = {
      responseModalities: ['IMAGE', 'TEXT'] as ('IMAGE' | 'TEXT')[],
      imageConfig: {
        imageSize: '1K' as const,
      },
    };

    const contents = [
      {
        role: 'user' as const,
        parts: [{ text: prompt }],
      },
    ];

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp-image-generation',
      config,
      contents,
    });

    let imageBuffer: Buffer | null = null;
    let mimeType: string | null = null;

    for await (const chunk of response) {
      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        continue;
      }

      const parts = chunk.candidates[0].content.parts;
      for (const part of parts) {
        if ('inlineData' in part && part.inlineData) {
          const inlineData = part.inlineData;
          mimeType = inlineData.mimeType || 'image/png';
          imageBuffer = Buffer.from(inlineData.data || '', 'base64');
        }
      }
    }

    if (!imageBuffer) {
      return {
        success: false,
        error: 'No image data in Gemini response',
      };
    }

    return {
      success: true,
      imageBuffer,
      mimeType: mimeType || 'image/png',
    };
  } catch (error) {
    console.error('Gemini image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build the prompt for NFT art generation
 */
function buildNFTPrompt(tagCode: string, productInfo: ProductInfo): string {
  return `Create a unique digital collectible artwork for an authentic product ownership certificate.

Product Details:
- Product Name: ${productInfo.name}
- Brand: ${productInfo.brand}
${productInfo.description ? `- Description: ${productInfo.description}` : ''}
- Tag Code: ${tagCode}

Art Requirements:
1. Style: Modern, premium, certificate-like digital art
2. Theme: Authenticity, ownership, blockchain verification
3. Elements to include:
   - Abstract representation of the product category
   - Brand identity elements (colors, patterns)
   - Subtle authenticity seal or badge aesthetic
   - The tag code "${tagCode}" subtly incorporated
   - Holographic or iridescent effects suggesting security
4. Color palette: Premium, sophisticated colors that convey trust and authenticity
5. Format: Square aspect ratio (1:1), suitable for NFT display
6. Do NOT include any text except the tag code
7. Make it visually striking and collectible

Generate a high-quality, unique artwork that celebrates authentic product ownership.`;
}

/**
 * Generate a fallback placeholder image if Gemini fails
 * Returns a simple colored square with text
 */
export async function generateFallbackImage(
  tagCode: string,
  productInfo: ProductInfo
): Promise<Buffer> {
  // Use sharp to create a simple placeholder image
  const sharp = (await import('sharp')).default;

  // Create a gradient-like placeholder
  const width = 1024;
  const height = 1024;

  // Generate a deterministic color based on tag code
  const hash = tagCode.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue = Math.abs(hash) % 360;

  // Create SVG with gradient and text
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue}, 70%, 40%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360}, 70%, 30%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" opacity="0.9">
        ETAGS COLLECTIBLE
      </text>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" opacity="0.7">
        ${productInfo.brand}
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle" opacity="0.6">
        ${productInfo.name}
      </text>
      <text x="50%" y="85%" font-family="monospace" font-size="24" fill="white" text-anchor="middle" opacity="0.5">
        ${tagCode}
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
