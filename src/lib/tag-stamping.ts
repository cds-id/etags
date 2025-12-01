import { prisma } from './db';
import { uploadFile, getFileUrl } from './r2';
import { generateQRCodeBuffer } from './qr-generator';
import { createTagOnChain } from './tag-sync';
import { BLOCKCHAIN_CONFIG } from './constants';
import type { ProductMetadata, TagMetadata } from './product-templates';

// Types for the static JSON metadata
export type TagProductInfo = {
  id: number;
  code: string;
  name: string;
  description: string;
  category?: string;
  price?: number;
  images: string[];
  brand: {
    id: number;
    name: string;
    logo_url: string | null;
  };
};

export type TagDistributionInfo = {
  region?: string;
  country?: string;
  channel?: string;
  intended_market?: string;
};

export type TagStaticMetadata = {
  version: '1.0';
  tag: {
    code: string;
    created_at: string;
    stamped_at: string;
    metadata: TagMetadata;
  };
  products: TagProductInfo[];
  distribution: TagDistributionInfo;
  verification: {
    qr_code_url: string;
    verify_url: string;
    blockchain: {
      network: string;
      chain_id: number;
      contract_address: string;
      transaction_hash: string | null;
    };
  };
};

export type StampingResult = {
  success: boolean;
  error?: string;
  data?: {
    metadataUrl: string;
    qrCodeUrl: string;
    txHash: string;
  };
};

/**
 * Get the verification URL for a tag
 */
function getVerifyUrl(tagCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://etags.app';
  return `${baseUrl}/verify/${tagCode}`;
}

/**
 * Build the complete static metadata JSON for a tag
 */
async function buildTagMetadata(tagId: number): Promise<TagStaticMetadata> {
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  const productIds = tag.product_ids as number[];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      brand: {
        select: { id: true, name: true, logo_url: true },
      },
    },
  });

  const productInfos: TagProductInfo[] = products.map((product) => {
    const metadata = product.metadata as ProductMetadata;
    return {
      id: product.id,
      code: product.code,
      name: metadata.name || 'Unknown Product',
      description: metadata.description || '',
      category: metadata.category as string | undefined,
      price: metadata.price as number | undefined,
      images: metadata.images || [],
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        logo_url: product.brand.logo_url,
      },
    };
  });

  const tagMetadata = tag.metadata as TagMetadata;
  const verifyUrl = getVerifyUrl(tag.code);

  // Build distribution info from tag metadata
  const distributionInfo: TagDistributionInfo = {
    region: tagMetadata.distribution_region,
    country: tagMetadata.distribution_country,
    channel: tagMetadata.distribution_channel,
    intended_market: tagMetadata.intended_market,
  };

  // Placeholder URLs - will be updated after upload
  const staticMetadata: TagStaticMetadata = {
    version: '1.0',
    tag: {
      code: tag.code,
      created_at: tag.created_at.toISOString(),
      stamped_at: new Date().toISOString(),
      metadata: tagMetadata,
    },
    products: productInfos,
    distribution: distributionInfo,
    verification: {
      qr_code_url: '', // Will be set after QR upload
      verify_url: verifyUrl,
      blockchain: {
        network: BLOCKCHAIN_CONFIG.NETWORK,
        chain_id: BLOCKCHAIN_CONFIG.CHAIN_ID,
        contract_address: BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
        transaction_hash: null, // Will be set after blockchain tx
      },
    },
  };

  return staticMetadata;
}

/**
 * Upload QR code image to R2
 * QR code contains only the tag code (not full URL) for scanner compatibility
 */
async function uploadQRCode(tagCode: string): Promise<string> {
  // QR code contains only the tag code - scanner app will look up the tag
  const qrBuffer = await generateQRCodeBuffer(tagCode, {
    width: 512,
    margin: 2,
  });

  const qrKey = `tags/${tagCode}/qr-code.png`;
  const result = await uploadFile(qrKey, qrBuffer, 'image/png');

  return result.url;
}

