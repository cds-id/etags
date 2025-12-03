/**
 * NFT Collectible Minting Library
 * Handles the full flow of generating, uploading, and minting NFT collectibles
 */

import { ethers } from 'ethers';
import { prisma } from './db';
import { uploadFile, getFileUrl } from './r2';
import {
  generateNFTImage,
  generateFallbackImage,
  type ProductInfo,
} from './gemini-image';
import { BLOCKCHAIN_CONFIG } from './constants';

// ETagCollectible contract ABI (minimal for minting)
const NFT_CONTRACT_ABI = [
  'function mintTo(address to, string tagCode, string uri) returns (uint256)',
  'function isTagMinted(string tagCode) view returns (bool)',
  'function getTokenByTag(string tagCode) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
];

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTClaimResult {
  success: boolean;
  tokenId?: string;
  imageUrl?: string;
  metadataUrl?: string;
  mintTxHash?: string;
  error?: string;
}

export interface TagWithProducts {
  id: number;
  code: string;
  products: Array<{
    code: string;
    metadata: {
      name?: string;
      description?: string;
      images?: string[];
    };
    brand: {
      name: string;
      logo_url?: string | null;
    };
  }>;
}

/**
 * Get NFT contract instance
 */
function getNFTContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('NFT_CONTRACT_ADDRESS environment variable is not set');
  }
  return new ethers.Contract(
    contractAddress,
    NFT_CONTRACT_ABI,
    signerOrProvider
  );
}

/**
 * Get provider for read operations
 */
function getProvider() {
  return new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL);
}

/**
 * Get admin signer for write operations
 */
function getAdminSigner() {
  const provider = getProvider();
  const privateKey = process.env.ADMIN_WALLET;
  if (!privateKey) {
    throw new Error('ADMIN_WALLET environment variable is not set');
  }
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Check if a tag already has an NFT minted
 */
export async function isTagNFTMinted(tagCode: string): Promise<boolean> {
  try {
    const provider = getProvider();
    const contract = getNFTContract(provider);
    return await contract.isTagMinted(tagCode);
  } catch (error) {
    console.error('Error checking if tag NFT is minted:', error);
    // Also check database as fallback
    const dbRecord = await prisma.tagNFT.findFirst({
      where: {
        tag: { code: tagCode },
      },
    });
    return !!dbRecord;
  }
}

/**
 * Generate NFT art for a tag
 */
export async function generateNFTArt(
  tagCode: string,
  productInfo: ProductInfo
): Promise<Buffer> {
  const result = await generateNFTImage(tagCode, productInfo);

  if (result.success && result.imageBuffer) {
    return result.imageBuffer;
  }

  // Fall back to placeholder if Gemini fails
  console.warn('Gemini image generation failed, using fallback:', result.error);
  return generateFallbackImage(tagCode, productInfo);
}

/**
 * Build NFT metadata in ERC721 standard format
 */
export function buildNFTMetadata(
  tagCode: string,
  productInfo: ProductInfo,
  imageUrl: string,
  tokenId?: string
): NFTMetadata {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://etags.example.com'}/verify/${tagCode}`;

  return {
    name: `Etags Collectible${tokenId ? ` #${tokenId}` : ''} - ${productInfo.name}`,
    description: `Authentic ownership certificate for ${productInfo.name} by ${productInfo.brand}. First-hand claim verified on ${new Date().toISOString().split('T')[0]}. This NFT proves authentic product ownership recorded on the blockchain.`,
    image: imageUrl,
    external_url: verifyUrl,
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
}

/**
 * Upload NFT assets (image and metadata) to R2
 */
export async function uploadNFTAssets(
  tagCode: string,
  imageBuffer: Buffer,
  metadata: NFTMetadata
): Promise<{ imageUrl: string; metadataUrl: string }> {
  // Upload image
  const imageKey = `nfts/${tagCode}/image.png`;
  const imageResult = await uploadFile(imageKey, imageBuffer, 'image/png');

  if (!imageResult.success) {
    throw new Error('Failed to upload NFT image to R2');
  }

  // Update metadata with actual image URL
  metadata.image = imageResult.url;

  // Upload metadata JSON
  const metadataKey = `nfts/${tagCode}/metadata.json`;
  const metadataResult = await uploadFile(
    metadataKey,
    JSON.stringify(metadata, null, 2),
    'application/json'
  );

  if (!metadataResult.success) {
    throw new Error('Failed to upload NFT metadata to R2');
  }

  return {
    imageUrl: imageResult.url,
    metadataUrl: metadataResult.url,
  };
}

/**
 * Mint NFT on blockchain
 */
export async function mintNFTOnChain(
  tagCode: string,
  toAddress: string,
  metadataUrl: string
): Promise<{ tokenId: string; txHash: string }> {
  const signer = getAdminSigner();
  const contract = getNFTContract(signer);

  console.log('Minting NFT:', { tagCode, toAddress, metadataUrl });

  const tx = await contract.mintTo(toAddress, tagCode, metadataUrl);
  const receipt = await tx.wait();

  // Get token ID from event or by querying
  let tokenId: string;
  try {
    tokenId = (await contract.getTokenByTag(tagCode)).toString();
  } catch {
    // Fallback: parse from transaction logs
    tokenId = 'unknown';
  }

  return {
    tokenId,
    txHash: receipt.hash,
  };
}

/**
 * Get product info from tag for NFT generation
 */
export async function getTagProductInfo(
  tagCode: string
): Promise<{ tag: TagWithProducts; productInfo: ProductInfo } | null> {
  const tag = await prisma.tag.findUnique({
    where: { code: tagCode },
    include: {
      nft: true,
    },
  });

  if (!tag) {
    return null;
  }

  // Get product IDs from tag
  const productIds = (tag.product_ids as number[]) || [];

  if (productIds.length === 0) {
    return null;
  }

  // Fetch products with brand info
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    include: {
      brand: true,
    },
  });

  if (products.length === 0) {
    return null;
  }

  // Use first product for NFT info
  const firstProduct = products[0];
  const metadata = firstProduct.metadata as {
    name?: string;
    description?: string;
    images?: string[];
  };

  const productInfo: ProductInfo = {
    name: metadata.name || firstProduct.code,
    brand: firstProduct.brand.name,
    description: metadata.description,
    images: metadata.images,
  };

  return {
    tag: {
      id: tag.id,
      code: tag.code,
      products: products.map((p) => ({
        code: p.code,
        metadata: p.metadata as {
          name?: string;
          description?: string;
          images?: string[];
        },
        brand: {
          name: p.brand.name,
          logo_url: p.brand.logo_url,
        },
      })),
    },
    productInfo,
  };
}

