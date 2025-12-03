/**
 * Test script for Gemini image generation
 * Run with: npx tsx scripts/test-gemini-image.ts
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import mime from 'mime';

// Load environment variables
dotenv.config();

interface ProductInfo {
  name: string;
  brand: string;
  description?: string;
}

async function generateNFTImage(tagCode: string, productInfo: ProductInfo) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Create a unique digital collectible artwork for an authentic product ownership certificate.

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

  console.log('Sending request to Gemini API...');
  console.log('Prompt:', prompt.substring(0, 200) + '...\n');

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
        const fileExtension = mime.getExtension(mimeType) || 'png';
        console.log(
          `Found image! MIME: ${mimeType}, Extension: ${fileExtension}, Size: ${imageBuffer.length} bytes`
        );
      } else if ('text' in part && part.text) {
        console.log('Text response:', part.text.substring(0, 200));
      }
    }
  }

  return { imageBuffer, mimeType };
}

async function main() {
  console.log('=== Gemini Image Generation Test (SDK) ===\n');

  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
  }

  console.log(
    'API Key found:',
    process.env.GEMINI_API_KEY.substring(0, 10) + '...\n'
  );

  // Test data
  const tagCode = 'ETAG-TEST-001';
  const productInfo: ProductInfo = {
    name: 'Premium Leather Wallet',
    brand: 'Luxury Brand',
    description:
      'Handcrafted genuine leather bifold wallet with RFID protection',
  };

  console.log('Test Parameters:');
  console.log('- Tag Code:', tagCode);
  console.log('- Product:', productInfo.name);
  console.log('- Brand:', productInfo.brand);
  console.log('');

  try {
    const { imageBuffer, mimeType } = await generateNFTImage(
      tagCode,
      productInfo
    );

    if (imageBuffer) {
      const extension = mime.getExtension(mimeType || 'image/png') || 'png';
      const outputPath = path.join(
        process.cwd(),
        `test-nft-output.${extension}`
      );
      fs.writeFileSync(outputPath, imageBuffer);
      console.log('\n=== SUCCESS ===');
      console.log('Image saved to:', outputPath);
      console.log('File size:', imageBuffer.length, 'bytes');
      console.log('MIME type:', mimeType);
    } else {
      console.log('\n=== FAILED ===');
      console.log('No image data received from Gemini API');
    }
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error(error);
  }
}

main().catch(console.error);