/**
 * Upload static metadata JSON to R2
 */
async function uploadMetadataJSON(
  tagCode: string,
  metadata: TagStaticMetadata
): Promise<string> {
  const jsonContent = JSON.stringify(metadata, null, 2);
  const jsonBuffer = Buffer.from(jsonContent, 'utf-8');

  const metadataKey = `tags/${tagCode}/metadata.json`;
  const result = await uploadFile(metadataKey, jsonBuffer, 'application/json');

  return result.url;
}

/**
 * Complete stamping flow for a tag
 * 1. Validate tag is published and not already stamped
 * 2. Generate QR code and upload to R2
 * 3. Build metadata JSON with QR URL
 * 4. Upload metadata JSON to R2
 * 5. Create tag on blockchain with metadata URI
 * 6. Update metadata JSON with transaction hash
 * 7. Update database with all URLs and stamped status
 */
export async function stampTag(tagId: number): Promise<StampingResult> {
  try {
    // 1. Validate tag
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return { success: false, error: 'Tag not found' };
    }

    if (tag.is_stamped === 1) {
      return { success: false, error: 'Tag is already stamped' };
    }

    if (tag.publish_status !== 1) {
      return {
        success: false,
        error: 'Tag must be published before stamping',
      };
    }

    const productIds = tag.product_ids as number[];
    if (productIds.length === 0) {
      return {
        success: false,
        error: 'Tag must have at least one product linked',
      };
    }

    // 2. Generate and upload QR code (contains tag code only, not URL)
    const qrCodeUrl = await uploadQRCode(tag.code);

    // 3. Build initial metadata
    const metadata = await buildTagMetadata(tagId);
    metadata.verification.qr_code_url = qrCodeUrl;

    // 4. Upload initial metadata JSON (without tx hash)
    const metadataUrl = await uploadMetadataJSON(tag.code, metadata);

    // 5. Create tag on blockchain with metadata URI and product IDs for hash
    const blockchainResult = await createTagOnChain(
      tag.code,
      metadataUrl,
      productIds
    );

    if (!blockchainResult.success) {
      return {
        success: false,
        error: 'Failed to create tag on blockchain',
      };
    }

    // 6. Update metadata JSON with transaction hash
    metadata.verification.blockchain.transaction_hash =
      blockchainResult.txHash || null;

    // Re-upload metadata with tx hash
    await uploadMetadataJSON(tag.code, metadata);

    // 7. Update database with metadata URL
    await prisma.tag.update({
      where: { id: tagId },
      data: {
        is_stamped: 1,
        hash_tx: blockchainResult.txHash,
        chain_status: 0, // CREATED
      },
    });

    return {
      success: true,
      data: {
        metadataUrl,
        qrCodeUrl,
        txHash: blockchainResult.txHash || '',
      },
    };
  } catch (error) {
    console.error('Stamping error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Preview stamping - generates metadata without actually stamping
 * Useful for showing what will be stamped
 */
export async function previewTagStamping(
  tagId: number
): Promise<{ success: boolean; error?: string; metadata?: TagStaticMetadata }> {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return { success: false, error: 'Tag not found' };
    }

    const metadata = await buildTagMetadata(tagId);
    const verifyUrl = getVerifyUrl(tag.code);
    metadata.verification.qr_code_url = `[Will be generated: tags/${tag.code}/qr-code.png]`;
    metadata.verification.verify_url = verifyUrl;

    return { success: true, metadata };
  } catch (error) {
    console.error('Preview error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get stamped tag metadata URL
 */
export function getTagMetadataUrl(tagCode: string): string {
  return getFileUrl(`tags/${tagCode}/metadata.json`);
}

/**
 * Get stamped tag QR code URL
 */
export function getTagQRCodeUrl(tagCode: string): string {
  return getFileUrl(`tags/${tagCode}/qr-code.png`);
}