/**
 * Process full NFT claim flow
 */
export async function processNFTClaim(
  tagCode: string,
  walletAddress: string
): Promise<NFTClaimResult> {
  try {
    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      return { success: false, error: 'Invalid wallet address' };
    }

    // Check if NFT already minted for this tag
    const alreadyMinted = await isTagNFTMinted(tagCode);
    if (alreadyMinted) {
      return { success: false, error: 'NFT already minted for this tag' };
    }

    // Get tag and product info
    const tagData = await getTagProductInfo(tagCode);
    if (!tagData) {
      return { success: false, error: 'Tag or product not found' };
    }

    const { tag, productInfo } = tagData;

    // 1. Generate NFT art
    console.log('Generating NFT art for:', tagCode);
    const imageBuffer = await generateNFTArt(tagCode, productInfo);

    // 2. Build initial metadata (without final image URL)
    const metadata = buildNFTMetadata(tagCode, productInfo, '');

    // 3. Upload assets to R2
    console.log('Uploading NFT assets to R2...');
    const { imageUrl, metadataUrl } = await uploadNFTAssets(
      tagCode,
      imageBuffer,
      metadata
    );

    // 4. Mint NFT on blockchain
    console.log('Minting NFT on blockchain...');
    const { tokenId, txHash } = await mintNFTOnChain(
      tagCode,
      walletAddress,
      metadataUrl
    );

    // 5. Update metadata with token ID and re-upload
    const finalMetadata = buildNFTMetadata(
      tagCode,
      productInfo,
      imageUrl,
      tokenId
    );
    const metadataKey = `nfts/${tagCode}/metadata.json`;
    await uploadFile(
      metadataKey,
      JSON.stringify(finalMetadata, null, 2),
      'application/json'
    );

    // 6. Save to database
    await prisma.tagNFT.create({
      data: {
        tag_id: tag.id,
        token_id: tokenId,
        owner_address: walletAddress.toLowerCase(),
        image_url: imageUrl,
        metadata_url: metadataUrl,
        mint_tx_hash: txHash,
      },
    });

    console.log('NFT claim successful:', { tokenId, txHash });

    return {
      success: true,
      tokenId,
      imageUrl,
      metadataUrl,
      mintTxHash: txHash,
    };
  } catch (error) {
    console.error('NFT claim error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get NFT info for a tag
 */
export async function getTagNFT(tagCode: string) {
  return prisma.tagNFT.findFirst({
    where: {
      tag: { code: tagCode },
    },
    include: {
      tag: true,
    },
  });
}

/**
 * Get NFT token info from blockchain
 */
export async function getNFTTokenInfo(tokenId: string) {
  try {
    const provider = getProvider();
    const contract = getNFTContract(provider);

    const [owner, tokenURI] = await Promise.all([
      contract.ownerOf(tokenId),
      contract.tokenURI(tokenId),
    ]);

    return {
      tokenId,
      owner,
      tokenURI,
    };
  } catch (error) {
    console.error('Error getting NFT token info:', error);
    return null;
  }
}

/**
 * Get total NFT supply from blockchain
 */
export async function getTotalNFTSupply(): Promise<number> {
  try {
    const provider = getProvider();
    const contract = getNFTContract(provider);
    const total = await contract.totalSupply();
    return Number(total);
  } catch (error) {
    console.error('Error getting total NFT supply:', error);
    return 0;
  }
}
