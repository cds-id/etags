/**
 * Full NFT Claim Flow Test
 * Tests the complete flow: Gemini art generation -> R2 upload -> blockchain mint
 *
 * Run with: npx tsx scripts/test-nft-full-flow.ts [owner_address]
 *
 * Required env vars:
 * - GEMINI_API_KEY
 * - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_DOMAIN
 * - BLOCKCHAIN_RPC_URL, NFT_CONTRACT_ADDRESS, ADMIN_WALLET
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ethers } from 'ethers';
import { GoogleGenAI } from '@google/genai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables
dotenv.config();

// =============================================================================
// Configuration
// =============================================================================

const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.R2_BUCKET || '',
    publicDomain: process.env.R2_PUBLIC_DOMAIN || '',
  },
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://sepolia.base.org',
    contractAddress: process.env.NFT_CONTRACT_ADDRESS || '',
    adminWallet: process.env.ADMIN_WALLET || '',
  },
};

// NFT Contract ABI
const NFT_ABI = [
  'function mintTo(address to, string calldata tagCode, string calldata tokenURI) external returns (uint256)',
  'function isTagMinted(string calldata tagCode) external view returns (bool)',
  'function getTokenByTag(string calldata tagCode) external view returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function totalSupply() external view returns (uint256)',
  'event CollectibleMinted(uint256 indexed tokenId, bytes32 indexed tagCodeHash, string tagCode, address indexed owner, string tokenURI)',
];

// =============================================================================
// Types
// =============================================================================

interface ProductInfo {
  name: string;
  brand: string;
  description?: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

// =============================================================================
// Step 1: Generate Art with Gemini
// =============================================================================

async function generateNFTArt(
  tagCode: string,
  productInfo: ProductInfo
): Promise<Buffer> {
  console.log('\n📸 Step 1: Generating NFT art with Gemini...');

  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

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

  console.log('   Sending request to Gemini API...');

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-exp-image-generation',
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: { imageSize: '1K' },
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  let imageBuffer: Buffer | null = null;

  for await (const chunk of response) {
    if (!chunk.candidates?.[0]?.content?.parts) continue;

    for (const part of chunk.candidates[0].content.parts) {
      if ('inlineData' in part && part.inlineData?.data) {
        imageBuffer = Buffer.from(part.inlineData.data, 'base64');
        console.log(`   ✅ Image generated: ${imageBuffer.length} bytes`);
      }
    }
  }

  if (!imageBuffer) {
    throw new Error('No image data received from Gemini');
  }

  // Save locally for verification
  const localPath = path.join(process.cwd(), `test-nft-${tagCode}.png`);
  fs.writeFileSync(localPath, imageBuffer);
  console.log(`   💾 Saved locally: ${localPath}`);

  return imageBuffer;
}

// =============================================================================
// Step 2: Upload to R2
// =============================================================================

async function uploadToR2(
  tagCode: string,
  imageBuffer: Buffer,
  metadata: NFTMetadata
): Promise<{ imageUrl: string; metadataUrl: string }> {
  console.log('\n☁️  Step 2: Uploading to R2...');

  if (
    !config.r2.accountId ||
    !config.r2.accessKeyId ||
    !config.r2.secretAccessKey
  ) {
    throw new Error('R2 credentials are not set');
  }

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
  });

  const getUrl = (key: string) => {
    if (config.r2.publicDomain) {
      return `${config.r2.publicDomain}/${key}`;
    }
    return `https://${config.r2.accountId}.r2.cloudflarestorage.com/${config.r2.bucket}/${key}`;
  };

  // Upload image
  const imageKey = `nfts/${tagCode}/image.png`;
  console.log(`   Uploading image: ${imageKey}`);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: 'image/png',
    })
  );

  const imageUrl = getUrl(imageKey);
  console.log(`   ✅ Image uploaded: ${imageUrl}`);

  // Update metadata with image URL
  metadata.image = imageUrl;

  // Upload metadata
  const metadataKey = `nfts/${tagCode}/metadata.json`;
  console.log(`   Uploading metadata: ${metadataKey}`);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: metadataKey,
      Body: JSON.stringify(metadata, null, 2),
      ContentType: 'application/json',
    })
  );

  const metadataUrl = getUrl(metadataKey);
  console.log(`   ✅ Metadata uploaded: ${metadataUrl}`);

  return { imageUrl, metadataUrl };
}

// =============================================================================
// Step 3: Mint NFT on Blockchain
// =============================================================================

async function mintNFT(
  tagCode: string,
  ownerAddress: string,
  metadataUrl: string
): Promise<{ tokenId: string; txHash: string }> {
  console.log('\n⛓️  Step 3: Minting NFT on blockchain...');

  if (!config.blockchain.contractAddress || !config.blockchain.adminWallet) {
    throw new Error('Blockchain config is not set');
  }

  const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
  const wallet = new ethers.Wallet(config.blockchain.adminWallet, provider);
  const contract = new ethers.Contract(
    config.blockchain.contractAddress,
    NFT_ABI,
    wallet
  );

  console.log(`   Contract: ${config.blockchain.contractAddress}`);
  console.log(`   Minter: ${wallet.address}`);
  console.log(`   Owner: ${ownerAddress}`);
  console.log(`   Metadata: ${metadataUrl}`);

  // Check if already minted
  const isMinted = await contract.isTagMinted(tagCode);
  if (isMinted) {
    throw new Error(`Tag ${tagCode} already has an NFT minted`);
  }

  // Mint
  console.log('   Sending transaction...');
  const tx = await contract.mintTo(ownerAddress, tagCode, metadataUrl);
  console.log(`   Tx hash: ${tx.hash}`);

  console.log('   Waiting for confirmation...');
  const receipt = await tx.wait();
  console.log(`   ✅ Confirmed in block: ${receipt.blockNumber}`);

  // Get token ID from event
  let tokenId = 'unknown';
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      if (parsed?.name === 'CollectibleMinted') {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch {
      // Not our event
    }
  }

  console.log(`   Token ID: ${tokenId}`);

  return { tokenId, txHash: tx.hash };
}

// =============================================================================
// Main Flow
// =============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           NFT FULL FLOW TEST (Gemini + R2 + Mint)          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Validate config
  const missingConfig: string[] = [];
  if (!config.gemini.apiKey) missingConfig.push('GEMINI_API_KEY');
  if (!config.r2.accountId) missingConfig.push('R2_ACCOUNT_ID');
  if (!config.r2.accessKeyId) missingConfig.push('R2_ACCESS_KEY_ID');
  if (!config.r2.secretAccessKey) missingConfig.push('R2_SECRET_ACCESS_KEY');
  if (!config.r2.bucket) missingConfig.push('R2_BUCKET');
  if (!config.blockchain.contractAddress)
    missingConfig.push('NFT_CONTRACT_ADDRESS');
  if (!config.blockchain.adminWallet) missingConfig.push('ADMIN_WALLET');

  if (missingConfig.length > 0) {
    console.error(
      '\n❌ Missing environment variables:',
      missingConfig.join(', ')
    );
    process.exit(1);
  }

  // Test data
  const tagCode = `ETAG-FULL-${Date.now()}`;
  const ownerAddress =
    process.argv[2] || new ethers.Wallet(config.blockchain.adminWallet).address;
  const productInfo: ProductInfo = {
    name: 'Premium Leather Wallet',
    brand: 'Luxury Brand Co.',
    description:
      'Handcrafted genuine leather bifold wallet with RFID protection',
  };

  console.log('\n📋 Test Configuration:');
  console.log(`   Tag Code: ${tagCode}`);
  console.log(`   Owner: ${ownerAddress}`);
  console.log(`   Product: ${productInfo.name}`);
  console.log(`   Brand: ${productInfo.brand}`);

  try {
    // Step 1: Generate art
    const imageBuffer = await generateNFTArt(tagCode, productInfo);

    // Build initial metadata
    const metadata: NFTMetadata = {
      name: `Etags Collectible - ${productInfo.name}`,
      description: `Authentic ownership certificate for ${productInfo.name} by ${productInfo.brand}. First-hand claim verified on ${new Date().toISOString().split('T')[0]}. This NFT proves authentic product ownership recorded on the blockchain.`,
      image: '', // Will be updated after upload
      external_url: `https://etags.example.com/verify/${tagCode}`,
      attributes: [
        { trait_type: 'Brand', value: productInfo.brand },
        { trait_type: 'Product', value: productInfo.name },
        { trait_type: 'Tag Code', value: tagCode },
        {
          trait_type: 'Claim Date',
          value: new Date().toISOString().split('T')[0],
        },
        { trait_type: 'Ownership Type', value: 'First Hand' },
        { trait_type: 'Verification', value: 'Blockchain Verified' },
      ],
    };

    // Step 2: Upload to R2
    const { imageUrl, metadataUrl } = await uploadToR2(
      tagCode,
      imageBuffer,
      metadata
    );

    // Step 3: Mint NFT
    const { tokenId, txHash } = await mintNFT(
      tagCode,
      ownerAddress,
      metadataUrl
    );

    // Update metadata with token ID
    metadata.name = `Etags Collectible #${tokenId} - ${productInfo.name}`;
    console.log('\n📝 Updating metadata with token ID...');

    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
    });

    await r2Client.send(
      new PutObjectCommand({
        Bucket: config.r2.bucket,
        Key: `nfts/${tagCode}/metadata.json`,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: 'application/json',
      })
    );
    console.log('   ✅ Metadata updated');

    // Summary
    console.log(
      '\n╔════════════════════════════════════════════════════════════╗'
    );
    console.log(
      '║                     🎉 SUCCESS! 🎉                         ║'
    );
    console.log(
      '╚════════════════════════════════════════════════════════════╝'
    );
    console.log('\n📊 NFT Details:');
    console.log(`   Token ID:     ${tokenId}`);
    console.log(`   Owner:        ${ownerAddress}`);
    console.log(`   Tag Code:     ${tagCode}`);
    console.log(`   Image URL:    ${imageUrl}`);
    console.log(`   Metadata URL: ${metadataUrl}`);
    console.log(`   Tx Hash:      ${txHash}`);
    console.log(`\n🔗 View on BaseScan:`);
    console.log(`   https://sepolia.basescan.org/tx/${txHash}`);
    console.log(`\n🖼️  View NFT image:`);
    console.log(`   ${imageUrl}`);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
